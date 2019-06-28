var current_user_id = $('#current_user_id').text()
var current_user_name = $('#current_user_name').text()
var post_id = $('#post_id').text()
var comment_id = $('#comment_id').text()

var api = "/" + current_user_id + '/post/' + post_id + '/comment/' + comment_id + '/reply'

function process(){

  var message = $('#message').val()
  $('#message').val('')


  var postData = {
    message : message
  }

  $.ajax({
    url : api,
    data : postData,
    method : 'POST'
  })
  .then(function(respond){  // respond is createdComment._id

    var main_section_item = $('<div class="main-section-item current-user-message"></div>')

    var author = $('<div style="font-weight:bold;"></div>')
    author.append($('<a href="#">'+current_user_name+'</a>'))

    var reply_div = $('<div></div>')
    reply_div.append(message)


    main_section_item.append(author)
    main_section_item.append(reply_div)

    $('#replies_section').append(main_section_item)


  })
  .catch(function(error){
    console.log(error)
  })

}

// console.log(api)
$('button').on('click', function(){

  process()
  window.scrollTo(0,document.body.scrollHeight);
})

$('input[type="text"]').on('keypress', function(event){
  if(event.which == 13){
    process()
    window.scrollTo(0,document.body.scrollHeight);
  }
})
