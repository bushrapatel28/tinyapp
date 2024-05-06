# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["screenshot description"](#)
!["screenshot description"](#)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Features

- Authentication Protection
- Permits User to Create, Read, Update, and Delete (CRUD) a simple entity (e.g blog posts, URL shortener).

### Additional Features

- Site Header:
  - If a user is logged in, the header shows:
    * the user's email
    * a logout button

  - If a user is not logged in, the header shows:
    * a link to the login page
    * a link to the registration page

## Route Checklist

### GET Routes

- [x] `GET /`
- [x] `GET /urls`
- [x] `GET /urls/new`
- [x] `GET /urls/:id`
- [x] `GET /u/:id`
- [x] `GET /login`
- [x] `GET /register`

### POST Routes

- [x] `POST /urls`
- [x] `POST /urls/:id`
- [x] `POST /urls/:id/delete`
- [x] `POST /login`
- [x] `POST /register`
- [x] `POST /logout`


## Documentation

### Helper Functions

- `getUserByEmail(formEmail, database)`: Looks up the `database` for a user email that matches the `formEmail`. Returns the userId of that user from the `database`. Returns `undefined` if match not found.

- `urlsForUser(id, urlDatabase)`: Looks up the `urlDatabase` for the user id that matches the `id`. Returns the url object, from the `urlDatabase`, for the `id`. Returns an empty object if match not found.

- `getLoggedInUser(formEmail, formPassword, database)`: Looks up the `database` for a user email that matches the `formEmail`, then compares and matches the user password to the `formPassword`. Returns the userId of the user, from the `database`, who's email and password match. Returns `undefined` if match not found.

### Routes

- `GET /`: 
  - if the user is logged in:
    * redirect to `/urls`
  - if the user is not logged in:
    * redirect to `/login`

- `GET /urls`:
  - if user is logged in:
    * returns HTML with:
    * the site header
    * a table of URLs the user has created, each list item containing:
      + a short URL
      + the short URL's matching long URL
      + an ***edit*** button which makes a **GET** request to `/urls/:id`
      + a ***delete*** button which makes a **POST** request to `/urls/:id/delete`
    * a link to *Create a New Short Link* which makes a **GET** request to `/urls/new`
  - if user is not logged in:
    * returns HTML with a relevant error message

- `GET /urls/new`:
  - if user is logged in:
    * returns HTML with:
    * the site header
    * a form which contains:
      + a text input field for the original (long) URL
      + a ***submit*** button which makes a **POST** request to `/urls`
  - if user is not logged in:
    * redirects to the `/login` page

- `GET /urls/:id`:
  - if user is logged in  and owns the URL for the given ID:
    * returns HTML with:
    * the site header
    * the short URL (for the given ID)
    * a form which contains:
      + the corresponding long URL
      + an ***update*** button which makes a **POST** request to `/urls/:id`
  - if a URL for the given ID does not exist:
    *  returns HTML with a relevant error message
  - if user is not logged in:
    * returns HTML with a relevant error message
  - if user is logged in but does not own the URL with the given ID:
    * returns HTML with a relevant error message

- `GET /u/:id`:
  - if URL for the given ID exists:
    * redirects to the corresponding long URL
  - if URL for the given ID does not exist:
    * return HTML with a relevant error message

- `GET /login`:
  - if user is logged in:
    * redirects to `/urls`
  - if user is not logged in:
    * returns HTML with:
    * a form which contains:
      + input fields for email and password
      + a ***login*** button which makes a **POST** request to `/login`

- `GET /register`:
  - if user is logged in:
    * redirects to `/urls`
  - if user is not logged in:
    * returns HTML with:
    * a form which contains:
      + input fields for email and password
      + a ***register*** button which makes a **POST** request to `/register`

- `POST /urls`:
  - if user is logged in:
    * generates a short URL, saves it, and associates it with the user
    * redirects to `/urls/:id`, where `:id` matches the ID of the newly saved URL
  - if user is not logged in:
    * returns HTML with a relevant error message

- `POST /urls/:id`:
  - if user is logged in and owns the URL for the given ID:
    * updates the URL
    * redirects to `/urls`
  - if user is not logged in:
    * returns HTML with a relevant error message
  - if user is logged in but does not own the URL of the given ID:
    * returns HTML with a relevant error message

- `POST /urls/:id/delete`:
  - if user is logged in and owns the URL for the given ID:
    * deletes the URL
    * redirects to `/urls`
  - if user is not logged in:
    * returns HTML with a relevant error message
  - if user is logged in but does not own the URL of the given ID:
    * returns HTML with a relevant error message

- `POST /login`:
  - if email and password params match an existing user:
    * sets a cookie
    * redirects to `/urls`
  - if email and password params do not match an existing user:
    * returns HTML with a relevant error message

- `POST /register`:
  - if email or password are empty:
    * returns HTML with a relevant error message
  - if email already exists:
    * returns HTML with a relevant error message
  - otherwise:
    * creates a new user
    * encrypts the new user's password with `bcrypt`
    * sets a cookie
    * redirects to `/urls`

- `POST /logout`:
  - deletes cookie
  - redirects to `/login`