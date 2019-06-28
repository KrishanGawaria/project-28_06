var express = require('express')
var router = express.Router()

var models = require('../models')
var Pipe = models['Pipe']


// API -> FAVOURITES PAGE
router.get('/api/my-favourites/:skip', function(req, res){
  var skip = Number(req.params.skip)

  Pipe.find({favourites : req.user._id.toString()}).populate('activity_owner').populate({path:'post',populate:{path:'author'}}).sort({time:-1}).skip(skip).limit(2).exec()
  .then(function(foundPipes){
    res.json(foundPipes)
  })
  .catch(function(error){
    console.log(error)
  })
})



// DISPLAY MY FAVOURITES PAGE
router.get('/:id/my-favourites', function(req, res){

  Pipe.find({favourites : req.user._id.toString()}).populate('activity_owner').populate({path:'post',populate:{path:'author'}}).sort({time:-1}).limit(5).exec()
  .then(function(foundPipes){
    res.render('favourite/my_favourites', {foundPipes : foundPipes})
  })

})



module.exports = router
