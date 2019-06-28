var express = require('express')
var router = express.Router()

var passport = require('passport')

var models = require("../models")
var User = models["User"]

var helper_functions = require('../helper_functions')
var isLoggedIn = helper_functions['isLoggedIn']

router.get('/index', isLoggedIn,function(req, res){
  res.send("This is coming from index route")
})

router.get('/', isLoggedIn, function(req, res){
    res.redirect('/' + req.user._id + '/home')
})

// Display Register Page
router.get('/register', function(req, res){
  res.render('register')
})

// Register Logic
router.post('/register', function(req, res){

  var newUser = {
        username : req.body["username"],
        name : req.body["name"]
    }

    User.register(newUser, req.body["password"], function(error, registeredUser){
        if(error){
            console.log(error)
            console.log('Error Registering')
            res.redirect('/register')
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/"+ req.user._id +"/home")
            })
        }
    })

})

// Display Login page
router.get('/login', function(req, res){

    if(req.isAuthenticated()){
        res.redirect('/'+req.user._id + '/home')
    } else {
        res.render('login')
    }

})

// Login Logic
router.post('/login', passport.authenticate('local', ({
    // successRedirect : "/"+ req.user._id +"/home",
    failureRedirect : '/login'
})), function(req, res){
  res.redirect("/"+ req.user._id +"/home")
})

// Logout Logic
router.get('/logout', function(req, res) {
    req.logout()
    res.redirect('/login')
})

module.exports = router
