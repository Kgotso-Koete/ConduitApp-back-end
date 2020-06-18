const itemscrapper = require("./item-web-scrapper");
const listscrapper = require("./list-web-scrapper");
const compareAndSaveResults = require("../database-updater");

const webcrapper = async () => {
  itemscrapper("https://www.bbc.com/news/world-africa-13072774")
    .then((dataObj) => {
      console.log(dataObj);
    })
    .catch(console.error);

  listscrapper("https://www.bbc.com/news/world-africa-16833769")
    .then((dataObj) => {
      console.log(dataObj);
    })
    .catch(console.error);
};

module.exports = webcrapper;
