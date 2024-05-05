///////////////////////////////////////////////////////////////////////////////////////////////////////////
// MODULES AND CONSTANTS
///////////////////////////////////////////////////////////////////////////////////////////////////////////

const express = require('express');
const app = express();
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { getUserByEmail, urlsForUser, getLoggedInUser } = require('./helpers');
const PORT = 8080;
const salt = bcrypt.genSaltSync(10);            //Salt for Hash

///////////////////////////////////////////////////////////////////////////////////////////////////////////
// CONFIG AND MIDDLEWARE
///////////////////////////////////////////////////////////////////////////////////////////////////////////

//Configuration for view engine
app.set("view engine", "ejs");

//Middleware to convert the request body from Buffer into string
app.use(express.urlencoded({ extended: false }));

//Middleware to decode JSON info
app.use(express.json());

//Middleware to parse Cookie header and populate req.session with an object keyed by the cookie names.
app.use(cookieSession({
  name: 'session',
  keys: ['wifjwopfkolwnmgr'],
}));

///////////////////////////////////////////////////////////////////////////////////////////////////////////
// DATABASE
///////////////////////////////////////////////////////////////////////////////////////////////////////////

//Database
const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", salt)     //Hashing Password
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$LSecq/nPOv7oQn25v6ah9e1ITTFzykHU0UIXcabWdlAcrVQkibLBG"     //Hashed Password
  },
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////
// RANDOM STRING GENERATOR FOR IDs
///////////////////////////////////////////////////////////////////////////////////////////////////////////

//Generate a string of 6 random alphanumeric characters
const generateRandomString = function() {
  const randomString = Math.random().toString(36).slice(2, 8);
  return randomString;
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////
// ROUTES: GETS AND POSTS
///////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////////////
// ***GETS***
///////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/", (req, res) => {
  const userID = req.session.user_id;      //form info that was sent to the server
  if (!userID) {
    return res.redirect("/login");
  }

  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;      //Cookie header parsed data
  if (!userID) {
    return res.status(401).end("Please Login/Register to continue.");
  }

  const userUrls = urlsForUser(userID, urlDatabase);       //Returned Urls Object
  const user = users[userID];
  const templateVars = {
    user: user,                 //Include user object into the templateVars and pass it to the ejs file
    urls: userUrls
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.redirect('/login');
  }

  const user = users[userID];
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
});

//If path is /urls/b2xVn2 then req.params.id would be b2xVn2
app.get("/urls/:id", (req, res) => {          //:id is the route parameter
  const userID = req.session.user_id;      //form info that was sent to the server
  if (!userID) {
    return res.status(401).end("Please Login/Register to continue.");
  }
  
  if (!urlDatabase[req.params.id]) {                          //If :id does not exist in the database
    return res.status(404).end("Error 404: Non-existent URL");
  }

  //const longURL = urlDatabase[req.params.id] ? urlDatabase[req.params.id].longUrl : null
  // const longURL = urlDatabase[req.params.id].longURL;
  // if (!longURL) {                                           //If :id does not exist in the database
  //   return res.status(404).end("Error 404: Non-existent URL");
  // }

  const user = users[userID];
  const userUrls = urlsForUser(userID, urlDatabase);       //Returned Urls Object
  const keys = Object.keys(userUrls);
  if (!keys.includes(req.params.id)) {
    return res.status(403).end("Error 403: Access Denied");
  }
  
  const templateVars = {
    user: user,
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };
  res.render("urls_show", templateVars);
});

