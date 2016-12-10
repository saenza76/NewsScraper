var express = require("express");
var routes = require("./controllers/controller.js");
var request = require("request");
var logger = require("morgan");
var bodyParser = require('body-parser');

// Initialize Express
var app = express();

var exphbs  = require('express-handlebars');
// Handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static('public'));

app.use('/', routes);

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});