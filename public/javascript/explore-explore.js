var current_user_id = $('#current_user_id').text()

$('input[type="text"]').on('keyup', function(event){
  // console.log(event)
  var string = $('input[type="text"]').val()
  console.log(string)

  var postData = {
    string : string
  }

  var api = '/api/explore'
  $.ajax({
    url : api,
    data : postData,
    method : 'POST'
  })
  .then(function(foundUsers){

    $('#display_users').remove()
    var display_users = $('<div id="display_users"></div>')

    foundUsers.forEach(function(User){

      console.log(User.name)

      var main_section_item = $('<div class="main-section-item flex-content-row"></div>')
      var a_tag = $('<a href="/'+current_user_id+'/explore/'+User._id+'">'+User.name+'</a>')
      main_section_item.append(a_tag)

      display_users.append(main_section_item)

    })

    $('.main-section').append(display_users)
  })
  .catch(function(error){
    console.log(error)
  })

})
