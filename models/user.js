var mongoose = require('mongoose')
var passportLocalMongoose = require('passport-local-mongoose')

var userSchema = new mongoose.Schema({

  username : {
    type : String
  },

  name : {
    type : String
  },

  posts : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : "Post"
    }
  ],

  friends : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : "User"
    }
  ],

  friend_requests : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : "User"
    }
  ],

  sent_friend_requests : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : "User"
    }
  ],

  groups : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'Group'
    }
  ],

  inventories : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'Post'
    }
  ],

  shared_inventories : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : 'Post'
    }
  ],

  acquaintances : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : "User"
    }
  ],

  blocked_by_me : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : "Post"
    }
  ],

  blocked_by_others : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : "Post"
    }
  ],

  my_interests : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : "Post"
    }
  ],

  others_interests : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : "Post"
    }
  ],

  shared_inventories_by_me : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : "Post"
    }
  ],

  interested_categories : [
    // type String
  ],

  acquaintance_requests : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : "User"
    }
  ],

  sent_acquaintance_requests : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : "User"
    }
  ],

  activity_logs : [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref : "Activity_Log"
    }
  ],

  notifications : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : "Notification"
    }
  ],

  favourites : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : "Pipe"
    }
  ]

})


userSchema.plugin(passportLocalMongoose)



var User = mongoose.model("User", userSchema)



module.exports = User
