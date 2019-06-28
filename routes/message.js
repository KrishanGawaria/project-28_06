var express = require('express')
var router = express.Router()

var models = require('../models')
var User = models['User']
var Group = models['Group']
var Message = models['Message']
var Notification = models['Notification']


// CREATING MESSAGE AND ADDING IT TO GROUP
router.post('/:id/my-groups/:group_id/message', function(req, res){
  // CREATE newMessage
  // ASSIGNING createdMessage AN "author"
  // ADDING createdMessage INTO GROUPS'S "messages" ARRAY

  var newMessage = {
    message : req.body['message'],
    group_id : req.params.group_id.toString()
  }


  Message.create(newMessage)
  .then(function(createdMessage){
    // ASSIGNING createdMessage AN "author"
    createdMessage.author = req.user
    createdMessage.save()

    // ADDING createdMessage INTO GROUPS'S "messages" ARRAY
    Group.findOne({_id : req.params.group_id}).populate({path:'members', populate:{path:'notifications'}}).exec()
    .then(function(foundGroup){
      foundGroup.messages.push(createdMessage)
      foundGroup.save()



      // NOTIFICATION
      var newNotification = {
        event_owner : req.user,
        event_caption : req.user.name + ' messaged in the group: '+foundGroup.name,
        event_tag : 'message in group '+foundGroup._id,
        event_link : '/my-groups/' + foundGroup._id + '/messages/1',
        seen : 'no',
        notification_tray : 'no'
      }



      foundGroup.members.forEach(function(Member){

        var flag = false
        var index = -1


        Member.notifications.forEach(function(foundNotification, i){

          if(foundNotification.event_tag == newNotification.event_tag){
            flag = true
            index = i
          }

        })


        if(!flag){

          newNotification['receivers'] = [Member._id.toString()]

          Notification.create(newNotification)
          .then(function(createdNotification){
            Member.notifications.push(createdNotification)
            Member.save()
          })
          .catch(function(error){
            console.log(error)
          })

        } else {


          Member.notifications[index].event_owner = req.user
          Member.notifications[index].event_caption = req.user.name + ' messaged in the group: '+foundGroup.name
          Member.notifications[index].seen = 'no'
          Member.notifications[index].notification_tray = 'no'
          Member.notifications[index].time = Date.now()

          Member.notifications[index].save()

        }


      })






      res.send("Message Created Successfully")
      // res.redirect('/' + req.user._id + '/my-groups/' + req.params.group_id + '/messages/1')
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
