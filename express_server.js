const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080;


//Configuration for view engine
app.set("view engine", "ejs");

//Middleware to convert the request body from Buffer into string
app.use(express.urlencoded({ extended: false }));
//Middleware to parse Cookie header and populate req.cookies with an object keyed by the cookie names.
app.use(cookieParser());

//Database
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
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
    const user = users[userId];           //Each user object (sub-object) of the users object
    if (user.email === formEmail) {
      return user;
    }
  }
  return null;
}

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
  const user = users[userID];
  const templateVars = { 
    user: user,                 //Include user object into the templateVars and pass it to the ejs file
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = { user: user };
  res.render("urls_new", templateVars);
});

//If path is /urls/b2xVn2 then req.params.id would be b2xVn2
app.get("/urls/:id", (req, res) => {  //:id is the route parameter
  const userID = req.cookies["user_id"];
  const user = users[userID];
  const templateVars = {
    user: user,
    id: req.params.id,
    longURL: urlDatabase[req.params.id] 
  };
  res.render("urls_show", templateVars);
});

//POST route to receive Form Submission i.e. new URL
app.post("/urls", (req, res) => {
  //console.log(req.body);      //form info that was sent to the server
  const id = generateRandomString();
  const newlongURL = req.body.longURL;
  
  urlDatabase[id] = newlongURL;       //Add the new URL to the Database
  
  res.redirect(`/urls/${id}`);          //Redirect to '/urls/:id' route

});

//Redirect user to the longURL when they click on the shortURL link.
app.get('/u/:id', (req, res) => {
  //To-do Edge Cases
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//Delete/Remove a URL resource
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

//Edit/Update a URL resource
app.post('/urls/:id',(req, res) => {
  const id = req.params.id;
  const modifiedURL = req.body.longURL;

  urlDatabase[id] = modifiedURL;          //Updating urlDatabase with modified longURL
  res.redirect('/urls');
});

//Login Route
app.post('/login', (req, res) => {
  const email = req.body.email;   //form info (username) that was sent to the server
  res.cookie('email', email);     //Store username in the Respond Cookie
  res.redirect('/urls');
});

//Logout Route
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');          //Clear/Delete the cookie
  res.redirect('/urls');
});

//Registration Form Route
app.get("/register", (req, res) => {
  res.render("register");
});

//Registration Route
app.post('/register', (req, res) => {

  const userID = generateRandomString();
  const formEmail = req.body.email;
  const formPassword = req.body.password;
  
  if (!formEmail || !formPassword) {
    return res.status(400).end("Error 400: Email and/or Password fields cannot be empty!");
  }
  
  const result = getUserByEmail(formEmail);

  if (result) {
    return res.status(400).end("Error 400: Email already in use!");
  }
  
  users[userID] = {       //Add the new user to the user object
    id: userID,
    email: formEmail,
    password: formPassword
  };       
  console.log("Users Database:", users);
  
  res.cookie('user_id', userID);        //Set user_id cookie
  res.redirect('/urls'); 
});

//Login Form Route
app.get("/login", (req, res) => {
  res.render("login");
});


//Listner
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});