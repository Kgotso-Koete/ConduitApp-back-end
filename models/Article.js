var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
var slug = require("slug"); // package we'll use to auto create URL slugs

var ArticleSchema = new mongoose.Schema(
  {
    slug: { type: String, lowercase: true, unique: true },
    title: String,
    description: String,
    body: String,
    favoritesCount: { type: Number, default: 0 },
    tagList: [{ type: String }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

// Using mongoose-unique-validator to ensure the slug is unique
ArticleSchema.plugin(uniqueValidator, { message: "is already taken" });

// Generates a unique slug for this article, article title + 6 random charachters
ArticleSchema.methods.slugify = function() {
  this.slug =
    slug(this.title) +
    "-" +
    ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
};

// Generate the slug before Mongoose tries to validate the model otherwise it will fail to save the required field
ArticleSchema.pre("validate", function(next) {
  if (!this.slug) {
    this.slugify();
  }

  next();
});

// Add a method that returns the JSON of an article
ArticleSchema.methods.toJSONFor = function(user) {
  return {
    slug: this.slug,
    title: this.title,
    description: this.description,
    body: this.body,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    tagList: this.tagList,
    favoritesCount: this.favoritesCount,
    author: this.author.toProfileJSONFor(user)
  };
};

mongoose.model("Article", ArticleSchema);
