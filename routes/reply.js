var express = require('express')
var router = express.Router()

var models = require('../models')
var Comment = models['Comment']
var Message = models['Message']
var Post = models['Post']
var Notification = models['Notification']

// DISPLAY ALL REPLIES OF A COMMENT
router.get('/:id/post/:post_id/comment/:comment_id/reply', function(req, res){

  Comment.findOne({_id : req.params.comment_id}).populate('author').populate({path:'replies', populate:{path:'author', model:'User'}})
  .then(function(foundComment){
    Post.findOne({_id: req.params.post_id}).populate('author').exec()
    .then(function(foundPost){

      res.render('reply/replies', {foundComment : foundComment, foundPost : foundPost})


    })
    .catch(function(error){
      res.send(error)
    })

  })
  .catch(function(error){
    console.log(error)
    res.send(error)
  })
})


// LOGIC TO CREATE A REPLY AND APPEND TO COMMENT'S replies
router.post('/:id/post/:post_id/comment/:comment_id/reply', function(req, res){
  // CREATING NEW REPLY (MESSAGE)
  // ASSIGNING author TO CREATED REPLY
  // ASSIGNING CREATED REPLY TO THE COMMENT



  // CREATING NEW REPLY (MESSAGE)

  var newReply = {
    message : req.body['message']
  }

  Message.create(newReply)
  .then(function(createdReply){
    // ASSIGNING author TO CREATED REPLY
    createdReply.author = req.user
    createdReply.save()

    Comment.findOne({_id : req.params.comment_id})
    .then(function(foundComment){
      // ASSIGNING CREATED REPLY TO THE COMMENT
      foundComment.replies.push(createdReply)
      foundComment.save()

      Post.findOne({_id: req.params.post_id}).populate({path:'author', populate:{path:'notifications'}}).exec()
      .then(function(foundPost){

        // NOTIFICATION
        var newNotification = {
          event_owner : req.user,
          event_caption : req.user.name + ' replied on a comment',
          event_tag : 'reply on comment '+ foundComment._id,
          event_link : '/post/' + foundPost._id + '/comment/' + foundComment._id + '/reply',
          post : foundPost,
          seen : 'no',
          notification_tray : 'no',
          receivers : [foundPost.author._id.toString()]
        }

        if(foundPost.author._id.toString() != foundComment.author._id.toString()){
          newNotification.receivers.push(foundComment.author._id.toString())
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
            res.redirect('/'+req.user._id+'/post/'+req.params.post_id+'/comment/'+req.params.comment_id+'/reply')
          })
          .catch(function(error){
            console.log(error)
          })

        } else {


          foundPost.author.notifications[index].event_owner = req.user
          foundPost.author.notifications[index].event_caption = req.user.name + ' replied on a comment'
          foundPost.author.notifications[index].seen = 'no'
          foundPost.author.notifications[index].notification_tray = 'no'
          foundPost.author.notifications[index].time = Date.now()

          foundPost.author.notifications[index].save()

          res.redirect('/'+req.user._id+'/post/'+req.params.post_id+'/comment/'+req.params.comment_id+'/reply')

        }

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

module.exports = router
