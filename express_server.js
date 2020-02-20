const { getUserIdWithEmail } = require("./helpers")
const cookieSession = require("cookie-session")
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const app = express();
const PORT = 8080;


app.use(cookieSession({
  name: 'session',
  keys: ["crazy grasshopper"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

// for use with bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({extended: true}));

// setting the view engine
app.set("view engine", "ejs");

// ---------------- npm requires above--------------------

// ----------------- starter data below ----------------------

// starter data to work with
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
}

//----------------- starter data above -------------------

app.get("/", (req, res) => {
  let userCookie = req.session.user_id;
  // if user is not logged in
  if (!users[userCookie]) {
    res.redirect("/login")
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
  let userURLs = getURLsbyUserId(userCookie, urlDatabase)
  let templateVars = { urls: userURLs, userInfo: users[userCookie] };

  // if user is not logged in ask them to login/register
  if (!users[userCookie]) {
    res.render("login_register_splash", templateVars)
    res.status(403);
  } else {
    res.render("urls_index", templateVars);
  }
})

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

// this will handle the post request from the /urls/new form
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();

  // update urlDatabase with every POST request
  // attach user's cookie ID to the shortURL object
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }

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
    // let userCookie = req.session.user_id;
    let userURLs = getURLsbyUserId(userCookie, urlDatabase)
    let templateVars = { urls: userURLs, userInfo: users[userCookie] };
    res.status(403);
    res.render("not_your_URL", templateVars)
  }
})

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let userCookie = req.session.user_id;
  let userURLs = getURLsbyUserId(userCookie, urlDatabase)

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
})


// this shortURL will redirect you to the longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.send("I don't think the shortURL is in our DATABASE!")
  }
});

// this will handle deleting urls
app.post("/urls/:shortURL/delete", (req, res) => {
  let userCookie = req.session.user_id;
  const shortURL = req.params.shortURL;

  // if the url requested to be deleted is by the user allow it
  if(urlDatabase[shortURL].userID === userCookie) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    // do not allow it
    let userURLs = getURLsbyUserId(userCookie, urlDatabase)
    let templateVars = { urls: userURLs, userInfo: users[userCookie] };    
    res.status(403);
    res.render("not_your_URL", templateVars);
  }
})

// this will handle the login post and COOOOKIES!!!!
app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;

  if (checkLoginIsRight(userEmail, userPassword, users)) {
    let userCookieId = getUserIdWithEmail(userEmail, users);
    // res.cookie("user_id", userCookieId);
    req.session.user_id = userCookieId;
    res.redirect("/urls");
  } else {
    res.status(403);
    res.redirect("/register");
  }

})

// deletes user_id cookie from history
app.post("/logout", (req, res) => {
  // res.clearCookie("user_id");
  req.session = null;
  res.redirect("/urls");
})

// for new registrations
app.get("/register", (req, res) => {
  let userCookie = req.session.user_id;
  let templateVars = { urls: urlDatabase, userInfo: users[userCookie] };
  res.render("urls_register", templateVars);
})

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
    }
    // send the intial cookie upon registration
    req.session.user_id = userId;
    res.redirect("/urls");   
  } else {
    res.status(400);
    res.send("nu-huh nice try hacker, you won't get any info from me! This email may or may not be already taken and the password may or maynot be strong enough to create an account");
  }
})

// for logging in
app.get("/login", (req, res) => {
  let userCookie = req.session.user_id;
  let templateVars = { urls: urlDatabase, userInfo: users[userCookie] };
  res.render("urls_login", templateVars);
})




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});


// ------------ helper fucntions below ---------------------


// placeholder function to simulate a "unique" shortURL
// function declaration to make sure it gets hoisted to the top
function generateRandomString() {
  let alphaNumData = ["a", "b", "c", "d", "e", "f", 1, 2, 3, 4, 5, 6, 7];
  let outputStr = "";

  for (let i = 0; i < 6; i++) {
    let randomCharacter = Math.floor(Math.random() * alphaNumData.length);
    outputStr += alphaNumData[randomCharacter];
  }

  return outputStr;
}

// check if an email already exists in the database (db)
function checkEmailExists(email, db) {
  for (let user in db) {
    if (db[user].email === email) {
      return true;
    }
  }
  return false;
}

// checks if both email and password is correct
function checkLoginIsRight(email, password, db) {
  for (let user in db) {
    if (checkEmailExists(email, db) && bcrypt.compareSync(password, db[user].password)) {
      return true;
    }
  }
  return false;
}



// get user's personal urls
function getURLsbyUserId(userId, urlDatabase) {
  let outputURLs = {};

  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === userId) {
      outputURLs[url] = {
        longURL: urlDatabase[url].longURL,
        userID: urlDatabase[url].userID
      }
    }
  }
  return outputURLs;
}
