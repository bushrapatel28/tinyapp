const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const PORT = 8080;
const salt = bcrypt.genSaltSync(10);


//Configuration for view engine
app.set("view engine", "ejs");

//Middleware to convert the request body from Buffer into string
app.use(express.urlencoded({ extended: false }));
//Middleware to parse Cookie header and populate req.cookies with an object keyed by the cookie names.
app.use(cookieParser());

//Database
const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "user2RandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "userRandomID"
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

//Generate a string of 6 random alphanumeric characters
const generateRandomString = function() {
  const randomString = Math.random().toString(36).slice(2, 8);
  return randomString;
};

//User lookup helper function
const getUserByEmail = function(formEmail) {
  for (const userId in users) {           //Each property of users object
    const user = users[userId];           //Each user object (sub-object) of the user object
    if (user.email === formEmail) {
      return user;
    }
  }
  return null;
};

//Filter urlDatabase function
const urlsForUser = function (id) {
  const urls = {};
  for (const urlID in urlDatabase) {        //Each property of urlDatabase
    const urlObj = urlDatabase[urlID];      //Each url Object of the urlID
    if (urlObj.userID === id) {
      urls[urlID] = urlObj;
      console.log(urls);
    }
  }
  return urls;
};

//Logged in User lookup helper function
const getLoggedInUser = function(formEmail, formPassword) {
  for (const userId in users) {           //Each property of users object
    const user = users[userId];           //Each user object (sub-object) of the users object
    if (user.email === formEmail && bcrypt.compareSync(formPassword, user.password)) {    //Compare formPassword hash with stored user's (hashed) password
      return user.id;
    }
  }
  return null;
};

app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];      //Cookie header parsed data
  
  if (!userID) {
    return res.status(401).end("Please Login or Register to continue.");
  };

  const userUrls = urlsForUser(userID);       //Returned Urls Object

  const user = users[userID];
  const templateVars = { 
    user: user,                 //Include user object into the templateVars and pass it to the ejs file
    urls: userUrls
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  if (!userID) {
    res.redirect('/login');
  }
  const user = users[userID];
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
});

//If path is /urls/b2xVn2 then req.params.id would be b2xVn2
app.get("/urls/:id", (req, res) => {          //:id is the route parameter
  const userID = req.cookies["user_id"];      //form info that was sent to the server
  
  if (!userID) {
    return res.status(401).end("Please Login or Register to continue.");
  };
  const user = users[userID];
  
  const userUrls = urlsForUser(userID);       //Returned Urls Object
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

//POST route to receive Form Submission i.e. new URL
app.post("/urls", (req, res) => {
  //console.log(req.body);              //form info that was sent to the server
  const userID = req.cookies["user_id"];
  if (!userID) {
    return res.status(401).end("Please Login to make changes.");
  };
  
  const id = generateRandomString();
  const newlongURL = req.body.longURL;
  
  urlDatabase[id] = id;
  urlDatabase[id] = {
    longURL: newlongURL,        //Add the new URL to the Database
    userID: userID
  };

  console.log(urlDatabase);
  
  res.redirect(`/urls/${id}`);                  //Redirect to '/urls/:id' route

});

//Redirect user to the longURL when they click on the shortURL link.
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) {                                           //If :id does not exist in the database
    return res.status(404).end("Error 404: Page Not Found");
  }
  res.redirect(longURL);
});

//Delete/Remove a URL resource
app.post('/urls/:id/delete', (req, res) => {
  const userID = req.cookies["user_id"];
  if (!userID) {
    return res.status(401).end("Please Login to make changes.");
  };

  const id = req.params.id;
  const ids = Object.keys(urlDatabase);
  if (!ids.includes(req.params.id)) {
    return res.status(400).end("Error 400: Not Found");
  }
  
  const userUrls = urlsForUser(userID);       //Returned Urls Object
  const keys = Object.keys(userUrls);
  
  if (!keys.includes(req.params.id)) {
    return res.status(403).end("Error 403: Access Denied");
  };

  delete urlDatabase[id];
  res.redirect('/urls');
});

//Edit/Update a URL resource
app.post('/urls/:id',(req, res) => {
  const userID = req.cookies["user_id"];
  if (!userID) {
    return res.status(401).end("Please Login to make changes.");
  };

  const id = req.params.id;
  const ids = Object.keys(urlDatabase);
  if (!ids.includes(id)) {
    return res.status(400).end("Error 400: Not Found");
  }
  
  const userUrls = urlsForUser(userID);       //Returned Urls Object
  const keys = Object.keys(userUrls);
  
  if (!keys.includes(id)) {
    return res.status(403).end("Error 403: Access Denied");
  };

  const modifiedURL = req.body.longURL;

  urlDatabase[id].longURL = modifiedURL;          //Updating urlDatabase with modified longURL
  res.redirect('/urls');
});

//Login Route
app.post('/login', (req, res) => {
  const formEmail = req.body.email;       //form info (Login email and password) that was sent to the server
  const formPassword = req.body.password;
  
  const result = getLoggedInUser(formEmail, formPassword);

  if (!result) {
    return res.status(403).end("Error 403: Invalid Email or Password. Try again!");
  }
  
  res.cookie('user_id', result);     //Store user id in the Respond Cookie
  res.redirect('/urls');
});

//Logout Route
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');          //Clear/Delete the cookie
  res.redirect('/login');
});

//Registration Form Route
app.get("/register", (req, res) => {
  const userID = req.cookies["user_id"];      //Cookie header parsed data
  if (userID) {                               //If user is already Logged in
    res.redirect('/urls');
  };
  const user = users[userID];
  const templateVars = { user: user };        //Include user object into the templateVars and pass it to the ejs file
  res.render("register", templateVars);
});

//Registration Route
app.post('/register', (req, res) => {
  const userID = generateRandomString();
  const formEmail = req.body.email;
  const formPassword = req.body.password;
  const hash = bcrypt.hashSync(formPassword, salt);

  if (!formEmail || !formPassword) {
    return res.status(400).end("Error 400: Email and/or Password fields cannot be empty!");
  };
  
  const result = getUserByEmail(formEmail);

  if (result) {
    return res.status(400).end("Error 400: Email already in use!");
  };
  
  users[userID] = {             //Add the new user to the user object
    id: userID,
    email: formEmail,
    password: hash
  };
  console.log("Users Database:", users);
  
  res.cookie('user_id', userID);        //Set user_id cookie
  res.redirect('/urls'); 
});

//Login Form Route
app.get("/login", (req, res) => {
  const userID = req.cookies["user_id"];      //Cookie header parsed data
  if (userID) {                               //If user is already Logged in
    res.redirect('/urls');
  };
  const user = users[userID];
  const templateVars = { user: user };        //Include user object into the templateVars and pass it to the ejs file
  res.render("login", templateVars);
});


//Listner
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});