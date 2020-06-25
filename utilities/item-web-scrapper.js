const puppeteer = require("puppeteer");

const itemscrapper = async (pageURL) => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox"],
  });

  // Create a new page
  const page = await browser.newPage();
  // Configure the navigation timeout
  await page.setDefaultNavigationTimeout(0);

  let dataObj = {};

  try {
    await page.goto(pageURL);

    const publishedNews = await page.evaluate(() => {
      const contentDOM = document.querySelectorAll(
        "#content > article > div > p"
      );
      return contentDOM;
    });

    dataObj = {
      title: "",
      date: "",
      article: publishedNews,
    };
  } catch (e) {
    console.log(e);
  }

  browser.close();
  return dataObj;
};

module.exports = itemscrapper;
