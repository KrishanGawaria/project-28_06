var mongoose = require('mongoose')

mongoose.connect('mongodb://krishangarg:Krishan12@ds213705.mlab.com:13705/konnect1', { useNewUrlParser: true })

mongoose.Promise = Promise

var User = require("./user")
var Post = require("./post")
var Comment = require("./comment")
var Group = require("./group")
var Message = require("./message")
var Category = require("./category")
var Pipe = require('./pipe')
var Notification = require('./notification')

var models = {
  User : User,
  Post : Post,
  Comment : Comment,
  Group : Group,
  Message : Message,
  Category : Category,
  Pipe : Pipe,
  Notification : Notification
}

module.exports = models
