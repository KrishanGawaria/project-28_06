$('.main-section').on('click', '.like',function(event){
  // event.stopPropagation()

  var postId = $(this).attr('id')

  if($(this).text() == "Like"){
    var api = "/" + current_user_id + "/post/" + postId + "/like"
    $.get(api)

    $(this).css('font-weight', 'bold')
    $(this).text('Liked')


    var numberOfLikes = $('span.number-' + postId).text()

    numberOfLikes = Number(numberOfLikes) + 1
    $('span.number-' + postId).text(numberOfLikes)

  } else {
    var api = "/" + current_user_id + "/post/" + postId + "/dislike"
    $.get(api)

    $(this).css('font-weight', 'normal')
    $(this).text('Like')



    var numberOfLikes = $('span.number-' + postId).text()


    numberOfLikes = Number(numberOfLikes) - 1
    $('span.number-' + postId).text(numberOfLikes)
  }

})
// $('.main-section-item').on('click', '.dislike span:first-child',function(event){
$('.main-section').on('click', '.dislike',function(event){
  // event.stopPropagation()

  var postId = $(this).attr('id')

  if($(this).text() == "Like"){
    var api = "/" + current_user_id + "/post/" + postId + "/like"
    $.get(api)

    $(this).css('font-weight', 'bold')
    $(this).text('Liked')



    var numberOfLikes = $('span.number-' + postId).text()

    numberOfLikes = Number(numberOfLikes) + 1
    $('span.number-' + postId).text(numberOfLikes)

  } else {
    var api = "/" + current_user_id + "/post/" + postId + "/dislike"
    $.get(api)

    $(this).css('font-weight', 'normal')
    $(this).text('Like')


    var numberOfLikes = $('span.number-' + postId).text()

    numberOfLikes = Number(numberOfLikes) - 1
    $('span.number-' + postId).text(numberOfLikes)
  }


})
