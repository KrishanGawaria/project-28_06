var current_user_id = $('#current_user_id').text()

$('a[href="#"]').on('click', function(e){
  if(!($(this).parent().hasClass('disabled'))){
    var categoryName = $(this).text()

    var main_section_item = $('<div class="main-section-item flex-content-row"></div>')

    var category_name = $('<div>'+categoryName+'</div>')
    var remove_link = $('<a href="/'+current_user_id+'/category/remove/'+categoryName+'">Remove</a>')

    main_section_item.append(category_name)
    main_section_item.append(remove_link)

    $('.main-section').append(main_section_item)


    var api = '/' + current_user_id + '/category/add/' + categoryName

    $(this).text(categoryName + " (Added)")
    $(this).parent().addClass('disabled')

    $.get(api)
    .then(function(response){

      console.log(response)
    })
    .catch(function(error){
      console.log(error)
    })

  }
})
