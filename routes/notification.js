var express = require('express')
var router = express.Router()

var models = require('../models')
var User = models["User"]
var Notification = models["Notification"]



router.get('/api/notification-number', function(req, res){
  Notification.find({receivers : req.user._id.toString(), notification_tray : 'no'})
  .then(function(foundNotifications){
    var send = {
      number_of_notifications : foundNotifications.length
    }

    res.json(send)
  })
  .catch(function(error){
    console.log(error)
  })
})


// DISPLAY NOTIFICATION PAGE
router.get('/:id/notification', function(req, res){

  // User.findOne({_id : req.user._id}).populate({path:'notifications',populate:{path:'event_owner'}}).populate({path:'notifications', populate:{path:'post', populate:{path:'author'}}}).exec()
  Notification.find({receivers : req.user._id.toString()}).sort({time:-1}).exec()
  .then(function(foundNotifications){
    foundNotifications.forEach(function(foundNotification){
      foundNotification.notification_tray = 'yes'
      foundNotification.save()
    })
    res.render("notification/notifications", {Notifications : foundNotifications})
  })
  .catch(function(error){
    console.log(error)
  })

})

module.exports = router
