const { assert } = require('chai');

const { getUserIdWithEmail } = require("../helpers")

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('the getUserByEmail function', function() {
  it('should return a user with valid email', function() {
    const user = getUserIdWithEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.strictEqual(user, expectedOutput);
  });

  it("should return undefined when email doesn't exist in DB", function() {
    const user = getUserIdWithEmail("xyz@gmail.com", testUsers)
    const expectedOutput = undefined;
    assert.strictEqual(user, expectedOutput);
  });
});