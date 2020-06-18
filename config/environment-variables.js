require("dotenv").config();

const email = {
  service: process.env.SERVICE,
  auth: {
    user: process.env.USEREMAIL,
    pass: process.env.PASSWORDEMAIL,
  },
  from: process.env.USEREMAIL,
  to: process.env.TO,
  subject: "New afriwiki country data found",
  text: "Please log into the afriwiki app to see new data",
};

const pageURL = "https://www.bbc.com/news/world-africa-16833769";

const mongoURI = process.env.MONGODB_URI;

module.exports = {
  email,
  pageURL,
  mongoURI,
};
