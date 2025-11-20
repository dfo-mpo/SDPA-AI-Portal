# ---------- Windows event-loop fix (only needed on Windows)  ----------
import sys, asyncio
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())


# ---------- Imports ----------
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode
from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urldefrag, urlparse, urlunparse
from typing import List, Dict, Optional, Set, Tuple
import requests, tempfile, os, hashlib, re, json
import pandas as pd
import pdfplumber
from docx import Document


# ---------- Variables ----------
LOW_QUALITY_PATTERNS = ["contact", "privacy", "terms", "login", "disclaimer", "account", "signup",
                        "legal","policy","adult","violence","complaints","report","abuse"]
DEFAULT_UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
              "AppleWebKit/537.36 (KHTML, like Gecko) "
              "Chrome/120.0.0.0 Safari/537.36 (AIWebScraper)")
MAX_DEPTH = 4 # set to 4 for proudction and 1 or 2 for development 
MAX_PAGES = 6000


# ---------- URL + Link Helpers ----------
def normalizeUrl(u: str) -> str:
    """
    Normalize URL but KEEP the #fragment so client-side hash routes
    (e.g., /#2012 vs /#2013) are treated as distinct pages.
    """
    p = urlparse(u.strip())
    # normalize scheme/host, keep path/query/fragment as-is
    p = p._replace(scheme=p.scheme.lower(), netloc=p.netloc.lower())
    return urlunparse(p)

def same_domain(u: str, base_netloc: str) -> bool:
    """Keep crawl constrained to a site (unless set same_domain_only=False)."""
    try:
        return urlparse(u).netloc.endswith(base_netloc)
    except Exception:
        return False

def looks_like_file(url: str) -> Optional[str]:
    """Detect direct file links we can extract without rendering a page."""
    path = urlparse(url).path.lower()
    for ext in (".csv", ".xlsx", ".pdf", ".docx"):
        if path.endswith(ext):
            return ext
    return None

def extract_links(base_url: str, html: str) -> List[str]:
    """Pull <a href>, absolutize to full URLs (including fragments)."""
    soup = BeautifulSoup(html, "html.parser")
    links: List[str] = []

    # regular a[href]
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        if not href or href.startswith(("mailto:", "javascript:")):
            continue
        full = normalizeUrl(urljoin(base_url, href))
        links.append(full)

    # detect hidden fragment navigation stored in IDs
    fragment_links = extract_fragment_id_links(base_url, html)
    links.extend(fragment_links)

    return links

def is_recursive_path(url: str, repeat_threshold: int = 2) -> bool:
    """
    Skip looping/recursive paths like /a/b/a/b/a/ or /2025/10/28/2025/10/28/.
    If any segment repeats more than repeat_threshold times -> True (skip).
    """
    try:
        segments = [s for s in urlparse(url).path.strip("/").split("/") if s]
        counts = {}
        for seg in segments:
            counts[seg] = counts.get(seg, 0) + 1
            if counts[seg] > repeat_threshold:
                return True
        return False
    except Exception:
        return False

def resolve_head(url: str, timeout: float = 3.0) -> Optional[str]:
    """
    Best-effort canonicalization: follow redirects with HEAD; fall back to GET.

    Why:
    - Different URLs often resolve to the same canonical destination.
    - Collapsing aliases early avoids enqueuing duplicates.

    Returns:
    - Final resolved URL (normalized) on success, or
    - None on network/timeout errors (caller can decide what to do).
    """
    try:
        r = requests.head(url, allow_redirects=True, timeout=timeout, verify=False)
        # Some origins disallow HEAD; try a lightweight GET
        if r.status_code in (405, 403) or r.is_redirect:
            r = requests.get(url, allow_redirects=True, timeout=timeout, stream=True, verify=False)
        final = r.url or url
        return normalizeUrl(final)
    except Exception:
        return None

