var mongoose = require("mongoose");
// To validate emails/usernames as unique
var uniqueValidator = require("mongoose-unique-validator");
// Used to create password hash
var crypto = require("crypto");
// For the JWT passed to the front-end that will be used for authentication
var jwt = require("jsonwebtoken");
var secret = require("../config/config").secret;

var UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/^[a-zA-Z0-9]+$/, "is invalid"],
      index: true
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "can't be blank"],
      match: [/\S+@\S+\.\S+/, "is invalid"],
      index: true
    },
    bio: String,
    image: String,
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    hash: String,
    salt: String
  },
  { timestamps: true }
);

// To check that username and passwords for registering users is unique
UserSchema.plugin(uniqueValidator, { message: "is already taken." });

// Create a method for setting User passwords
UserSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
};

// Create a method to validate passwords
UserSchema.methods.validPassword = function(password) {
  var hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
  return this.hash === hash;
};

// Create a method on the user model to generate a JWT
// Setting the token expiration to 60 days in the future
UserSchema.methods.generateJWT = function() {
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      exp: parseInt(exp.getTime() / 1000)
    },
    secret
  );
};

// Create a method to get the JSON representation of a user for authentication
UserSchema.methods.toAuthJSON = function() {
  return {
    id: this._id, // add object id to make it easier to debug
    username: this.username,
    email: this.email,
    token: this.generateJWT()
  };
};

// Create a method for a user to favorite an article
UserSchema.methods.favorite = function(id) {
  if (this.favorites.indexOf(id) === -1) {
    this.favorites = this.favorites.concat([id]);
  }

  return this.save();
};

// Create a method for a user to unfavorite an article
UserSchema.methods.unfavorite = function(id) {
  this.favorites.remove(id);
  return this.save();
};

// Create a method for a user to check if they've favorited an article
// To tell the front end whether it should show a like or unlike button for a given article
UserSchema.methods.isFavorite = function(id) {
  return this.favorites.some(function(favoriteId) {
    return favoriteId.toString() === id.toString();
  });
};

// Create a method for a following another user
UserSchema.methods.follow = function(id) {
  if (this.following.indexOf(id) === -1) {
    this.following = this.following.concat([id]);
  }

  return this.save();
};

// Create a method for a unfollowing another user
UserSchema.methods.unfollow = function(id) {
  this.following.remove(id);
  return this.save();
};

// Create a method for checking if a user is following another user
// To tell the front end whether it should show a follow or unfollow button for a given user's profile
UserSchema.methods.isFollowing = function(id) {
  return this.following.some(function(followId) {
    return followId.toString() === id.toString();
  });
};

// Create a method that returns user's public profile data
UserSchema.methods.toProfileJSONFor = function(user) {
  return {
    id: this._id, // add object id to make it easier to debug
    username: this.username,
    bio: this.bio,
    image:
      this.image || "https://static.productionready.io/images/smiley-cyrus.jpg",
    following: user ? user.isFollowing(this._id) : false
  };
};

mongoose.model("User", UserSchema);
