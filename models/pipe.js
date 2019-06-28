var mongoose = require('mongoose')

var pipeSchema = new mongoose.Schema({

  show_access_ids : [],

  show_access : [],

  activity_owner : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User"
  },

  activity_caption : {
    type : String
  },

  time : {
    type : Date
  },

  post : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Post"
  },

  category_name : {
    type : String
  },

  group_ids : [],

  favourites : [] // String of user IDs

})

var Pipe = mongoose.model('Pipe', pipeSchema)

module.exports = Pipe
