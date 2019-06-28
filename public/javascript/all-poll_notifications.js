setInterval(function(){
  poll_notifications()
}, 5000)

function poll_notifications(){

  $.get('/api/notification-number')
  .then(function(response){
    $('#number_of_notifications').text(response.number_of_notifications)
    // console.log(response)
  })
  .catch(function(error){
    console.log(error)
  })

}

poll_notifications()
