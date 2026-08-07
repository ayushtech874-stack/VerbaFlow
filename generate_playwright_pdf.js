const { chromium } = require('playwright');
const path = require('path');

(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const filePath = 'file:///' + path.resolve('printable.html').replace(/\\/g, '/');
    
    await page.goto(filePath, { waitUntil: 'networkidle' });
    
    await page.pdf({
      path: 'DSA_Master_Guide_Printable.pdf',
      format: 'A4',
      printBackground: true,
      margin: {
        top: '12mm',
        right: '12mm',
        bottom: '12mm',
        left: '12mm'
      }
    });

    console.log('PDF_GENERATION_SUCCESSFUL');
    await browser.close();
  } catch (err) {
    console.error('Error generating PDF:', err);
    process.exit(1);
  }
})();
