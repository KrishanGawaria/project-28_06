var mongoose = require('mongoose')

var mongoosePaginate = require('mongoose-paginate-v2')

var messageSchema = new mongoose.Schema({

  message : {
    type : String
  },

  author : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User"
  },

  group_id : {
    type : String
  },

  time : {
    type : Date,
    default : Date.now
  }

})

messageSchema.plugin(mongoosePaginate)

var Message = mongoose.model("Message", messageSchema)

module.exports = Message
