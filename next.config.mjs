// next.config.mjs  
import nextTranslate from 'next-translate-plugin';  
  
/** @type {import('next').NextConfig} */  
const nextConfig = {   
  experimental: { appDir: true },
  // Any other Next.js configurations  
};  
  
export default nextTranslate(nextConfig);  