const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const filePath = 'file:///' + path.resolve('printable.html').replace(/\\/g, '/');
    
    await page.goto(filePath, { waitUntil: 'networkidle0' });
    
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

    console.log('PDF generated successfully!');
    await browser.close();
  } catch (err) {
    console.error('Error generating PDF with puppeteer:', err);
    process.exit(1);
  }
})();
