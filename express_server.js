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
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let userCookie = req.cookies.user_id;
  let templateVars = { urls: urlDatabase, userInfo: users[userCookie] };
  res.render("urls_index", templateVars)
})

// this path will take you to a form
app.get("/urls/new", (req, res) => {
  let userCookie = req.cookies.user_id;
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
    userID: req.cookies.user_id
  }

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
  let userCookie = req.cookies.user_id;
  if (urlDatabase[shortURL]) {
    let templateVars = { 
      shortURL: req.params.shortURL, 
      longURL: urlDatabase,
      userInfo: users[userCookie] 
    };
    res.render("urls_show", templateVars);
  } else {
    res.send("That tiny URL isn't in our database");
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
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
})

// this will handle the login post and COOOOKIES!!!!
app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;

  if (checkLoginIsRight(userEmail, userPassword, users)) {
    let userCookieId = getUserIdWithEmail(userEmail, users);
    res.cookie("user_id", userCookieId);
    res.redirect("/urls");
  } else {
    res.status(403);
    res.send("nu-huh nice try hacker, you won't get any info from me! This email may or may not be already taken and the password may or maynot be strong enough to create an account");
  }

})

// deletes user_id cookie from history
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

// for new registrations
app.get("/register", (req, res) => {
  let userCookie = req.cookies.user_id;
  let templateVars = { urls: urlDatabase, userInfo: users[userCookie] };
  res.render("urls_register", templateVars);
})

// getting back filled out registration form
app.post("/register", (req, res) => {
  let userId = generateRandomString();
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  
  if (!checkEmailExists(userEmail, users)) {
    // add to user DB
    users[userId] = {
      id: userId,
      email: userEmail,
      password: userPassword
    }
  
    // send the intial cookie upon registration
    res.cookie("user_id", userId);
    res.redirect("/urls");   
  } else {
    res.status(400);
    res.send("nu-huh nice try hacker, you won't get any info from me! This email may or may not be already taken and the password may or maynot be strong enough to create an account");
  }
})

// for logging in
app.get("/login", (req, res) => {
  let userCookie = req.cookies.user_id;
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
    if (checkEmailExists(email, db) && db[user].password === password) {
      return true;
    }
  }
  return false;
}

// get user id with only email
function getUserIdWithEmail(email, db) {
  for (let user in db) {
    if (db[user].email === email) {
      return db[user].id;
    }
  }
}
