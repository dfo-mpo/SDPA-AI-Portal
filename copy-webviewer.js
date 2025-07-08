/**
 * Copies the required Apryse WebViewer static assets from node_modules 
 * into the public folder (./public/lib/webviewer) so they can be 
 * served by the React app during development and production.
 * 
 * These assets include HTML, JavaScript, CSS, and WebAssembly files that 
 * WebViewer loads at runtime. They are not bundled by default, so this step 
 * ensures they're available in the correct static path.
 * 
 * This script is run automatically before dev and build commands.
 * 
 * For more information, see:
 * https://docs.apryse.com/web/guides/get-started/copy-assets
 */
const fs = require('fs-extra');

const copyFiles = async () => {
  try {
    await fs.copy('./node_modules/@pdftron/webviewer/public', './public/lib/webviewer');
    console.log('WebViewer files copied over successfully');
  } catch (err) {
    console.error(err);
  }
};

copyFiles();