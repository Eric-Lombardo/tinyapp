const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;

// for use with bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({extended: true}));

// setting the view engine
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase }
  res.render("urls_index", templateVars)
})

// this path will take you to a form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// this will handle the post request from the /urls/new form
app.post("/urls", (req, res) => {
  console.log(req.body);
  // update urlDatabase with {shortURL: longURL} with every post request
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase };
  res.render("urls_show", templateVars);
})


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});





// placeholder function to simulate a "unique" shortURL
// function declaration to amke sure it gets hoisted to the top
function generateRandomString() {
  let alphaNumData = ["a", "b", "c", "d", "e", "f", 1, 2, 3, 4, 5, 6, 7];
  let outputStr = "";

  for (let i = 0; i < 6; i++) {
    let randomCharacter = Math.floor(Math.random() * alphaNumData.length);
    outputStr += alphaNumData[randomCharacter];
  }

  return outputStr;
}