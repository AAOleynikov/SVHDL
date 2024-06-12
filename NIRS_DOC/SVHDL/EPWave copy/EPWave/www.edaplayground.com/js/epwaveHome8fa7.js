var loading = false,
    epWave;
$(document).ready(function () {
    showUserButtons(remoteUser);

    // Remove Copy button if this epwave is not saved
    if (!isPositive($('#epwaveId').val())) {
        $('.copyButton').hide();
    } else {
        // Add share button
        $('.shareButton').show();
        $('#shareLink').val(document.location);
        $('#shareLink').click(function () {
            $(this).select();
        });
        if (SHARE_ON_SOCIAL) {
            $('#linkedIn').html("<script type=\"IN/Share\" data-url=\"" + document.location + "\"><\/script>");
            $('#shareOnTwitter').attr("href", "http://twitter.com/home?status=Check out my waves: " + document.location);
            $('#shareOnFacebook').click(function () {
                FB.ui({
                    method: 'feed',
                    link: '' + document.location,
                    picture: 'https://www.edaplayground.com/img/Playground-screenshot.png',
                    name: 'EPWave - ' + document.location
                  }, function(){});
            });
        }

        // Remove Save button if this epwave belongs to another user
        var epwaveUserId = $.trim($('#epwaveUserId').val());
        if (epwaveUserId !== userId) {
            $('.saveButton').hide();
        }
    }

    updateType();
    $('#type').change(updateType);

    var windowWidth = $(window).width() - 20;
    epWave = new EPWave(dump, windowWidth, $('#waves'));
    epWave.elementCursorTime = $('.cursorTime');
    epWave.elementRemoveWave = $('.removeWave');
    epWave.elementUpWave = $('.upWave');
    epWave.elementDownWave = $('.downWave');
    epWave.elementStart = $('#start');
    epWave.elementEnd = $('#end');

    epWave.waveIndex = EPWAVE_WAVE_INDEX;
    epWave.setRadix(EPWAVE_RADIX);
    epWave.reloadIndex();
    epWave.createSvg(EPWAVE_START, EPWAVE_END);
    epWave.setMarkerByTime(EPWAVE_CURSOR_TIME);
    if (!EPWAVE_DEFAULT) {
      epWave.populateStartEnd();
    }
    epWave.checkWarnings();
    epWave.populateSignalSelects($('#scopeSelect'), $('#nameSelect'),
            $('#appendSelected'), $('#appendAll'));

    applyEmbedSettings();
    $('#loadingCover').hide();

    // Binds
    $('#saveButton').click({ action: contextPath + "/w/save"},
            _.bind(epWave.save, epWave));
    $('#copyButton').click({ action: contextPath + "/w/copy"},
            _.bind(epWave.save, epWave));

    $('.zoomIn').click({epWave: epWave}, function(event) {
        event.data.epWave.zoomIn();
    });
    $('.zoomOut').click({epWave: epWave}, function(event) {
        event.data.epWave.zoomOut();
    });
    $('.zoomFull').click({epWave: epWave}, function(event) {
        event.data.epWave.zoomFull();
    });
    $('.moveLeft').click({epWave: epWave}, function(event) {
        event.data.epWave.moveLeft();
    });
    $('.moveRight').click({epWave: epWave}, function(event) {
        event.data.epWave.moveRight();
    });
    $('#epwave-examples').click(function(){
        $('#exampleModal').modal();
    });
    $('#waves').click({epWave: epWave}, function(event) {
        var position = $(this).position();
        event.data.epWave.click(event.clientX - position.left,
                event.clientY + $(document).scrollTop() - position.top);
    });
    epWave.elementCursorTime.click({epWave: epWave}, function(event){
        event.data.epWave.centerAroundMarker();
    });
    var resizeDebounced = _.debounce(function(event) {
        event.data.epWave.refreshSvg($(window).width() - 20);
    }, 300);
    $(window).resize({epWave: epWave}, resizeDebounced);
    epWave.elementRemoveWave.click({epWave: epWave}, function(event) {
        event.data.epWave.removeSelectedWave();
    });
    epWave.elementUpWave.click({epWave: epWave}, function(event) {
        event.data.epWave.upSelectedWave();
    });
    epWave.elementDownWave.click({epWave: epWave}, function(event) {
        event.data.epWave.downSelectedWave();
    });
    $('.signalSelect').click(function() {
        $('#signalSelectModal').modal();
    });
    $('#epwave-apps').click(function(){
        $('#appsModal').modal();
    });
    $('#loadButton').click({epWave: epWave}, function(event) {
        event.data.epWave.loadWave();
    });
    $('#type_file, #type_url').on("keypress", '', {epWave: epWave}, function(event) {
        if (event.which === 13) {
            event.data.epWave.loadWave();
        }
    });
    $('#fileToUpload').click(function(event) {
      if (!epWave.isUploadAllowed()) {
        event.preventDefault();
      }
    });
    $('#fileToUpload').change(function() {
      epWave.loadWave();
    });

    $('#expandOptions').click(expandOptions);
    $('#collapseOptions').click(collapseOptions);
    $('#radixHex').click({epWave: epWave}, function(event) {
        if (event.data.epWave.radix !== 'hex') {
            event.data.epWave.setRadix('hex');
            event.data.epWave.refreshSvg();
        }
    });
    $('#radixBinary').click({epWave: epWave}, function(event) {
        if (event.data.epWave.radix !== 'binary') {
            event.data.epWave.setRadix('binary');
            event.data.epWave.refreshSvg();
        }
    });
    $('#radixDecimal').click({epWave: epWave}, function(event) {
        if (event.data.epWave.radix !== 'decimal') {
            event.data.epWave.setRadix('decimal');
            event.data.epWave.refreshSvg();
        }
    });
    $('#radixSigned').click({epWave: epWave}, function(event) {
        if (event.data.epWave.radix !== 'signed') {
            event.data.epWave.setRadix('signed');
            event.data.epWave.refreshSvg();
        }
    });
    $('#radixAscii').click({epWave: epWave}, function(event) {
        if (event.data.epWave.radix !== 'ascii') {
            event.data.epWave.setRadix('ascii');
            event.data.epWave.refreshSvg();
        }
    });
});

