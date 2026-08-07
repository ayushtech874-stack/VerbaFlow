const fs = require('fs');

const rawHtml = fs.readFileSync('input.html', 'utf8');

// Replace dark mode / colorful CSS with a clean, high-contrast black & white print stylesheet
const cleanHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DSA Master Guide — Algorithm Patterns & Hashing (Print Version)</title>
<style>
  @page {
    size: A4 portrait;
    margin: 12mm 12mm 12mm 12mm;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    background: #ffffff !important;
    color: #000000 !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.45;
    font-size: 10.5pt;
    -webkit-print-color-adjust: exact;
  }

  /* ── HEADER ── */
  .hero {
    background: #ffffff !important;
    border-bottom: 2pt solid #000000 !important;
    padding: 10px 0 15px 0 !important;
    text-align: center !important;
    margin-bottom: 15px !important;
  }
  .hero h1 {
    font-size: 22pt !important;
    font-weight: 800 !important;
    color: #000000 !important;
    -webkit-text-fill-color: initial !important;
    background: none !important;
    margin-bottom: 6px !important;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .hero p {
    color: #333333 !important;
    font-size: 10.5pt !important;
    font-weight: 600;
  }
  .badges {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-top: 10px;
    flex-wrap: wrap;
  }
  .badge {
    padding: 2px 8px !important;
    border-radius: 4px !important;
    font-size: 8pt !important;
    font-weight: 700 !important;
    background: #f0f0f0 !important;
    color: #000000 !important;
    border: 1pt solid #000000 !important;
  }

  .container {
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* ── TOC ── */
  .toc {
    background: #fafafa !important;
    border: 1pt solid #000000 !important;
    border-radius: 4px !important;
    padding: 12px 16px !important;
    margin-bottom: 20px !important;
    page-break-inside: avoid;
  }
  .toc h2 {
    color: #000000 !important;
    margin-bottom: 8px !important;
    font-size: 11pt !important;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 1pt solid #ccc;
    padding-bottom: 4px;
  }
  .toc-grid {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 4px 16px !important;
  }
  .toc a {
    color: #000000 !important;
    text-decoration: none !important;
    font-size: 9pt !important;
    padding: 1px 0 !important;
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
  }
  .toc a span {
    color: #000000 !important;
    font-weight: 800 !important;
    font-size: 8.5pt !important;
  }

  /* ── SECTIONS ── */
  .section {
    background: #ffffff !important;
    border: 1pt solid #555555 !important;
    border-radius: 4px !important;
    padding: 14px 16px !important;
    margin-bottom: 16px !important;
    page-break-inside: avoid;
  }
  .section-header {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
    margin-bottom: 10px !important;
    padding-bottom: 6px !important;
    border-bottom: 1.5pt solid #000000 !important;
  }
  .section-icon {
    width: 28px !important;
    height: 28px !important;
    border-radius: 4px !important;
    background: #e6e6e6 !important;
    color: #000000 !important;
    border: 1pt solid #000000 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 1rem !important;
    flex-shrink: 0 !important;
  }
  .section-title h2 {
    font-size: 12pt !important;
    font-weight: 800 !important;
    color: #000000 !important;
  }
  .section-title p {
    color: #444444 !important;
    font-size: 8.5pt !important;
    margin-top: 1px !important;
  }

  h3 {
    font-size: 10.5pt !important;
    color: #000000 !important;
    margin: 12px 0 6px !important;
    font-weight: 700 !important;
    border-left: 2.5pt solid #000;
    padding-left: 6px;
  }
  h4 {
    font-size: 9.5pt !important;
    color: #000000 !important;
    margin: 8px 0 4px !important;
    font-weight: 700 !important;
  }
  p {
    color: #111111 !important;
    margin-bottom: 6px !important;
    font-size: 9.5pt !important;
  }

  /* ── CODE BLOCKS ── */
  pre {
    background: #f5f5f5 !important;
    border: 1pt solid #777777 !important;
    border-radius: 3px !important;
    padding: 8px 10px !important;
    overflow-x: visible !important;
    white-space: pre-wrap !important;
    word-break: break-all !important;
    margin: 6px 0 10px !important;
    font-family: "Courier New", Courier, monospace !important;
    font-size: 8pt !important;
    line-height: 1.35 !important;
    color: #000000 !important;
    page-break-inside: avoid;
  }
  code {
    background: #eeeeee !important;
    border: 0.5pt solid #aaaaaa !important;
    border-radius: 2px !important;
    padding: 1px 3px !important;
    font-family: "Courier New", Courier, monospace !important;
    font-size: 8pt !important;
    color: #000000 !important;
  }
  pre code {
    background: none !important;
    border: none !important;
    padding: 0 !important;
    color: #000000 !important;
  }

  /* ── SIGNAL / TIP / WARN BOXES ── */
  .signal-box, .tip-box, .warn-box {
    background: #fafafa !important;
    border-left: 3.5pt solid #000000 !important;
    border-top: 1pt solid #cccccc !important;
    border-right: 1pt solid #cccccc !important;
    border-bottom: 1pt solid #cccccc !important;
    border-radius: 0 3px 3px 0 !important;
    padding: 8px 12px !important;
    margin: 8px 0 !important;
    page-break-inside: avoid;
  }
  .signal-box .label, .tip-box .label, .warn-box .label {
    color: #000000 !important;
    font-size: 8pt !important;
    font-weight: 800 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
    margin-bottom: 3px !important;
  }
  .signal-box ul { padding-left: 14px !important; }
  .signal-box li { color: #111111 !important; margin: 2px 0 !important; font-size: 9pt !important; }

  /* ── TABLES ── */
  table {
    width: 100% !important;
    border-collapse: collapse !important;
    margin: 8px 0 12px !important;
    font-size: 8.5pt !important;
    page-break-inside: avoid;
  }
  th {
    background: #e6e6e6 !important;
    color: #000000 !important;
    padding: 5px 8px !important;
    text-align: left !important;
    font-size: 8pt !important;
    text-transform: uppercase !important;
    font-weight: 800 !important;
    border: 1pt solid #000000 !important;
  }
  td {
    padding: 5px 8px !important;
    border: 1pt solid #777777 !important;
    color: #000000 !important;
  }
  tr:nth-child(even) td {
    background: #f9f9f9 !important;
  }

  .good, .bad, .warn {
    color: #000000 !important;
    font-weight: 700 !important;
  }

  /* ── COMPLEXITY TAGS ── */
  .cx {
    display: inline-block !important;
    padding: 1px 5px !important;
    border-radius: 3px !important;
    font-size: 7.5pt !important;
    font-weight: 700 !important;
    font-family: monospace !important;
    background: #f0f0f0 !important;
    color: #000000 !important;
    border: 1pt solid #000000 !important;
  }
  .cx-g, .cx-y, .cx-r {
    background: #f5f5f5 !important;
    color: #000000 !important;
    border: 1pt solid #333333 !important;
  }

  /* ── VARIANT CARDS & GRIDS ── */
  .variants {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 8px !important;
    margin: 8px 0 !important;
    page-break-inside: avoid;
  }
  .variant-card {
    background: #fafafa !important;
    border: 1pt solid #666666 !important;
    border-radius: 3px !important;
    padding: 8px 10px !important;
  }
  .variant-card h4 {
    color: #000000 !important;
    margin: 0 0 3px !important;
    font-size: 9pt !important;
  }
  .variant-card p {
    color: #222222 !important;
    font-size: 8pt !important;
    margin: 0 !important;
  }
  .variant-card pre {
    margin: 4px 0 0 !important;
    font-size: 7.5pt !important;
  }

  /* ── DECISION TREE ── */
  .tree-box {
    background: #fafafa !important;
    border: 1pt solid #000000 !important;
    border-radius: 4px !important;
    padding: 10px 12px !important;
    font-family: "Courier New", monospace !important;
    font-size: 8pt !important;
    line-height: 1.4 !important;
    white-space: pre !important;
    overflow-x: visible !important;
    color: #000000 !important;
    margin: 10px 0 !important;
    page-break-inside: avoid;
  }

  /* ── COMPARISON GRID ── */
  .compare-grid {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 8px !important;
    margin: 8px 0 !important;
    page-break-inside: avoid;
  }
  .compare-card {
    background: #ffffff !important;
    border: 1pt solid #666666 !important;
    border-radius: 3px !important;
    padding: 8px 10px !important;
  }
  .compare-card.good-card {
    border: 1.5pt solid #000000 !important;
  }
  .compare-card.bad-card {
    border: 1.5pt dashed #444444 !important;
  }

  .divider {
    height: 1pt;
    background: #000000 !important;
    margin: 16px 0 !important;
  }

  footer {
    text-align: center !important;
    padding: 14px !important;
    color: #444444 !important;
    font-size: 8pt !important;
    border-top: 1pt solid #000000 !important;
    margin-top: 16px !important;
  }
  footer span {
    color: #000000 !important;
    font-weight: 700 !important;
  }

  a { text-decoration: none; color: black; }
</style>
</head>
<body>
`;

// Extract content inside body tag of input.html
const bodyContentMatch = rawHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
const bodyContent = bodyContentMatch ? bodyContentMatch[1] : rawHtml;

// Strip out inline color style overrides if any remain in inner HTML tags
let cleanedBodyContent = bodyContent.replace(/style="color:[^"]*"/gi, '');
cleanedBodyContent = cleanedBodyContent.replace(/color:#[0-9a-fA-F]+/gi, 'color:#000000');

const finalHtml = cleanHtml + cleanedBodyContent + '\n</body>\n</html>';
fs.writeFileSync('printable.html', finalHtml);
console.log('printable.html created successfully!');
