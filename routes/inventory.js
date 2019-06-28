var express = require('express')
var router = express.Router()

var multer = require("multer")
var path = require("path")
var fs = require("fs")

var models = require('../models')
var User = models['User']
var Post = models['Post']
var Group = models['Group']
var Category = models['Category']
var Pipe = models['Pipe']
var Notification = models['Notification']

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



var loadedPipes = []
// API VIEW INVENTORY
router.get('/api/inventory/:skip', function(req, res){

  var skip = Number(req.params.skip)

  // if(loadedPipes.length !=0) {
  //   var foundInventories = loadedPipes.slice(skip, skip + 1)
  //   res.json(foundInventories)
  // } else {
  //
  // }

  Post.find({author:req.user, type_of_post:"inventory", inventory_tag:"created"}).populate('author').exec()
  .then(function(foundInventories){

    foundInventories = foundInventories.sort(function(a, b){ return b.time - a.time })
    loadedPipes = [...foundInventories]
    foundInventories = loadedPipes.slice(skip, skip + 1)
    res.json(foundInventories)
  })
  .catch(function(error){
    console.log(error)
  })



})



// VIEW INVENTORY
router.get('/:id/inventory', function(req, res){

  res.render('inventory/inventories')

})


// DISPLAY CREATE INVENTORY PAGE
router.get('/:id/inventory/new', function(req, res){
    res.render('inventory/create.ejs')
})



// LOGIC TO CREATE INVENTORY
router.post('/:id/inventory', function(req, res){
  // CREATING NEW INVENTORY
  //ASSIGNING AUTHOR TO INVENTORY
  // PUSHING createdPost INTO CURRENT USER'S inventory ARRAY


  FILES = []
  MIME_TYPES = []
  upload(req,res,function(err) {
    // console.log(req.body);
    //console.log(req.files);
    if(err) {
      console.log(err)
      return res.end("Error uploading file.");
    }


    // CREATING NEW INVENTORY
    var newInventory = {
      post : req.body['inventory'],
      quantity : Number(req.body['quantity']),
      price : Number(req.body['price']),
      type_of_post : 'inventory',
      inventory_tag : 'created',
      images : []
    }


    FILES.forEach(function(FILE_NAME, i){
      // 'src/img/**/*.{jpg,JPG,jpeg,JPEG,png,svg,gif}'
      // var INPUT_path_to_your_images = __dirname.replace('/routes', '')+"/public/uploads/*.{jpg,JPG,jpeg,JPEG,gif,png,svg}"
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
        newInventory["images"].push(image)
      })

      Post.create(newInventory)
      .then(function(createdPost){

        //ASSIGNING AUTHOR TO INVENTORY
        createdPost.author = req.user
        createdPost.save()

        // PUSHING createdPost INTO CURRENT USER'S inventory ARRAY
        req.user.inventories.push(createdPost)
        req.user.save()


        res.redirect('/' + req.user._id + '/inventory')
      })
      .catch(function(error){
        console.log(error)
        res.send(error)
      })



    }


    if(FILES.length == 0){
      process()
    }




  })
})



// DISPLAY AN IMAGE ON CLICK
router.get('/:id/inventory/:inventory_id/image/:index', function(req, res){
  Post.findOne({_id : req.params.inventory_id})
  .then(function(foundPost){

    res.contentType(foundPost.images[Number(req.params.index)]["contentType"])
    res.send(foundPost.images[Number(req.params.index)]["data"]['buffer'])
  })
  .catch(function(error){
    console.log(error)
    res.send(error)
  })
})







// DELETE INVENTORY


