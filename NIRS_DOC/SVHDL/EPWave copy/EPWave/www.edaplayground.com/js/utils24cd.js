/*! Copyright (C) 2013-2014 Doulos, All Rights Reserved. */

var SESSION_EXPIRATION_TIME = 6 * 60 * 60 * 1000;
var sessionExpired = false;


// если отключить функцию, то не заведётся 
function setSessionTimer() {
  sessionExpired = false;
  window.setTimeout(function () {
    sessionExpired = true;
  },
  // Start session expiration timer.
  SESSION_EXPIRATION_TIME);
}

$(document).ready(function() {
  setSessionTimer();
  $('[data-toggle="tooltip"]').tooltip();
});

/**
 * Check whether CSRF token has expired. If so, get a new one.
 * Then execute the callback.
 * @param callback the callback to run after checking the token
 */
function checkToken(callback) {
  if (!sessionExpired) {
    callback();
  } else {
    // get a new token
    var request = $.ajax({
      type: "GET",
      url: "/getToken?cachebuster=" + Math.random(),
      data: {
        userId : $('#sessionUserId').val()
      }
    });
    request.done(function(msg) {
      if (msg.badUser) {
        alert('Error: User logged out. Please reload page.');
      } else if (msg.token && msg.token.token) {
        // Set the CSRF token and start a new timer
        $('._csrfToken').val(msg.token.token);
        setSessionTimer();
        callback();
      } else {
        alert('Session expired. Please reload your page. (Any unsaved code will be lost. Please copy to the clipboard or some other file.)');
      }
    });
    request.fail(function(jqXHR, textStatus) {
        alert("Error connecting to server: " + textStatus);
    });
  }
}

/**
 * Adjust the padding size for a UI Layout element.
 * @param selector jQuery selector of a UI Layout element
 * @param size the new padding (should be between 0 and 10 inclusive)
 */
function adjustLayoutPadding(jQueryObject, size) {
    jQueryObject.css('padding', size + 'px');
    var adjustAmount = 2 * (10 - size);
    jQueryObject.each( function() {
        var el = $(this);
        el.width(el.width() + adjustAmount);
        el.height(el.height() + adjustAmount);
    } );
}

/**
 * Check whether value is a number
 * @param param the value to check
 * @returns {Boolean} true if parameter is a number; false otherwise
 */
function isNumber(param) {
    return ! isNaN (param-0) && param !== null && param !== "" && param !== false;
}

/**
 * Check whether value is a positive number
 * @param param the value to check
 * @returns {Boolean} true if parameter is a positive number; false otherwise
 */
function isPositive(param) {
    return isNumber(param) && param > 0;
}

/**
 * Encode text so that its inner HTML doesn't get injected.
 * @param value the text to encode
 * @returns encoded text
 */
function htmlEncode(value){
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * Decode text to convert its HTML tags into real characters.
 * @param value the text to decode
 * @returns decoded text
 */
function htmlDecode(value){
    return String(value)
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}

function clearRunButtons() {
    $('#codeRunning').val(0);
    $('#stopButton').hide();
    $('#runButton').show();
    $('#runButton').blur();
}

function setRunButtons() {
    $('#codeRunning').val(1);
    $('#stopButton').show();
    $('#runButton').hide();
}

function hideCodeButtons() {
    $('.runButton').hide();
    $('.saveButton').hide();
    $('.copyButton').hide();
}

function showCodeButtons() {
    clearRunButtons();
    $('.runButton').show();
    $('.saveButton').show();
    $('.copyButton').show();
    $('.collaborateButton').show();
}

function showUserButtons(user) {
    if (user) {
        $('.userButton').show();
    } else {
        $('.loginButton').show();
    }
}

function isLoggedIn() {
  // return $('#sessionUserId').val() ? true : false;
	return true;
}

function getLoggedInUserId() {
  return $('#sessionUserId').val();
	//return 629013;
}

function getSelectedSimulator() {
    return $('#simulator option:selected').val();
}

function isGhdlSelected(simulator) {
  return (simulator === '1601');
}

function isSimulatorSupportLibraries(simulator) {
    return (simulator !== '9' && simulator !== '10' && simulator !== '201');
}

function isSynthesisSelected(simulator) {
    return isYosysSelected(simulator) || isVtrSelected(simulator) || isPrecisionSelected(simulator) || isHesSyntheserSelected(simulator);
}

function isPrecisionSelected(simulator) {
    return (simulator === '1702');
}

function isHesSyntheserSelected(simulator) {
    return (simulator === '1205');
}

function isYosysSelected(simulator) {
    return (simulator === '601' || simulator === '602' || simulator === '603');
}

function isVtrSelected(simulator) {
  return (simulator === '501');
}

function getSelectedSimulatorType(sim) {
  switch(sim) {
  case '1601':
    return 'GHDL';
  default:
    return '';
  }
}

/**
 * Create a string of specified length.
 * @param length the length of the string to create
 * @param char the character to pad the string with; if not specified, then 'x' is used
 * @returns a string of specified length
 */
function createString(length, ch) {
    return Array.prototype.join.call({
        length: (length || -1) + 1
        }, ch || 'x');
}

/**
 * Check whether the browser is supported.
 * @returns {Boolean} true if browser is supported; otherwise redirects user to error page
 */
function checkBrowserSupport(path) {
    var ie = /MSIE \d/.test(navigator.userAgent),
        ie_lt9 = ie && (document.documentMode === null || document.documentMode < 9);
    if (ie_lt9) {
        window.location.href = path + "/static/browserNotSupported.html";
    }
    return true;
}

/**
 * Reusable sort functions.
 */
var sortBy = function(field, reverse, primer){

    var key = function (x) {
      return primer ? primer(x[field]) : x[field];
    };

    return function (a,b) {
        var A = key(a), B = key(b);
        return ((A < B) ? -1 : (A > B) ? +1 : 0) * [-1,1][+!!reverse];
    };
};

var sortBy2 = function(field1,field2,reverse){
    return function (a, b) {
          if (a[field1][field2] >  b[field1][field2]) return reverse ? -1 : 1;
          if (a[field1][field2] <  b[field1][field2]) return reverse ? 1 : -1;
          return 0;
        };
};

var sortBy3 = function(field1,field2,field3,reverse){
    return function (a, b) {
          if (a[field1][field2][field3] >  b[field1][field2][field3]) return reverse ? -1 : 1;
          if (a[field1][field2][field3] <  b[field1][field2][field3]) return reverse ? 1 : -1;
          return 0;
        };
};


function capitalizeFirstLetter(value) {
  return value.charAt(0).toUpperCase(0) + value.slice(1);
}

/**
 * Check whether the current page is being loaded in Iframe.
 * @returns true if the page is in Iframe; false otherwise
 */
function inIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

function isIE() {
  // Trident is the new MSIE 11 layout engine.
  return navigator.userAgent.search(/(msie)|(trident\/)/i) > -1;
}

function isFirefox() {
  return navigator.userAgent.search(/(firefox)/i) > -1;
}

function truncate(string){
   if (string.length > 100)
      return string.substring(0,100)+'...';
   else
      return string;
}
const isValidUrl = urlString=> {
    var urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
        '(\\#[-a-z\\d_]*)?$','i'); // validate fragment locator
    return !!urlPattern.test(urlString);
}
