$(function () {
  const amenityIds = [];
  const stateIds = [];
  const cityIds = [];
  const amenityNames = [];
  const locationNames = [];
  let filterPlaces = null;

  getPlaces('{}'); // get all places when window loads

  // listen to filter changes
  $('input.amenity_list').change(function () { getFilters($(this), amenityIds, amenityNames, $('div.amenities > h4')); });
  $('input.states').change(function () { getFilters($(this), stateIds, locationNames, $('div.locations > h4')); });
  $('input.cities').change(function () { getFilters($(this), cityIds, locationNames, $('div.locations > h4')); });

  // START get filters
  function getFilters (filter, filterIds, filterNames, populate) {
    if (filter.is(':checked')) {
      filterIds.push(filter.attr('data-id'));
      filterNames.push(filter.attr('data-name'));
    } else {
      filterIds.pop(filter.attr('data-id'));
      filterNames.pop(filter.attr('data-name'));
    }
    populate.text(filterNames.join(', '));
  }
  // END get filters

  // START listen to searches
  $('button').click(() => {
    $('section.places article').remove();
    getPlaces(JSON.stringify({ states: stateIds, cities: cityIds, amenities: amenityIds }));
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
              url: `http://0.0.0.0:5001/api/v1/users/${place.user_id}`,
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
