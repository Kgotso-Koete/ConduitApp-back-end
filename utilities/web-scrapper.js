const puppeteer = require("puppeteer");

const webscraping = async (pageURL) => {
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
      const newsDOM = document.querySelectorAll("#recent-posts-3 > ul > li");
      let newsList = [];
      newsDOM.forEach((linkElement) => {
        const currentNews = linkElement.querySelector("a").innerText;
        newsList.push(currentNews);
      });
      return newsList;
    });

    dataObj = {
      amount: publishedNews.length,
      publishedNews,
    };
  } catch (e) {
    console.log(e);
  }

  browser.close();
  return dataObj;
};

module.exports = webscraping;
