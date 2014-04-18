/* jshint browser: true, loopfunc: true */

define(function() {
  'use strict';

  // SETUP AZM-ALT + Model
  var els = document.querySelectorAll('.rangeInput');
  function onRangeValueChanged(evt) {
    var el = evt.target;
    console.log('range.value changed', el.value);
    el.setAttribute('value', el.value);
  }
  if (els.length > 0) {
    for (var i = 0; i < els.length; i++) {
      els[i].addEventListener('change', onRangeValueChanged);
    }
  }

});