# ---------- Extraction Helpers ----------
def extract_csv_text(url):
    """Read CSV over HTTP(S) into a DataFrame and return Markdown table"""
    try:
        df = pd.read_csv(url)
        return df.to_markdown(index=False)
    except Exception as e:
        print(f"❌ CSV extract failed for {url}: {e}")
        return None

def extract_xlsx_text(url):
    """Read XLSX over HTTP(S) into a DataFrame and return Markdown table."""
    try:
        df = pd.read_excel(url)
        return df.to_markdown(index=False)
    except Exception as e:
        print(f"❌ XLSX extract failed for {url}: {e}")
        return None

def extract_pdf_text(url):
    """Download PDF and extract text from all pages (basic text layer only)."""
    try:
        response = requests.get(url, timeout=10, verify=False)
        response.raise_for_status()
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(response.content)
            tmp_path = tmp.name
        with pdfplumber.open(tmp_path) as pdf:
            text = "\n".join(page.extract_text() or "" for page in pdf.pages)
        os.unlink(tmp_path)
        return text.strip()
    except Exception as e:
        print(f"❌ PDF extract failed for {url}: {e}")
        return None

def extract_docx_text(url):
    """Download DOCX and extract paragraph text."""
    try:
        response = requests.get(url, timeout=10, verify=False)
        response.raise_for_status()
        with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp:
            tmp.write(response.content)
            tmp_path = tmp.name
        doc = Document(tmp_path)
        text = "\n".join(p.text for p in doc.paragraphs)
        os.unlink(tmp_path)
        return text.strip()
    except Exception as e:
        print(f"❌ DOCX extract failed for {url}: {e}")
        return None

def extract_fragment_id_links(base_url: str, html: str) -> List[str]:
    """
    Some sites use <a href="#"> and put the real route/state in the <a id="2023">.
    This helper creates synthetic #fragment URLs such as base_url + '#2023'.
    """
    soup = BeautifulSoup(html, "html.parser")
    out = []
    
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        
        # Case 1: real href with fragment is handled already
        if href.startswith("#") and len(href) > 1:
            full = normalizeUrl(urljoin(base_url, href))
            out.append(full)
            continue

        # Case 2: href is "#" but the a-tag has an ID, treat ID as fragment
        if href == "#" and a.get("id"):
            frag = "#" + a["id"].strip()
            full = normalizeUrl(urljoin(base_url, frag))
            out.append(full)

    return out

def extract_jsonld(html: str) -> list:
    soup = BeautifulSoup(html, "html.parser")
    out=[]
    for s in soup.find_all("script", attrs={"type": lambda t: t and "ld+json" in t.lower()}):
        raw=(s.string or s.get_text() or "").strip()
        if not raw: continue
        try:
            raw = re.sub(r"/\*.*?\*/", "", raw, flags=re.S) # strip /* */
            raw = re.sub(r"^\s*//.*?$", "", raw, flags=re.M) # strip //
            data=json.loads(re.sub(r",\s*([}\]])", r"\1", raw)) # fix trailing commas
            out.extend(data if isinstance(data, list) else [data])
        except Exception:
            pass
    return out

def extract_simple_meta_from_result(result, base_url: str) -> dict:
    meta = getattr(result, "metadata", None) or getattr(result, "meta_tags", {}) or {}
    title = (meta.get("title") or "").strip()
    descr = (meta.get("description") or meta.get("og:description") or "").strip()

    # fallback
    soup = BeautifulSoup(getattr(result, "html", "") or "", "html.parser")
    if not title:
        if soup.title and soup.title.string:
            title = soup.title.string.strip()
        else:
            tag = soup.select_one('meta[property="og:title" i]') or soup.select_one('meta[name="twitter:title" i]')
            if tag:
                title = (tag.get("content") or "").strip()
    if not descr:
        tag = (soup.select_one('meta[name="description" i]') or
               soup.select_one('meta[property="og:description" i]') or
               soup.select_one('meta[name="twitter:description" i]'))
        if tag:
            descr = (tag.get("content") or "").strip()

    # Favicon (png/jpg/ico/svg/apple-touch)
    fav = ""
    candidates = []
    for link in soup.select('link[rel*="icon" i], link[rel*="apple-touch-icon" i], link[rel="mask-icon" i]'):
        href = (link.get("href") or "").strip()
        if href:
            candidates.append(urljoin(base_url, href))
    if candidates:
        fav = candidates[0]
    if not fav:
        p = urlparse(base_url)
        fav = urljoin(f"{p.scheme}://{p.netloc}", "/favicon.ico")

    return {"site_title": title, "site_description": descr, "favicon": fav}


