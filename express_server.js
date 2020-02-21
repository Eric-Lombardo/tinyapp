// ---------- tinyApp Server--------------
//-----------------------------------------

// helper function modules
const { getUserIdWithEmail } = require("./helpers");
const { generateRandomString } = require("./helpers");
const { checkEmailExists } = require("./helpers");
const { checkLoginIsRight } = require("./helpers");
const { getURLsbyUserId } = require("./helpers");
const { getTimeStamp } = require("./helpers");

// npm modules
const cookieSession = require("cookie-session");
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const app = express();
const PORT = 8080;

// for use with cookie-session = require("cookie-session")
app.use(cookieSession({
  name: 'session',
  keys: ["crazy grasshopper"],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// for use with bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({extended: true}));

// setting the view engine
app.set("view engine", "ejs");

// ---------------- setup above --------------------
// ----------------- starter data below ----------------------

// starter data to work with acting as DB
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@g.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@g.com",
    password: "dishwasher-funk"
  }
};

//----------------- starter data above ---------------------------------
//----------------- GET routes below ----------------------------------

app.get("/", (req, res) => {
  let userCookie = req.session.user_id;
  // if user is not logged in
  if (!users[userCookie]) {
    res.redirect("/login");
  } else {
    // if they are
    res.redirect("/urls");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let userCookie = req.session.user_id;
  let userURLs = getURLsbyUserId(userCookie, urlDatabase);
  let templateVars = { urls: userURLs, userInfo: users[userCookie] };

  // if user is not logged in ask them to login/register
  if (!users[userCookie]) {
    res.render("login_register_splash", templateVars);
    res.status(403);
  } else {
    res.render("urls_index", templateVars);
  }
});

// this path will take you to a form
app.get("/urls/new", (req, res) => {
  let userCookie = req.session.user_id;
  let templateVars = { userInfo: users[userCookie] };

  // checks if user is registered/logged in or else takes them back
  // to the login page
  if (users[userCookie]) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let userCookie = req.session.user_id;
  let userURLs = getURLsbyUserId(userCookie, urlDatabase);

  // check to see if url exists in DB
  if (urlDatabase[shortURL] && urlDatabase[shortURL].userID === userCookie) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase,
      userInfo: users[userCookie]
    };
    res.render("urls_show", templateVars);
  } else if (urlDatabase[shortURL] && urlDatabase[shortURL].userID !== userCookie && userCookie) {
    // when url/:shortURL is true but it doesn't belong to this user and userCookie is defined
    let templateVars = { urls: userURLs, userInfo: users[userCookie] };
    res.render("not_your_URL", templateVars);
  } else {
    // when urls/:shortURL doesn't exist
    let templateVars = { urls: userURLs, userInfo: users[userCookie] };
    res.render("tinyURL_not_in_DB", templateVars);
  }
});


// this shortURL will redirect you to the longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const userCookie = req.session.user_id;
  const userURLs = getURLsbyUserId(userCookie, urlDatabase);
  const templateVars = { urls: userURLs, userInfo: users[userCookie] };
  if (longURL === undefined) {
    res.render("tinyURL_not_in_DB", templateVars);
  } else {
    res.redirect(longURL.longURL);
  }
});

// for new registrations
app.get("/register", (req, res) => {
  let userCookie = req.session.user_id;
  let templateVars = { urls: urlDatabase, userInfo: users[userCookie] };
  res.render("urls_register", templateVars);
});

// for logging in
app.get("/login", (req, res) => {
  let userCookie = req.session.user_id;
  let templateVars = { urls: urlDatabase, userInfo: users[userCookie] };

  // if user is logged in redirect to /urls
  if (users[userCookie]) {
    res.redirect("/urls");
  } else {
    res.render("urls_login", templateVars);
  }
});

//------------------- GET routes above -------------------------------
//------------------- POST routes below -------------------------------

// this will handle the post request from the /urls/new form
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let time = getTimeStamp();

  // update urlDatabase with every POST request
  // attach user's cookie ID to the shortURL object
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
    timeCreated: time,
  };

  res.redirect(`/urls/${shortURL}`);
});


// when editing the long url
app.post("/urls/:shortURL/update", (req, res) => {
  let userCookie = req.session.user_id;
  let newLongURL = req.body.newLongURL;
  let shortURL = req.params.shortURL;

  // allow edit if it belongs to user
  if (urlDatabase[shortURL].userID === userCookie) {
    urlDatabase[shortURL].longURL = newLongURL;
    res.redirect("/urls");
  } else {
    // do not allow it
    let userURLs = getURLsbyUserId(userCookie, urlDatabase);
    let templateVars = { urls: userURLs, userInfo: users[userCookie] };
    res.status(403);
    res.render("not_your_URL", templateVars);
  }
});

// this will handle deleting urls
app.post("/urls/:shortURL/delete", (req, res) => {
  let userCookie = req.session.user_id;
  const shortURL = req.params.shortURL;

  // if the url requested to be deleted is by the user allow it
  if (urlDatabase[shortURL].userID === userCookie) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    // do not allow it
    let userURLs = getURLsbyUserId(userCookie, urlDatabase);
    let templateVars = { urls: userURLs, userInfo: users[userCookie] };
    res.status(403);
    res.render("not_your_URL", templateVars);
  }
});

// this will handle the login post and COOOOKIES!!!!
app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;

  if (checkLoginIsRight(userEmail, userPassword, users)) {
    let userCookieId = getUserIdWithEmail(userEmail, users);
    req.session.user_id = userCookieId;
    res.redirect("/urls");
  } else {
    let userCookie = req.session.user_id;
    let userURLs = getURLsbyUserId(userCookie, urlDatabase);
    let templateVars = { urls: userURLs, userInfo: users[userCookie] };
    res.status(403);
    res.render("bad_guy", templateVars);
  }
});

// deletes user_id cookie from history
app.post("/logout", (req, res) => {
  // res.clearCookie("user_id");
  req.session = null;
  res.redirect("/urls");
});

// getting back filled out registration form
app.post("/register", (req, res) => {
  let userId = bcrypt.hashSync(generateRandomString(), 10);
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  let hashedPassword = bcrypt.hashSync(userPassword, 10);
  
  if (!checkEmailExists(userEmail, users)) {
    // add to user DB
    users[userId] = {
      id: userId,
      email: userEmail,
      password: hashedPassword
    };
    // send the intial cookie upon registration
    req.session.user_id = userId;
    res.redirect("/urls");
  } else {
    let userCookie = req.session.user_id;
    let templateVars = { urls: urlDatabase, userInfo: users[userCookie] };
    res.status(400);
    res.render("bad_guy_register", templateVars);
  }
});

// ---------------- POST routes above ------------------------------

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});


