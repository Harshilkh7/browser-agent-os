const { chromium } = require("playwright");

async function openBrowser(url) {
  const browser = await chromium.launch({
    headless: false,
  });

  try {
    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    const title = await page.title();

    const bodyText = await page.textContent("body");

    await browser.close();

    return `
Page Title:
${title}

Page Content:
${bodyText?.slice(0, 2000)}
`;
  } catch (error) {
    await browser.close();
    return `Browser tool failed: ${error.message}`;
  }
}

module.exports = openBrowser;