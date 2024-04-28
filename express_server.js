const express = require('express');
const app = express();
const PORT = 8080;


//Configuration for view engine
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

//If path is /urls/b2xVn2 then req.params.id would be b2xVn2
app.get("/urls/:id", (req, res) => {  //:id is the route parameter
  const templateVars = { 
    id: req.params.id,
    longURL: urlDatabase[req.params.id] 
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});