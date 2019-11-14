# About the project

This is the code I wrote following the [Thinkster IO](https://thinkster.io/) tutorial on building a Medium clone (blogging social network) using the MERN stack (Mongodb Express React and Node) and is based on the ([Thinkster IO Real World App](https://github.com/gothinkster/realworld), from the [Thinkster Full Stack tutorial series](https://thinkster.io/tutorials/fullstack) by [Thinkster IO](https://thinkster.io/)

This code is for the back end. [here is the tutorial](https://thinkster.io/tutorials/node-json-api). The front end code I wrote can be found [here](https://github.com/Kgotso-Koete/ConduitApp-front-end).

# Click here for the [demo](https://conduit-by-kg.firebaseapp.com/)

# Description and features

## General functionality:

- Authenticate users via JWT (login/signup pages + logout button on settings page)
- CRU\* users (sign up & settings page - no deleting required)
- CRUD Articles
- CR\*D Comments on articles (no updating required)
- GET and display paginated lists of articles
- Favorite articles
- Follow other users

## The general page breakdown is as follows:

- Home page (URL: /#/ )
  - List of tags
  - List of articles pulled from either Feed, Global, or by Tag
  - Pagination for list of articles
- Sign in/Sign up pages (URL: /#/login, /#/register )
  - Use JWT (store the token in localStorage)
- Settings page (URL: /#/settings )
- Editor page to create/edit articles (URL: /#/editor, /#/editor/article-slug-here )
- Article page (URL: /#/article/article-slug-here )
  - Delete article button (only shown to article's author)
  - Render markdown from server client side
  - Comments section at bottom of page
  - Delete comment button (only shown to comment's author)
- Profile page (URL: /#/@username, /#/@username/favorites )
  - Show basic user info
  - List of articles populated from author's created articles or author's favorited articles

The API specification is listed in the /api folder of this repository

# How to run the code:

The back end is deployed on Heroku, and the front end is deployed on Firebase. Here is the [demo](https://conduit-by-kg.firebaseapp.com/), and here is the production api link `https://intense-hollows-36762.herokuapp.com/api` that can be used with any front end for requests

## 1: Download Postman API environment

Load the `Conduit.postman.{{environment}}.json` files in the `/api_spec` folder into Postman

## 2: Install packages

Run `npm install`

## 3: Run Mongodb

Navigate to your local Mongodb folder and run `mongod --dbpath=data --bind_ip 127.0.0.1`

## 4: Run project

Run `npm start`

## 5: Open it

Open [Postman](https://www.getpostman.com/) and begin making requests to `http://localhost:3000/api/{{request}}`

# Application Structure

1. `app.js` - The entry point to our application. This file defines the express server and connects it to MongoDB using mongoose. It also requires the routes and models to be used in the application.
2. `config/` - This folder contains configuration for passport as well as a central location for configuration/environment variables.
3. `routes/` - This folder contains the route definitions for the API.
4. `models/` - This folder contains the schema definitions for the Mongoose models.

# Authentication

Requests are authenticated using the `Authorization` header with a valid JWT. We define two express middlewares in `routes/auth.js` that can be used to authenticate requests.

1. The `required` middleware configures the express-jwt middleware using our application's secret and will return a 401 status code if the request cannot be authenticated. The payload of the JWT can then be accessed from req.payload in the endpoint.
2. The `optional` middleware configures the express-jwt in the same way as required, but will not return a 401 status code if the request cannot be authenticated.

# Timesheet log

- Back end

  - Version 1 (Thinkster Tutorial): 22 hours
  - Version 2 (personal modifications): 7 hours (to add commentCount and Trending article list)

- Front end

  - Version 1 (Thinkster Tutorial): 37 hours
  - Version 2 (personal modifications): 17 hours

# Acknowledgements

Special thanks to [Thinkster IO](https://thinkster.io/) for a great tutorial. The Real World mother of all demo apps is very ambitious and is exactly what the world needs.
<br/>
<br/>

# License

The codebase is MIT licensed unless otherwise specified.

#

To be modified further by Kgotso Koete
<br/>
Johannesburg, November 2019
