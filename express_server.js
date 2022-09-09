
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");
//middleware - to parse body

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// const cookieParser = require('cookie-parser');
// app.use(cookieParser());
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
  maxAge: 10 * 60 * 1000 // 10 min
}));


function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
};

const getUserByEmail = require('./helpers');

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
    password: bcrypt.hashSync('123', 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync('456', 10),
  },
};

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
  res.redirect("/login");
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
  const user_id = req.session.user_id;
  const user = users[user_id];
  let templateVars = { urls: urlDatabase, user };
  if (user) {
    templateVars = { urls: urlsForUser(user_id), user };
  }
  if (!user) {
    return res.send('<h2>Please login first :)</h2>');
  }

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
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
  const user_id = req.session.user_id;
  const user = users[user_id];
  const id = req.params.id;
  if (!urlDatabase[req.params.id]) {
    return res.send("<h3>Invalid URL</h3>");
  }
  if (!user) {
    return res.send("<h3>Please login first :)</h3>");
  }
  if (id !== user.id) {
    return res.send("<h3>This URL is not owned by you</h3>");
  }
  const longURL = urlDatabase[id].longURL
  const templateVars = { id, longURL , user };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = {
    user,
  };
  if (!user) {
    return res.send("Need to be logged in to create new tiny URLs");
  }
  const longURL = req.body.longURL;
  const id = generateRandomString();
  urlDatabase[id] = { longURL, userID: user_id };
  res.redirect('/urls');
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (!urlDatabase[req.params.id]) {
    return res.send("<h3>Invalid URL</h3>");
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
  const user_id = req.session.user_id;
  const user = users[user_id];
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  const templateVars = { id, longURL, user };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const longURL = req.body.longURL;
  const id = req.params.id;
  urlDatabase[id].longURL = longURL;
  res.redirect('/urls');
});


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const user = getUserByEmail(email, users);
  if (!user) {
    res.status(403);
    return res.send("Invalid email/password");
  }
  if (bcrypt.compareSync(password, hashedPassword)) {
    req.session.user_id = user.id;
    res.redirect('/urls');
  }
});


app.post("/logout", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = { user };
  req.session = null;
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  const user_id = req.session.user_id;
  if (users[user_id]) {
    return res.redirect('/urls');
  }
  res.render('register', { user: null });
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  if (getUserByEmail(email, users)) {
    res.status(400);
    return res.send("400 Status Code: Email is in use");
  }
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString();
  const user = { id, email, password: hashedPassword };
  users[id] = user;
  req.session.user_id = user.id;
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  if (user) {
    return res.redirect('/urls');
  }
  res.render('login', { user: null });
});
