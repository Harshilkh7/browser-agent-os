const { chromium } = require("playwright");

async function browserTool(input) {
  const browser = await chromium.launch({
    headless: false,
  });

  try {
    const page = await browser.newPage();

    if (input.startsWith("http")) {
      await page.goto(input, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });

      const title = await page.title();
      const bodyText = await page.textContent("body");

      await browser.close();

      return JSON.stringify({
        title,
        content: bodyText?.slice(0, 1500),
      });
    }

    await page.goto("https://duckduckgo.com", {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    await page.fill('input[name="q"]', input);

    await page.keyboard.press("Enter");

    await page.waitForTimeout(3000);

    await page.keyboard.press("Enter");

    await page.waitForTimeout(3000);

    const results = await page.textContent("body");

    await browser.close();

    return JSON.stringify({
      query: input,
      results: results?.slice(0, 2000),
    });

  } catch (error) {
    await browser.close();

    return `Browser tool failed: ${error.message}`;
  }
}

module.exports = browserTool;