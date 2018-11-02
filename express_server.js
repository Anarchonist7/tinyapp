var express = require('express');
var cookieParser = require('cookie-parser');

var app = express();
var PORT = 8080;
var cookie;
var currentUser;
var loggedUser = false;
const bcrypt = require('bcrypt');

app.set('view engine', 'ejs');
app.use(cookieParser());

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

  var filtered = urlsForUser(req.cookies.user_id);
  console.log('these are my filtered urls: ', filtered);
  console.log('this is my url database: ', urlDatabase);
  let templateVars = { username: users[req.cookies["user_id"]],
    urls: filtered
  };
  if (loggedUser) {
    res.render("urls_index", templateVars);
  } else {
    res.redirect('/login');
  }




});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: users[req.cookies["user_id"]],
    urls: urlDatabase
  };

  if (currentUser === req.cookies.user_id) {
    res.render('login');
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  console.log('req body', req.body);
  let templateVars = { username: users[req.cookies["user_id"]], shortURL: req.params.id,
    lurl: urlDatabase[req.params.id].link};
    //console.log('LURL:', urlDatabase[req.params.id].link);
    //console.log('url database: ', urlDatabase);
//console.log('this is the short url: ', templateVars[shortURL]);
  res.render("urls_show", templateVars);
});

app.get('/', (req, res) => {
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
  let templateVars = { username: users[req.cookies["user_id"]]};
  res.render('registration_page', templateVars);
});

app.get('/login', (req, res) => {
  loggedUser = true;
  res.render('login');
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
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
    loggedUser = true;
    currentUser = req.cookies.user_id;
    var userKey = generateRandomString();
    //console.log('circuit tripped!');
    users[userKey] = { id: userKey, email,
      password: hashedPassword};
    //console.log(users);
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
      let pFind = users[usr];
      truMail = users[usr].email;
      if (bcrypt.compareSync(pWord, pFind.password)) {
      // if (pWord === users[usr].password) {
        res.cookie('user_id', users[usr].id);
        currentUser = req.cookies.user_id;
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
  res.clearCookie('user_id');
  res.redirect('/urls');
  currentUser = null;
});
//delete feature
app.post('/urls/:id/delete', (req, res) => {

  //  '9sm5xK': {
  //   link: 'http://www.google.com',
  //   userID: '435623'
  // }

  // console.log("cookie ",req.cookies.user_id);
  // console.log("params ",req.params.id);
  // console.log(urlDatabase[req.params.id]);

  // console.log('Important info :', req.cookies.user_id, 'comparer :', urlDatabase[req.params.id]['userID']);

  if (req.cookies.user_id === urlDatabase[req.params.id].userID) {
    console.log("condition matched for the delete");
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  } else {
    res.send('These are not your links! Release the hounds!');
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
  let templateVars = { username: users[req.cookies["user_id"]]};
  if (req.cookies.user_id === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id] = {link: req.body.urlName};
    res.redirect('/urls');
  } else {
    res.send('These are not your urls to edit!');
  }


});

app.post("/urls", (req, res) => {
  var stringo = generateRandomString();
  console.log('This is the long url that didnt show :', req.body.longURL);
  urlDatabase[stringo] = {'link': req.body.longURL, userID: req.cookies.user_id};///!!!!
  console.log('whatever goes in userID: ' + req.cookies.user_id);
  //console.log(urlDatabase[stringo]['link']);
  //urlDatabase[stringo]['link'] = req.body.longURL;
  //console.log(urlDatabase[stringo]['link']);
  //urlDatabase[stringo]['link'] = req.body.longURL;
  //console.log('cooky :', req.cookies);
  // urlDatabase[stringo][userID] =
  // console.log(req.body);  // debug statement to see POST parameters
  res.redirect('http://localhost:8080/urls/' + stringo);
});

app.get("/u/:shortURL", (req, res) => {
  console.log('Redirect stuff: ', req.params.shortURL);
  let longURL = urlDatabase[req.params.shortURL].link;
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


