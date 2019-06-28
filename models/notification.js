var mongoose = require('mongoose')

var notificationSchema = new mongoose.Schema({

  event_owner : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User"
  },

  event_caption : {
    type : String
  },

  event_link : {
    type : String
  },

  event_tag : {
    type : String
  },

  post : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Post"
  },

  time : {
    type : Date,
    default : Date.now
  },

  seen : {
    type : String    // yes / no
  },

  notification_tray : {
    type : String  // yes / no
  },

  receivers : [] // string of user id

})

var Notification = mongoose.model('Notification', notificationSchema)

module.exports = Notification
