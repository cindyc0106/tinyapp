
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

//middleware - to parse body

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
};


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

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "123",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

function getUserByEmail(email) {
  for (let userid in users) {
    if (users[userid].email === email) {
      return users[userid];
    }
  }
  return null;
}

function urlsForUser(id) {
  let result = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      result[key] = { longURL: urlDatabase[key].longURL, userID: urlDatabase[key].userID };
    }
  }
  return result;

}


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  let templateVars = { urls: urlDatabase, user };
  if (user) {
    templateVars = { urls: urlsForUser(user_id), user };
    // res.render();
  }
  if (!user) {
    return res.redirect('/login');
  }

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  const templateVars = {
    user,
  };
  if (!user) {
    return res.redirect('/login');
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longUrl, user };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  const templateVars = {
    user,
  };
  if (!user) {
    return res.send("Need to be login in to create new tiny URLs");
  }
  const longURL = req.body.longURL;
  const id = generateRandomString();
  urlDatabase[id] = { longURL, userID: user_id };
  res.redirect('/urls');
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (!urlDatabase[req.params.id]) {
    return res.send("Invalid URL");
  }
  let keys = Object.keys(urlDatabase);
  let isValidId = false;
  keys.map(key => {
    if (key === id) {
      isValidId = true;
    }
  });
  const longURL = urlDatabase[req.params.id].longURL;
  if (isValidId) {
    res.redirect(longURL);
  } else {
    res.send("Invalid URL");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.get("/urls/:id/edit", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  const id = req.params.id;
  const longURL = urlDatabase[id].longUrl;
  const templateVars = { id, longURL, user };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const longURL = req.body.longURL;
  const id = req.params.id;
  urlDatabase[id].longUrl = longURL;
  res.redirect('/urls');
});


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);

  if (!user || user.password !== password) {
    res.status(403);
    return res.send("Invalid email/password");
  }

  res.cookie("user_id", user.id);
  res.redirect('/urls');
});


app.post("/logout", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  const templateVars = { user };
  res.clearCookie("user_id");
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  const user_id = req.cookies.user_id;
  if (users[user_id]) {
    return res.redirect('/urls');
  }
  res.render('register', { user: null });
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  if (getUserByEmail(email)) {
    res.status(400);
    return res.send("400 Status Code: Email is in use");
  }
  const password = req.body.password;
  const id = generateRandomString();
  const user = { id, email, password };
  users[id] = user;
  res.cookie("user_id", id);
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  if (user) {
    return res.redirect('/urls');
  }
  res.render('login', { user: null });
});
