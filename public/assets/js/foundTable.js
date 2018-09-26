// The code for populating the list of found items at the bottom of the found.html
$(document).ready(function () {
  $("#confirmMsg").hide();
  $(document).on('submit', '#foundItemsEntry', submitFoundItem);

  function submitFoundItem(event) {
    event.preventDefault();
    // items to be added into the table
    var category = $('#category').val();
    var subcategory = $('#categorySelect').find(':selected').val();
    var size = $('#size').find(':selected').val();
    var color = $('#color').find(':selected').val();
    var location = $('textarea#location').val();
    var description = $('textarea#description').val();
    var claimed = false;
    var uid = localStorage.getItem('user_id');
    var firstname = localStorage.getItem('user_firstName');
    var lastname = localStorage.getItem('user_lastName');
    var email = localStorage.getItem('user_email');

    var validated = true;
    if (description.trim() === '' || description.trim().length < 3) {
      validated = false;
      $('#item-desc-error').text('Please enter brief description');
      $('#description').focus();
    }
    if (validated) {
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
          lastname: lastname,
          email: email
        };
        addNewItem(obj);
      }
    }
  }

  function addNewItem(data) {
    $("#confirmMsg").show();
    $.ajax('/api/found', {
      type: 'POST',
      data: data
    }).then(function (res) {
      location.replace('/');
      location.replace('/browse-items');
    });
  }
});