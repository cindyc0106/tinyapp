const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: ""
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: ""
  },
};

const getUserByEmail = function(email, database) {
  for (let userid in database) {
    if (database[userid].email === email) {
      return database[userid];
    }
  } return undefined;
};

const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

const urlsForUser = function(id) {
  let result = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      result[key] = { longURL: urlDatabase[key].longURL, userID: urlDatabase[key].userID };
    }
  }
  return result;
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser, 
  urlDatabase
};