var express = require('express')
var router = express.Router()

var models = require('../models')
var Post = models['Post']
var User = models['User']
var Notification = models['Notification']


// LOGIC TO BLOCK AN ITEM (POST/INVENTORY)
router.post('/:id/post/:post_id/block', function(req, res){

  // CREATE A NEW INVENTORY WITH MENTIONED QUANTITY FOR CURRENT USER
  // ASSIGNING THE VALUE OF buying_from AS SOURCE POST'S AUTHOR
  // PUSHING createdInventory INTO CURRENT USER'S my_interests ARRAY
  // PUSHING SAME createdPost IN foundPost'S author'S others_interests

  var quantity = req.body['quantity']


  Post.findOne({_id : req.params.post_id}).populate('author').exec()
  .then(function(foundPost){

    // CREATE A NEW INVENTORY WITH MENTIONED QUANTITY FOR CURRENT USER
    // ASSIGNING THE VALUE OF buying_from AS SOURCE POST'S AUTHOR
    var newPost = {
      post : foundPost.post,
      images : foundPost.images,
      quantity : Number(quantity),
      price : foundPost.price,
      author : req.user,
      parent_post : foundPost.parent_post,
      buyer : req.user,
      seller : foundPost.author,
      blocked_status : "false"
    }

    Post.create(newPost)
    .then(function(createdPost){
        // PUSHING createdInventory INTO CURRENT USER'S my_interests ARRAY
        req.user.my_interests.push(createdPost)
        req.user.save()

        // PUSHING SAME createdPost IN foundPost'S author'S others_interests
        foundPost.author.others_interests.push(createdPost)
        foundPost.author.save()


        // NOTIFICATION
        var newNotification = {
          event_owner : req.user,
          event_caption : req.user.name + ' requested to block your inventory',
          event_tag : 'request block inventory',
          event_link : '/others-interests' ,
          post : createdPost,
          seen : 'no',
          notification_tray : 'no',
          receivers : [foundPost.author._id.toString()]
        }


        Notification.create(newNotification)
        .then(function(createdNotification){
          res.send("Added into My Interests.... Wait for Approval")
        })
        .catch(function(error){
          console.log(error)
        })





    })
    .catch(function(error){
      console.log(error)
      res.send(error)
    })


  })
  .catch(function(error){
    console.log(error)
    res.send(error)
  })

})




// LOGIC TO APPROVE THE BLOCK REQUEST
router.get('/:id/post/:post_id/approve', function(req, res){
  // FIND parent_post FROM FOUND POST, AND MODIFY QUANTITY FROM IT AND FROM ALL OF IT'S children_posts
  // DELETE THE POST FROM CURRENT USER'S others_interests AND PUT IT INTO his blocked_by_others
  // DELETE THE POST FROM POST'S AUTHOR'S my_interests AND PUT IT INTO his blocked_by_me
  // CREATE A NEW POST SAME AS foundPost AND ADD IT INTO foundPost's author's inventories



  // FIND parent_post FROM FOUND POST, AND MODIFY QUANTITY OF IT AND FROM ALL OF IT'S children_posts

  Post.findOne({_id : req.params.post_id}).populate('author').populate({path:'parent_post', populate:{path:'children_posts', model:'Post'}}).exec()
  .then(function(foundPost){

    // MODIFY PARENT POST
    foundPost.parent_post.quantity = foundPost.parent_post.quantity - foundPost.quantity
    foundPost.parent_post.save()

    // MODIFY ALL CHILDREN OF PARENT POST
    foundPost.parent_post.children_posts.forEach(function(ChildrenPost){
      ChildrenPost.quantity = ChildrenPost.quantity - foundPost.quantity
      ChildrenPost.save()
    })



    // DELETE THE POST FROM CURRENT USER'S others_interests AND PUT IT INTO his blocked_by_others
    req.user.blocked_by_others.push(foundPost)

    var index = -1
    req.user.others_interests.forEach(function(Post, i){
      if(Post._id.toString() == req.params.post_id){
        index = i
      }
    })

    req.user.others_interests.splice(index, 1)
    req.user.save()

    // DELETE THE POST FROM POST'S AUTHOR'S my_interests AND PUT IT INTO his blocked_by_me
    foundPost.author.blocked_by_me.push(foundPost)

    var index = -1
    foundPost.author.my_interests.forEach(function(Post, i){
      if(Post._id.toString() == req.params.post_id){
        index = i
      }
    })

    foundPost.author.my_interests.splice(index, 1)

    foundPost.blocked_status = "true"
    foundPost.save()

    // CREATE A NEW POST SAME AS foundPost AND ADD IT INTO foundPost's author's inventories
    var newPost = {
      post : foundPost.post,
      quantity : foundPost.quantity,
      author : foundPost.author,
      price : foundPost.price,
      type_of_post : 'inventory',
      inventory_tag : 'created',
      images : foundPost.images
    }

    Post.create(newPost)
    .then(function(createdPost){
      foundPost.author.inventories.push(createdPost)
      foundPost.author.save()


      // NOTIFICATION
      var newNotification = {
        event_owner : req.user,
        event_caption : req.user.name + ' approved your block request for inventory',
        event_tag : 'approve block inventory',
        event_link : '/blocked-by-me' ,
        post : foundPost,
        seen : 'no',
        notification_tray : 'no',
        receivers : [foundPost.buyer.toString()]
      }


      Notification.create(newNotification)
      .then(function(createdNotification){
        res.redirect("/" + req.user._id + "/others-interests")
      })
      .catch(function(error){
        console.log(error)
      })


    })
    .catch(function(error){
      console.log(error)
      res.send(error)
    })


  })
  .catch(function(error){
    console.log(error)
    res.send(error)
  })

})


// API DISPLAY blocked_by_me PAGE
router.get('/api/blocked-by-me/:skip', function(req, res){

  Post.find({buyer : req.user, blocked_status : 'true'}).populate('author').populate('seller').sort({time:-1}).skip(Number(req.params.skip)).limit(2).exec()
  .then(function(foundPosts){
    res.json(foundPosts)
  })
  .catch(function(error){
    console.log(error)
    res.send(error)
  })

})

// DISPLAY blocked_by_me PAGE
router.get('/:id/blocked-by-me', function(req, res){

  Post.find({buyer : req.user, blocked_status : 'true'}).populate('author').populate('seller').sort({time:-1}).limit(5).exec()
  .then(function(foundPosts){

    res.render('block/blocked_by_me', {foundPosts:foundPosts})
  })
  .catch(function(error){
    console.log(error)
    res.send(error)
  })

})


// API DISPLAY blocked_by_others PAGE
router.get('/api/blocked-by-others/:skip', function(req, res){

  Post.find({seller : req.user, blocked_status : 'true'}).populate('author').sort({time:-1}).skip(Number(req.params.skip)).limit(2).exec()
  .then(function(foundPosts){
    res.json(foundPosts)
  })
  .catch(function(error){
    console.log(error)
    res.send(error)
  })

})


// DISPLAY blocked_by_others PAGE
router.get('/:id/blocked-by-others', function(req, res){

  Post.find({seller : req.user, blocked_status : 'true'}).populate('author').sort({time:-1}).limit(5).exec()
  .then(function(foundPosts){
    res.render('block/blocked_by_others', {foundPosts:foundPosts})
  })
  .catch(function(error){
    console.log(error)
    res.send(error)
  })

})

module.exports = router
