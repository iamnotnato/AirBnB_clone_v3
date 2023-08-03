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
    url: 'http://127.0.0.1:5001/api/v1/status/',
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
        url: 'http://127.0.0.1:5001/api/v1/places_search/',
        headers: { 'Content-Type': 'application/json' },
        data: filters,
        success: (data) => {
          $.each(data, (index, place) => {
            const article = $(`<article data-id=${place.id}></article>`);
            const titleAndPrice = $('<div class="title_box"></div>');
            const title = $('<h2></h2>').text(place.name);
            const price = $('<div class="price_by_night"></div>').text(`$${place.price_by_night}`);
            const information = $('<div class="information"></div>');
            const maxGuest = $('<div class="max_guest"></div>');
            const numRooms = $('<div class="number_rooms"></div>');
            const numBathrooms = $('<div class="number_bathrooms"></div>');
            const description = $('<div class="description"></div>').html(place.description);
            const user = $('<div></div>').addClass('user');
            const review = $('<div class="reviews"></div>').html('<h2>Reviews</h2><span>show</span>');

            $.ajax({
              type: 'GET',
              url: `http://127.0.0.1:5001/api/v1/users/${place.user_id}`,
              success: (data) => { user.html(`<b>Owner:</b> ${data.first_name} ${data.last_name}`); }
            });

            titleAndPrice.append(title, price);
            information.append(maxGuest, numRooms, numBathrooms);
            article.append(titleAndPrice, information, user, description, review);
            $('section.places').append(article);
          });
        }
      });
    }
    filterPlaces = null;
  }
  // END search for places using filters

  // START get reviews
  $('.reviews span').bind('click', function () {
    const reviewStatus = $(this).text;
    const placeId = $(this).parent('article').attr('data-id');
    if (reviewStatus() === 'show') {
      $.ajax({
        type: 'GET',
        url: `http://127.0.0.1:5001/api/v1/places/${placeId}/reviews`,
        success: (data) => {
          const reviewList = $('<ul></ul>');
          $.each(data, (index, review) => {
            const text = $('<p></p>').text(review.text);
            const date = new Date(review.update_at).toDateString();
            $.ajax({
              type: 'GET',
              url: `http://127.0.0.1:5001/api/v1/users/${review.user_id}`,
              success: (data) => {
                const user = $('<h3></h3>').text(`From ${data.first_name} on ${date}`);
                const reviewDetails = $('<li></li>');
                reviewDetails.append(user, text);
                reviewList.append(reviewDetails);
              }
            });
          });
          $(this).after(reviewList);
          $(this.text('Hide'));
        }
      });
    } else {
      ('this ul').remove();
    }
  });
  // END get reviews
}
);
