var express = require('express')
var router = express.Router()

var models = require('../models')
var User = models["User"]
var Group = models["Group"]
var Post = models["Post"]
var Message = models["Message"]
var Pipe = models["Pipe"]
var Notification = models["Notification"]

var multer = require("multer")
var path = require("path")
var fs = require("fs")

// var sharp = require("sharp")
var compress_images = require('compress-images')

var FILES = []
var MIME_TYPES = []

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/uploads');
  },
  filename: function (req, file, callback) {

    FILES.push(file.fieldname+"-"+Date.now()+path.extname(file.originalname))
    callback(null, file.fieldname+"-"+Date.now()+path.extname(file.originalname));
  }
});

var upload = multer({
    storage : storage ,
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }

}).array('userPhoto',20);

function checkFileType(file, cb){
    var filetypes= /jpeg|JPEG|jpg|JPG|png|PNG|gif|GIF/;
    var extname= filetypes.test(path.extname(file.originalname));
    var mimetype= filetypes.test(file.mimetype);

    // console.log("Mime Type: "+file.mimetype.toString())
    MIME_TYPES.push(file.mimetype.toString())

    if(mimetype && extname){
        return cb(null, true);
    } else{
        cb("Error: Images Only")
    }
}




// Lists all Groups of Current User
router.get('/:id/my-groups', function(req, res){
  User.findOne({_id : req.params.id}).populate('groups').exec()
  .then(function(foundUser){
    res.render('group/groups', {foundUser:foundUser})
  })
  .catch(function(error){
    console.log(error)
    res.send(error)
  })
})




// LOGIC TO CREATE POST IN GROUP
router.post('/:id/my-groups/:group_id/post', function(req, res){

  FILES = []
  MIME_TYPES = []
  upload(req,res,function(err) {
    if(err) {
      console.log(err)
      return res.end("Error uploading file.");
    }

    var newPost = {
      post : req.body["post"],
      // quantity : Number(req.body["quantity"]),
      // price : Number(req.body['price']),
      type_of_post : 'casual',
      author : req.user,
      images : []
    }


    FILES.forEach(function(FILE_NAME, i){
      // 'src/img/**/*.{jpg,JPG,jpeg,JPEG,png,svg,gif}'
      // var INPUT_path_to_your_images = __dirname.replace('\\routes', '')+"\\public\\uploads\\*.{jpg,JPG,jpeg,JPEG,gif,png,svg}"
      var INPUT_path_to_your_images = __dirname.replace('/routes', '')+"/public/uploads/" + FILE_NAME
      INPUT_path_to_your_images = INPUT_path_to_your_images.replace(/\\/g, '/');
      console.log('input')
      console.log(INPUT_path_to_your_images)
      var OUTPUT_path = __dirname.replace('/routes', '')+"/public/optimized/"
      OUTPUT_path = OUTPUT_path.replace(/\\/g, '/');

      console.log(OUTPUT_path)

      compress_images(INPUT_path_to_your_images, OUTPUT_path, {compress_force: false, statistic: true, autoupdate: true}, false,
                                                  {jpg: {engine: 'mozjpeg', command: ['-quality', '60']}},
                                                  {png: {engine: 'pngquant', command: ['--quality=20-50']}},
                                                  {svg: {engine: 'svgo', command: '--multipass'}},
                                                  {gif: {engine: 'gifsicle', command: ['--colors', '64', '--use-col=web']}}, function(){

                                                  process()


      });

    })


    function process(){

      FILES.forEach(function(FILE_NAME, i){
        var image = {}
        image["data"] = fs.readFileSync(__dirname.replace('/routes', '')+"/public/uploads/"+FILE_NAME)
        image["contentType"] = MIME_TYPES[i]
        image["base64"] = new Buffer(image["data"], 'binary').toString('base64')
        newPost["images"].push(image)
      })

      // CREATING POST
      Post.create(newPost)
      .then(function(createdPost){
        // PUSHING THE CREATED POST INTO CURRENT GROUP
        Group.findOne({_id : req.params.group_id})
        .then(function(foundGroup){
          foundGroup.posts.push(createdPost)
          foundGroup.save()

          // ASSIGNING GROUP_ID TO THE CREATED POST
          createdPost['group_id'] = req.params.group_id
          createdPost.save()

          // CREATING A NEW PIPE WITH CREATED POST INCLUDED INTO IT
          var newPipe = {
            group_ids : [req.params.group_id],
            activity_owner : req.user,
            activity_caption : '',
            time : Date.now(),
            post : createdPost
          }

          Pipe.create(newPipe)
          .then(function(createdPipe){
            res.redirect('/' + req.user._id + '/my-groups/' + req.params.group_id)
          })
          .catch(function(error){
            console.log(error)
          })


        })
        .catch(function(error){
          res.send(error)
        })
      })
      .catch(function(error){
        res.send(error)
      })


    }

    if(FILES.length == 0){
      process()
    }

    

    

  })

})


