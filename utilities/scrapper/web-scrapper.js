const itemscrapper = require("./item-web-scrapper");
const listscrapper = require("./list-web-scrapper");
const compareAndSaveResults = require("../database-updater");

const webcrapper = async () => {
  listscrapper("https://www.bbc.com/news/world-africa-16833769")
    .then((dataObj) => {
      dataObj["countryProfileLinks"].forEach((country) => {
        const countryLink = Object.keys(country).map((k) => country[k])[0];

        if (
          countryLink === "https://www.bbc.com/news/world-africa-13072774" ||
          countryLink === "https://www.bbc.com/news/world-africa-14094760"
        ) {
          itemscrapper(countryLink)
            .then((dataObj) => {
              console.log(dataObj);
            })
            .catch(console.error);
        }

        console.log(countryLink);
      });
    })
    .catch(console.error);
};

module.exports = webcrapper;