//Redirect user to the longURL when they click on the shortURL link.
app.get('/u/:id', (req, res) => {
  if (!urlDatabase[req.params.id]) {                          //If :id does not exist in the database
    return res.status(404).end("Error 404: Non-existent URL");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  // if (!longURL) {                                           //If :id does not exist
  //   return res.status(404).end("Error 404: URL Not Found");
  // }
  res.redirect(longURL);
});

//Registration Form Route
app.get("/register", (req, res) => {
  const userID = req.session.user_id;         //Cookie header parsed data
  if (userID) {                               //If user is already Logged in
    return res.redirect('/urls');
  }

  const user = users[userID];
  const templateVars = { user: user };        //Include user object into the templateVars and pass it to the ejs file
  res.render("register", templateVars);
});

//Login Form Route
app.get("/login", (req, res) => {
  const userID = req.session.user_id;      //Cookie header parsed data
  if (userID) {                               //If user is already Logged in
    return res.redirect('/urls');
  }

  const user = users[userID];
  const templateVars = { user: user };        //Include user object into the templateVars and pass it to the ejs file
  res.render("login", templateVars);
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////
// ***POSTS***
///////////////////////////////////////////////////////////////////////////////////////////////////////////

//POST route to receive Form Submission i.e. new URL
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;     //form info that was sent to the server (SAME AS req.body)
  if (!userID) {
    return res.status(401).end("Please Login to make changes.");
  }
  
  const id = generateRandomString();
  const newlongURL = req.body.longURL;
  urlDatabase[id] = id;
  urlDatabase[id] = {
    longURL: newlongURL,        //Add the new URL to the Database
    userID: userID
  };
  res.redirect(`/urls/${id}`);                  //Redirect to '/urls/:id' route
});

//Delete/Remove a URL resource
app.post('/urls/:id/delete', (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(401).end("Please Login to make changes.");
  }

  const id = req.params.id;
  const ids = Object.keys(urlDatabase);
  if (!ids.includes(req.params.id)) {
    return res.status(400).end("Error 400: Not Found");
  }
  
  const userUrls = urlsForUser(userID, urlDatabase);       //Returned Urls Object
  const keys = Object.keys(userUrls);
  if (!keys.includes(req.params.id)) {
    return res.status(403).end("Error 403: Access Denied");
  }

  delete urlDatabase[id];
  res.redirect('/urls');
});

//Edit/Update a URL resource
app.post('/urls/:id',(req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(401).end("Please Login to make changes.");
  }

  const id = req.params.id;
  const ids = Object.keys(urlDatabase);
  if (!ids.includes(id)) {
    return res.status(404).end("Error 404: URL does not exist");
  }
  
  const userUrls = urlsForUser(userID, urlDatabase);       //Returned Urls Object
  const keys = Object.keys(userUrls);
  if (!keys.includes(id)) {
    return res.status(403).end("Error 403: Access Denied");
  }

  const modifiedURL = req.body.longURL;
  urlDatabase[id].longURL = modifiedURL;          //Updating urlDatabase with modified longURL
  res.redirect('/urls');
});

//Login Route
app.post('/login', (req, res) => {
  const formEmail = req.body.email;       //form info (Login email and password) that was sent to the server
  const formPassword = req.body.password;

  const result = getLoggedInUser(formEmail, formPassword, users);
  if (!result) {
    return res.status(401).end("Error 401: Incorrect Email or Password. Try again!");
  }
  
  req.session.user_id = result;     //Store user id in the Respond Cookie (SAME AS res.cookie(cookieName, value))
  res.redirect('/urls');
});

//Logout Route
app.post('/logout', (req, res) => {
  req.session = null;         //Clear/Delete the cookie
  res.redirect('/login');
});

//Registration Route
app.post('/register', (req, res) => {
  const userID = generateRandomString();
  const formEmail = req.body.email;
  const formPassword = req.body.password;

  if (!formEmail || !formPassword) {
    return res.status(400).end("Error 400: Email and/or Password fields cannot be empty!");
  }
  
  const result = getUserByEmail(formEmail, users);
  if (result) {
    return res.status(403).end("Error 403: Email already in use!");
  }
  
  const hash = bcrypt.hashSync(formPassword, salt);
  users[userID] = {             //Add the new user to the user object
    id: userID,
    email: formEmail,
    password: hash
  };
  req.session.user_id = userID;        //Set user_id cookie
  res.redirect('/urls');
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////
// LISTENER
///////////////////////////////////////////////////////////////////////////////////////////////////////////

//Listner
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});