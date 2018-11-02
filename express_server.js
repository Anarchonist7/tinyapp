var express = require('express');
//var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var app = express();

app.use(cookieSession({
  name: 'session',
  keys: ['Keyoooo!']

}));
var PORT = 8080;
var cookie;
var currentUser;
var loggedUser = false;
var userKey;
const bcrypt = require('bcrypt');

app.set('view engine', 'ejs');
// app.use(cookieParser());

function generateRandomString() {
  var randomString = '';

  for (var i = 0; i < 6; i++) {
    randomString += Math.ceil(Math.random() * 6);
  }

  return randomString;
}
//databases
var urlDatabase = {
  'b2xVn2': {
    link: 'http://www.lighthouselabs.ca',
    userID: '453754'
  },
  '9sm5xK': {
    link: 'http://www.google.com',
    userID: '435623'
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "1"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


//helper functions

function urlsForUser(id) {
  console.log("id we get", id);
  console.log("url database ", urlDatabase);
  var finito = {};
  for (var key in urlDatabase) {
    console.log('comparer :', urlDatabase[key].userID);
    console.log('ID', id);
    if (id === urlDatabase[key].userID) {
      console.log('im activated!');
      finito[key] = urlDatabase[key].link;
      console.log('the current user is : ' + currentUser);
    }
  }

  console.log('my object :', finito);
  return finito;
}

app.get("/urls", (req, res) => {

  var filtered = urlsForUser(req.session.user_id);
  console.log('these are my filtered urls: ', filtered);
  console.log('this is my url database: ', urlDatabase);
  let templateVars = { username: users[req.session["user_id"]],
    urls: filtered
  };
  if (loggedUser) {
    res.render("urls_index", templateVars);
  } else {
    // res.redirect(403, "Looks like somebody isn't logged in....");
    res.status(403).send("Looks like somebody isn't logged in...");
  }
});

app.get("/urls/new", (req, res) => {
  console.log('logged user: ', loggedUser);
  let templateVars = { username: users[req.session["user_id"]],
    urls: urlDatabase
  };

  if (loggedUser) {
    res.render("urls_new", templateVars);
  } else {
    res.render('login');

  }
});

app.get("/urls/:id", (req, res) => {
  console.log('comparer',urlDatabase);
  console.log('id:',req.params.id)
  let templateVars = { username: users[req.session["user_id"]], shortURL: req.params.id,
    lurl: urlDatabase[req.params.id].link};
  let exists = false;
  for (let url in urlDatabase) {
    if (urlDatabase[url].link == urlDatabase[req.params.id].link) {
      exists = 'owned';
    }
  }
  if (!exists) {
    res.status(404).send('Url does not exist');
  } else if (!loggedUser) {
    res.status(403).send("Hey! You aren't logged in!");
  } else if (loggedUser && exists !== 'owned') {
    res.status(403).send("You don't own this link");
  } else {
    res.render("urls_show", templateVars);
  }
});

app.get('/', (req, res) => {
  if (loggedUser) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
  res.send("<h1>Hello</h1><br><a href='/urls/new'>Make a new url</a>");
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>BRAVE WARRIOR</b></body></html>\n');
});
//registration!!!!!!!!!!!!!!!!!!!!!!!!!!!!YAH!
app.get('/register', (req, res) => {
  let templateVars = { username: users[req.session.user_id]};
  console.log(templateVars);
  res.render('registration_page', templateVars);
});

app.get('/login', (req, res) => {
  if (loggedUser) {
    res.redirect('/urls');
  } else {
    res.render('login');
  }
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  for (user in users) {

    if (email === users[user].email) {

      res.status(400).send('Your email is already registered, go back and try again');
    }
  }

  if (email === '' || password === '') {
    res.status(400).send('Your email/password is empty, go back and try again');
  } else {
    loggedUser = true;

    userKey = generateRandomString();
    req.session.user_id = userKey;
    currentUser = req.session.user_id;
    //console.log('circuit tripped!');
    users[userKey] = { id: userKey, email,
      password: hashedPassword};

    res.redirect('/urls');
  }
});
//login feature
app.post('/login', (req, res) => {
  var myMail = req.body.email;
  var pWord = req.body.password;
  var truMail = null;
  var truPass = null;
  loggedUser = true;

  for (var usr in users) {
    if (myMail === users[usr].email) {
      let pFind = users[usr];
      truMail = users[usr].email;
      if (bcrypt.compareSync(pWord, pFind.password)) {
      // if (pWord === users[usr].password) {
        req.session.user_id = userKey;
        // res.cookie('user_id', users[usr].id);
        currentUser = req.session.user_id;
        console.log('Successful login');
        truPass = users[usr].password;
      }
    }
  }

  if (!truMail) {
    res.status(403).send('Email not found, go back and try again.');
  }

  if (!truPass) {
    res.status(403).send('Password does not match, go back and try again');
  }

  res.redirect('/');
});

//logout feature
app.post('/logout', (req, res) => {
  console.log('password im comparing to: ', users);
  loggedUser = false;
  req.session.user_id = null;
  res.redirect('/');
  currentUser = null;
});
//delete feature
app.post('/urls/:id/delete', (req, res) => {

  if (req.session.user_id === urlDatabase[req.params.id].userID) {
    console.log("condition matched for the delete");
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  } else {
    res.status(401).send('Incorrect password, go back and try again');
  }
});
//update feature
app.post('/urls/:id/update', (req, res) => {
  console.log('update body: ', req.body);
  urlDatabase[req.params.id].link = req.body.urlName;
  //res.render('/urls/' + req.params.id + '/update');
  res.redirect('/urls/' + req.params.id);
});

app.post('/urls/:id', (req, res) => {
  console.log('req.params.id :', req.params.id);
  let templateVars = { username: users[req.session["user_id"]]};
  if (req.session.user_id === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id] = {link: req.body.urlName};
    res.redirect('/urls');
  } else {
    res.status(403).send('ACCESS DENIED!');
  }
});

app.post("/urls", (req, res) => {
  var stringo = generateRandomString();
  console.log('This is the long url that didnt show :', req.body.longURL);
  urlDatabase[stringo] = {'link': req.body.longURL, userID: req.session.user_id};///!!!!
  console.log('whatever goes in userID: ' + req.session.user_id);
  if (!loggedUser) {
    res.status(403).send('Log yourself in or get lost buddai!');
  } else {
    res.redirect('http://localhost:8080/urls/' + stringo);
  }
});

app.get("/u/:shortURL", (req, res) => {
  let proper = false;
  console.log('Redirect stuff: ', req.params.shortURL);

  for (let url in urlDatabase) {
    console.log('compare1: ', urlDatabase[url].link);
    console.log('compare2: ', urlDatabase[req.params.shortURL].link);
    if (urlDatabase[url].link == urlDatabase[req.params.shortURL].link) {
      proper = true;
    }
  }
  if (proper) {
    let longURL = urlDatabase[req.params.shortURL].link;
    res.redirect(longURL);
  } else {
    res.status(404).send('This url does not exist...leave this place');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});