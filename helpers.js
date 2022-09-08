const getUserByEmail = function(email, database) {
  for (let userid in database) {
    if (database[userid].email === email) {
      return database[userid];
    }
  } return undefined
};

module.exports = getUserByEmail 