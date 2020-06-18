var router = require("express").Router();

router.use("/", require("./users")); // users router now integrated with the API router
router.use("/countries", require("./countries")); //

// Create a middleware function for API router to handle validation errors from Mongoose
router.use(function (err, req, res, next) {
  if (err.name === "ValidationError") {
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function (errors, key) {
        errors[key] = err.errors[key].message;

        return errors;
      }, {}),
    });
  }

  return next(err);
});

module.exports = router;
