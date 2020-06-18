var router = require("express").Router();
var passport = require("passport");
var mongoose = require("mongoose");
var Country = mongoose.model("Country");
var auth = require("../auth");

// Use router.param to intercept & prepopulate country data from the name and handing over to *RUD functions
router.param("country", function (req, res, next, name) {
  Country.findOne({ name: name })
    .then(function (country) {
      if (!country) {
        return res.sendStatus(404);
      }
      req.country = country;
      return next();
    })
    .catch(next);
});

// Make the endpoint for retrieving a country by its name
// GET /api/countries/:country
router.get("/:country", auth.optional, function (req, res, next) {
  return Promise.all([req.payload ? User.findById(req.payload.id) : null])
    .then(function (results) {
      return res.json(req.country);
    })
    .catch(next);
});

// Create publicly accessible endpoint to list all countries
// GET /api/countries
router.get("/", auth.optional, function (req, res, next) {
  return Promise.all([
    Country.find().sort({ createdAt: "desc" }).exec(),

    // Retrieve the count of countries without the limit and offset parameters
    Country.count().exec(),
  ])
    .then(function (results) {
      var countries = results[0];
      var countriesCount = results[1];

      return res.json({
        countries: countries,
        countriesCount: countriesCount,
      });
    })
    .catch(next);
});

module.exports = router;
