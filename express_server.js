var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();
var PORT = 8080;
var cookie;
var currentUser;

app.set('view engine', 'ejs');
app.use(cookieParser());

function generateRandomString() {
  var randomString = '';

  for (var i = 0; i < 6; i++) {
    randomString += Math.ceil(Math.random() * 6);
  }
  console.log(randomString);
  return randomString;
}
//databases
var urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const users = {
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
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/urls", (req, res) => {
  let templateVars = { username: users[req.cookies["user_id"]],
    urls: urlDatabase
  };


  res.render("urls_index", templateVars);

});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: users[req.cookies["user_id"]],
    urls: urlDatabase
  };

  if (!currentUser) {
    res.render('login');
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { username: users[req.cookies["user_id"]], shortURL: req.params.id,
    lurl: urlDatabase[req.params.id] };

  res.render("urls_show", templateVars);
});

app.get('/', (req, res) => {
  res.send('Hello');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>BRAVE WARRIOR</b></body></html>\n');
});
//registration!!!!!!!!!!!!!!!!!!!!!!!!!!!!YAH!
app.get('/register', (req, res) => {
  let templateVars = { username: users[req.cookies["user_id"]]};
  res.render('registration_page', templateVars);
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/register', (req, res) => {
  var email = req.body.email;
  var password = req.body.password;

  for (user in users) {
    //console.log('email : ', email);
    //console.log('user email :', users[user].email);
    if (email === users[user].email) {
      //console.log('match');
      res.status(400).send('Your email is already registered, go back and try again');
    }
  }

  if (email === '' || password === '') {
    res.status(400).send('Your email/password is empty, go back and try again');
  } else {
    currentUser = true;
    var userKey = generateRandomString();
    console.log('circuit tripped!');
    users[userKey] = { id: userKey, email,
      password};
    console.log(users);
    res.cookie('user_id', userKey);
    res.redirect('/urls');
  }

});
//login feature
app.post('/login', (req, res) => {
  var myMail = req.body.email;
  var pWord = req.body.password;
  var truMail = null;
  var truPass = null;
  for (var usr in users) {

    if (myMail === users[usr].email) {
      truMail = users[usr].email;
      if (pWord === users[usr].password) {
        res.cookie('user_id', users[usr].id);
        currentUser = true;
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
  res.clearCookie('user_id');
  res.redirect('/urls');
  currentUser = false;
});
//delete feature
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});
//update feature
app.post('/urls/:id/update', (req, res) => {
  res.redirect('/urls/' + req.params.id);
});

app.post('/urls/:id', (req, res) => {
  let templateVars = { username: users[req.cookies["user_id"]]};
  //console.log(req.body.urlName);
  urlDatabase[req.params.id] = req.body.urlName;
  res.redirect('/urls', templateVars);

});

app.post("/urls", (req, res) => {
  var stringo = generateRandomString();
  urlDatabase[stringo] = req.body.longURL;
  // console.log(req.body);  // debug statement to see POST parameters
  res.redirect('http://localhost:8080/urls/' + stringo);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  // console.log('req body = ' + req.params.shortURL);
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//helper functions

