$(function () {
  const amenityIds = [];
  const amenityNames = [];
  let filterPlaces = null;

  getPlaces('{}'); // get all places when window loads

  // START get amenity filters
  $('li input:checkbox').change(function () {
    if ($(this).is(':checked')) {
      amenityIds.push($(this).attr('data-id'));
      amenityNames.push($(this).attr('data-name'));
    } else {
      amenityIds.pop($(this).attr('data-id'));
      amenityNames.pop($(this).attr('data-name'));
    }
    if (amenityNames.length > 0) {
      $('div.amenities > h4').text(amenityNames.join(', '));
    } else {
      $('div.amenities > h4').text('');
    }
  });
  // END get amenity filters

  // START listen to searches
  $('button').click(() => {
    $('section.places article').remove();
    getPlaces(JSON.stringify({ amenities: amenityIds }));
  });
  // END listen to searches

  // START check API status
  $.ajax({
    type: 'GET',
    url: 'http://0.0.0.0:5001/api/v1/status/',
    success: (data) => {
      if (data.status === 'OK') { $('div.api_status').toggleClass('available'); }
    }
  });
  // END check API status

  // START search for places using filters
  function getPlaces (filters) {
    if (filterPlaces !== null) filterPlaces.abort();
    else {
      filterPlaces = $.ajax({
        type: 'POST',
        url: 'http://0.0.0.0:5001/api/v1/places_search/',
        headers: { 'Content-Type': 'application/json' },
        data: filters,
        success: (data) => {
          $.each(data, (index, place) => {
            const article = $('<article></article>');
            const titleAndPrice = $('<div class="title_box"></div>');
            const title = $('<h2></h2>').text(place.name);
            const price = $('<div class="price_by_night"></div>').text(`$${place.price_by_night}`);
            const information = $('<div class="information"></div>');
            const maxGuest = $('<div class="max_guest"></div>');
            const numRooms = $('<div class="number_rooms"></div>');
            const numBathrooms = $('<div class="number_bathrooms"></div>');
            const description = $('<div class="description"></div>').html(place.description);
            const user = $('<div class="user"></div>');

            $.ajax({
              type: 'GET',
              url: 'http://0.0.0.0:5001/api/v1/users/{$place.user_id}',
              success: (data) => { user.html(`<b>Owner:</b> ${data.first_name} ${data.last_name}`); }
            });

            titleAndPrice.append(title, price);
            information.append(maxGuest, numRooms, numBathrooms);
            article.append(titleAndPrice, information, user, description);
            $('section.places').append(article);
          });
        }
      });
    }
    filterPlaces = null;
  }
  // END search for places using filters
}
);
