// Prints resume.html (written by build.py) to resume.pdf. Run from this folder: node pdf.js
const path = require('path');
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + path.join(__dirname, 'resume.html')); await p.waitForTimeout(500);
  await p.pdf({ path: path.join(__dirname, 'resume.pdf'), format: 'Letter', printBackground: true });
  await b.close();
})();
