
var current_user_id = $('#current_user_id').text()

$('.main-section').on('click', '.favourite', function(event){

  event.stopPropagation()

  var pipe_id = $(this).attr('id')


  var api = "/" + current_user_id + '/pipe/' + pipe_id + '/favourite'


  $.get(api)
  .then(function(response){

  })
  .catch(function(error){
    console.log(error)
  })


  $(this).removeClass('favourite')
  $(this).addClass('favourited')
  $(this).text('Favourited')






})
