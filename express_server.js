
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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  for(let userid in users) {
    if(users[userid].email === email) {
      return users[userid]
    } 
  }
  return null
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
  const user_id = req.cookies.user_id
  const user = users[user_id]
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.cookies.user_id
  const user = users[user_id]
  const templateVars = {
    user,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user_id = req.cookies.user_id
  const user = users[user_id]
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString();
  urlDatabase[id] = longURL;
  res.redirect('/urls');
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.get("/urls/:id/edit", (req, res) => {
  const user_id = req.cookies.user_id
  const user = users[user_id]
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { id, longURL, user };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const longURL = req.body.longURL;
  const id = req.params.id;
  urlDatabase[id] = longURL;
  res.redirect('/urls');
});


app.post("/login", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  const user = getUserByEmail(email)
  
  if(!user || user.password !== password) {
    res.status(403)
    return res.send("Invalid email/password")
  } 


  res.cookie("user_id", user.id);
  res.redirect('/urls');
});


app.post("/logout", (req, res) => {
  const user_id = req.cookies.user_id
  const user = users[user_id]
  const templateVars = { user }
  res.clearCookie("user_id");
  res.redirect('/urls');
});

app.get("/register", (req, res) => {
  res.render('register', {user:null});
});

app.post("/register", (req, res) => {
 
  const email = req.body.email
  const password = req.body.password
  // check if these are empty
  
  const id = generateRandomString();
  const user = {id, email, password}
  users[id] = user
  if(getUserByEmail(email)) {
    res.status(400)
    return res.send("400 Status Code: Email is in use")
  } 
  res.cookie("user_id", id);
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  res.render('login', {user: null})
})