/**
 * Apply settings for embedded view.
 */
function applyEmbedSettings() {
  if (USE_EMBED) {
    // Hide the navbar
    $('#header').hide();
    $('body').css(style="padding-top", '0px');
    // Hide the section above the waves
    $('#topBreak').hide();
    $('#typeGroup').parent().hide();
    $('#footer .footerMask').
      html('<small>Note: To revert to EPWave opening in a new browser window, set that option on your profile page.</small>');
  }
}

function expandOptions() {
    $('#expandedForm').show();
    $('#expandOptions').hide();
    $('#collapseOptions').show();
}

function collapseOptions() {
    $('#expandedForm').hide();
    $('#collapseOptions').hide();
    $('#expandOptions').show();
}

function updateType() {
    var value = $('#type option:selected').val();
    if (value === 'playground') {
        $('#type_file').hide();
        $('#type_url').hide();
        $('#type_upload').hide();
        $('#type_playground').show();
        $('#signalFilterField').hide();
        document.getElementById('start').disabled = true;
        document.getElementById('end').disabled = true;
    } else {
        $('#signalFilterField').show();
        document.getElementById('start').disabled = false;
        document.getElementById('end').disabled = false;
        if (value === 'file') {
            $('#type_url').hide();
            $('#type_upload').hide();
            $('#type_playground').hide();
            $('#type_file').show();
        } else if (value === 'url') {
            $('#type_file').hide();
            $('#type_upload').hide();
            $('#type_playground').hide();
            $('#type_url').show();
        } else if (value === 'upload') {
            $('#type_file').hide();
            $('#type_url').hide();
            $('#type_playground').hide();
            $('#type_upload').show();
        }
    }
}

function instructionBox(){
    var box = document.getElementById('instructionCard');
    box.style.display = 'none';
}
