
var current_user_id = $('#current_user_id').text()

$('.main-section').on('click', '.enquire', function(event){

  event.stopPropagation()

  var post_id = $(this).attr('id')


  var api = "/" + current_user_id + '/post/' + post_id + '/comment'


  var comment = 'Enquire'
  var private_tag = "true"



  var postData = {
    comment : comment,
    private_tag : private_tag
  }


  $.ajax({
    url : api,
    data : postData,
    method : 'POST'
  })
  .then(function(response){
    $.get("/" + current_user_id + '/post/' + post_id + '/enquire')
  })
  .catch(function(error){
    console.log(error)
  })

  $(this).removeClass('enquire')
  $(this).addClass('enquired')
  $(this).text('Enquired')






})
