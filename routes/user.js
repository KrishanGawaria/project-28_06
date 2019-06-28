var express = require('express')
var router = express.Router()

var models = require('../models')
var User = models['User']
var Post = models['Post']
var Category = models['Category']
var Pipe = models['Pipe']
var Group = models['Group']
var Notification = models['Notification']



// API OF USER PROFILE PAGE
router.get('/api/user/profile/:skip', function(req, res){

  var skip = Number(req.params.skip)
  // FIND POSTS WHOSE AUTHOR IS CURRENT USER
  Post.find({author:req.user, type_of_post : "casual"}).populate('author').exec()
  .then(function(foundPosts){
    foundPosts.sort(function(a,b){ return b.time - a.time})
    foundPosts = foundPosts.slice(skip, skip + 1)
    res.json(foundPosts)
  })
  .catch(function(error){
    console.log(error)
    res.send(error)
  })
})


// DISPLAY PROFILE PAGE
router.get('/:id/profile', function(req, res){

  // FIND POSTS WHOSE AUTHOR IS CURRENT USER


    // TO SHOW WHILE CREATING POST
    Category.find()
    .then(function(foundCategories){

      // TO SHOW WHILE CREATING POST
      Group.find({members:req.user._id})
      .then(function(foundGroups){
        res.render('user/profile', {foundCategories:foundCategories, foundGroups: foundGroups})
      })
      .catch(function(error){
        console.log(error)
      })

    })
    .catch(function(error){
      console.log(error)
    })


})

var loadedPipes = []
// API OF REAL TIME NEWS FEED
router.get('/api/user/home/real-posts', function(req, res){

  // FIND PIPES THAT MATCH EITHER OF THE CONDITIONS:
  //   1. SHOW ACCESS IDS INCLUDE CURRENT USER
  //   2. PIPE'S CATEGORY NAME IS USER'S INTEREST AND AUTHOR SHOULD BE NEITHER FRIEND NOR ACQUAINTANCE NOR HIMSELF
  //       AND SHOW ACCESS MUST BE UNCONNECTED/BROADCAST
  Pipe.find({$or:[{show_access_ids : req.user._id.toString()}, {category_name:{$in:req.user.interested_categories}, activity_owner :{$nin: [...req.user.friends, ...req.user.acquaintances, req.user]}, show_access:"unconnected"}]}).populate('activity_owner').populate({path:'post',populate:{path:'author'}}).sort({time:-1}).limit(4).exec()
  .then(function(foundPipes){

    returnPipes = []
    for(var i =0; i<foundPipes.length; i++){
      var flag = false
      loadedPipes.forEach(function(loadedPipe){
        if(loadedPipe._id.toString() == foundPipes[i]._id.toString()){
          flag = true
        }
      })

      if(!flag){
        returnPipes.push(foundPipes[i])
        loadedPipes.push(foundPipes[i])
      } else {
        break
      }

    }

    res.json(returnPipes)
  })
  .catch(function(error){
    console.log(error)
  })
})

// API OF NEWS FEED -> USER HOME PAGE
router.get('/api/user/home/:skip', function(req, res){
  var skip = Number(req.params.skip)
  // FIND PIPES THAT MATCH EITHER OF THE CONDITIONS:
  //   1. SHOW ACCESS IDS INCLUDE CURRENT USER
  //   2. PIPE'S CATEGORY NAME IS USER'S INTEREST AND AUTHOR SHOULD BE NEITHER FRIEND NOR ACQUAINTANCE NOR HIMSELF
  //       AND SHOW ACCESS MUST BE UNCONNECTED/BROADCAST
  // if(loadedPipes.length != 0) {
  //   var foundPipes = loadedPipes.slice(skip, skip+1)
  //   res.json(foundPipes)
  // } else {
  //
  // }
  Pipe.find({$or:[{show_access_ids : req.user._id.toString()}, {category_name:{$in:req.user.interested_categories}, activity_owner :{$nin: [...req.user.friends, ...req.user.acquaintances, req.user]}, show_access:"unconnected"}]}).populate('activity_owner').populate({path:'post',populate:{path:'author'}}).exec()
  .then(function(foundPipes){
    foundPipes.sort(function(a,b){ return b.time - a.time})
    loadedPipes = [...foundPipes]
    foundPipes = foundPipes.slice(skip, skip + 1)

    res.json(foundPipes)
  })
  .catch(function(error){
    console.log(error)
  })

})


