var mongoose = require('mongoose')

var postSchema = new mongoose.Schema({

  post : {
    type : String
  },

  author : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User"
  },

  comments : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : "Comment"
    }
  ],

  time : {
    type : Date,
    default : Date.now
  },

  quantity : {
    type : Number
  },

  show_access : [], // ['friend', 'acquaintance', 'unconnected']

  performa : {
    type : mongoose.Schema.ObjectId,
    ref : "Performa"
  },

  seller : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User"
  },

  price : {
    type : Number
  },

  children_posts : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : "Post"
    }
  ],

  parent_post : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Post"
  },

  images : [
    // {
    //   data : Buffer,
    //   contentType : String,
    //   base64 : String
    // }
  ],

  type_of_post : {
    type : String   //  inventory / casual
  },

  category_name : {
    type : String  // Name of Category of which this post belongs
  },

  group_id : {
    type : mongoose.Schema.Types.ObjectId,
    ref: "Group"
  },

  inventory_tag : {
    type: String  // "created / shared"
  },

  buyer : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User"
  },

  blocked_status : {
    type : String // "true / false"
  },

  likes : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : "User"
    }
  ],

  enquires : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : "User"
    }
  ]

})

postSchema.index({post : "text"})

var Post = mongoose.model("Post", postSchema)

module.exports = Post
