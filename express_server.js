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


const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Generate a string of 6 random alphanumeric characters
const generateRandomString = function() {
  const randomString = Math.random().toString(36).slice(2, 8);
  return randomString;
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
  const templateVars = { 
    username: req.cookies["username"],      //Include Cookie header parsed data into the templateVars and pass it to the ejs file
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

//If path is /urls/b2xVn2 then req.params.id would be b2xVn2
app.get("/urls/:id", (req, res) => {  //:id is the route parameter
  const templateVars = { 
    username: req.cookies["username"],
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
  const userName = req.body.username;   //form info (username) that was sent to the server
  res.cookie('username', userName);     //Store username in the Respond Cookie
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});