// DISPLAY SHARE INVENTORY PAGE
router.get('/:id/inventory/:inventory_id/share', function(req, res){
  // POPULATING FRIENDS AND GROUPS OF CURRENT USER
  // FINDING THE INVENTORY TO SHARE

  // POPULATING FRIENDS AND GROUPS OF CURRENT USER
  User.findOne({_id : req.user._id}).populate('friends').populate('groups').exec()
  .then(function(foundUser){
    // FINDING THE INVENTORY TO SHARE
    Post.findOne({_id : req.params.inventory_id})
    .then(function(foundPost){
      Category.find()
      .then(function(foundCategories){
        res.render('inventory/share', {foundUser: foundUser, foundInventory: foundPost, foundCategories: foundCategories})
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
  .catch(function(error){
    console.log(error)
    res.send(error)
  })

})

// LOGIC TO SHARE INVENTORY
router.post('/:id/inventory/:inventory_id/share', function(req, res){
  // ONLY THE OWNER OF INVENTORY CAN HIT THIS ROUTE TO SHARE HIS INVENTORY.
  // OTHER USERS WILL SHARE THE SHARED_INVENTORIES AS A POST

  // CREATING NEW POST WITH NEW PRICE AND NEW QUANTITY
  // PUSHING newPost TO CURRENT USER'S shared_inventories_by_me ARRAY
  // PUSHING newPost TO foundPost'S children_posts ARRAY
  // PUSHING foundPost TO newPost'S parent_post
  // PUSHING newPost TO SELECTED FRIENDS'S shared_inventories
  // PUSHING newPost TO SELECTED GROUPS'S posts
  // PUSHING newPost TO CURRENT USER'S posts ARRAY IF HE SELECTED TO SHARE AS A POST ALSO
  // ASSIGNING show_access TO newPost IF CURRENT USER SELECTED TO SHARE AS A POST


  Post.findOne({_id : req.params.inventory_id})
  .then(function(foundInventory){


    // CREATING NEW POST WITH NEW PRICE AND NEW QUANTITY
    var newPost = {
      post : req.body['inventory'],
      quantity : req.body['quantity'],
      price : Number(req.body['price']),
      type_of_post : foundInventory['type_of_post'],
      inventory_tag : 'shared',
      images : foundInventory['images'],
      author : req.user
    }

    Post.create(newPost)
    .then(function(newPost){

      // PUSHING newPost TO CURRENT USER'S shared_inventories_by_me ARRAY
      req.user.shared_inventories_by_me.push(newPost)
      // req.user.save()

      // PUSHING newPost TO foundPost'S children_posts ARRAY
      foundInventory.children_posts.push(newPost)
      foundInventory.save()

      // PUSHING foundPost TO newPost'S parent_post
      newPost.parent_post = foundInventory
      // newPost.save()

      // req.body will be in format:
      // {"Friend-5c90c2db3c463e7e7075953c" : "rishabh", "Group-5c90c2db3c463e7e7075953c" : "our-group" }

      // PUSHING newPost TO SELECTED FRIENDS
      // PUSHING newPost TO SELECTED GROUPS
      // PUSHING newPost TO CURRENT USER'S posts ARRAY IF HE SELECTED TO SHARE AS A POST ALSO





      var category_name;

      var pipe_show_access_ids = []
      var pipe_show_access = []
      var pipe_group_ids = []
      //Object.entries iterates through an Javascript Object
      Object.entries(req.body).forEach(function(array){
        // array will be in format : [ 'Friend-5c90c2db3c463e7e7075953c', 'rishabh' ]
        // or  [ 'Group-5c90c2db3c463e7e7075953c', 'our-group' ]


        var category = array[0].split("-")[0]  // Friend/Group/Post
        var id = array[0].split("-")[1]

        if(category == "Friend"){

          if(pipe_show_access_ids.indexOf(id) == -1){
            pipe_show_access_ids.push(id)
          }

          User.findOne({_id : id})
          .then(function(foundFriend){
            foundFriend.shared_inventories.push(newPost)
            foundFriend.save()
          })
          .catch(function(error){
            console.log(error)
            res.send(error)
          })
        } else if(category == 'Group'){


            pipe_group_ids.push(id)

            Group.findOne({_id : id})
            .then(function(foundGroup){
              foundGroup.posts.push(newPost)
              foundGroup.save()
            })
            .catch(function(error){
              console.log(error)
              res.send(error)
            })
        }


        // ASSIGN SHOW ACCESS IF USER SELECTED TO POST ALSO
        var friend = -1
        var acquaintance = -1
        var unconnected = -1

        if(array[0] == 'friend'){
          friend = 1
        } else if(array[0] == 'acquaintance'){
          acquaintance = 1
        } else if(array[0] == 'unconnected'){
          unconnected = 1

        }

        if(friend == 1){
          req.user.posts.push(newPost)
          newPost.show_access.push('friend')
          var friendsStringArray = req.user.friends.map(function(item){ return item.toString() })
          pipe_show_access_ids.push(...friendsStringArray)
          pipe_show_access.push('friend')
        }
        if(acquaintance == 1){
          req.user.posts.push(newPost)
          newPost.show_access.push('acquaintance')
          var acquaintancesStringArray = req.user.acquaintances.map(function(item){ return item.toString() })
          pipe_show_access_ids.push(...acquaintancesStringArray)
          pipe_show_access.push('acquaintance')
        }
        if(unconnected == 1){
          req.user.posts.push(newPost)
          newPost.show_access.push('unconnected')
          pipe_show_access.push('unconnected')
        }

        // Putting the post in specified category if user selected "broadcast"
        if(array[0] == 'category'){

            category_name = array[1]

            Category.findOne({name:category_name})
            .then(function(foundCategory){
              foundCategory.posts.push(newPost)
              foundCategory.save()
            })
            .catch(function(error){
              console.log("Error Sharing Inventory")
            })

        }


      })

      newPost.save()

      var newPipe = {}
      newPipe['activity_owner'] = req.user,
      newPipe['activity_caption'] = req.user.name + ' shared his inventory',
      newPipe['time'] = Date.now()
      newPipe['post'] = newPost
      newPipe['group_ids'] = pipe_group_ids // STRINGS
      newPipe['show_access_ids'] = pipe_show_access_ids
      newPipe['show_access'] = pipe_show_access
      newPipe['category_name'] = category_name


      req.user.save()

      Pipe.create(newPipe)
      .then(function(createdPipe){


        // NOTIFICATION
        var newNotification = {
          event_owner : req.user,
          event_caption : req.user.name + ' shared his inventory with you',
          event_tag : 'share inventory',
          event_link : '/post/' + newPost._id ,
          post : newPost,
          seen : 'no',
          notification_tray : 'no',
          receivers : [...pipe_show_access_ids]
        }


        Notification.create(newNotification)
        .then(function(createdNotification){
          res.redirect('/'+req.user._id+'/inventory')
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
  .catch(function(error){
    console.log(error)
    res.send(error)
  })

})

// DISPLAY SHARED INVENTORIES PAGE
router.get('/:id/shared-inventory', function(req, res){
  // POPULATE shared_inventories OF CURRENT USER
  User.findOne({_id : req.user._id}).populate({path : 'shared_inventories', populate:{path : 'author', model:'User'}}).exec()
  .then(function(foundUser){
    res.render('inventory/shared_inventories', {foundUser : foundUser})
  })
  .catch(function(error){
    console.log(error)
    res.send(error)
  })
})


// API DISPLAY SHARED INVENTORIES BY ME PAGE
router.get('/api/shared-inventory-by-me/:skip', function(req, res){
  // POPULATE shared_inventories OF CURRENT USER
  Post.find({author:req.user, type_of_post:"inventory", inventory_tag:"shared"}).populate('author').sort({time:-1}).skip(Number(req.params.skip)).limit(2).exec()
  .then(function(foundInventories){
    res.json(foundInventories)
  })
  .catch(function(error){
    console.log(error)
    res.send(error)
  })
})



// DISPLAY SHARED INVENTORIES BY ME PAGE
router.get('/:id/shared-inventory-by-me', function(req, res){
  // POPULATE shared_inventories OF CURRENT USER
  Post.find({author:req.user, type_of_post:"inventory", inventory_tag:"shared"}).populate('author').sort({time:-1}).limit(5).exec()
  .then(function(foundInventories){
    res.render('inventory/shared_inventories_by_me', {AllInventories : foundInventories})
  })
  .catch(function(error){
    console.log(error)
    res.send(error)
  })
})


// DISPLAY EDIT -> INVENTORY PAGE
router.get('/:id/inventory/:inventory_id/edit', function(req, res){

  Post.findOne({_id : req.params.inventory_id})
  .then(function(foundInventory){
    res.render("inventory/edit", {foundInventory : foundInventory})
  })
  .catch(function(error){
    console.log(error)
  })

})


// LOGIC TO EDIT -> INVENTORY
router.post('/:id/inventory/:inventory_id/edit', function(req, res){

  var toEdit = {
    post : req.body.post,
    quantity : req.body.quantity,
    price : req.body.price
  }

  Post.updateOne({_id : req.params.inventory_id}, toEdit)
  .then(function(updatedInventory){
    res.redirect('/' + req.user._id + '/inventory')
  })
  .catch(function(error){
    console.log(error)
  })

})


// LOGIC TO DELETE INVENTORY
router.get('/:id/inventory/:inventory_id/delete', function(req, res){

  Pipe.deleteOne({post : req.params.inventory_id})
  .then(function(){
    Post.deleteOne({_id : req.params.inventory_id})
    .then(function(){
      res.redirect('/' + req.user._id + '/inventory')
    })
    .catch(function(){
      console.log(error)
    })
  })
  .catch(function(error){
    console.log(error)
  })

})



module.exports = router
