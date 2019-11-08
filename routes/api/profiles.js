var router = require("express").Router();
var mongoose = require("mongoose");
var User = mongoose.model("User");
var auth = require("../auth");

// Prepopulate req.profile with the user's data when the :username parameter is contained within a route
router.param("username", function(req, res, next, username) {
  User.findOne({ username: username })
    .then(function(user) {
      if (!user) {
        return res.sendStatus(404);
      }

      req.profile = user;

      return next();
    })
    .catch(next);
});

// Create an endpoint to fetch a user's profile by their username
// Confirm if current user is logged and pass to profile.toProfileJSONFor, before confirming if user follows profile
router.get("/:username", auth.optional, function(req, res, next) {
  if (req.payload) {
    User.findById(req.payload.id).then(function(user) {
      if (!user) {
        return res.json({ profile: req.profile.toProfileJSONFor(false) });
      }

      return res.json({ profile: req.profile.toProfileJSONFor(user) });
    });
  } else {
    return res.json({ profile: req.profile.toProfileJSONFor(false) });
  }
});

module.exports = router;
