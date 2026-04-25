const fs = require('fs');
const path = 'c:/Users/pinkf/Desktop/Antigravity Project/pdfa2z/components/PdfEditorCanvas.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldStr = 'colors={PRO_COLORS}\r\n        />';
const newStr = 'colors={PRO_COLORS}\r\n          activeFontSize={activeFontSize}\r\n          setActiveFontSize={setActiveFontSize}\r\n          activeFont={activeFont}\r\n          setActiveFont={setActiveFont}\r\n        />';

// Try with both CRLF and LF
if (content.includes(oldStr)) {
    content = content.replace(oldStr, newStr);
} else {
    content = content.replace('colors={PRO_COLORS}\n        />', 'colors={PRO_COLORS}\n          activeFontSize={activeFontSize}\n          setActiveFontSize={setActiveFontSize}\n          activeFont={activeFont}\n          setActiveFont={setActiveFont}\n        />');
}

fs.writeFileSync(path, content, 'utf8');
console.log('Patch applied successfully');
