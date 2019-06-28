var current_user_id = $('#current_user_id').text()
var current_user_name = $('#current_user_name').text()
var group_id = $('#group_id').text()

// SUBMIT GROUP MESSAGE API
var api = '/' + current_user_id + '/my-groups/' + group_id + '/message'

function process(){

  var input = $('input').val()
  $('input').val('')


  var postData = {
    message : input
  }

  $.ajax({
    url: api,
    data : postData,
    method : 'POST'
  })
  .then(function(respond){

    var main_section_item_div = $('<div class="main-section-item current-user-message"></div>')
    var author = $('<div class="main-section-item-author">'+current_user_name+'</div>')
    var message = $('<div>'+input+'</div>')

    main_section_item_div.append(author)
    main_section_item_div.append(message)

    $('#chat_messages').append(main_section_item_div)
  })
  .catch(function(error){
    console.log('errors')
    console.log(error)
  })


}


$('button').on('click', function(){

  if($('input[type="text"]').val().trim().length == 0){
    $('.alert-warning').removeClass('hide')
    $('.alert-warning').text('Empty Message can\'t be sent')
  } else {

    $('.alert-warning').addClass('hide')

    process()
    window.scrollTo(0,document.body.scrollHeight);

  }
})

$('input').on('keypress', function(event){
  if(event.which == 13){

    if($('input[type="text"]').val().trim().length == 0){
      $('.alert-warning').removeClass('hide')
      $('.alert-warning').text('Empty Message can\'t be sent')
    } else {

      $('.alert-warning').addClass('hide')

      process()
      window.scrollTo(0,document.body.scrollHeight);

    }
  }
})
