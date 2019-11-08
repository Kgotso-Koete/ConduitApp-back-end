var router = require("express").Router();
var passport = require("passport");
var mongoose = require("mongoose");
var Article = mongoose.model("Article");
var User = mongoose.model("User");
var auth = require("../auth");

// Make the endpoint for creating articles for logged in users
// POST /api/articles
router.post("/", auth.required, function(req, res, next) {
  User.findById(req.payload.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(401);
      }

      var article = new Article(req.body.article);

      article.author = user;

      return article.save().then(function() {
        console.log(article.author);
        return res.json({ article: article.toJSONFor(user) });
      });
    })
    .catch(next);
});

// Use router.param to intercept & prepopulate article data from the slug and handing over to *RUD functions
router.param("article", function(req, res, next, slug) {
  Article.findOne({ slug: slug })
    .populate("author")
    .then(function(article) {
      if (!article) {
        return res.sendStatus(404);
      }

      req.article = article;

      return next();
    })
    .catch(next);
});

// Make the endpoint for retrieving an article by its slug
// GET /api/articles/:slug
router.get("/:article", auth.optional, function(req, res, next) {
  Promise.all([
    req.payload ? User.findById(req.payload.id) : null,
    req.article.populate("author").execPopulate()
  ])
    .then(function(results) {
      var user = results[0];

      return res.json({ article: req.article.toJSONFor(user) });
    })
    .catch(next);
});

// Create the endpoint for authorized users to update articles
// PUT /api/articles/:slug
router.put("/:article", auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function(user) {
    if (req.article.author._id.toString() === req.payload.id.toString()) {
      if (typeof req.body.article.title !== "undefined") {
        req.article.title = req.body.article.title;
      }

      if (typeof req.body.article.description !== "undefined") {
        req.article.description = req.body.article.description;
      }

      if (typeof req.body.article.body !== "undefined") {
        req.article.body = req.body.article.body;
      }

      req.article
        .save()
        .then(function(article) {
          return res.json({ article: article.toJSONFor(user) });
        })
        .catch(next);
    } else {
      return res.sendStatus(403);
    }
  });
});

// Create the endpoint for deleting articles
// DELETE /api/articles/:slug
router.delete("/:article", auth.required, function(req, res, next) {
  User.findById(req.payload.id).then(function() {
    if (req.article.author._id.toString() === req.payload.id.toString()) {
      return req.article.remove().then(function() {
        return res.sendStatus(204);
      });
    } else {
      return res.sendStatus(403);
    }
  });
});

// Favorite an article
// POST /api/articles/:slug/favorite
router.post("/:article/favorite", auth.required, function(req, res, next) {
  var articleId = req.article._id; // middleware to get article data from parameter

  User.findById(req.payload.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(401);
      }

      return user.favorite(articleId).then(function() {
        return req.article.updateFavoriteCount().then(function(article) {
          return res.json({ article: article.toJSONFor(user) });
        });
      });
    })
    .catch(next);
});

// Unfavorite an article
// DELETE /api/articles/:slug/favorite
router.delete("/:article/favorite", auth.required, function(req, res, next) {
  var articleId = req.article._id; // middleware to get article data from parameter

  User.findById(req.payload.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(401);
      }

      return user.unfavorite(articleId).then(function() {
        return req.article.updateFavoriteCount().then(function(article) {
          return res.json({ article: article.toJSONFor(user) });
        });
      });
    })
    .catch(next);
});

module.exports = router;
