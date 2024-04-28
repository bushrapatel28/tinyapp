const express = require('express');
const app = express();
const PORT = 8080;


//Configuration for view engine
app.set("view engine", "ejs");

//Middleware to convert the request body from Buffer into string
app.use(express.urlencoded({ extended: true }));


const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Generate a string of 6 alphanumeric characters
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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//If path is /urls/b2xVn2 then req.params.id would be b2xVn2
app.get("/urls/:id", (req, res) => {  //:id is the route parameter
  const templateVars = { 
    id: req.params.id,
    longURL: urlDatabase[req.params.id] 
  };
  res.render("urls_show", templateVars);
});

//POST route to receive Form Submission
app.post("/urls", (req, res) => {
  const id = generateRandomString();
  console.log(req.body);
  res.send("Ok");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});