# Conduit API Spec

## Validation errors

For validation errors that need to be sent back to the client, we'll use status code 422 and errors in the following format:
<br/>

```javascript
{
  "errors":{
    "body": [
      "can't be empty"
    ]
  }
}
```

<br/>

## Other status codes:

401 for Unauthorized requests, when a request requires authentication but it isn't provided
<br/>
403 for Forbidden requests, when a request may be valid but the user doesn't have permissions to perform the action
<br/>
404 for Not found requests, when a resource can't be found to fulfill the request

# User CRUD Endpoints

## User object

This data is what will be returned from successful logins, registrations, and requests for the currently logged in user's information
<br/>
Example result body:
<br/>

```javascript
{
 "user": {
  "email": "jake@jake.jake",
  "token": "jwt.token.here",
  "username": "jake",
  "bio": "I work at statefarm",
  "image": null
  }
}
```

<br/>

## Registration

To register, we require an email, password, and desired username:

`POST /api/users`

Example request body:
<br/>

```javascript
{
 "user":{
  "username": "Jacob"
  "email": "jake@jake.jake",
  "password": "jakejake"
  }
}
```

<br/>

## Login

To login, we only require an email and password:

`POST /api/users/login`

Example request body:
<br/>

```javascript
{
 "user":{
  "email": "jake@jake.jake",
  "password": "jakejake"
 }
}
```

## Making authorized requests

Any time you're interacting with endpoints that require knowledge of the current user, you'll need to pass along an authentication header:

`Authorization: Token jwt.token.here`

This functionality is needed on the following pages:

1. login/register
2. Edit profile
3. Retrieving the user's information when the user hits the page on a hard load.

## Geting the current user's data

To get the current user's info. Required authentication token.

`GET /api/user`

Returns a User object with the example result body:
<br/>

```javascript
{
 "user": {
  "email": "jake@jake.jake",
  "token": "jwt.token.here",
  "username": "jake",
  "bio": "I work at statefarm",
  "image": null
  }
}
```

## Updating the current user's data

Update to bio, pic, name, etc

`PUT /api/user`

Authentication required, returns the updated User object:

<br/>

```javascript
{
 "user": {
  "email": "jake@jake.jake",
  "username": "jake",
  "bio": "I work at statefarm",
  "image": null
  }
}
```

## Getting a user's public profile

`GET /api/profiles/:username`

Authentication optional, returns a Profile object

```javascript
{
  "profile": {
    "username": "jake",
    "bio": "I work at statefarm",
    "image": "https://static.productionready.io/images/smiley-cyrus.jpg",
    "following": false
  }
}
```

The other actions we can do with a profile is to follow and unfollow it.

## Follow a user

`POST /api/profiles/:username/follow`

Authentication required, returns a Profile No additional parameters required

## Unfollow a user

`DELETE /api/profiles/:username/follow`

Authentication required, returns a Profile No additional parameters required

# Article CRUD Endpoints

## Articles

Defining the spec for the article data.

```javascript
{
  "article": {
    "slug": "how-to-train-your-dragon",
    "title": "How to train your dragon",
    "description": "Ever wonder how?",
    "body": "It takes a Jacobian",
    "createdAt": "2016-02-18T03:22:56.637Z",
    "updatedAt": "2016-02-18T03:48:35.824Z",
    "favorited": false,
    "favoritesCount": 0,
    "commentCount": 0,
    "author": {
      "username": "jake",
      "bio": "I work at statefarm",
      "image": "https://i.stack.imgur.com/xHWG8.jpg",
      "following": false
    }
  }
}
```

## Create Article

`POST /api/articles`

Example request body:

```javascript
{
  "article": {
    "title": "How to train your dragon",
    "description": "Ever wonder how?",
    "body": "You have to believe",
    "tagList": ['reactjs', 'angularjs', 'dragons']
  }
}
```

Authentication required, will return an Article
<br/>
Required fields: title, description, body
<br/>
Optional fields: tagList as an array of Strings

## Retrieve Article

`GET /api/articles/:slug`

No authentication required, will return single article

## Update article

