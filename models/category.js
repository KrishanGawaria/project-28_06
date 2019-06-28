var mongoose = require('mongoose')

var categorySchema = new mongoose.Schema({

  name : {
    type : String
  },

  parent : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Category"
  },

  children : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : "Category"
    }
  ],

  posts : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : "Post"
    }
  ],

  parent_name : {
    type : String
  },

  children_names : [
    // holds strings i.e. name of children
  ]

})

var Category = mongoose.model("Category", categorySchema)

module.exports = Category
