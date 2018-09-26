// The code for populating the list of lost items at the bottom of the lost.html
$(document).ready(function () {
  $("#confirmMsg").hide();
  $(document).on('submit', '#itemsEntry', submitLostItem);

  function submitLostItem(event) {
    event.preventDefault();
    // items to be added into the table
    var category = $('#category').val();
    var subcategory = $('#categorySelect').find(':selected').val();
    var size = $('#size').find(':selected').val();
    var color = $('#color').find(':selected').val();
    var location = $('#location').val();
    var description = $('#description').val();
    var claimed = false;
    var uid = localStorage.getItem('user_id');
    var firstname = localStorage.getItem('user_firstName');
    var lastname = localStorage.getItem('user_lastName');
    var email = localStorage.getItem('user_email');

    var validated = true;
    if(description.trim() ==='' || description.trim().length<3){
      validated = false;
      $('#item-desc-error').text('Please enter brief description');
      $('#description').focus();
    }
        
    if(validated){
      if (!category) {
        return;
      } else {
        obj = {
          category: category,
          subcategory: subcategory,
          size: size,
          color: color,
          location: location,
          description: description,
          claimed: claimed,
          UserId: uid,
          firstname: firstname,
          lastname:  lastname,
          email:  email
        };
        addNewItem(obj);
      }
    }
  }

  function addNewItem(data) {
    $("#confirmMsg").show();
    $.ajax('/api/lost', {
      type: 'POST',
      data: data
    }).then(function (res) {
      location.replace('localhost:8080/browse-items');
    });
  }
});