`PUT /api/articles/:slug`

Example request body:

```javascript
{
  "article": {
    "title": "Did you train your dragon?"
  }
}
```

Authentication required, returns the updated Article
<br/>
Optional fields: title, description, body
<br/>
The slug also gets updated when the title is changed

## Deleting an article

`DELETE /api/articles/:slug`

Authentication required

# Associated actions with articles

Users can favorite articles. API's are below.

## Favoriting an article

`POST /api/articles/:slug/favorite`

Authentication required, returns the Article
<br/>
No additional parameters required

## Unfavoriting an article

`DELETE /api/articles/:slug/favorite`

Authentication required, returns the Article

No additional parameters required

# Comments

Here's the spec for comments:

```javascript
{
  "comment": {
    "id": 1,
    "body": "It takes a Jacobian",
    "createdAt": "2016-02-18T03:22:56.637Z",
    "author": {
      "username": "jake",
      "bio": "I work at statefarm",
      "image": "https://i.stack.imgur.com/xHWG8.jpg",
      "following": false
    }
  }
}
```

## Creating comments on an article

`POST /api/articles/:slug/comments`

Example request body:

```javascript
{
  "comment": {
    "body": "His name was my name too."
  }
}
```

Authentication required, returns the created Comment

Required fields: body

## Deleting a comment

`DELETE /api/articles/:slug/comments/:id`

Authentication required

## Getting comments of an article

`GET /api/articles/:slug/comments`

Authentication optional, returns multiple comments

```javascript
{
  "comments": [{
    "id": 1,
    "body": "It takes a Jacobian",
    "createdAt": "2016-02-18T03:22:56.637Z",
    "author": {
      "username": "jake",
      "bio": "I work at statefarm",
      "image": "https://i.stack.imgur.com/xHWG8.jpg",
      "following": false
    }
  }]
}
```

# Tags

Tags are created when articles are created, and deleted when no articles are using them any more. The home page will show a list of all the tags.

## Getting tags

`GET /api/tags`

Returns a list of tags (similar to comments):

```javascript
{
  "tags": [
    "reactjs",
    "angularjs"
  ]
}
```

# Queryable Endpoints for Lists

Articles will be listed, paginated and sorted based on author, tags, etc with the following spec:

```javascript
{
  "articles":[{
    "description": "Ever wonder how?",
    "slug": "how-to-train-your-dragon",
    "title": "How to train your dragon",
    "tagList": ["dragons", "training"],
    "createdAt": "2016-02-18T03:22:56.637Z",
    "updatedAt": "2016-02-18T03:48:35.824Z",
    "favorited": false,
    "favoritesCount": 0,
    "commentCount": 0,
    "author": {
      "username": "jake",
      "bio": "I work at statefarm",
      "image": "https://i.stack.imgur.com/xHWG8.jpg",
      "following": false
    }
  }, {
    "description": "So toothless",
    "slug": "how-to-train-your-dragon-2",
    "title": "How to train your dragon 2",
    "tagList": ["dragons", "training"],
    "createdAt": "2016-02-18T03:22:56.637Z",
    "updatedAt": "2016-02-18T03:48:35.824Z",
    "favorited": false,
    "favoritesCount": 0,
    "commentCount": 0,
    "author": {
      "username": "jake",
      "bio": "I work at statefarm",
      "image": "https://i.stack.imgur.com/xHWG8.jpg",
      "following": false
    }
  }],
  "articlesCount": 2
}
```

## List Articles

`GET /api/articles`

Returns most recent articles globally be default, provide tag, author or favorited query parameter to filter results

Query Parameters:

Filter by tag:

`?tag=AngularJS`

Filter by author:

`?author=jake`

Favorited by user:

`?favorited=jake`

Limit number of articles (default is 20):

`?limit=20`

Offset/skip number of articles:

`?offset=0`

Authentication optional, will return multiple articles, ordered by most recent first

## Feed articles

`GET /api/articles/feed`

Can also take limit and offset query parameters like List Articles
<br/>
Authentication required, will return multiple articles created by followed users, ordered by most recent first.
