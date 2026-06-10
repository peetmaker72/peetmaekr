const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 2,
  });
  const filePath = path.join(__dirname, 'cover.html');
  await page.goto('file://' + filePath);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(__dirname, 'cover.png') });
  await browser.close();
})();
