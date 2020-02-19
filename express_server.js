const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

// for use with cookieParser = require("cookieParser")
app.use(cookieParser());

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
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars)
})

// this path will take you to a form
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

// this will handle the post request from the /urls/new form
app.post("/urls", (req, res) => {
  // update urlDatabase with {shortURL: longURL} with every post request
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// when editing the long url
app.post("/urls/:shortURL/update", (req, res) => {
  let userInput = req.body.userInput;
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = userInput;
  res.redirect("/urls");
})

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    let templateVars = { 
      shortURL: req.params.shortURL, 
      longURL: urlDatabase,
      username: req.cookies["username"] 
    };
    res.render("urls_show", templateVars);
  } else {
    res.send("That tiny URL isn't in our database");
  }
})

// this shortURL will redirect you to the longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.send("I don't think the shortURL is in our DATABASE!")
  }
});

// this will handle deleting urls
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
})

// this will handle the login post and COOOOKIES!!!!
app.post("/login", (req, res) => {
  let userInputUsername = req.body.username;
  res.cookie("username", userInputUsername);
  res.redirect("/urls");
})

// deletes username cookie from history
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
})

// for new registrations
app.get("/register", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_register", templateVars);
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
