var skip = 3
// SO THAT INITIALLY IT CAN SKIP 5. 5 ARE ALREADY RENDERED BY SERVER

var current_user_id = $('#current_user_id').text()


var callApi = true

function process() {

  callApi = false

  skip = skip + 2

  var api = '/api/shared-inventory-by-me/'+skip.toString()

  $.get(api)
  .then(function(Posts){


    if(Posts.length == 0){
      callApi = false
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
        image_subitem.append('<a href="/'+current_user_id+'/post/'+Post._id+'/image/'+index+'"><img width=500px src="data:image/png;base64,'+Image["base64"]+'"></a>')
        image_item.append(image_subitem)
      })

      // QUANTITY PRICE COMMENT SHARE
      var qty_price_comment_share = $('<div class="main-section-item-qty-price-comments main-section-subitem"></div>')
      var like = $('<div class="main-section-item-qty-price-comments-subitem"><span id="'+Pipe.post._id+'" class="like">Like</span> (<span class="number-'+Pipe.post._id+'">'+Pipe.post.likes.length+'</span>)</div>')
var dislike = $('<div class="main-section-item-qty-price-comments-subitem"><span id="'+Pipe.post._id+'" class="like" style="font-weight:bold;">Liked</span> (<span class="number-'+Pipe.post._id+'">'+Pipe.post.likes.length+'</span>)</div>')
      var qty = $('<div class="main-section-item-qty-price-comments-subitem">Quantity: <span id="quantity">'+Post.quantity+'</span></div>')
      var price = $('<div class="main-section-item-qty-price-comments-subitem">Price: <span id="price">'+Post.price+'</span></div>')
      var comment = $('<div class="main-section-item-qty-price-comments-subitem"><a href="/'+current_user_id+'/post/'+Post._id+'/comment">Comments</a></div>')
      var edit = $('<div class="main-section-item-qty-price-comments-subitem"><a href="/'+current_user_id+'/inventory/'+Post._id+'/edit">Edit</a></div>')
      var delete_link = $('<div class="main-section-item-qty-price-comments-subitem"><a href="/'+current_user_id+'/inventory/'+Post._id+'/delete">Delete</a></div>')

      var liked = false
      Pipe.post.likes.forEach(function(user){
        if(user.toString() == current_user_id.toString()){
          liked = true
        }
      })

      if(liked){
        qty_price_comment_share.append(dislike)
      } else {
        qty_price_comment_share.append(like)
      }

      qty_price_comment_share.append(qty)
      qty_price_comment_share.append(price)
      qty_price_comment_share.append(comment)
      qty_price_comment_share.append(edit)
      qty_price_comment_share.append(delete_link)






      main_section_item.append(post_author)
      main_section_item.append(post_post)
      main_section_item.append(image_item)
      main_section_item.append(qty_price_comment_share)


      $('.main-section').append(main_section_item)

    })

    callApi = true

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