// Display HOME PAGE
router.get('/:id/home', function(req, res){

  // FIND PIPES THAT MATCH EITHER OF THE CONDITIONS:
  //   1. SHOW ACCESS IDS INCLUDE CURRENT USER
  //   2. PIPE'S CATEGORY NAME IS USER'S INTEREST AND AUTHOR SHOULD BE NEITHER FRIEND NOR ACQUAINTANCE NOR HIMSELF
  //       AND SHOW ACCESS MUST BE UNCONNECTED/BROADCAST

  Group.find({members:req.user._id})
  .then(function(foundGroups){
    // TO SHOW WHILE CREATING POST
    Category.find()
    .then(function(foundCategories){
      res.render("user/home", { foundGroups:foundGroups, foundCategories:foundCategories })
    })
    .catch(function(error){
      console.log(error)
    })
  })
  .catch(function(error){
    console.log(error)
  })

})




// DISPLAY FRIENDS-ACQUAINTANCES PAGE
router.get('/:id/friends-acquaintances', function(req, res){

  // FETCH CURRENT USER WITH POPULATED friends ARRAY
  User.findOne({_id : req.user._id}).populate('friends').populate('acquaintances').exec()
  .then(function(foundUser){
    res.render('user/friends_acquaintances', {foundUser : foundUser})
  })
  .catch(function(error){
    console.log(error)
    res.send(error)
  })

})




// DISPLAY FRIEND-ACQUAINTANCE REQUESTS PAGE
router.get('/:id/friend-requests', function(req, res){

  // FETCH CURRENT USER WITH POPULATED friend_requests ARRAY
  User.findOne({_id : req.user._id}).populate('friend_requests').populate('acquaintance_requests').exec()
  .then(function(foundUser){
    res.render('user/friend_acquaintance_requests', {foundUser : foundUser})
  })
  .catch(function(error){
    console.log(error)
    res.send(error)
  })

})

// DISPLAY SENT REQUESTS PAGE THAT DISPLAYS SENT FRIEND REQUESTS AND SENT ACQUAINTANCE REQUESTS
router.get('/:id/sent-requests', function(req, res){

  // FETCH CURRENT USER WITH POPULATED sent_friend_requests AND sent_acquaintance_requests ARRAY
  User.findOne({_id : req.user._id}).populate('sent_friend_requests').populate('sent_acquaintance_requests').exec()
  .then(function(foundUser){
    res.render('user/sent_requests', {foundUser : foundUser})
  })
  .catch(function(error){
    console.log(error)
    res.send(error)
  })

})


// API OF ALL POSTS OF FRIENDS AND ACQUAINTANCES
router.get('/api/friends-acquaintances/posts/:skip', function(req, res){

  var skip = Number(req.params.skip)

  Pipe.find({activity_owner:{$in:[...req.user.friends, ...req.user.acquaintances]}, show_access_ids:req.user._id.toString()}).populate('activity_owner').populate({path:'post',populate:{path:'author'}}).exec()
  .then(function(foundPipes){
    foundPipes.sort(function(a,b){ return b.time - a.time})
    foundPipes = foundPipes.slice(skip, skip + 1)
    res.json(foundPipes)
  })
  .catch(function(error){
    console.log(error)
  })

})


// DISPLAY ALL POSTS OF FRIENDS AND ACQUAINTANCES
router.get('/:id/friends-acquaintances/posts', function(req, res){

  res.render("user/fr_acq_posts")

})




module.exports = router
