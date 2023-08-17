const $ = window.$;
let amenities = [];

$(document).ready(function () {
    $('.amenity_checkbox').click(function () {
      let amenity_id = $(this).data('id');
      if (amenities.includes(amenity_id)) {
        let index = amenities.indexOf(amenity_id);
        if (index !== -1) {
          amenities.splice(index, 1);
        }
      } else {
        amenities.push(amenity_id);
      }
      console.log(amenities);
  });
});
