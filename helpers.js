const bcrypt = require('bcryptjs');

//User lookup helper function
const getUserByEmail = function(formEmail, database) {
  let user = undefined;
  for (const userId in database) {           //Each property of users object
    if (database[userId].email === formEmail) {          //Each user object (sub-object) of the user object
      user = userId;
    }
  }
  return user;
};

//Filter urlDatabase function
const urlsForUser = function(id, urlDatabase) {
  const urls = {};
  for (const urlID in urlDatabase) {        //Each property of urlDatabase
    const urlObj = urlDatabase[urlID];      //Each url Object of the urlID
    if (urlObj.userID === id) {
      urls[urlID] = urlObj;
    }
  }
  return urls;
};

//Logged in User lookup helper function
const getLoggedInUser = function(formEmail, formPassword, database) {
  let user = undefined;
  for (const userId in database) {           //Each property of users object
    //Each user object (sub-object) of the users object
    if (database[userId].email === formEmail && bcrypt.compareSync(formPassword, database[userId].password)) {    //Compare formPassword hash with stored user's (hashed) password
      user = database[userId].id;
      //console.log(user);
    }
  }
  return user;
};

module.exports = {
  getUserByEmail,
  urlsForUser,
  getLoggedInUser
};