const { assert } = require('chai');
const { getUserByEmail, urlsForUser, getLoggedInUser } = require('../helpers');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);            //Salt for Hash

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

const testUrlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "user2RandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "userRandomID"
  }
};

const testLoggedInUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", salt)     //Hashing Password
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$LSecq/nPOv7oQn25v6ah9e1ITTFzykHU0UIXcabWdlAcrVQkibLBG"     //Hashed Password
  },
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });

  it('should return undefined if email is not found in the database', function() {
    const user = getUserByEmail("user3@example.com", testUsers);
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID);
  });
});

describe('urlsForUser', function() {
  it('should return the object containing all urls for a valid user id', function() {
    const urls = urlsForUser("user2RandomID", testUrlDatabase);
    const expectedUrls = { b2xVn2: {
      longURL: "http://www.lighthouselabs.ca",
      userID: "user2RandomID"
    }};
    assert.deepEqual(urls, expectedUrls);
  });

  it('should return undefined if user id is not found in the urls data', function() {
    const urls = getUserByEmail("user3RandomID", testUrlDatabase);
    const expectedUrls = undefined;
    assert.deepEqual(urls, expectedUrls);
  });
});

describe('getLoggedInUser', function() {
  it('should return a user with valid email and password', function() {
    const user = getLoggedInUser("user@example.com", "purple-monkey-dinosaur", testLoggedInUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });

  it('should return undefined if email is not found in the database', function() {
    const user = getLoggedInUser("user3@example.com", "abc", testLoggedInUsers);
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID);
  });

  it('should return undefined if password is not found for the valid email in the database', function() {
    const user = getLoggedInUser("user@example.com", "abc", testLoggedInUsers);
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID);
  });
});