// Logic to create new group
router.post('/:id/my-groups', function(req, res){
  // CREATING A NEW GROUP
  // ADDING THE CREATED GROUP INTO CURRENT USER'S "groups" array
  // ADDING THE CURRENT USER INTO CREATED GROUP'S "members" ARRAY

  var newGroup = {
    name : req.body['name'],
    owner : req.user
  }
  // CREATING A NEW GROUP
  Group.create(newGroup)
  .then(function(createdGroup){
    // ADDING THE CREATED GROUP INTO CURRENT USER'S "groups" array
    req.user.groups.push(createdGroup)
    req.user.save()

    // ADDING THE CURRENT USER INTO CREATED GROUP'S "members" ARRAY
    createdGroup.members.push(req.user)
    createdGroup.save()

    res.redirect('/' + req.user._id + '/my-groups')
  })
  .catch(function(error){
    console.log(error)
    res.send(error)
  })

})

// Logic to Delete existing group
router.get('/:id/my-groups/:group_id/delete', function(req, res){
  // DELETING THE GROUP FROM "groups" ARRAY OF ALL MEMBERS OF GROUP
  // DELETING THE GROUP


  // DELETING THE GROUP FROM "groups" ARRAY OF ALL MEMBERS OF GROUP
  Group.findOne({_id : req.params.group_id}).populate('members').exec()
  .then(function(foundGroup){
    foundGroup.members.forEach(function(Member){

      var index = -1
      Member.groups.forEach(function(groupId, i){
        if(groupId.toString() == foundGroup._id.toString){
          index = i
        }
      })

      if(index != -1){
        Member.groups.splice(index, 1)
        Member.save()
      }


    })

    var receiversStringArray = foundGroup.members.map(function(member){return member._id.toString()})

    // DELETING THE GROUP
    Group.deleteOne({_id : req.params.group_id})
    .then(function(){


      // NOTIFICATION
      var newNotification = {
        event_owner : req.user,
        event_caption : req.user.name + ' deleted the group: ' + foundGroup.name,
        event_tag : 'delete group',
        event_link : '/my-groups' ,
        seen : 'no',
        notification_tray : 'no',
        receivers : [...receiversStringArray]
      }


      Notification.create(newNotification)
      .then(function(createdNotification){
        res.redirect('/' + req.user._id + '/my-groups')
      })
      .catch(function(error){
        console.log(error)
      })
    })

    .catch(function(error){
      console.log("Error Deleting Group")
      res.send(error)
    })
  })
  .catch(function(error){
    console.log(error)
    res.send(error)
  })

})


// API FOR GROUP HOME PAGE
router.get('/my-groups/:group_id/:skip', function(req, res){

  Pipe.find({group_ids : req.params.group_id}).populate({path:'post', populate:{path:'author'}}).sort({time:-1}).skip(Number(req.params.skip)).limit(2).exec()
  .then(function(foundPipes){
    res.json(foundPipes)
  })
  .catch(function(error){
    console.log(error)
  })
})

// THIS ROUTE SHOW THE HOME PAGE OF GROUP
router.get('/:id/my-groups/:group_id', function(req, res){

  Group.findOne({_id : req.params.group_id}).populate('members').exec()
  .then(function(foundGroup){
    Pipe.find({group_ids : req.params.group_id}).populate({path:'post', populate:{path:'author'}}).sort({time:-1}).limit(5).exec()
    .then(function(foundPipes){
      res.render('group/home', {foundGroup : foundGroup, foundPipes:foundPipes})
    })
    .catch(function(error){
      console.log(error)
    })
  })
  .catch(function(error){
    console.log(error)
  })

})



