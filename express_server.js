var express = require('express');
var app = express();
var PORT = 8080;

app.set('view engine', 'ejs');

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
  let templateVars = { urls: urlDatabase };

  res.render("urls_index", templateVars);

});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
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
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.post('/urls/:id/delete', (req, res) => {

  delete urlDatabase[req.params.id];
  res.redirect('/urls');
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