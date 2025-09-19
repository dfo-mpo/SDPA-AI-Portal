// src/pages/tools/MLModelsRepo/views/FilesTab.js
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Box, Stack, Paper, Button, Typography, Divider, Tooltip, IconButton,
} from "@mui/material";
import { Plus, X as CloseIcon } from "lucide-react";
import SearchBar from "../components/SearchBar";
import * as repo from "../services/repoApi";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";

export function FilesTab({ model, isMine, userId }) {
  const [files, setFiles] = useState([]);
  const [query, setQuery] = useState("");
  const fileInputRef = useRef(null);
  const [currentDir, setCurrentDir] = useState("");
  const [selectedPath, setSelectedPath] = useState("");

  const base = model?.sourcePath || (model?.private ? `users/${userId}/models/${model?.id}` : `models/${model?.id}`);
  const prefix = `${base}/files/`;

  const reload = useCallback(async () => {
    const items = await repo.listModelFilesById(model.id, { userId });
    setFiles(items);
  }, [model.id, userId]);

  useEffect(() => {
    reload();
  }, [reload]);
  // Make a simple flat list with relative paths and basic search
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const raw = (files || [])
      .map(f => {
        let rel = f.name;
        const splitIdx = rel.indexOf("/files/");
        if (splitIdx !== -1) {
          rel = rel.slice(splitIdx + "/files/".length);
        }
        return { ...f, rel };
      })
    const dirSet = new Set();
     for (const f of raw) {
       const parts = f.rel.split("/").filter(Boolean);
       for (let i = 0; i < parts.length - 1; i++) {
         dirSet.add(parts.slice(0, i + 1).join("/"));
       }
     }
     // drop any blob whose rel equals a dir name (prevents “Notes” showing twice)
     return raw.filter(f => !dirSet.has(f.rel));
  }, [files, prefix, query]);

  const handleTreeSelect = (_event, nodeIds) => {
    // SimpleTreeView gives an array; take the last one
    const id = Array.isArray(nodeIds) ? nodeIds[nodeIds.length - 1] : nodeIds;
    if (!id) return;
    // directories in our tree have a trailing '/'
    // strip the leading slash from our itemId scheme
    const rel = id.startsWith('/') ? id.slice(1) : id;
    const isDir = rel.endsWith('/');
    setSelectedPath(rel);
    setCurrentDir(isDir ? rel : rel.split('/').slice(0, -1).join('/') + (rel.includes('/') ? '/' : ''));
  };

    // Build a simple directory tree from rows
   const tree = useMemo(() => {
     const root = { name: "", dirs: new Map(), files: [] };
     for (const f of rows) {
       const parts = f.rel.split("/").filter(Boolean);
       let node = root;
       for (let i = 0; i < parts.length; i ++) {
        const part = parts[i];
        const isFile = i === parts.length - 1 && !f.rel.endsWith("/");
        if (isFile) {
          if (!node.dirs.has(part)) {
            node.files.push({ name: part, full: f.rel, size: f.size });
          }
        } else {
          if (!node.dirs.has(part)) node.dirs.set(part, { name: part, dirs: new Map(), files: [] });
          node = node.dirs.get(part);
        }
      }
    }
    return root;
  }, [rows]);

  // recursive renderer for TreeView
  const renderNode = (node, path = "") => {
    const dirItems = [...node.dirs.values()].sort((a, b) => a.name.localeCompare(b.name));
    const fileItems = node.files.sort((a, b) => a.name.localeCompare(b.name));
    const idBase = path || "/";
    return (
      <>
        {dirItems.map(d => {
          const id = `${idBase}${d.name}/`;
          return (
            <TreeItem key={id} itemId={id} label={d.name}>
              {renderNode(d, id)}
            </TreeItem>
          );
        })}
        {fileItems.map(f => {
          const id = `${idBase}${f.name}`;
          const size = f.size ? ` • ${(f.size / (1024 * 1024)).toFixed(2)} MB` : "";
          return (
            <TreeItem
              key={id}
              itemId={id}
              label={
                <Box sx={{ height: "30px", display: "flex", alignItems: "center", justifyContent: "space-between", m : 0 }}>
                  <Typography variant="body2">{`${f.name}${size}`}</Typography>
                  {canContribute && (
                    <Tooltip title="Delete file">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await repo.deleteModelFile({
                            id: model.id,
                            filePath: f.full,   // relative path
                            isPrivate: model.private,
                            userId,
                            sourcePath: model.sourcePath,
                          });
                          reload();
                        }}
                      >
                        <CloseIcon size={14} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              }
            />
          );
        })}
      </>
    );
  }
  const canContribute = Boolean(userId) && Boolean(isMine);

  const pickFiles = () => fileInputRef.current?.click();
  const onPicked = async (e) => {
    const arr = Array.from(e.target.files || []);
    if (!arr.length) return;
    await repo.uploadModelFiles({
      id: model.id,
      files: arr,
      isPrivate: model.private,
      userId,
      sourcePath: model.sourcePath,
      dir: currentDir,
    });
    e.target.value = "";
    reload();
  };

  return (
    <Box  sx={{width: "50%", minWidth: "400px"}} > 
      {/* Toolbar */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search files…"
          sx={{ flexGrow: 1, maxWidth: 520 }}
        />
        <Tooltip title={canContribute ? "Upload files to this model" : "Only the owner can add/delete"}>
          <span>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Plus size={16} />}
              onClick={pickFiles}
              disabled={!canContribute}
            >
              Add
            </Button>
          </span>
        </Tooltip>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          Target: {selectedPath || currentDir || "(root)"}
        </Typography>
        <input ref={fileInputRef} type="file" hidden multiple onChange={onPicked} />
      </Stack>

      {/* List */}
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
        {rows.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">No files yet.</Typography>
          </Box>
        ) : (
          <>
            {(
               <Box sx={{ p: 1.5 }}>
                 <SimpleTreeView
                   defaultCollapseIcon={<span>▾</span>}
                   defaultExpandIcon={<span>▸</span>}
                   sx={{ overflow: "auto" }}
                   onSelectedItemsChange={handleTreeSelect}
                 >
                   {/* root renders only its children */}
                   {renderNode(tree, "")}
                 </SimpleTreeView>
               </Box>
             )}
            <Divider />
            <Box sx={{ p: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {rows.length} file{rows.length !== 1 ? "s" : ""}{query ? " (filtered)" : ""}
              </Typography>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}

export default FilesTab;