const fs = require('fs');
const path = require('path');

const src = "C:\\Users\\Vinay Gowda\\.gemini\\antigravity\\brain\\f561a35a-cfbc-44c1-846e-b4b7da4cb87e\\melodia_favicon_1773477821308.png";
const dest = "c:\\Users\\Vinay Gowda\\OneDrive\\Desktop\\Final Music\\music-library-frontend\\public\\favicon.png";

try {
    fs.copyFileSync(src, dest);
    console.log('Successfully copied to favicon.png');
    // Also copy to favicon.ico just in case
    const destIco = "c:\\Users\\Vinay Gowda\\OneDrive\\Desktop\\Final Music\\music-library-frontend\\public\\favicon.ico";
    fs.copyFileSync(src, destIco);
    console.log('Successfully copied to favicon.ico');
} catch (err) {
    console.error('Error copying file:', err);
}
