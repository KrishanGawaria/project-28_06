var current_user_id = $('#current_user_id').text()
var post_id = $('#post_id').text()
var current_user_name = $('#current_user_name').text()

var api = "/" + current_user_id + '/post/' + post_id + '/comment'

function process(){

  var comment = $('#comment').val()
  var private_tag = $('input[name="private_tag"]:checked').val()

  $('#comment').val('')

  var postData = {
    comment : comment,
    private_tag : private_tag
  }

  console.log(comment)

  $.ajax({
    url : api,
    data : postData,
    method : 'POST'
  })
  .then(function(created_comment_id){  // respond is createdComment._id

    var main_section_item = $('<div class="main-section-item current-user-message"></div>')

    var author = $('<div style="font-weight:bold;"></div>')
    author.append($('<a href="#">'+current_user_name+'</a>'))

    var comment_div = $('<div></div>')
    comment_div.append(comment)

    var reply_div = $('<div style="text-align:right;"></div>')
    var reply_link = $('<a href="/'+current_user_name+'/post/'+post_id+'/comment/'+created_comment_id+'/reply">Reply</a>')
    reply_div.append(reply_link)

    main_section_item.append(author)
    main_section_item.append(comment_div)
    main_section_item.append(reply_div)

    $('#comments_section').append(main_section_item)


  })
  .catch(function(error){
    console.log(error)
  })

}

// console.log(api)
$('button').on('click', function(e){

  e.preventDefault()

  if($('input[type="text"]').val().trim().length == 0){
    $('.alert-warning').removeClass('hide')
    $('.alert-warning').text('Comment can\'t be empty')
  } else {

    $('.alert-warning').addClass('hide')

    process()
    window.scrollTo(0,document.body.scrollHeight);

  }

})

$('input[type="text"]').on('keypress', function(event){
  if(event.which == 13){

    if($('input[type="text"]').val().trim().length == 0){
      $('.alert-warning').removeClass('hide')
      $('.alert-warning').text('Comment can\'t be empty')
    } else {

      $('.alert-warning').addClass('hide')

      process()
      window.scrollTo(0,document.body.scrollHeight);

    }
  }
})
