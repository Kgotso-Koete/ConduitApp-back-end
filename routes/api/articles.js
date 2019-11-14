var router = require("express").Router();
var passport = require("passport");
var mongoose = require("mongoose");
var Article = mongoose.model("Article");
var User = mongoose.model("User");
var Comment = mongoose.model("Comment");
var auth = require("../auth");

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

// Router param middleware for resolving get comment details before DELETE is called
router.param("comment", function(req, res, next, id) {
  Comment.findById(id)
    .then(function(comment) {
      if (!comment) {
        return res.sendStatus(404);
      }

      req.comment = comment;

      return next();
    })
    .catch(next);
});

// Create publically accessible Articles querying endpoint to list all articles
// GET /api/articles?tag=NodeJS
router.get("/", auth.optional, function(req, res, next) {
  var query = {};
  var limit = 20;
  var offset = 0;

  // Mongo shell query: db.articles.find().pretty().limit(4)
  if (typeof req.query.limit !== "undefined") {
    limit = req.query.limit;
  }

  if (typeof req.query.offset !== "undefined") {
    offset = req.query.offset;
  }
  // Mongo shell query: db.articles.find({tagList:{$in:["technology"]}}).pretty()
  if (typeof req.query.tag !== "undefined") {
    query.tagList = { $in: [req.query.tag] };
  }

  //  Promise.all() method takes an array of promises, then passes an array of resolved values to the attached
  Promise.all([
    req.query.author ? User.findOne({ username: req.query.author }) : null,
    req.query.favorited ? User.findOne({ username: req.query.favorited }) : null
  ])
    .then(function(results) {
      var author = results[0];
      var favoriter = results[1];

      // when provided, query for articles authored by this username
      // Mongo shell query becomes: db.articles.find({"author":ObjectId("5dc5aadf955980353e2a8675")}).pretty()
      if (author) {
        query.author = author._id;
      }

      // Mongo shell query: db.articles.find({"_id":{$in:[ObjectId("5dc584d4da082d3b1859017f"), ObjectId("5dc57b747a16752313f85199")]}}).pretty()
      if (favoriter) {
        //  when provided, query for articles favorited by this username
        query._id = { $in: favoriter.favorites };
      } else if (req.query.favorited) {
        query._id = { $in: [] };
      }

      //  Promise.all() method takes an array of promises, then passes an array of resolved values to the attached
      return Promise.all([
        Article.find(query)
          .limit(limit)
          .skip(offset)
          .sort({ createdAt: "desc" })
          .populate("author")
          .exec(),

        // Retrieve the count of articles without the limit and offset parameters
        Article.count(query).exec(),

        // Retrieve the authenticated user to confirm if user has favorited the article or followed the author
        req.payload ? User.findById(req.payload.id) : null
      ]).then(function(results) {
        var articles = results[0];
        var articlesCount = results[1];
        var user = results[2];

        return res.json({
          articles: articles.map(function(article) {
            return article.toJSONFor(user);
          }),
          articlesCount: articlesCount
        });
      });
    })
    .catch(next);
});

// Create a route for retrieving articles authored by users being followed
// GET /api/articles/feed
router.get("/feed", auth.required, function(req, res, next) {
  var limit = 20;
  var offset = 0;

  if (typeof req.query.limit !== "undefined") {
    limit = req.query.limit;
  }

  if (typeof req.query.offset !== "undefined") {
    offset = req.query.offset;
  }

  User.findById(req.payload.id).then(function(user) {
    if (!user) {
      return res.sendStatus(401);
    }
    // Promise.all() method takes an array of promises, then passes an array of resolved values to the attached
    // Mongo shell query: db.articles.find({"author":{$in:[ObjectId("5dc69cb535a37c1ec7241055"), ObjectId("5dc5aadf955980353e2a8675")]}}).pretty()
    Promise.all([
      Article.find({ author: { $in: user.following } })
        .limit(limit)
        .skip(offset)
        .populate("author")
        .exec(),
      Article.count({ author: { $in: user.following } })
    ])
      .then(function(results) {
        var articles = results[0];
        var articlesCount = results[1];

        return res.json({
          articles: articles.map(function(article) {
            return article.toJSONFor(user);
          }),
          articlesCount: articlesCount
        });
      })
      .catch(next);
  });
});

