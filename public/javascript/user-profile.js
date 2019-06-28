var skip = -1
// SO THAT INITIALLY IT CAN SKIP 5. 5 ARE ALREADY RENDERED BY SERVER

var current_user_id = $('#current_user_id').text()


var callApi = true

var defaultCallProcess = 0

function process() {

  callApi = false

  skip = skip + 1

  $.get('/api/user/profile/'+skip.toString())
  .then(function(Posts){


    if(Posts.length == 0){
      callApi = false
      $('#loading_div').text("You're All Caught Up ")
      return
    }

    Posts.forEach(function(Post){
      // MAIN SECTION ITEM
      var main_section_item = $('<div class="main-section-item"></div>')

      //  POST_AUTHOR POST.POST

      var post_author = $('<div class="main-section-item-author main-section-subitem"><a href="#">'+Post.author.username+'</a></div>')
      var post_post = $('<div class="main-section-item-post main-section-subitem">'+Post.post+'</div>')

      // IMAGES
      var image_item = $('<div class="main-section-item-post-image main-section-subitem"></div>')
      Post.images.forEach(function(Image, index){
        var image_subitem = $('<div class="main-section-item-post-image-subitem">')
        image_subitem.append('<a href="/'+current_user_id.text()+'/post/'+Post._id+'/image/'+index+'"><img width=500px src="data:image/png;base64,'+Image["base64"]+'"></a>')
        image_item.append(image_subitem)
      })

      // QUANTITY PRICE COMMENT SHARE
      var qty_price_comment_share = $('<div class="main-section-item-qty-price-comments main-section-subitem"></div>')
      var like = $('<div class="main-section-item-qty-price-comments-subitem"><span id="'+Post._id+'" class="like">Like</span> (<span class="number-'+Post._id+'">'+Post.likes.length+'</span>)</div>')
      var dislike = $('<div class="main-section-item-qty-price-comments-subitem"><span id="'+Post._id+'" class="like" style="font-weight:bold;">Liked</span> (<span class="number-'+Post._id+'">'+Post.likes.length+'</span>)</div>')
      var qty = $('<div class="main-section-item-qty-price-comments-subitem">Quantity: <span id="quantity">'+Post.quantity+'</span></div>')
      var price = $('<div class="main-section-item-qty-price-comments-subitem">Price: <span id="price">'+Post.price+'</span></div>')
      var comment = $('<div class="main-section-item-qty-price-comments-subitem"><a href="/'+current_user_id.text()+'/post/'+Post._id+'/comment">Comments</a></div>')
      var share = $('<div class="main-section-item-qty-price-comments-subitem"><a href="/'+current_user_id.text()+'/post/'+Post._id+'/share">Share</a></div>')
      var edit = $('<div class="main-section-item-qty-price-comments-subitem"><a href="/'+current_user_id.text()+'/post/'+Post._id+'/edit">Edit</a></div>')
      var deleted_link = $('<div class="main-section-item-qty-price-comments-subitem"><a href="/'+current_user_id.text()+'/post/'+Post._id+'/delete">Delete</a></div>')

      var liked = false
      Post.likes.forEach(function(user){
        if(user.toString() == current_user_id.text().toString()){
          liked = true
        }
      })

      if(liked){
        qty_price_comment_share.append(dislike)
      } else {
        qty_price_comment_share.append(like)
      }


      if(Post["type_of_post"] == "inventory"){
        qty_price_comment_share.append(qty)
        qty_price_comment_share.append(price)
      }
      qty_price_comment_share.append(comment)
      qty_price_comment_share.append(share)
      qty_price_comment_share.append(edit)
      qty_price_comment_share.append(deleted_link)

      var block_div = $('<div class="main-section-item-block-form main-section-subitem"></div>')
      var block_form = $('<form action="/'+current_user_id.text()+'/post/'+Post._id+'/block" method="POST"></form>')
      var form_flex = $('<div class="form-flex form-group"></div>')
      form_flex.append($('<input class="form-flex-item form-control" type="text" name="quantity" placeholder="Enter quantity to Block">'))
      form_flex.append($('<button class="form-flex-item btn btn-primary" style="background: black;">Block</button>'))
      block_form.append(form_flex)
      block_div.append(block_form)




      main_section_item.append(post_author)
      main_section_item.append(post_post)
      main_section_item.append(image_item)
      main_section_item.append(qty_price_comment_share)
      if(Post["type_of_post"] == "inventory"){
        main_section_item.append(block_div)
      }

      $('#display_posts').append(main_section_item)

    })

    callApi = true

    defaultCallProcess ++;
    if(defaultCallProcess < 4) {
      process()
    }

  })
  .catch(function(error){
    callApi = true
    console.log(error)
  })

}

// LOGIC TO DETECT WHEN USER HAS SCROLLED TO BOTTOM OF PAGE
$(window).scroll(function() {
  if($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
    // USER IS AT BOTTOM OF PAGE
    if(callApi){
      process()
    }
   }
});


$('a[href="#"]').on('click', function(e){

  var categoryName = $(this).text()

  $('#category_checkbox').remove()

  var category_checkbox = $('<div id="category_checkbox"></div>')
  var checkbox = $('<input style="display:none" type="checkbox" name="category" value='+categoryName+' checked>'+'<span>')

  category_checkbox.append(checkbox)
  $('#category_element').append(category_checkbox)
})




$('#create_post').on('click', function (e) {

  e.preventDefault()

  if($('textarea').val().trim().length == 0){
    $('.alert-warning').removeClass('hide')
    $('.alert-warning').text('Write a caption for your post')
  } else {
    $('#create_post').text('Posting ...')

    $('.alert').removeClass('alert-warning')
    $('.alert').removeClass('hide')
    $('.alert').addClass('alert-success')
    $('.alert').text('Your Post will be posted in a while ...')

    $.ajax({
      method: 'post',
      url: '/' + current_user_id.text() + '/post',
      data: new FormData($('form')[0]),

      config: { headers: {'Content-Type': 'multipart/form-data' }},

      cache: false,
      contentType: false,
      processData: false,

    })
    .then(function(response){
        $('.alert').text('Posted Successfully')
        $('form')[0].reset()
        $('#create_post').text('Submit')
        console.log(response)
    })
    .catch(function(error){
        $('#create_post').text('Submit')
      console.log(error)
    })

  }


});
// window.onload = process

process()
