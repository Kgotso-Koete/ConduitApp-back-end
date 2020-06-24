var router = require("express").Router();
var passport = require("passport");
var mongoose = require("mongoose");
var auth = require("../auth");

router.get("/", auth.optional, function (req, res, next) {});

module.exports = router;
