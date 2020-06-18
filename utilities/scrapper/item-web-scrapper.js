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

    const countryObject = await page.evaluate(() => {
      // get country summary
      const countryIntro = document
        .querySelector(".story-body__introduction")
        .innerHTML.trimLeft()
        .trimRight()
        .replace(/(\r\n|\n|\r)/gm, "");

      // get country capital
      const countryCapital = document
        .querySelector(".ns_subtitle")
        .innerHTML.trimLeft()
        .trimRight()
        .replace(/(\r\n|\n|\r)/gm, "");

      // get country statistics
      const statsList = document.querySelectorAll(".ns_impact-figures > li ");
      let countryStatistics = {};
      // iterate though each item found
      statsList.forEach((linkElement) => {
        const statName = linkElement.querySelector("p > span").innerHTML;
        const statData = linkElement.querySelector("p").textContent;
        countryStatistics[statName] = statData
          .replace(statName, "")
          .trimLeft()
          .trimRight()
          .replace(/(\r\n|\n|\r)/gm, "");
      });

      return Object.assign(
        {},
        {
          intro: countryIntro,
          administrativeCapital: countryCapital,
          statistics: countryStatistics,
        }
      );
    });

    dataObj = countryObject;
  } catch (e) {
    console.log(e);
  }

  browser.close();
  return dataObj;
};

module.exports = itemscrapper;
