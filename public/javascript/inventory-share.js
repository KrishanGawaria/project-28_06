var current_user_id = $('#current_user_id').text()
var found_inventory_id = $('#found_inventory_id').text()

// action="/<%=currentUser._id%>/inventory/<%=foundInventory._id%>/share" method="post"
var postData = {friend : "friend"}
var categoryName=null

$('a[href="#"]').on('click', function(e){

  categoryName = $(this).text()

  $('#category_checkbox').remove()

  var category_checkbox = $('<div id="category_checkbox"></div>')
  var checkbox = $('<input style="display:none" type="checkbox" name="category" value='+categoryName+' checked>'+'<span>')

  category_checkbox.append(checkbox)
  $('#category_element').append(category_checkbox)
})

// data: new FormData($('form')[0])

$('input[type="checkbox"]').on('click', function(){
  var name = $(this).attr('name')
  var value = $(this).attr('value')

  if(name in postData){
    delete postData[name]
  } else {
    postData[name] = value
  }

})


$('#create_post').on('click', function (e) {

  e.preventDefault()


  $('#create_post').text('Posting ...')
      
  $('.alert').removeClass('alert-warning')
  $('.alert').removeClass('hide')
  $('.alert').addClass('alert-success')
  $('.alert').text('Your Post will be posted in a while ...')


    postData['inventory'] = $('textarea[name="inventory"]').val()
    postData['quantity'] = $('input[name="quantity"]').val()
    postData['price'] = $('input[name="price"]').val()


  if(categoryName){
    postData['category'] = categoryName
  }



  var api = '/' + current_user_id + '/inventory/' + found_inventory_id + '/share'




  $.ajax({
    method: 'post',
    url: api,
    data: postData

  })
  .then(function(response){
    postData = {friend:"friend"}
    $('.alert').text('Posted Successfully')
    // $('form')[0].reset()
    $('#create_post').text('Submit')

    console.log(response)
  })
  .catch(function(error){
    console.log(error)
  })

});
