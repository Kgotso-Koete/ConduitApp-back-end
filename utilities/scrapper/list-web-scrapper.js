const puppeteer = require("puppeteer");

const listscrapper = async (pageURL) => {
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

    const countryProfileLinks = await page.evaluate(() => {
      // get list of all items to be clicked on
      const countryListDOM = document.querySelectorAll(".group > ul > li");
      let countryList = [];

      // iterate though each item found
      countryListDOM.forEach((linkElement) => {
        // get link name and website and save in object
        const countryName = linkElement
          .querySelector(".cta")
          .innerHTML.trimLeft()
          .trimRight()
          .replace(/(\r\n|\n|\r)/gm, "")
          .split(",");
        const countryLink = linkElement.querySelector("a").href;
        const countryObject = Object.assign({}, { [countryName]: countryLink });

        countryList.push(countryObject);
      });
      return countryList;
    });

    dataObj = {
      amount: countryProfileLinks.length,
      countryProfileLinks,
    };
  } catch (e) {
    console.log(e);
  }

  browser.close();
  return dataObj;
};

module.exports = listscrapper;
