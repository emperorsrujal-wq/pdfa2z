const fs = require('fs');
const path = 'c:/Users/pinkf/Desktop/Antigravity Project/pdfa2z/components/PdfEditorCanvas.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldStr = 'colors={PRO_COLORS}\n        />';
const newStr = 'colors={PRO_COLORS}\n          activeFontSize={activeFontSize}\n          setActiveFontSize={setActiveFontSize}\n          activeFont={activeFont}\n          setActiveFont={setActiveFont}\n        />';

// Standardize line endings to LF for easier matching
content = content.replace(/\r\n/g, '\n');

if (content.includes(oldStr)) {
    content = content.replace(oldStr, newStr);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Patch applied successfully');
} else {
    console.log('Target string not found');
    console.log('CONTENT START:');
    console.log(content.substring(content.indexOf('colors={PRO_COLORS}'), content.indexOf('colors={PRO_COLORS}') + 100));
}
