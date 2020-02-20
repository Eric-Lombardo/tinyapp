const bcrypt = require("bcrypt");


// get user id with only email
const getUserIdWithEmail = function(email, db) {
  for (let user in db) {
    if (db[user].email === email) {
      return db[user].id;
    }
  }
};


// uniqueID generator to create shortURL signature
const generateRandomString = function() {
  let alphaNumData = ["a", "b", "c", "d", "e", "f", 1, 2, 3, 4, 5, 6, 7];
  let outputStr = "";

  for (let i = 0; i < 6; i++) {
    let randomCharacter = Math.floor(Math.random() * alphaNumData.length);
    outputStr += alphaNumData[randomCharacter];
  }
  return outputStr;
};

// check if an email already exists in the database (db)
const checkEmailExists = function(email, db) {
  for (let user in db) {
    if (db[user].email === email) {
      return true;
    }
  }
  return false;
};

// checks if both email and password is correct
const checkLoginIsRight = function(email, password, db) {
  for (let user in db) {
    if (checkEmailExists(email, db) && bcrypt.compareSync(password, db[user].password)) {
      return true;
    }
  }
  return false;
};

// get user's personal urls
const getURLsbyUserId = function(userId, urlDatabase) {
  let outputURLs = {};

  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === userId) {
      outputURLs[url] = {
        longURL: urlDatabase[url].longURL,
        userID: urlDatabase[url].userID
      };
    }
  }
  return outputURLs;
};


module.exports.getUserIdWithEmail = getUserIdWithEmail;
module.exports.generateRandomString = generateRandomString;
module.exports.checkEmailExists = checkEmailExists;
module.exports.checkLoginIsRight = checkLoginIsRight;
module.exports.getURLsbyUserId = getURLsbyUserId;