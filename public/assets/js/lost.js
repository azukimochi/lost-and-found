// Connects to the Form for the lost item(Using categories table)
$(document).ready(function () {
  activateSearch();
});



var subcategory = {
    Electronics: ['Mobile(apple)', 'Mobile(android)', 'laptop', 'tablet', 'earbuds/ headphones', 'computer accessories'],
    Wallet: ['Wallet only', 'Wallet with IDs', 'IDs only'],
    Clothing: ['Shirt', 'Jacket', 'Pants', 'Skirt'],
    Accessories: ['Shoes', 'Hat', 'Scarf', 'Mittens/ Gloves', 'Jewellery/ Watches', 'Bag/ Purse/ Case'],
    Documents: ['Book', 'Notes'],
    Other: ["Must be clarified in item description section"]
};

function makeSubmenu(value) {
    if (value.length == 0) document.getElementsById('categorySelect').innerHTML = '<option></option>';
    else {
        var categoryOptions = '';
        for (categoryId in subcategory[value]) {
            categoryOptions += '<option>' + subcategory[value][categoryId] + '</option>';
        }
        document.getElementById('categorySelect').innerHTML = categoryOptions;
    }
}
// function displaySelected() {

// var category = document.getElementById('category').value;
// var item = document.getElementById('subCategory').value;
// alert(category+'\n'+item);
// }
function resetSelection() {
    document.getElementById('category').selectedIndex = 0;
    document.getElementById('categorySelect').selectedIndex = 0;
};

var latSearch;
var lngSearch;

function activateSearch() {
    var input = document.getElementById('location');
    var autoComplete = new google.maps.places.Autocomplete(input);
    console.log(autoComplete)
    google.maps.event.addListener(autoComplete, 'place_changed', function () {
        var place = autoComplete.getPlace();
        var name = place.name;
        latSearch = place.geometry.location.lat();
        lngSearch = place.geometry.location.lng();
        console.log("name: " + name + " lat: " + latSearch + " lng: " + lngSearch)
        searchAddress = place.formatted_address;
    });
};



