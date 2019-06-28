var express = require('express')
var router = express.Router()

var models = require('../models')
var User = models['User']
var Pipe = models['Pipe']
var Notification = models['Notification']



// API EXPLORE USERS
router.post('/api/explore', function(req, res){

  var string = req.body['string']

  // $options : 'i' is for ignore case
  User.find({name : {$regex : ".*"+string+".*", $options : 'i'}, _id : { $nin : [req.user._id, ...req.user.friends, ...req.user.acquaintances] }})
  .then(function(foundUsers){
    res.send(foundUsers)
  })
  .catch(function(error){
    console.log(error)
  })

})


// This route shows all users list except the current user, friends and acquaintances
router.get('/:id/explore', function(req, res){
  // FETCHING ONLY THOSE USERS WHO ARE NEITHER CURRENT USER'S FRIEND NOR ACQUAINTANCE
  var currentUserId = [req.user._id]
  User.find({_id : { $nin : [...currentUserId, ...req.user.friends, ...req.user.acquaintances] }})
  .then(function(foundUsers){
    res.render('explore/explore', {foundUsers: foundUsers})
  })
  .catch(function(error){
    console.log(error)
    res.send(error)
  })
})

// This route shows the home page of a user
router.get('/:id/explore/:user_id', function(req, res){
  // CHECK whoAmIAccordingToHim, AND ACCORDINGLY DISPLAY POSTS TO ME BY CHECKING EACH POST'S show_access


  User.findOne({_id : req.params.user_id}).populate('posts').exec()
  .then(function(foundUser){

    whoAmIAccordingToHim = ''
    User.findOne({_id : req.params.user_id})
    .then(function(exploredUser){
      // CHECKING FRIEND
      var FRIEND = -1
      var ACQUAINTANCE = -1
      var UNCONNECTED = -1

      exploredUser.friends.forEach(function(Friend){
        if(Friend._id.toString() == req.user._id.toString()){
          FRIEND = 1
          whoAmIAccordingToHim = 'friend'
        }
      })
      if(FRIEND == -1){
        exploredUser.acquaintances.forEach(function(Acquaintance){
          if(Acquaintance._id.toString() == req.user._id.toString()){
            ACQUAINTANCE = 1
            whoAmIAccordingToHim = 'acquaintance'
          }
        })
      }
      if(FRIEND == -1 && ACQUAINTANCE == -1){
        UNCONNECTED = 1
        whoAmIAccordingToHim = 'unconnected'
      }


      if(whoAmIAccordingToHim == 'unconnected'){
        Pipe.find({activity_owner : req.params.user_id, show_access : 'unconnected'}).populate('activity_owner').populate({path:'post',populate:{path:'author'}}).sort({time:-1}).limit(5).exec()
        .then(function(foundPipes){
          // console.log(foundPipes)
          res.render('explore/home', {foundUser : foundUser, foundPipes : foundPipes})
        })
        .catch(function(error){
          console.log(error)
          res.send(error)
        })
      } else {
        Pipe.find({activity_owner : req.params.user_id, show_access_ids : req.user._id.toString()}).populate('activity_owner').populate({path:'post',populate:{path:'author'}}).sort({time:-1}).limit(5).exec()
        .then(function(foundPipes){
          // console.log(foundPipes)
          res.render('explore/home', {foundUser : foundUser, foundPipes : foundPipes})
        })
        .catch(function(error){
          console.log(error)
          res.send(error)
        })

      }

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

// This route does: "SEND FRIEND REQUEST"
router.get('/:id/explore/:user_id/send-friend-request', function(req, res){
  // Adding the current user in foundUser's "friend_requests" array
  // Adding foundUser in current user's "sent_friend_requests" array


  User.findOne({_id : req.params.user_id}).populate('notifications').exec()
  .then(function(foundUser){
    // Adding the current user in foundUser's "friend_requests" array
    foundUser.friend_requests.push(req.user)
    foundUser.save()
    // Adding foundUser in current user's "sent_friend_requests" array
    req.user.sent_friend_requests.push(foundUser)
    req.user.save()


    // NOTIFICATION
    var newNotification = {
      event_owner : req.user,
      event_caption : req.user.name + ' sent you friend request',
      event_tag : 'send request',
      event_link : '/explore/' + req.user._id,
      seen : 'no',
      notification_tray : 'no',
      receivers : [foundUser._id.toString()]
    }


    Notification.create(newNotification)
    .then(function(createdNotification){
      foundUser.notifications.push(createdNotification)
      foundUser.save()

      res.redirect('/'+req.user._id+'/explore/'+foundUser._id)
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


// THIS ROUTE DOES : SEND ACQUAINTANCE REQUEST
router.get('/:id/explore/:user_id/send-acquaintance-request', function(req, res){
  // Adding the current user in foundUser's "acquaintance_requests" array
  // Adding foundUser in current user's "sent_acquaintance_requests" array


  User.findOne({_id : req.params.user_id}).populate('notifications').exec()
  .then(function(foundUser){
    // Adding the current user in foundUser's "acquaintance_requests" array
    foundUser.acquaintance_requests.push(req.user)
    foundUser.save()
    // Adding foundUser in current user's "sent_acquaintance_requests" array
    req.user.sent_acquaintance_requests.push(foundUser)
    req.user.save()


    // NOTIFICATION
    var newNotification = {
      event_owner : req.user,
      event_caption : req.user.name + ' sent you friend request',
      event_tag : 'send request',
      event_link : '/explore/' + req.user._id,
      seen : 'no',
      notification_tray : 'no',
      receivers : [foundUser._id.toString()]
    }


    Notification.create(newNotification)
    .then(function(createdNotification){
      foundUser.notifications.push(createdNotification)
      foundUser.save()

      res.redirect('/'+req.user._id+'/explore/'+foundUser._id)
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



// This route does: "CANCEL FRIEND REQUEST"
router.get('/:id/explore/:user_id/cancel-friend-request', function(req, res){
  // CHECKING IF EXPLORED USER IS IN CURRENT USER'S sent_friend_requests ARRAY
  // REMOVING THE EXPLORED USER FROM CURRENT USER'S sent_friend_requests ARRAY
  // CHECKING IF THE CURRENT USER IS IN EXPLORED USER'S FRIEND REQUESTS ARRAY
  // REMOVING CURRENT USER FROM EXPLORED USER'S FRIEND REQUESTS ARRAY


  // CHECKING IF EXPLORED USER IS IN CURRENT USER'S sent_friend_requests ARRAY
  var index = -1
  req.user.sent_friend_requests.forEach(function(friendId, i){
    if(friendId.toString() == req.params.user_id.toString()){
      index = i
    }
  })
  // REMOVING THE EXPLORED USER FROM CURRENT USER'S sent_friend_requests ARRAY
  if(index != -1){
    req.user.sent_friend_requests.splice(index, 1)
  }

  req.user.save()


  // CHECKING IF THE CURRENT USER IS IN EXPLORED USER'S FRIEND REQUESTS ARRAY
  User.findOne({_id : req.params.user_id})
  .then(function(foundUser){
    index = -1
    foundUser.friend_requests.forEach(function(friendId, i){
      if(friendId.toString() == req.user._id.toString()){
        index = i
      }
    })
    // REMOVING CURRENT USER FROM EXPLORED USER'S FRIEND REQUESTS ARRAY
    if(index != -1){
      foundUser.friend_requests.splice(index, 1)
    }

    foundUser.save()
    res.redirect('/'+req.user._id+'/explore/'+req.params.user_id)
  })
  .catch(function(error){
    console.log(error)
    res.send(error)
  })

})


// THIS ROUTES DOES : CANCEL ACQUAINTANCE REQUEST
router.get('/:id/explore/:user_id/cancel-acquaintance-request', function(req, res){
  // CHECKING IF EXPLORED USER IS IN CURRENT USER'S sent_acquaintance_requests
  // REMOVING THE EXPLORED USER FROM CURRENT USER'S SENT ACQUAINTANCE REQUESTS ARRAY
  // CHECKING IF THE CURRENT USER IS IN EXPLORED USER'S ACQUAINTANCE REQUESTS ARRAY
  // REMOVING CURRENT USER FROM EXPLORED USER'S ACQUAINTANCE REQUESTS ARRAY


  // CHECKING IF EXPLORED USER IS IN CURRENT USER'S sent_acquaintance_requests
  req.user.sent_acquaintance_requests.forEach(function(AcquaintanceId, i){
    if(AcquaintanceId.toString() == req.params.user_id.toString()){
      index = i
    }
  })

  // REMOVING THE EXPLORED USER FROM CURRENT USER'S SENT ACQUAINTANCE REQUESTS ARRAY
  if(index != -1){
    req.user.sent_acquaintance_requests.splice(index, 1)
  }

  req.user.save()


  // CHECKING IF THE CURRENT USER IS IN EXPLORED USER'S ACQUAINTANCE REQUESTS ARRAY
  User.findOne({_id : req.params.user_id})
  .then(function(foundUser){
    foundUser.acquaintance_requests.forEach(function(acquaintanceId, i){
      if(acquaintanceId.toString() == req.user._id.toString()){
        index = i
      }
    })
    // REMOVING CURRENT USER FROM EXPLORED USER'S ACQUAINTANCE REQUESTS ARRAY
    if(index != -1){
      foundUser.acquaintance_requests.splice(index, 1)
    }

    foundUser.save()
    res.redirect('/'+req.user._id+'/explore/'+req.params.user_id)
  })
  .catch(function(error){
    res.send(error)
  })


})




// THIS ROUTE DOES : CONFIRM REQUEST AS A 'FRIEND' OR 'ACQUAINTANCE'
router.get('/:id/explore/:user_id/confirm-request/:role', function(req, res){
  // ADDING EXPLORED USER INTO CURRENT USER'S "friends/acquaintances" ARRAY base on req.params.role
  // ADDING THE CURRENT USER INTO EXPLORED USERS FRIENDS ARRAY IF CURRENT USER HAS GOT FRIEND REQUEST
  // ADDING THE CURRENT USER INTO EXPLORED USERS Acquaintances ARRAY IF CURRENT USER HAS GOT Acquaintance REQUEST
  // REMOVING THE EXPLORED USER FROM CURRENT USER'S "friend_requests" ARRAY
  // REMOVING THE EXPLORED USER FROM CURRENT USER'S "acquaintance_requests" ARRAY
  // REMOVING THE CURRENT USER FROM EXPLORED USER'S "sent_friend_requests" ARRAY
  // REMOVING THE CURRENT USER FROM EXPLORED USER'S "sent_acquaintance_requests" ARRAY

  // ADDING EXPLORED USER INTO CURRENT USER'S "friends" ARRAY
  User.findOne({_id : req.params.user_id})
  .then(function(foundUser){

    if(req.params.role == "friend"){
      req.user.friends.push(foundUser)

      Pipe.find({activity_owner:req.user, show_access:'friend'})
      .then(function(foundPipes){
        foundPipes.forEach(function(foundPipe){
          foundPipe.show_access_ids.push(foundUser._id.toString())
          foundPipe.save()
        })
      })
      .catch(function(error){
        console.log(error)
      })

    } else {
      req.user.acquaintances.push(foundUser)

      Pipe.find({activity_owner:req.user, show_access:'acquaintance'})
      .then(function(foundPipes){
        foundPipes.forEach(function(foundPipe){
          foundPipe.show_access_ids.push(foundUser._id.toString())
          foundPipe.save()
        })
      })
      .catch(function(error){
        console.log(error)
      })
    }

    // ADDING THE CURRENT USER INTO EXPLORED USERS FRIENDS ARRAY IF CURRENT USER HAS GOT FRIEND REQUEST
    var index = -1
    req.user.friend_requests.forEach(function(Friend_Request, i){
      if(Friend_Request._id.toString() == foundUser._id.toString()){
        index = i
      }
    })

    if(index != -1){
      foundUser.friends.push(req.user)

      Pipe.find({activity_owner:foundUser, show_access:"friend"})
      .then(function(foundPipes){
        foundPipes.forEach(function(foundPipe){
          foundPipe.show_access_ids.push(req.user._id.toString())
          foundPipe.save()
        })
      })
      .catch(function(error){
        console.log(error)
      })

    } else {
      // ADDING THE CURRENT USER INTO EXPLORED USERS Acquaintances ARRAY IF CURRENT USER HAS GOT Acquaintance REQUEST
      req.user.acquaintance_requests.forEach(function(Acquaintance_Request, i){
        if(Acquaintance_Request._id.toString() == foundUser._id.toString()){
          index = i
        }
      })

      if(index != -1){
        foundUser.acquaintances.push(req.user)

        Pipe.find({activity_owner:foundUser, show_access:"friend"})
        .then(function(foundPipes){
          foundPipes.forEach(function(foundPipe){
            foundPipe.show_access_ids.push(req.user._id.toString())
            foundPipe.save()
          })
        })
        .catch(function(error){
          console.log(error)
        })
      }
    }

    // REMOVING THE EXPLORED USER FROM CURRENT USER'S "friend_requests" ARRAY
    var index = -1
    req.user.friend_requests.forEach(function(friendId, i){
      if(friendId.toString() == req.params.user_id.toString()){
        index = i
      }
    })

    if(index != -1){
      req.user.friend_requests.splice(index, 1)
    } else {

      // REMOVING THE EXPLORED USER FROM CURRENT USER'S "acquaintance_requests" ARRAY
      var index = -1
      req.user.acquaintance_requests.forEach(function(acquaintanceId, i){
        if(acquaintanceId.toString() == req.params.user_id.toString()){
          index = i
        }
      })

      if(index != -1){
        req.user.acquaintance_requests.splice(index, 1)
      }
    }

    req.user.save()

    // REMOVING THE CURRENT USER FROM EXPLORED USER'S "sent_friend_requests" ARRAY
    index = -1
    foundUser.sent_friend_requests.forEach(function(friendId, i){
      if(friendId.toString() == req.user._id.toString()){
        index = i
      }
    })

    if(index != -1){
      foundUser.sent_friend_requests.splice(index, 1)
    } else {

      // REMOVING THE CURRENT USER FROM EXPLORED USER'S "sent_acquaintance_requests" ARRAY
      index = -1
      foundUser.sent_acquaintance_requests.forEach(function(acquaintanceId, i){
        if(acquaintanceId.toString() == req.user._id.toString()){
          index = i
        }
      })

      if(index != -1){
        foundUser.sent_acquaintance_requests.splice(index, 1)
      }
    }




    foundUser.save()


    // NOTIFICATION
    var newNotification = {
      event_owner : req.user,
      event_caption : req.user.name + ' confirmed your friend request',
      event_tag : 'confirm request',
      event_link : '/explore/' + req.user._id,
      seen : 'no',
      notification_tray : 'no',
      receivers : [foundUser._id.toString()]
    }


    Notification.create(newNotification)
    .then(function(createdNotification){
      foundUser.notifications.push(createdNotification)
      foundUser.save()

      res.redirect('/'+req.user._id+'/explore/'+foundUser._id)
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



// THIS ROUTES DOES: REMOVE FRIEND
router.get('/:id/explore/:user_id/remove-friend', function(req, res){
  // REMOVING THE EXPLORED FRIEND FROM CURRENT USER'S "friends" ARRAY
  // REMOVING THE EXPLORED FRIEND FROM CURRENT USER'S "acquaintances" ARRAY
  // REMOVING CURRENT USER FROM EXPLORED USER'S "friends" ARRAY
  // REMOVING CURRENT USER FROM EXPLORED USER'S "acquaintances" ARRAY



  // REMOVING THE EXPLORED FRIEND FROM CURRENT USER'S "friends" ARRAY



  var index = -1
  req.user.friends.forEach(function(friendId, i){
    if(friendId.toString() == req.params.user_id.toString()){
      index = i
    }
  })
  if(index!=-1){
    req.user.friends.splice(index, 1)
  } else {
    // REMOVING THE EXPLORED FRIEND FROM CURRENT USER'S "acquaintances" ARRAY
    index = -1
    req.user.acquaintances.forEach(function(acquaintanceId, i){
      if(acquaintanceId.toString() == req.params.user_id.toString()){
        index = i
      }
    })

    if(index!=-1){
      req.user.acquaintances.splice(index, 1)
    }
  }


  req.user.save()



  // REMOVING CURRENT USER FROM EXPLORED USER'S "friends" ARRAY
  index = -1
  User.findOne({_id : req.params.user_id})
  .then(function(foundUser){
    foundUser.friends.forEach(function(friendId, i){
      if(friendId.toString() == req.user._id.toString()){
        index = i
      }
    })

    if(index!=-1){
      foundUser.friends.splice(index, 1)
    } else {
      // REMOVING CURRENT USER FROM EXPLORED USER'S "acquaintances" ARRAY
      index = -1
      foundUser.acquaintances.forEach(function(acquaintanceId, i){
        if(acquaintanceId.toString() == req.user._id.toString()){
          index = i
        }
      })

      if(index != -1){
        foundUser.acquaintances.splice(index, 1)
      }
    }


    Pipe.find({activity_owner:req.user})
    .then(function(foundPipes){
      foundPipes.forEach(function(foundPipe){
        var index = foundPipe.show_access_ids.indexOf(foundUser._id.toString())
        if(index!=-1){
          foundPipe.show_access_ids.splice(index, 1)
          foundPipe.save()
        }
      })
    })
    .catch(function(error){
      console.log(error)
    })

    Pipe.find({activity_owner:foundUser})
    .then(function(foundPipes){
      foundPipes.forEach(function(foundPipe){
        var index = foundPipe.show_access_ids.indexOf(req.user._id.toString())
        if(index!=-1){
          foundPipe.show_access_ids.splice(index, 1)
          foundPipe.save()
        }
      })
    })
    .catch(function(error){
      console.log(error)
    })



    foundUser.save()

    res.send("Friend Removed")
  })
  .catch(function(error){
    console.log(error)
    res.send(error)
  })

})

module.exports = router
