const { chromium } = require("playwright");

async function openBrowser(url) {
  const browser = await chromium.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto(url);

  const title = await page.title();

  return `Opened ${url} with title: ${title}`;
}

module.exports = openBrowser; 