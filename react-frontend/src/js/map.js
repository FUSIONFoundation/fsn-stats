//
// map.js
// Theme module
//

(function() {

  //
  // Variables
  //

  var map = document.querySelectorAll('[data-toggle="map"]');
  var accessToken = 'pk.eyJ1IjoiZ29vZHRoZW1lcyIsImEiOiJjanU5eHR4N2cybDU5NGVwOHZwNGprb3E0In0.msdw9q16dh8v4azJXUdiXg';


  //
  // Methods
  //

  function init(el) {
    var elementOptions = el.dataset.options;
        elementOptions = elementOptions ? JSON.parse(elementOptions) : {};
    var defaultOptions = {
      container: el,
      style: 'mapbox://styles/mapbox/light-v9',
      scrollZoom: false,
      interactive: false
    }
    var options = Object.assign(elementOptions, defaultOptions);

    // Get access token
    mapboxgl.accessToken = accessToken;

    // Init map
    new mapboxgl.Map(options);
  }


  //
  // Events
  //

  if (typeof mapboxgl !== 'undefined' && map) {
    [].forEach.call(map, function(el) {
      init(el);
    });
  }

})();