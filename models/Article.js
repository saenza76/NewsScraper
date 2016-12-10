var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
// create Schema class
var Schema = mongoose.Schema;


// Create article schema
var ArticleSchema = new Schema({
  // title is required
  title: {
    type:String,
    unique:true,
    required:true
  },
  // link is required
  link: {
    type:String,
    required:true
  },
  // this only saves one note's ObjectId. ref refers to the Note model.
  note: {
      type: Schema.Types.ObjectId,
      ref: 'Note'
  }
});

ArticleSchema.plugin(uniqueValidator);

// Create the Article model with the ArticleSchema
var Article = mongoose.model('Article', ArticleSchema);

// export the model
module.exports = Article;