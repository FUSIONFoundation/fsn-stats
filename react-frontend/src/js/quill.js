//
// quill.js
// Theme module
//

'use strict';

(function() {

  //
  // Variables
  //

  var toggle = document.querySelectorAll('[data-toggle="quill"]');


  //
  // Functions
  //

  function init(el) {
    var elementOptions = el.dataset.options;
        elementOptions = elementOptions ? JSON.parse(elementOptions) : {};
    var defaultOptions = {
      modules: {
        toolbar: [['bold', 'italic'], ['link', 'blockquote', 'code', 'image'], [{'list': 'ordered'}, {'list': 'bullet'}]]
      },
      theme: 'snow'
    };
    var options = Object.assign(elementOptions, defaultOptions);

    new Quill(el, options);
  }


  //
  // Events
  //

  if (typeof Quill !== 'undefined' && toggle) {
    [].forEach.call(toggle, function(el) {
      init(el);
    });
  }
  
})();