'use strict';

var _ = require('lodash');

var size = function(needed, original, cycle) {
  cycle = cycle || [];

  var dimension = cycle[cycle.length-1],
      value = needed;

  // if key was specified, pick that value from needed
  if(dimension) {
    // both width and height can't reference each other
    if(cycle.indexOf(dimension) !== cycle.length - 1) {
      throw new Error(`Size reference cycle detected (${dimension}) => ${cycle.join(', ')}`);
    }

    value = needed[dimension];
  }

  // if needed is object, resolve each property
  if(typeof(value) === 'object') {
    Object.keys(original).forEach(function(dimension) {
      value[dimension] = size(value, original, cycle.concat(dimension));
    });

    return value;
  }

  var percentage,
      ratio,
      basis,
      basisDimension;

  if (value === undefined || value === null) {
    value = null;
  } else if (_.isString(value) && value.indexOf('%') > -1) {
    percentage = parseFloat(value);
    if (isNaN(percentage)){
      throw new Error('Wrong percentage size "'+value+'"');
    }
    basis = original[dimension] || original;
    value = Math.round(basis * percentage * 0.01);
  } else if (_.isString(value) && (basisDimension = value.indexOf('w') > -1 && 'width' || value.indexOf('h') > -1 && 'height')) {
    ratio = parseFloat(value);

    if (isNaN(ratio)){
      throw new Error('Wrong size "'+value+'"');
    }

    basis = size(needed, original, cycle.concat(basisDimension));
    value = Math.round(basis * ratio / 100);
  } else {
    value = parseInt(value);
    if (isNaN(value)){
      throw new Error('Wrong size "'+value+'"');
    }
  }

  // resolve this dimension's cycle
  cycle.pop();

  return value;
};

module.exports = size;
