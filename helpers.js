// get user id with only email
const getUserIdWithEmail = function(email, db) {
  for (let user in db) {
    if (db[user].email === email) {
      return db[user].id;
    }
  }
}

module.export = { getUserIdWithEmail };