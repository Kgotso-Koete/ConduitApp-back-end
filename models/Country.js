var mongoose = require("mongoose");

var CountrySchema = new mongoose.Schema(
  {
    name: String,
    intro: String,
    administrativeCapital: String,
    statistics: Object,
  },
  { timestamps: true }
);

// Requires population of author
CountrySchema.methods.toJSONFor = function (user) {
  return {
    id: this._id,
    name: this.body,
    intro: this.intro,
    administrativeCapital: this.administrativeCapital,
    statistics: this.statistics,
    createdAt: this.createdAt,
    entryMadeBy: this.author.toProfileJSONFor(user),
  };
};

mongoose.model("Country", CountrySchema);
