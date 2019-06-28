var express = require('express')
var router = express.Router()

var models = require('../models')
var Category = models["Category"]
var Pipe = models["Pipe"]

// DISPLAY MY INTERESTED CATEGORIES AND ALL CATEGORIES
router.get('/:id/category', function(req, res){

  Category.find()
  .then(function(foundCategories){
    console.log('--')
    res.render('category/category', {foundCategories : foundCategories})
  })
  .catch(function(error){
    res.send(error)
  })
})


// LOGIC TO ADD CATEGORY INTO MY INTERESTED CATEGORIES
router.get('/:id/category/add/:category_name', function(req, res){
  req.user.interested_categories.push(req.params.category_name)
  req.user.save()

  res.send('Added')
})


// LOGIC TO REMOVE CATEGORY FROM MY INTERESTED CATEGORIES
router.get('/:id/category/remove/:category_name', function(req, res){
  var index = req.user.interested_categories.indexOf(req.params.category_name)
  if(index != -1){
    req.user.interested_categories.splice(index, 1)
    req.user.save()
    res.send('Removed')
  } else{
    res.send('Not Found')
  }

})


// API OF ALL POSTS OF SPECIFIC CATEGORY
router.get('/api/category/:category_name/:skip', function(req, res){

  var skip = Number(req.params.skip)
  // $or
  //   1. Posts of non-connected users with category name and show_access to be 'unconnected'
  //   2. Posts of friends and acq with category name and show_access_ids to be req.user
  Pipe.find({$or:[{activity_owner:{$nin:[...req.user.friends, ...req.user.acquaintances]}, show_access:'unconnected', category_name:req.params.category_name}, {category_name:req.params.category_name, show_access_ids:req.user._id.toString()}]}).populate('activity_owner').populate({path:'post',populate:{path:'author'}}).exec()
  .then(function(foundPipes){
    foundPipes.sort(function(a,b){ return b.time - a.time})
    foundPipes = foundPipes.slice(skip, skip + 1)
    res.json(foundPipes)
  })
  .catch(function(error){
    console.log(error)
  })

})


// DISPLAY ALL POSTS OF SPECIFIC CATEGORY
router.get('/:id/category/:category_name', function(req, res){

  // $or
  //   1. Posts of non-connected users with category name and show_access to be 'unconnected'
  //   2. Posts of friends and acq with category name and show_access_ids to be req.user

  res.render("category/category_posts", {categoryName:req.params.category_name})

})


// API OF POSTS OF FRIENDS AND ACQUAINTANCES OF SPECIFIC CATEGORY
router.get('/api/category/:category_name/friends-acquaintances/:skip', function(req, res){

  var skip = Number(req.params.skip)
  // Posts of friends and acq with category name and show_access_ids to be req.user
  Pipe.find({category_name:req.params.category_name, show_access_ids:req.user._id.toString()}).populate('activity_owner').populate({path:'post',populate:{path:'author'}}).exec()
  .then(function(foundPipes){
    foundPipes.sort(function(a,b){ return b.time - a.time})
    foundPipes = foundPipes.slice(skip, skip + 1)
    res.json(foundPipes)
  })
  .catch(function(error){
    console.log(error)
  })

})

// DISPLAY POSTS OF FRIENDS AND ACQUAINTANCES OF SPECIFIC CATEGORY
router.get('/:id/category/:category_name/friends-acquaintances', function(req, res){
    // Posts of friends and acq with category name and show_access_ids to be req.user
    res.render("category/fr_acq_category_posts", {categoryName:req.params.category_name})

})




module.exports = router