# ---------- Processing Helpers ----------
def extract_body_content(html_content: str) -> str:
    """Return only <body> content as HTML."""
    soup = BeautifulSoup(html_content, "html.parser")
    body_content = soup.body
    return str(body_content) if body_content else ""

def clean_body_content(body_content: str) -> str:
    """Strip script/style/noscript and return readable text."""
    soup = BeautifulSoup(body_content, "html.parser")
    for tag in soup(["script", "style"]):
        tag.extract()
    cleaned = soup.get_text(separator="\n")
    cleaned = "\n".join(line.strip() for line in cleaned.splitlines() if line.strip())
    return cleaned

def split_dom_content(dom_content: str, max_length: int = 6000) -> list[str]:
    """Chunk long strings for LLMs (unchanged helper)."""
    return [dom_content[i:i + max_length] for i in range(0, len(dom_content), max_length)]


# ---------- Main ----------
def scrape_website(
    start_url: str,
    max_depth: int = MAX_DEPTH,
    max_pages: int = MAX_PAGES,
    same_domain_only: bool = True,
) -> Dict[str, object]:

    start_url = normalizeUrl(start_url)
    base_netloc = urlparse(start_url).netloc

    visited: Set[str] = set()
    urls_seen_ordered: List[str] = []
    results: List[Dict] = []
    seen_signatures: Set[str] = set()
    canonical_seen: Set[str] = set()
    queue: List[Tuple[str, int]] = [(start_url, 0)]
    enqueued: Set[str] = {start_url}
    site_meta = None

    async def _run():
        nonlocal site_meta
        browser_cfg = BrowserConfig(
            headless=True,
            text_mode=True,
            user_agent=DEFAULT_UA,
        )
        async with AsyncWebCrawler(config=browser_cfg) as crawler:
            while queue and len(results) < max_pages:
                url, depth = queue.pop(0)
                if url in visited:
                    continue

                # skip recursive/looping paths
                if is_recursive_path(url):
                    print(f"⛔ Skipping recursive path: {url}")
                    continue

                # domain scope
                if same_domain_only and not same_domain(url, base_netloc):
                    print(f"⛔ Skipping off-domain: {url}")
                    continue

                visited.add(url)
                urls_seen_ordered.append(url)
                print(f"\n➡️ Visiting (depth {depth}): {url}")

                # handle direct file links (unchanged)
                file_ext = looks_like_file(url)
                if file_ext:
                    kind = file_ext.lstrip(".")
                    text = None
                    if file_ext == ".csv":
                        text = extract_csv_text(url)
                    elif file_ext == ".xlsx":
                        text = extract_xlsx_text(url)
                    elif file_ext == ".pdf":
                        text = extract_pdf_text(url)
                    elif file_ext == ".docx":
                        text = extract_docx_text(url)

                    results.append({
                        "url": url,
                        "depth": depth,
                        "kind": kind,
                        "text": text,
                        "html": None,
                    })
                    print(f"📄 Captured file ({kind}): {url}")
                    continue

                # --- crawl4ai fetch (robots respected here) ---
                md_generator = DefaultMarkdownGenerator(
                    options={"ignore_links": True, "escape_html": False, "body_width": 80}
                )
                config = CrawlerRunConfig(
                    cache_mode=CacheMode.BYPASS,
                    session_id="intelligent-crawl",
                    wait_until="domcontentloaded",
                    exclude_external_links=True,
                    excluded_tags=["script", "style", "nav", "footer", "header"],
                    excluded_selector="#ads, .sidebar, .footer, .header",
                    scan_full_page=True,
                    check_robots_txt=True,
                    exclude_social_media_links=True,
                    word_count_threshold=0,
                    markdown_generator=md_generator,
                    process_iframes=True,
                    js_code=[
                    "document.querySelectorAll('[role=\"tab\"], .tab, .tab-button, .accordion, .toggle, .show-more, .expander').forEach(el=>el.click());",
                    "window.scrollTo(0, document.body.scrollHeight);",
                    ],
                )

                try:
                    result = await crawler.arun(url=url, config=config)
                    if not result.success:
                        raise Exception("Crawler returned unsuccessful status")
                    content_md = result.markdown
                    html = result.html
                    jsonld = extract_jsonld(html)
                    if (site_meta is None) and result.success and (result.html):
                        site_meta = extract_simple_meta_from_result(result, url)

                except Exception as e:
                    print(f"❌ Fetch failed (crawl4ai): {url} -> {e}")
                    results.append({
                        "url": url, "depth": depth, "kind": "error",
                        "text": None, "html": None
                    })
                    continue

                # extract text
                body_html = extract_body_content(html)
                text = clean_body_content(body_html)

                # prefer resolved final URL after redirects
                final_url = normalizeUrl(getattr(result, "response_url", url))
                canonical_seen.add(final_url)

                # minimal content signature
                sig_basis = (content_md or text or "").strip()
                sig = hashlib.sha256(re.sub(r"\s+", " ", sig_basis).encode("utf-8","ignore")).hexdigest()

                if sig in seen_signatures:
                    print(f"⚠️ Duplicate page content: {final_url}")
                    continue
                seen_signatures.add(sig)

                # low-quality filter
                if any(p in url.lower() for p in LOW_QUALITY_PATTERNS):
                    print(f"⚠️ Low-quality pattern hit: {url}")
                    # do NOT block traversal; still discover links
                else:
                    results.append({
                        "url": final_url,
                        "depth": depth,
                        "kind": "html",
                        "text": text,
                        "html": html,
                        "markdown": content_md,
                        "jsonld": jsonld,
                    })
                    print(f"✅ Saved page (words={len(text.split())}): {url}")

                # depth limit
                if depth >= max_depth:
                    continue

                # discover + print next-layer links
                links = extract_links(url, html)

                if links:
                    print("🔗 Links found:")
                    for l in links[:50]:
                        print("   -", l)

                for link in links:
                    if link in visited or link in enqueued:
                        continue
                    if same_domain_only and not same_domain(link, base_netloc):
                        continue
                    if is_recursive_path(link):
                        continue
                    if "/pages/frames/" in link and "frame=i" in link and "family=" not in link:
                        continue

                    # Collapse redirect aliases; if resolved URL is already known, skip
                    resolved = None if '#' in link else resolve_head(link, timeout=3.0)
                    if resolved and (resolved in visited or resolved in enqueued):
                        continue

                    queue.append((link, depth + 1))
                    enqueued.add(link) 

                # simple guardrail to avoid runaway queues
                if len(results) + len(queue) > max_pages * 2:
                    queue[:] = queue[:max_pages]

    # run the async crawler
    asyncio.run(_run())

    combined_text = "\n\n".join(
        item["text"] for item in results if item.get("text")
    ).strip()

    return {
        "pages": results,
        "urls_seen": urls_seen_ordered,
        "combined_text": combined_text,
        "site_meta": site_meta or {"site_title": "", "site_description": "", "favicon": urljoin(f"{urlparse(start_url).scheme}://{urlparse(start_url).netloc}", "/favicon.ico")}
    }
