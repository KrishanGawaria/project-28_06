var express = require('express')
var router = express.Router()

var models = require("../models")
var Category = models["Category"]

// SHOW ADMIN HOME PAGE
router.get('/admin', function(req, res){
  res.render("admin/home")
})

// SHOW CREATE CATEGORY PAGE
router.get('/admin/category', function(req, res){

  Category.find()
  .then(function(foundCategories){
      res.render("admin/category.ejs", {foundCategories : foundCategories})
  })
  .catch(function(error){
    res.send(error)
  })

})

// LOGIC TO CREATE CATEGORY
router.post('/admin/category', function(req, res){

  var newCategory = {
    name : req.body["name"],
    parent_name : req.body["parent_name"]
  }

  Category.create(newCategory)
  .then(function(createdCategory){
    if(newCategory.parent_name != "null"){
      Category.findOne({name : newCategory.parent_name})
      .then(function(parentCategory){
        parentCategory.children.push(createdCategory)
        parentCategory.children_names.push(newCategory.name)
        parentCategory.save()

        createdCategory.parent = parentCategory
        createdCategory.save()

        res.send(parentCategory)
      })
      .catch(function(error){
        res.send(error)
      })

    } else {

      createdCategory.parent = null
      createdCategory.save()
      res.send(createdCategory)
    }
  })
  .catch(function(error){
    res.send(error)
  })

})



module.exports = router
