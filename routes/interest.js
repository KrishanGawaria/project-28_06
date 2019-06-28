var express = require('express')
var router = express.Router()

var models = require('../models')
var User = models['User']
var Post = models['Post']


// API DISPLAY 'my-interests' PAGE
router.get('/api/my-interests/:skip', function(req, res){
  Post.find({buyer : req.user, blocked_status : 'false'}).populate('author').populate('seller').sort({time:-1}).skip(Number(req.params.skip)).limit(2).exec()
  .then(function(foundPosts){
    res.json(foundPosts)
  })
  .catch(function(error){
    console.log(error)
    res.send(error)
  })
})


// DISPLAY 'my-interests' PAGE
router.get('/:id/my-interests', function(req, res){

  Post.find({buyer : req.user, blocked_status : 'false'}).populate('author').populate('seller').sort({time:-1}).limit(5).exec()
  .then(function(foundPosts){
    res.render('interest/my_interests', {foundPosts : foundPosts})
  })
  .catch(function(error){
    console.log(error)
    res.send(error)
  })

})


// API DISPLAY 'others-interests' PAGE
router.get('/api/others-interests/:skip', function(req, res){
  Post.find({seller : req.user, blocked_status : 'false'}).populate('author').sort({time:-1}).skip(Number(req.params.skip)).limit(2).exec()
  .then(function(foundPosts){
    res.json(foundPosts)
  })
  .catch(function(error){
    console.log(error)
    res.send(error)
  })
})


// DISPLAY 'others-interests' PAGE
router.get('/:id/others-interests', function(req, res){

  Post.find({seller : req.user, blocked_status : 'false'}).populate('author').sort({time:-1}).limit(5).exec()
  .then(function(foundPosts){
    res.render('interest/others_interests', {foundPosts : foundPosts})
  })
  .catch(function(error){
    console.log(error)
    res.send(error)
  })

})

module.exports = router