// THIS ROUTE SHOWS THE MESSAGES OF GROUP
router.get('/:id/my-groups/:group_id/messages/:page_number', function(req, res){
  Group.findOne({_id : req.params.group_id}).populate('members').exec()
  .then(function(foundGroup){

    // CREATING options OBJECT WHICH WILL BE PASSED IN paginate()
    var options = {
      populate:[{path:'author',populate:{path:'friends'}}],
      limit: 20,  // MAXIMUM 20 DOCUMENTS (MESSAGES IN THIS CASE) IN EACH PAGE
      page : Number(req.params.page_number), // SPECIFYING PAGE NUMBER
      sort : {time : -1}
    }

    // FINDING THOSE MESSAGES WHICH HAVE group_id AS req.params.group_id
    Message.paginate({group_id:req.params.group_id.toString()}, options)
    .then(function(MessagesObj){

      // SINCE MessagesObj.docs WILL HAVE DOCUMENTS IN DESCENDING ORDER OF TIME, WE
      // ARE REVERSING THIS TO DISPLAY IT AS CHAT
      MessagesObj.docs = MessagesObj.docs.reverse()

      res.render('group/messages', {foundGroup : foundGroup, MessagesObj:MessagesObj})
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

// THIS ROUTE DISPLAYS MEMBERS OF THE GROUP
router.get('/:id/my-groups/:group_id/members', function(req, res){
  Group.findOne({_id : req.params.group_id}).populate('members').exec()
  .then(function(foundGroup){
    res.render('group/members', {foundGroup : foundGroup})
  })
  .catch(function(error){
    console.log(error)
    res.send(error)
  })
})

// THIS ROUTE DISPLAYS THE 'ADD/REMOVE MEMBERS' PAGE
router.get('/:id/my-groups/:group_id/add-remove-members', function(req, res){
  // POPULATING "members" OF GROUP
  Group.findOne({_id : req.params.group_id}).populate('members').exec()
  .then(function(foundGroup){
    // POPULATING "friends" AND "acquaintances" OF USER
    User.findOne({_id : req.user._id}).populate('friends').populate('acquaintances').exec()
    .then(function(foundUser){
        res.render('group/add_remove_members', {foundGroup : foundGroup, foundUser : foundUser})
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


// Logic to add member into the group
router.get('/:id/my-groups/:group_id/add-member/:member_id', function(req, res){
  // ADDING THE USER INTO THE GROUP'S "members" ARRAY
  // ADDING THE GROUP INTO THE USER'S "groups" ARRAY
    Group.findOne({_id : req.params.group_id})
    .then(function(foundGroup){
      User.findOne({_id : req.params.member_id})
      .then(function(foundUser){
        // ADDING THE USER INTO THE GROUP'S "members" ARRAY
        foundGroup.members.push(foundUser)
        foundGroup.save()

        // ADDING THE GROUP INTO THE USER'S "groups" ARRAY
        foundUser.groups.push(foundGroup)
        foundUser.save()

        // NOTIFICATION
        var newNotification = {
          event_owner : req.user,
          event_caption : req.user.name + ' added you into the group: ' + foundGroup.name,
          event_tag : 'add member into group',
          event_link : '/my-groups' ,
          seen : 'no',
          notification_tray : 'no',
          receivers : [req.params.member_id]
        }


        Notification.create(newNotification)
        .then(function(createdNotification){
        res.redirect('/' + req.user._id + '/my-groups/' + req.params.group_id + '/add-remove-members')
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

// Logic to remove member from the group
router.get('/:id/my-groups/:group_id/remove-member/:member_id', function(req, res){
  // REMOVING THE USER FROM THE GROUP'S "members" ARRAY
  // REMOVING THE GROUP FROM THE USER'S "groups" ARRAY

    Group.findOne({_id : req.params.group_id})
    .then(function(foundGroup){
      User.findOne({_id : req.params.member_id})
      .then(function(foundUser){
        // REMOVING THE USER FROM THE GROUP'S "members" ARRAY
        var index = -1
        foundGroup.members.forEach(function(memberId, i){
          if(memberId.toString() == req.params.member_id.toString()){
            index = i
          }
        })

        if(index != -1){
          foundGroup.members.splice(index, 1)
        }
        foundGroup.save()

        // REMOVING THE GROUP FROM THE USER'S "groups" ARRAY
        index = -1
        req.user.groups.forEach(function(groupId, i){
          if(groupId.toString() == req.params.group_id.toString()){
            index = i
          }
        })

        if(index != -1){
          foundUser.groups.splice(index, 1)
        }
        foundUser.save()

        res.redirect('/' + req.user._id + '/my-groups/' + req.params.group_id + '/add-remove-members')
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

// DISPLAY GROUP RENAME PAGE
router.get('/:id/my-groups/:group_id/rename', function(req, res){
  Group.findOne({_id : req.params.group_id})
  .then(function(foundGroup){
    res.render("group/rename.ejs", {foundGroup : foundGroup})
  })
  .catch(function(error){
    console.log(error)
  })
})

// LOGIC TO RENAME GROUP
router.post('/:id/my-groups/:group_id/rename', function(req, res){

  Group.updateOne({_id : req.params.group_id}, {name : req.body['name']})
  .then(function(updatedGroup){

    Group.findOne({_id : req.params.group_id})
    .then(function(foundGroup){

      var receiversStringArray = foundGroup.members.map(function(member){return member.toString()})
      // NOTIFICATION
      var newNotification = {
        event_owner : req.user,
        event_caption : req.user.name + ' renamed a group into: ' + foundGroup.name,
        event_tag : 'rename group',
        event_link : '/my-groups' ,
        seen : 'no',
        notification_tray : 'no',
        receivers : [...receiversStringArray]
      }


      Notification.create(newNotification)
      .then(function(createdNotification){
        res.redirect('/' + req.user._id + '/my-groups/' + req.params.group_id)
      })
      .catch(function(error){
        console.log(error)
      })
    })
    .catch(function(error){
      console.log(error)
    })




  })
  .catch(function(error){
    console.log(error)
  })

})


// LOGIC TO DELETE POST IN THE GROUP
router.get('/:id/my-groups/:group_id/post/:post_id/delete', function(req, res){

  Pipe.deleteOne({post : req.params.post_id})
  .then(function(){
    res.redirect('/' + req.user._id + '/my-groups/' + req.params.group_id)
  })
  .catch(function(error){
    console.log(error)
  })

})


module.exports = router