// Create a route for retrieving trending articles in the global feed based on aranking by highest commentCount
// GET /api/articles/trending
router.get("/trending", auth.required, function(req, res, next) {
  var limit = 20;
  var offset = 0;

  if (typeof req.query.limit !== "undefined") {
    limit = req.query.limit;
  }

  if (typeof req.query.offset !== "undefined") {
    offset = req.query.offset;
  }

  User.findById(req.payload.id).then(function(user) {
    if (!user) {
      return res.sendStatus(401);
    }
    // Promise.all() method takes an array of promises, then passes an array of resolved values to the attached
    // Mongo shell query: db.articles.find({"author":{$in:[ObjectId("5dc69cb535a37c1ec7241055"), ObjectId("5dc5aadf955980353e2a8675")]}}).pretty()
    Promise.all([
      Article.find()
        .sort({ commentCount: -1 })
        .limit(limit)
        .skip(offset)
        .populate("author")
        .exec(),
      Article.count().sort({ commentCount: -1 })
    ])
      .then(function(results) {
        var articles = results[0];
        var articlesCount = results[1];

        return res.json({
          articles: articles.map(function(article) {
            return article.toJSONFor(user);
          }),
          articlesCount: articlesCount
        });
      })
      .catch(next);
  });
});

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

      if (typeof req.body.article.tagList !== "undefined") {
        req.article.tagList = req.body.article.tagList;
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
      if (req.article.author._id.toString() === req.payload.id.toString()) {
        return user.unfavorite(articleId).then(function() {
          return req.article.updateFavoriteCount().then(function(article) {
            return res.sendStatus(204);
          });
        });
      } else {
        return res.sendStatus(403);
      }
    })
    .catch(next);
});

// Create an endpoint to create comments on articles
// POST /api/articles/:slug/comments
router.post("/:article/comments", auth.required, function(req, res, next) {
  User.findById(req.payload.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(401);
      }

      var comment = new Comment(req.body.comment);
      comment.article = req.article;
      comment.author = user;

      return comment.save().then(function() {
        req.article.comments = req.article.comments.concat([comment]);
        return req.article
          .save()
          .then(function(article) {
            return Comment.count({ article: req.article._id }).then(function(
              count
            ) {
              req.article.commentCount = count;
              return req.article.save();
            });
          })
          .then(function(article) {
            res.json({ comment: comment.toJSONFor(user) });
          });
      });
    })
    .catch(next);
});

// Create an endpoint to list comments on articles
// GET /api/articles/:slug/comments
router.get("/:article/comments", auth.optional, function(req, res, next) {
  Promise.resolve(req.payload ? User.findById(req.payload.id) : null)
    .then(function(user) {
      return req.article
        .populate({
          path: "comments",
          populate: {
            path: "author"
          },
          options: {
            sort: {
              createdAt: "desc"
            }
          }
        })
        .execPopulate()
        .then(function(article) {
          return res.json({
            comments: req.article.comments.map(function(comment) {
              return comment.toJSONFor(user);
            })
          });
        });
    })
    .catch(next);
});

// Create an endpoint for comment authors to delete comments on articles
// DELETE /api/articles/:slug/comments/:id
router.delete("/:article/comments/:comment", auth.required, function(
  req,
  res,
  next
) {
  // Check that the currently logged in user is the comment author
  if (req.comment.author.toString() === req.payload.id.toString()) {
    // Remove the comment ID from the article model
    req.article.comments.remove(req.comment._id);
    req.article
      .save()
      .then(
        // delete the actual comment from the database
        Comment.find({ _id: req.comment._id })
          .remove()
          .exec()
      )
      .then(function() {
        res.sendStatus(204);
      });
  } else {
    res.sendStatus(403);
  }
});

module.exports = router;
