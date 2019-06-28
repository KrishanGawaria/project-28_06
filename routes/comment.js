var express = require('express')
var router = express.Router()


var models = require('../models')
var User = models['User']
var Post = models['Post']
var Comment = models['Comment']
var Notification = models['Notification']

// LOGIC TO DISPLAY COMMENTS OF A POST
router.get('/:id/post/:post_id/comment', function(req, res){

  res.redirect('/' + req.user._id + '/post/' + req.params.post_id)

})

// LOGIC TO CREATE A NEW COMMENT
router.post('/:id/post/:post_id/comment', function(req, res){
  // CREATING A COMMENT
  // ASSIGN PRIVATE_TAG TO IT
  // ASSIGNING author TO IT
  // PUSHING THAT COMMENT TO THE POST'S comments
  var newComment = {
    comment : req.body['comment'],
    author : req.user,
    private_tag : req.body['private_tag']=="true" ? true : false
  }

  Comment.create(newComment)
  .then(function(createdComment){


    // PUSHING THIS COMMENT TO THE POST'S comments
    Post.findOne({_id : req.params.post_id}).populate({path:'author', populate:{path:'notifications'}}).exec()
    .then(function(foundPost){
      foundPost.comments.push(createdComment)
      foundPost.save()
      console.log('------------------')

      // NOTIFICATION
      var newNotification = {
        event_owner : req.user,
        event_caption : req.user.name + ' commented on a post',
        event_tag : 'comment on post',
        event_link : '/post/' + foundPost._id + '/comment',
        post : foundPost,
        seen : 'no',
        notification_tray : 'no',
        receivers : [foundPost.author._id.toString()]
      }

      var flag = false
      var index = -1



      foundPost.author.notifications.forEach(function(foundNotification, i){
        if(foundNotification.post){
          if((foundNotification.post.toString() == foundPost._id.toString()) && (foundNotification.event_tag == newNotification.event_tag)){
            flag = true
            index = i
          }
        }

      })

      if(!flag){

        Notification.create(newNotification)
        .then(function(createdNotification){
          foundPost.author.notifications.push(createdNotification)
          foundPost.author.save()
          res.send(createdComment._id)
        })
        .catch(function(error){
          console.log(error)
        })

      } else {



        foundPost.author.notifications[index].event_owner = req.user
        foundPost.author.notifications[index].event_caption = req.user.name + ' commented on a post'
        foundPost.author.notifications[index].seen = 'no'
        foundPost.author.notifications[index].notification_tray = 'no'
        foundPost.author.notifications[index].time = Date.now()

        foundPost.author.notifications[index].save()

        res.send(createdComment._id)

      }



      // res.redirect('/'+req.user._id+'/post/'+req.params.post_id+'/comment')
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

module.exports = router
