var express = require("express");
var router = express.Router();
var request = require('request');
var Article = require('../models/Article.js');
var Note = require('../models/Note.js');

var mongoose = require('mongoose');
var cheerio = require('cheerio');

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/scraperhw");
// heroku connection that wont work: 
 // mongoose.connect("mongodb://heroku_4nbj8f19:itu2r1dosoq7jir7aj8ajrnoqq@ds127928.mlab.com:27928/heroku_4nbj8f19");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// A GET request to scrape the hackernews website
router.get('/', function(req, res){
	request('https://news.ycombinator.com/', function(error, response, html) {
		// Then, we load that into cheerio and save it to $ for a shorthand selector
   		var $ = cheerio.load(html);
   		// Now, we grab every title within an td tag, and do the following:
   		$('td.title').each(function(i, element) {
   			// Save an empty result object
    		var result = {};

    		// Add the text and href of every link, and save them as properties of the result object
    		result.title = $(this).children("a").text();
    		result.link = $(this).children("a").attr("href");

    		// Using our Article model, create a new entry
      		// This effectively passes the result object to the entry (and the title and link)
      		var entry = new Article(result);

      		// Now, save that entry to the db
      		entry.save(function(err, doc) {
      			if (err) {
      				console.log(err);
      			}
      			else {
      				console.log(doc);
      			}
      		});
   		});
	});
	// Tell the browser that we finished scraping the text
  	Article.find({},function(err,data) {
         res.render('index');
    });
});

// This will get the articles we scraped from the mongoDB
router.get("/articles", function(req, res) {
	// Grab every doc in the Articles array
	Article.find({}, function(error, doc) {
    	// Log any errors
    	if (error) {
    	  console.log(error);
    	}
    	// Or send the doc to the browser as a json object
    	else {
    	  res.json(doc);
    	}
  	});
});

// Grab an article by it's ObjectId
router.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("note")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// Create a new note or replace an existing note
router.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  var newNote = new Note(req.body);

  // And save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's note
      Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          res.send(doc);
        }
      });
    }
  });
});

// Delete a note
router.post('/deletenote/:id', function(req, res) {
    // using the id passed in the id parameter,
    // prepare a query that finds the matching one in our db...
    console.log(req.params.id);
    Note.findOne({ '_id': req.params.id })
        // and populate all of the notes associated with it.
        .remove('note')
        // now, execute our query
        .exec(function(err, doc) {
            // log any errors
            if (err) {
                console.log(err);
            }
            // otherwise, send the doc to the browser as a json object
            else {
                res.json(doc);
            }
        });
});

module.exports = router;