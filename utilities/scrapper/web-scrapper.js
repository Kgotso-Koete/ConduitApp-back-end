const itemscrapper = require("./item-web-scrapper");
const listscrapper = require("./list-web-scrapper");
const notifyUser = require("../email-notifyer");
const data = require("../../config/environment-variables");
const { pageURL, email } = data;
var mongoose = require("mongoose");
var Country = mongoose.model("Country");

const webcrapper = async () => {
  listscrapper(pageURL)
    .then((dataObj) => {
      dataObj["countryProfileLinks"].forEach((country) => {
        const countryLink = Object.keys(country).map((k) => country[k])[0];

        itemscrapper(countryLink)
          .then((dataObj) => {
            console.log(dataObj);

            var countryEntry = new Country(dataObj);
            notifyUser(email, dataObj);
            countryEntry.save();
          })
          .catch(console.error);

        console.log(countryLink);
      });
    })
    .catch(console.error);
};

module.exports = webcrapper;
