var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();
var PORT = 8080;
var cookie;

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

var urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/urls", (req, res) => {
  let templateVars = { username: req.cookies["username"], urls: urlDatabase };

  res.render("urls_index", templateVars);

});

app.get("/urls/new", (req, res) => {
  var templateVars = { username: req.cookies["username"], something: 'im a placeholder!'};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { username: req.cookies["username"], shortURL: req.params.id,
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
//login feature
app.post('/login', (req, res) => {

  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

//logout feature
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
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
  let templateVars = { username: req.cookies["username"]};
  console.log(req.body.urlName);
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