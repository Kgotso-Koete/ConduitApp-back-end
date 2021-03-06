var router = require("express").Router();
var mongoose = require("mongoose");
var Article = mongoose.model("Article");

// Create a route for getting the set of tags that have been used on articles
// No need for fetching from a 'tags' collection
router.get("/", function(req, res, next) {
  Article.find()
    .distinct("tagList")
    .then(function(tags) {
      return res.json({ tags: tags });
    })
    .catch(next);
});

// dummy routing test
router.get("/ninja", function(req, res, next) {
  return res.json({ message: "hello AUTOBOT giant robot warrior tag" });
});

module.exports = router;
