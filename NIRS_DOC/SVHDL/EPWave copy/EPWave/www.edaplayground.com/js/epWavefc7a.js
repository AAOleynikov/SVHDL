/*! Copyright (C) 2013 Doulos, All Rights Reserved. */

function EPWave(waves, windowWidth, element) {
    // Constants
    this.ELEMENT_HEIGHT = 20;
    this.CHARACTER_WIDTH = 8;
    this.DUMP_MAX_SIZE = 1048576;
    this.MAX_SIGNALS_FOR_DEFAULT_INDEX = 10;

    //keys
    this.CURSOR_TIME_KEY = "cursorTime";
    this.CURSOR_2_TIME_KEY = "cursor2Time";

    // Name region constants
    this.VALUE_REGION_WIDTH = 33;
    this.CHARS_IN_VALUE_REGION = 3;
    this.HEX_BITS_IN_VALUE_REGION = 4 * this.CHARS_IN_VALUE_REGION;

    // Ruler constants
    this.MIN_PIXELS_BETWEEN_HASHES = 10;
    this.MIN_PIXELS_BETWEEN_TENS = this.MIN_PIXELS_BETWEEN_HASHES * 10;

    // Options that should be set
    this.waves = waves;
    this.windowWidth = windowWidth;
    this.element = element;
    this.elementCursorTime = null;
    this.elementRemoveWave = null;
    this.elementUpWave = null;
    this.elementDownWave = null;
    this.elementStart = null;
    this.elementEnd = null;
    this.radix = null;

    this.svgHeight = 0;
    this.textRegionWidth = 0;
    this.numberOfRows = 0;

    this.currentStart = 0;
    this.currentEnd = 0;
    this.cursorTime = isNaN(parseInt(localStorage.getItem(this.CURSOR_TIME_KEY))) ? null:parseInt(localStorage.getItem(this.CURSOR_TIME_KEY));
    this.cursor2Time= isNaN(parseInt(localStorage.getItem(this.CURSOR_2_TIME_KEY))) ? null:parseInt(localStorage.getItem(this.CURSOR_2_TIME_KEY));
    this.timePerPixel = 0;
    this.waveIndex = [];
    this.selectedWaveIndex = null;
    this.selectedWaveIndices = [];
    this.lastSelectedWaveIndex = null;
    this.startIndex = null;
    // Flag to indicate that waves are loading
    this.loading = false;
    this.ctrlPressed = false;
    this.shiftPressed = false;


    $('html').keydown({epWave: this}, function (event) {
        if (event.keyCode === 46) {
            // Delete key pressed
            event.data.epWave.removeSelectedWave();
        }
        if (event.keyCode == 17) {
            event.data.epWave.ctrlPressed = true;
        }
        if (event.keyCode == 16) {
            event.data.epWave.shiftPressed = true;
        }
    });
    $('html').keyup({epWave: this}, function (event) {
        if (event.keyCode == 17) {
            event.data.epWave.ctrlPressed = false;

        }
        if (event.keyCode == 16) {
            event.data.epWave.shiftPressed = false;
        }
    });

    this.isFirefox = navigator.userAgent.search("Firefox") > -1;
    this.isChrome = navigator.userAgent.search("Chrome") > -1;

    this.setRadix = function (defaultRadix) {
        var storedRadix = localStorage.getItem('radix');
        if(defaultRadix) {
            this.radix = defaultRadix;
        }else if(storedRadix){
            this.radix = storedRadix;
        }else{
            this.radix = 'hex';
        }
        this.updateRadixVisibility();

        localStorage.setItem('radix', this.radix);

    };


    this.updateRadixVisibility = function (){
        if (this.radix === 'hex') {
            $('#radixHex > i').css('visibility', 'visible');
            $('#radixBinary > i').css('visibility', 'hidden');
            $('#radixDecimal > i').css('visibility', 'hidden');
            $('#radixSigned > i').css('visibility', 'hidden');
            $('#radixAscii > i').css('visibility', 'hidden');
        } else if (this.radix === 'binary') {
            $('#radixBinary > i').css('visibility', 'visible');
            $('#radixHex > i').css('visibility', 'hidden');
            $('#radixDecimal > i').css('visibility', 'hidden');
            $('#radixSigned > i').css('visibility', 'hidden');
            $('#radixAscii > i').css('visibility', 'hidden');
        } else if (this.radix === 'decimal') {
            $('#radixDecimal > i').css('visibility', 'visible');
            $('#radixHex > i').css('visibility', 'hidden');
            $('#radixBinary > i').css('visibility', 'hidden');
            $('#radixSigned > i').css('visibility', 'hidden');
            $('#radixAscii > i').css('visibility', 'hidden');
        } else if (this.radix === 'signed') {
            $('#radixSigned > i').css('visibility', 'visible');
            $('#radixDecimal > i').css('visibility', 'hidden');
            $('#radixHex > i').css('visibility', 'hidden');
            $('#radixBinary > i').css('visibility', 'hidden');
            $('#radixAscii > i').css('visibility', 'hidden');
        } else if (this.radix === 'ascii') {
            $('#radixAscii > i').css('visibility', 'visible');
            $('#radixDecimal > i').css('visibility', 'hidden');
            $('#radixHex > i').css('visibility', 'hidden');
            $('#radixBinary > i').css('visibility', 'hidden');
            $('#radixSigned > i').css('visibility', 'hidden');
        }
    };

    this.zoomIn = function () {
        var distance = this.currentEnd - this.currentStart;
        var quarterDistance = Math.floor(distance / 4);
        if (quarterDistance) {
            if (isNumber(this.cursorTime)) {
                if (this.cursorTime - quarterDistance < this.currentStart) {
                    this.createSvg(this.currentStart, this.currentEnd - 2 * quarterDistance);
                } else if (this.cursorTime + quarterDistance > this.currentEnd) {
                    this.createSvg(this.currentStart + 2 * quarterDistance, this.currentEnd);
                } else {
                    this.createSvg(this.cursorTime - quarterDistance, this.cursorTime + quarterDistance);
                }
            } else {
                this.createSvg(this.currentStart + quarterDistance, this.currentEnd - quarterDistance);
            }
            this.setMarkerByTime(this.cursorTime, 1);
            this.setMarkerByTime(this.cursor2Time, 2);
        }
    };

    this.zoomOut = function () {
        var distance = this.currentEnd - this.currentStart;
        var doubleDistance = 2 * distance;
        if (doubleDistance >= this.waves.end - this.waves.start) {
            this.createSvg();
        } else {
            var halfDistance = Math.floor(distance / 2);
            var newStart = this.currentStart - halfDistance;
            if (newStart < this.waves.start) {
                newStart = this.waves.start;
            }
            var newEnd = this.currentEnd + halfDistance;
            if (newEnd > this.waves.end) {
                newEnd = this.waves.end;
                newStart = newEnd - doubleDistance;
            }
            this.createSvg(newStart, newEnd);
        }
        this.setMarkerByTime(this.cursorTime, 1);
        this.setMarkerByTime(this.cursor2Time, 2);
    };

    this.zoomFull = function () {
        this.createSvg();
        this.setMarkerByTime(this.cursorTime, 1);
        this.setMarkerByTime(this.cursor2Time, 2);
    };

    this.moveLeft = function () {
        var distance = this.currentEnd - this.currentStart;
        var moveDistance = Math.ceil(distance / 4);
        var newStart = this.currentStart - moveDistance;
        if (newStart < this.waves.start) {
            newStart = this.waves.start;
        }
        this.createSvg(newStart, newStart + distance);
        this.setMarkerByTime(this.cursorTime, 1);
        this.setMarkerByTime(this.cursor2Time, 2);
    };

    this.moveRight = function () {
        var distance = this.currentEnd - this.currentStart;
        var moveDistance = Math.ceil(distance / 4);
        var newEnd = this.currentEnd + moveDistance;
        if (newEnd > this.waves.end) {
            newEnd = this.waves.end;
        }
        this.createSvg(newEnd - distance, newEnd);
        this.setMarkerByTime(this.cursorTime, 1);
        this.setMarkerByTime(this.cursor2Time, 2);
    };

    this.centerAroundMarker = function () {
        var halfDistance = (this.currentEnd - this.currentStart) / 2;
        if (isNumber(this.cursorTime)) {
            if (this.cursorTime - halfDistance < this.waves.start) {
                this.createSvg(this.waves.start, this.waves.start + 2 * halfDistance);
            } else if (this.cursorTime + halfDistance > this.waves.end) {
                this.createSvg(this.waves.end - 2 * halfDistance, this.waves.end);
            } else {
                this.createSvg(this.cursorTime - halfDistance, this.cursorTime + halfDistance);
            }
            this.setMarkerByTime(this.cursorTime, 1);
            this.setMarkerByTime(this.cursor2Time, 2);
        }
    };

    this.click = function (positionX, positionY) {
        var lineNumber = this.ctrlPressed ? 2 : 1;
        if (positionX >= this.textRegionWidth) {
            if (positionY < this.ELEMENT_HEIGHT) {
                this.setMarkerByPosition(positionX, lineNumber);
                this.updateMarkerValues();
            } else {
                this.setMarkerByEdge(positionX, positionY - this.ELEMENT_HEIGHT, lineNumber);
            }
        } else if (positionY >= this.ELEMENT_HEIGHT && positionX <= ((this.textRegionWidth + 20 ) - this.VALUE_REGION_WIDTH) && positionX >= 20) {
            this.highlightWaveName(positionY - this.ELEMENT_HEIGHT);
        } else {
            this.setMarkerByTime(this.currentStart, lineNumber);
        }
    };

    this.handleShiftClick = function (waveNumber) {
        if (this.lastSelectedWaveIndex === null) {
            // First wave selected with Shift key, start a new selection
            this.lastSelectedWaveIndex = waveNumber;
            this.selectedWaveIndices = [];
            this.selectedWaveIndices.push(waveNumber);
            this.startIndex = this.lastSelectedWaveIndex;
        } else {
            var end = waveNumber;
            if (this.startIndex < end) {
                for (var i = this.startIndex; i <= end; i++) {
                    if (!this.selectedWaveIndices.includes(i)) {
                        this.selectedWaveIndices.push(i);
                    }
                }
            } else {
                for (var i = end; i <= this.startIndex; i++) {
                    if (!this.selectedWaveIndices.includes(i)) {
                        this.selectedWaveIndices.push(i);
                    }
                }
            }
        }
        // Highlight the selected waves
        this.highlightSelectedWaves();
    };



    this.highlightSelectedWaves = function () {
        // Clear previous highlights
        $('.waveName').css('fill', 'black');

        // Iterate through selectedWaveIndices and highlight the corresponding waves
        for (const index of this.selectedWaveIndices) {
            var rect = $('.waveName' + index);
            rect.css('fill', 'blue');
            this.fillWaveName(rect, index);
        }

        // Update the features for the last selected wave
        // if (this.lastSelectedWaveIndex !== null) {
        //     var lastRect = $('.waveName' + this.lastSelectedWaveIndex);
        //     // this.fillWaveName(lastRect, this.lastSelectedWaveIndex);
        // }
    };

    /**
     * Find the closest edge for the given signal and set the marker there.
     */
    this.setMarkerByEdge = function (positionX, positionY, cursorNumber) {
        var waveNumber = Math.floor(positionY / this.ELEMENT_HEIGHT),
            clickTime = this.getTimeFromPosition(positionX),
            time = null, lastTime = 0, markerSet = false;
        for(var i = 0; i < this.waveIndex.length; i++) {
            let maxNumberOfBits = this.getMaxNumberOfBits(this.waves.vars[this.waveIndex[i].id].data);
            if (this.waveIndex[i].expanded == true) {
                 if(waveNumber>i+1){
                    waveNumber -= maxNumberOfBits;
                }
            }
        }
        // Find closest edge to clickTime
            var data = this.waves.vars[this.waveIndex[waveNumber].id].data;
            for (time in data) {
                if (data.hasOwnProperty(time)) {
                    time = +time;
                    if (time < clickTime) {
                        lastTime = time;
                    } else {
                        if ((clickTime - lastTime) < (time - clickTime)) {
                            markerSet = true;
                            this.setMarkerByTime(lastTime, cursorNumber);
                        }
                        break;
                    }
                }
        }
        // Set marker to time if it hasn't beeen set
        if (!markerSet) {
                this.setMarkerByTime(time, cursorNumber);
        }
        // Redraw if marker is off screen
        var cursorVal = cursorNumber == 2 ? this.cursor2Time : this.cursorTime;
        if (this.currentStart > cursorVal || cursorVal > this.currentEnd) {
            this.centerAroundMarker();
        }
    };

    this.updateMarkerValues = function () {
        if (isNumber(this.cursorTime)) {
            var i;

            for (i = 0; i < this.waveIndex.length; i++) {
                var wave = this.waves.vars[this.waveIndex[i].id],
                    data = wave.data,
                    time = null, lastTime = 0, textUpdated = false, j=i-1;

                for (time in data) {
                    if (data.hasOwnProperty(time)) {
                        time = +time;
                        if (time <= this.cursorTime) {
                            lastTime = time;
                        } else {
                            textUpdated = true;
                            this.updateMarkerValue(i, data[lastTime], wave.width, this.waveIndex[i].signal.type);
                            break;
                        }
                    }
                }
                if (!textUpdated) {
                    this.updateMarkerValue(i, data[lastTime], wave.width, this.waveIndex[i].signal.type);
                }
            }
        }
    };

    this.updateMarkerValue = function (i, value, width, type) {
        var bitsInRegion = this.radix === 'hex' ? this.HEX_BITS_IN_VALUE_REGION : this.CHARS_IN_VALUE_REGION,
            fullValue = value;
        if (type && type === 'real' && value.length > this.CHARS_IN_VALUE_REGION) {
            value = fullValue.substring(fullValue.length - this.CHARS_IN_VALUE_REGION);
        } else if (width > 1 && width <= bitsInRegion) {
            value = this.getBusValue(value, width);
            fullValue = value;
        } else if (width > bitsInRegion) {
            // trim
            fullValue = this.getBusValue(value, width);
            value = fullValue.substring(fullValue.length - this.CHARS_IN_VALUE_REGION);
        }
                $('#value_' + i).contents().eq(1).wrap('<p />').parent().text(value).contents().unwrap();
                $('#value_' + i + ' > title').text(fullValue);
    };

    /**
     * Set the time using the position inside the image.
     */
    this.setMarkerByPosition = function (position, cursorNumber) {
        var time = null;
        if (position >= this.textRegionWidth) {
            time = this.getTimeFromPosition(position);
            this.setMarkerByTime(time, cursorNumber);
        } else {
            lineElement.hide();
        }
        this.setCursorTime(time, cursorNumber);
    };

    this.getTimeFromPosition = function (position) {
        return Math.round(((position - this.textRegionWidth) * this.timePerPixel).toFixed(2)) + this.currentStart;
    };

    /**
     * Set the time marker using the simulation time.
     */
    this.setMarkerByTime = function (time, cursorNumber) {
        //saving cursor
        this.saveCursor(time, cursorNumber);
        var lineElement = $('.verticalLine' + cursorNumber, this.element);
        if (isNumber(time) && this.currentStart <= time && time <= this.currentEnd) {
            var position = Math.round(((time - this.currentStart) / this.timePerPixel + this.textRegionWidth).toFixed(2));
            $('line', lineElement).attr({'x1': position, 'x2': position});
            lineElement.css("display", "block");
        }
        if(time!=null &&!isNaN(time) && cursorNumber!=null && !isNaN(cursorNumber)) {
            this.setCursorTime(time, cursorNumber);
        }
        this.updateMarkerValues();
    };

    this.saveCursor = function (time, cursorNumber) {
        if (cursorNumber == 2) {
            localStorage.setItem('cursor2Time', time);
        } else {
            localStorage.setItem('cursorTime', time);
        }
    }

    this.setCursorTime = function (t, cursorNumber) {
        const cT  = parseInt(localStorage.getItem(this.CURSOR_TIME_KEY))
        const cT2 = parseInt(localStorage.getItem(this.CURSOR_2_TIME_KEY))
        let time;
        if (cursorNumber == 2) {
            this.cursor2Time = cT2;
            time=cT2
        } else {
            this.cursorTime = cT;
            time = cT
        }
        var otherTime = cursorNumber == 2 ? this.cursorTime : this.cursor2Time;

        var displayingDelta = isNumber(time) && isNumber(otherTime);

        if (displayingDelta) {
            time = Math.abs(time - otherTime);
        }

        if (this.elementCursorTime) {
            var disabled = !isNumber(time);
            time = disabled ? '-' : (this.numberWithCommas(time * this.waves.timescale.number) + this.waves.timescale.unit);
            this.elementCursorTime.html(
                '<i class="cursorTimeArrow fa fa-location-arrow"></i> '
                + (displayingDelta ? 'Δ ' : '') + time);
            if (disabled) {
                this.elementCursorTime.addClass('disabled');
            } else {
                this.elementCursorTime.removeClass('disabled');
            }
        }
    };

    this.highlightWaveName = function (positionY) {
        var waveNumber = Math.floor(positionY / this.ELEMENT_HEIGHT);
        for(var i = 0; i < this.waveIndex.length; i++) {
            let maxNumberOfBits = this.getMaxNumberOfBits(this.waves.vars[this.waveIndex[i].id].data);
            if (this.waveIndex[i].expanded == true) {
                if(waveNumber <= i + maxNumberOfBits && waveNumber > i ){
                    waveNumber = null;
                }
                else if(waveNumber>i+1){
                    waveNumber -= maxNumberOfBits;
                }
            }
        }
        if (this.ctrlPressed) {
            this.toggleSelectedWave(waveNumber);
        } else if (this.shiftPressed) {
            // this.toggleSelectedWave(waveNumber);
            this.handleShiftClick(waveNumber);
        } else {
            this.lastSelectedWaveIndex = waveNumber;
            this.selectedWaveIndices = [];
            this.selectedWaveIndices.push(waveNumber);
            this.startIndex = this.lastSelectedWaveIndex;
            var rect = $('.waveName' + waveNumber);
            var color = rect.css('fill');
            $('.waveName').css('fill', 'black');
            if (color === 'rgb(0, 0, 0)' || color === '#000000' || color === 'black') {
                this.fillWaveName(rect, waveNumber);
            } else {
                rect.css('fill', 'black');
                this.hideWaveNameFeatures();
            }
        }
    };

    this.toggleSelectedWave = function (waveNumber) {
        // Toggle the selected state of the wave
        if (this.selectedWaveIndices.includes(waveNumber)) {
            // Deselect
            this.selectedWaveIndices = this.selectedWaveIndices.filter(index => index !== waveNumber);
            if(!this.selectedWaveIndices.length){
                this.lastSelectedWaveIndex = null;
                this.startIndex =null;
            }
        } else {
            // Select
            this.selectedWaveIndices.push(waveNumber);
        }

        // Highlight the selected waves
        this.highlightSelectedWaves();
    };


    this.hideWaveNameFeatures = function () {
        this.selectedWaveIndex = null;
        this.selectedWaveIndices = [];
        this.lastSelectedWaveIndex = null;
        this.elementRemoveWave.addClass('disabled');
        this.elementUpWave.addClass('disabled');
        this.elementDownWave.addClass('disabled');
        $('.fullSignalWell').hide();
    };

    this.fillWaveName = function (element, waveNumber) {
        this.selectedWaveIndex = waveNumber;
        this.elementRemoveWave.removeClass('disabled');
        if (waveNumber) {
            this.elementUpWave.removeClass('disabled');
        } else {
            this.elementUpWave.addClass('disabled');
        }
        if (waveNumber < this.waveIndex.length - 1) {
            this.elementDownWave.removeClass('disabled');
        } else {
            this.elementDownWave.addClass('disabled');
        }
        element.css('fill', 'blue');
        $('#fullSignalName').text(this.waveIndex[waveNumber].signal.scope + '/' + this.waveIndex[waveNumber].signal.name);
        $('.fullSignalWell').show();
    };


    this.removeSelectedWave = function () {
        if (this.selectedWaveIndices.length > 0) {
            // Sort selected indices in descending order to avoid issues with array shifting
            var sortedIndices = this.selectedWaveIndices.slice().sort((a, b) => b - a);

            for (const index of sortedIndices) {
                this.waveIndex.splice(index, 1);
            }
            this.selectedWaveIndices = [];
            this.lastSelectedWaveIndex = null;
            this.hideWaveNameFeatures();
        } else {
            if (isNumber(this.selectedWaveIndex)) {
                this.waveIndex.splice(this.selectedWaveIndex, 1);
                this.selectedWaveIndex = null;
                this.hideWaveNameFeatures();
            }
        }
        localStorage.setItem($('#type_playground').attr('href'), JSON.stringify(epWave.waveIndex));
        this.selectedWaveIndex = null;
        this.lastSelectedWaveIndex = null;
        this.selectedWaveIndices = [];
        this.refreshSvg();
    };

    this.upSelectedWave = function () {
        if (this.selectedWaveIndices.length === 0 && isNumber(this.selectedWaveIndex)) {
            // Single wave selected
            if (this.selectedWaveIndex > 0) {
                var temp = this.waveIndex[this.selectedWaveIndex];
                this.waveIndex[this.selectedWaveIndex] = this.waveIndex[this.selectedWaveIndex - 1];
                this.waveIndex[this.selectedWaveIndex - 1] = temp;
                this.selectedWaveIndex--;
            }
        } else if (this.selectedWaveIndices.length > 0) {
            this.selectedWaveIndices.sort(function (a, b) {
                return a - b;
            });
            for (var i = 0; i < this.selectedWaveIndices.length; i++) {
                var currentIndex = this.selectedWaveIndices[i];

                if (currentIndex > 0) {
                    var temp = this.waveIndex[currentIndex];
                    this.waveIndex[currentIndex] = this.waveIndex[currentIndex - 1];
                    this.waveIndex[currentIndex - 1] = temp;
                }
            }
            this.selectedWaveIndices = this.selectedWaveIndices.map(function (index) {
                return index - 1;
            });
        }
        this.hideWaveNameFeatures();
        this.lastSelectedWaveIndex = null;
        this.selectedWaveIndices = [];
        this.refreshSvg();
    };

    this.downSelectedWave = function () {
        if (this.selectedWaveIndices.length === 0 && isNumber(this.selectedWaveIndex) && this.selectedWaveIndex < this.waveIndex.length - 1) {
            // Single wave selected
            var temp = this.waveIndex[this.selectedWaveIndex];
            this.waveIndex[this.selectedWaveIndex] = this.waveIndex[this.selectedWaveIndex + 1];
            this.waveIndex[this.selectedWaveIndex + 1] = temp;
            this.selectedWaveIndex++;
        } else if (this.selectedWaveIndices.length > 0) {
            // Multiple waves selected
            this.selectedWaveIndices.sort(function (a, b) {
                return b - a;
            });

            for (var i = 0; i < this.selectedWaveIndices.length; i++) {
                var currentIndex = this.selectedWaveIndices[i];

                if (currentIndex < this.waveIndex.length - 1) {
                    var temp = this.waveIndex[currentIndex];
                    this.waveIndex[currentIndex] = this.waveIndex[currentIndex + 1];
                    this.waveIndex[currentIndex + 1] = temp;
                }
            }

            this.selectedWaveIndices = this.selectedWaveIndices.map(function (index) {
                return index + 1;
            });
        }
        this.hideWaveNameFeatures();
        this.lastSelectedWaveIndex = null;
        this.selectedWaveIndices = [];
        this.refreshSvg();
    };


    this.refreshSvg = function (windowWidth) {
        if (windowWidth) {
            this.windowWidth = windowWidth;
        }
        this.createSvg(this.currentStart, this.currentEnd);
        this.setMarkerByTime(this.cursorTime, 1);
        this.setMarkerByTime(this.cursor2Time, 2);
    };

    this.populateStartEnd = function () {
        this.elementStart.val(this.numberWithCommas(this.waves.start * this.waves.timescale.number) + this.waves.timescale.unit);
        this.elementEnd.val(this.numberWithCommas(this.waves.end * this.waves.timescale.number) + this.waves.timescale.unit);
    };

    this.populateSignalSelects = function (elementScopeSelect, elementNameSelect,
                                           elementAppendSelected, elementAppendAll) {
        var key = null,
            scopeSet = {},
            names = {},
            scope = null, i;
        for (key in this.waves.vars) {
            if (this.waves.vars.hasOwnProperty(key)) {
                for (i = 0; i < this.waves.vars[key].signals.length; i++) {
                    scope = this.waves.vars[key].signals[i].scope;
                    scopeSet[scope] = true;
                    if (!names[scope]) {
                        names[scope] = [];
                    }
                    names[scope].push(this.waves.vars[key].signals[i].name);
                }
            }
        }
        for (key in names) {
            if (names.hasOwnProperty(key)) {
                names[key].sort();
            }
        }
        var scopeArray = [];
        for (scope in scopeSet) {
            if (scopeSet.hasOwnProperty(scope)) {
                scopeArray.push(scope);
            }
        }
        scopeArray.sort();
        elementNameSelect.empty();
        this.populateScopeSelects(scopeArray, elementScopeSelect);
        this.bindSignalSelects(names, elementScopeSelect, elementNameSelect, elementAppendSelected, elementAppendAll);
    };

    this.populateScopeSelects = function (scopeArray, elementScopeSelect) {
        var currentScope = [];
        elementScopeSelect.empty();
        for (var i = 0; i < scopeArray.length; i++) {
            var text = scopeArray[i];
            if (currentScope.length) {
                for (var j = currentScope.length - 1; j >= 0; j--) {
                    var loc = text.search('^' + currentScope[j] + '/');
                    if (loc !== -1) {

                        var tempText = '';
                        for (var k = 0; k <= j; k++) {
                            tempText += '.';
                        }
                        text = tempText + text.slice(currentScope[j].length + 1, text.length);
                        break;
                    }
                    currentScope.pop();
                }
            }
            elementScopeSelect.append($("<option></option").attr("value", scopeArray[i])
                .attr("title", scopeArray[i]).text(text));
            currentScope.push(scopeArray[i]);
        }
    };

    this.bindSignalSelects = function (names, elementScopeSelect, elementNameSelect,
                                       elementAppendSelected, elementAppendAll) {
        elementScopeSelect.unbind();
        elementScopeSelect.change({names: names, elementNameSelect: elementNameSelect}, function (event) {
            elementNameSelect.empty();
            var scope = $('option:selected', this).val();
            for (var i = 0; i < event.data.names[scope].length; i++) {
                var name = event.data.names[scope][i];
                elementNameSelect.append($("<option></option").attr("value", name)
                    .attr("title", name).text(name));
            }
        });
        elementNameSelect.unbind();
        elementNameSelect.dblclick({epWave: this, elementScopeSelect: elementScopeSelect}, function (event) {
            var nameArray = [];
            nameArray.push($('option:selected', this).val());
            event.data.epWave.appendWaves($('option:selected', event.data.elementScopeSelect).val(), nameArray);
        });
        elementAppendSelected.unbind();
        elementAppendSelected.click({
            epWave: this, elementScopeSelect: elementScopeSelect,
            elementNameSelect: elementNameSelect
        }, function (event) {
            var nameArray = [];
            var selectedElements = $('option:selected', event.data.elementNameSelect);
            for (var i = 0; i < selectedElements.length; i++) {
                nameArray.push(selectedElements.eq(i).val());
            }
            event.data.epWave.appendWaves($('option:selected', event.data.elementScopeSelect).val(), nameArray);
        });
        elementAppendAll.unbind();
        elementAppendAll.click({
            epWave: this, elementScopeSelect: elementScopeSelect,
            elementNameSelect: elementNameSelect
        }, function (event) {
            var nameArray = [];
            var selectedElements = $('option', event.data.elementNameSelect);
            for (var i = 0; i < selectedElements.length; i++) {
                nameArray.push(selectedElements.eq(i).val());
            }
            event.data.epWave.appendWaves($('option:selected', event.data.elementScopeSelect).val(), nameArray);
        });
    };

    this.appendWaves = function (scope, nameArray) {
        var found = {count: 0};
        var waveIndexLength = this.waveIndex.length;
        for (var key in this.waves.vars) {
            if (this.waves.vars.hasOwnProperty(key)) {
                for (var i = 0; i < this.waves.vars[key].signals.length && found.count !== nameArray.length; i++) {
                    this.findSignalsForAppend(key, i, scope, nameArray, waveIndexLength, found);
                }
            }
        }
        localStorage.setItem($('#type_playground').attr('href'), JSON.stringify(epWave.waveIndex));
        this.refreshSvg();
    };

    this.findSignalsForAppend = function (key, i, scope, nameArray, waveIndexLength, found) {
        var signal = this.waves.vars[key].signals[i];
        if (scope === signal.scope) {
            for (var k = 0; k < nameArray.length && found.count !== nameArray.length; k++) {
                if (nameArray[k] === signal.name) {
                    this.waveIndex[waveIndexLength + k] = ({
                        id: key,
                        signal: signal
                    });
                    found.count++;
                    break;
                }
            }
        }
    };

    // this.createDefaultIndex = function () {
    //     // First empty existing index
    //     this.waveIndex = [];
    //     // Now create a new one in default order
    //     for (var key in this.waves.vars) {
    //         if (this.waves.vars.hasOwnProperty(key)) {
    //             this.waveIndex.push({
    //                 id: key,
    //                 signal: this.waves.vars[key].signals[0]
    //             });
    //         }
    //     }
    // };

    this.reloadIndex = function () {
        // this.loadCursor();
        if (this.waveIndex.length) {
            // index already exists, so we need to scrub it
            this.scrubCurrentIndex();
        }
        if (!this.waveIndex.length) {
            // Create an index if there are only a few signals
            var numberOfSignals = 0,
                key = null,
                useDefaultIndex = true;
            for (key in this.waves.vars) {
                if (this.waves.vars.hasOwnProperty(key)) {
                    for (var i = 0; i < this.waves.vars[key].signals.length; i++) {
                        this.waveIndex.push({
                            id: key,
                            signal: this.waves.vars[key].signals[i]
                        });
                        if (++numberOfSignals > this.MAX_SIGNALS_FOR_DEFAULT_INDEX) {
                            useDefaultIndex = false;
                            break;
                        }
                    }
                    if (!useDefaultIndex) {
                        break;
                    }
                }
            }
            //If there's too many signals to display all then either use previously selected or display message
            if (!useDefaultIndex) {
                this.waveIndex = [];
                this.selectedWaveIndex = null;
                this.selectedWaveIndices = [];
                this.lastSelectedWaveIndex = null;
                var previouslySelectedSignals = localStorage.getItem($('#type_playground').attr('href'));

                if (previouslySelectedSignals) {
                    signalsObject = JSON.parse(previouslySelectedSignals);
                    //append previously selected singals
                    for (var j = 0; j < signalsObject.length; j++) {
                        var signalObj = signalsObject[j];
                        if(!(_.isEmpty(signalObj))) {
                            epWave.appendWaves(signalObj.signal.scope, [signalObj.signal.name]);
                        }
                    }

                } else {
                    $('#loadDoneModal').modal();
                }

            } else {
                // Sort by scope/name
                this.waveIndex.sort(sortBy('signal', true, function (signal) {
                    return signal.scope.toLowerCase() + '.' + signal.name.toLowerCase();
                }));
            }
        }
    };

    this.loadCursor = function() {
        const cT  = parseInt(localStorage.getItem(this.CURSOR_TIME_KEY))
        const cT2 = parseInt(localStorage.getItem(this.CURSOR_2_TIME_KEY))
        if( cT!= null && !isNaN(cT)) {
            let time =cT;
            epWave.setMarkerByTime(time, 1);
            this.setCursorTime(time, 1);
        }
        if(cT2 != null && !isNaN(cT2)) {
            let time =cT2;
            epWave.setMarkerByTime(time, 2);
            this.setCursorTime(time, 2);
        }
    }

    this.scrubCurrentIndex = function () {
        var newWaveIndex = [];
        // Count the total number of signals
        for (var i = 0; i < this.waveIndex.length; i++) {
            var item = this.waveIndex[i],
                itemExists = false;
            if (this.waves.vars[item.id]) {
                for (var j = 0; j < this.waves.vars[item.id].signals.length; j++) {
                    var signal = this.waves.vars[item.id].signals[j];
                    if (signal.name === item.signal.name && signal.scope === item.signal.scope) {
                        itemExists = true;
                        break;
                    }
                }
            }
            if (itemExists) {
                newWaveIndex.push(item);
            }
        }
        this.waveIndex = newWaveIndex;
        // Show pop-up when loading some signals but not all
        if (this.waveIndex.length && this.waveIndex.length < this.getTotalSignalCount()) {
            $('#loadDoneModal').modal();
        }
        this.selectedWaveIndex = null;
        this.selectedWaveIndices = [];
        this.lastSelectedWaveIndex = null;
    };

    this.getTotalSignalCount = function () {
        var totalCount = 0;
        for (var key in this.waves.vars) {
            if (this.waves.vars.hasOwnProperty(key)) {
                totalCount += this.waves.vars[key].signals.length;
            }
        }
        return totalCount;
    };

    this.createSvg = function (start, end) {
        start = start ? start : this.waves.start;
        end = end ? end : this.waves.end;
        this.currentStart = start;
        this.currentEnd = end;
        var totalTime = end - start,
            i;
        if (!this.windowWidth) {
            this.windowWidth = $(window).width() - 20;
        }

        // Get the text region width
        // TODO: Should not call this if there is no changes to which variables are displayed
        var longestName = 1;
        var varsLength = this.waveIndex.length;
        for (i = 0; i < this.waveIndex.length; i++) {
            var length = this.waveIndex[i].signal.name.length;
            if (length > longestName) {
                longestName = length;
            }
        }
        // var textWidth = longestName * this.CHARACTER_WIDTH;
        // if (textWidth > this.windowWidth / 2) {
        //     textWidth = this.windowWidth / 2;
        // }
        var maxAllowedWidth = this.windowWidth / 2;
        var minAllowedWidth = 45;
        var textWidth = Math.min(longestName * this.CHARACTER_WIDTH, maxAllowedWidth);
        if(textWidth < minAllowedWidth){
            textWidth = minAllowedWidth;
        }
        this.textRegionWidth = textWidth + this.VALUE_REGION_WIDTH + 10;

        var totalWavesWidth = this.windowWidth - this.textRegionWidth,
            totalTimeWidth = totalWavesWidth / totalTime;
        this.timePerPixel = totalTime / totalWavesWidth;
        this.numberOfRows = varsLength;
        this.svgHeight = this.calculateSVGHeight(varsLength); //this.ELEMENT_HEIGHT * (varsLength + 200);
        var svg = '<svg id="main-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ' +
            'version="1.1" width="' + this.windowWidth + '" height="' + this.svgHeight + '">' +
            '<defs>' +
            '<g id="b"><rect width="1" height="20" style="fill:rgb(0,0,0);stroke-width:0"></rect></g>' +
            '<g id="gray"><rect width="1" height="20" style="fill:DimGray;stroke-width:0"></rect></g>' +
            '<g id="zero"><line x1="0" y1="18" x2="1" y2="18" style="stroke:aqua; stroke-width:1"/></g>' +
            '<g id="one"><line x1="0" y1="2" x2="1" y2="2" style="stroke:limeGreen; stroke-width:1"/></g>' +
            '<g id="z"><line x1="0" y1="10" x2="1" y2="10" style="stroke:Peru; stroke-width:1"/></g>' +
            '<g id="x"><rect y="2" width="1" height="16" style="fill:#722232;stroke-width:0"/>' +
            '<line x1="0" y1="2" x2="1" y2="2" style="stroke:Crimson; stroke-width:1"/>' +
            '<line x1="0" y1="18" x2="1" y2="18" style="stroke:Crimson; stroke-width:1"/></g>' +
            '<g id="xEdge"><line x1="0" y1="18" x2="0" y2="2" style="stroke:Crimson; stroke-width:1"/></g>' +
            '<g id="risingEdge"><line x1="0" y1="18" x2="0" y2="2" style="stroke:limeGreen; stroke-width:1"/></g>' +
            '<g id="zeroToZ"><line x1="0" y1="18" x2="0" y2="10" style="stroke:limeGreen; stroke-width:1"/></g>' +
            '<g id="ZToOne"><line x1="0" y1="10" x2="0" y2="2" style="stroke:limeGreen; stroke-width:1"/></g>' +
            '<g id="fallingEdge"><line x1="0" y1="2" x2="0" y2="18" style="stroke:aqua; stroke-width:1"/></g>' +
            '<g id="oneToZ"><line x1="0" y1="2" x2="0" y2="10" style="stroke:aqua; stroke-width:1"/></g>' +
            '<g id="ZToZero"><line x1="0" y1="10" x2="0" y2="18" style="stroke:aqua; stroke-width:1"/></g>' +
            '<g id="bus"><line x1="0" y1="18" x2="1" y2="18" style="stroke:bisque; stroke-width:1"/>' +
            '<line x1="0" y1="2" x2="1" y2="2" style="stroke:bisque; stroke-width:1"/></g>' +
            '<g id="busChange"><line x1="0" y1="18" x2="3" y2="2" style="stroke:bisque; stroke-width:1"/>' +
            '<line x1="0" y1="2" x2="3" y2="18" style="stroke:bisque; stroke-width:1"/></g>' +
            '<g id="majorMark"><line x1="0" y1="18" x2="0" y2="0" style="stroke:yellow; stroke-width:1"/></g>' +
            '<g id="minorMark"><line x1="0" y1="18" x2="0" y2="12" style="stroke:yellow; stroke-width:1"/></g>' +
            '<g id="yellowLine"><line x1="0" y1="18" x2="1" y2="18" style="stroke:yellow; stroke-width:1"/></g>' +
            '<pattern id="oneZeroPattern" patternUnits="userSpaceOnUse" width="2" height="18">' +
            '<line x1="1" y1="18" x2="1" y2="2" style="stroke:limeGreen; stroke-width:1"/>' +
            '<line x1="2" y1="18" x2="2" y2="2" style="stroke:aqua; stroke-width:1"/></pattern>' +
            '<pattern id="oneZeroPatternChrome" patternUnits="userSpaceOnUse" width="2" height="18">' +
            '<line x1="0" y1="18" x2="0" y2="2" style="stroke:limeGreen; stroke-width:1"/>' +
            '<line x1="1" y1="18" x2="1" y2="2" style="stroke:aqua; stroke-width:1"/></pattern>' +
            '</defs>';

        // Create ruler
        svg += this.createSvgRuler(totalTimeWidth, totalWavesWidth);

        // Draw the waves
        svg += this.createSvgWaves(textWidth, totalWavesWidth, totalTimeWidth);

        // Placeholders for vertical lines
        svg += '<g class="verticalLine1" style="display:none;" transform="translate(0,0)">';
        svg += '<line id="line-1" x1="100" y1="0" x2="100" y2="' + this.svgHeight + '"/></g>';
        svg += '<g class="verticalLine2" style="display:none;" transform="translate(0,0)">';
        svg += '<line id="line-2" x1="100" y1="0" x2="100" y2="' + this.svgHeight + '"/></g>';

        svg += '</svg>';
        element.html(svg);
        this.loadCursor();
        this.setSVGHeight(this.calculateSVGHeight(this.numberOfRows));
        if (isNumber(this.selectedWaveIndex)) {
            this.fillWaveName($('.waveName' + this.selectedWaveIndex), this.selectedWaveIndex);
        } else if (this.lastSelectedWaveIndex) {
            this.fillWaveName($('.waveName' + this.lastSelectedWaveIndex), this.lastSelectedWaveIndex);
        }
    };

    /**
     * Increase SVG Height
     */
    this.increaseSVGHeight = function (numberOfRowsToIncrease) {
        this.numberOfRows = this.numberOfRows + numberOfRowsToIncrease;
        let height = this.calculateSVGHeight(this.numberOfRows);
        this.setSVGHeight(height);
    }

    /**
     * Decrease SVG Height
     */
    this.decreaseSVGHeight = function (numberOfRowsToDecrease) {
        this.numberOfRows = this.numberOfRows - numberOfRowsToDecrease;
        if (numberOfRows < 0) {
            numberOfRows = 0;
        }
        let height = this.calculateSVGHeight(numberOfRows);
        this.setSVGHeight(height);
    }

    /**
     * Set SVG Height
     */
    this.setSVGHeight = function (height) {
        $('#main-svg').height(height);
        $('#line-1').attr('y2', height);
        $('#line-2').attr('y2', height);

    }

    /**
     * Calculate SVG Height
     */
    this.calculateSVGHeight = function (numberOfRows) {
        return this.ELEMENT_HEIGHT * (numberOfRows + 1)  //1
    }

    /**
     * Draw the ruler for SVG.
     */
    this.createSvgRuler = function (totalTimeWidth, totalWavesWidth) {
        var start = this.currentStart,
            end = this.currentEnd,
            interval = this.getInterval(totalWavesWidth, start, end),
            minorInterval = interval / 10,
            lastLocation = 0,
            lastLocationRound,
            currentLocationRound,
            lastTime,
            time,
            currentLocation,
            svg = '';
        svg += '<g transform="translate(0,0)">';
        svg += '<use xlink:href="#gray" transform="scale(' + this.windowWidth + ',1)"/>';
        svg += '<g transform="translate(' + this.textRegionWidth + ',0)">';
        svg += '<use xlink:href="#yellowLine" transform="scale(' + totalWavesWidth + ',1)"/>';
        if (start % interval === 0) {
            lastLocation = 0;
            svg += '<use xlink:href="#majorMark" transform="translate(' + lastLocation + ')"/>';
            svg += '<text class="time" x="1" y="12">' + this.numberWithCommas(start * this.waves.timescale.number) + '</text>';
            lastTime = start;
        } else if (start % minorInterval === 0) {
            lastLocation = 0;
            svg += '<use xlink:href="#minorMark" transform="translate(' + lastLocation + ')"/>';
            lastTime = start;
        } else {
            time = minorInterval * Math.ceil(start / minorInterval);
            lastLocation = totalTimeWidth * (time - start);
            lastLocationRound = Math.round(lastLocation.toFixed(2));
            if (time % interval === 0) {
                svg += '<use xlink:href="#majorMark" transform="translate(' + lastLocationRound + ')"/>';
                svg += '<text class="time" x="1" y="12" transform="translate(' + lastLocationRound +
                    ')">' + this.numberWithCommas(time * this.waves.timescale.number) + '</text>';
            } else {
                svg += '<use xlink:href="#minorMark" transform="translate(' + lastLocationRound + ')"/>';
            }
            lastTime = time;
        }
        time = lastTime + minorInterval;
        var distance = totalTimeWidth * minorInterval;
        do {
            currentLocation = lastLocation + distance;
            currentLocationRound = Math.round(currentLocation.toFixed(2));
            var nextTime = time + minorInterval;
            if (time % interval === 0) {
                svg += '<use xlink:href="#majorMark" transform="translate(' + currentLocationRound + ')"/>';
                if (nextTime <= end) {
                    svg += '<text class="time" x="1" y="12" transform="translate(' + currentLocationRound + ')">' +
                        this.numberWithCommas(time * this.waves.timescale.number) + '</text>';
                }
            } else {
                svg += '<use xlink:href="#minorMark" transform="translate(' + currentLocationRound + ')"/>';
            }
            lastLocation = currentLocation;
            time = nextTime;
        } while (time <= end);
        return svg + '</g></g>';
    };

    this. createSvgWaves = (textWidth, totalWavesWidth, totalTimeWidth) => {
        var blockTimeChangeLimit = 1.2 * this.timePerPixel,
            svg = '';
        let svgYIndex = 0;
        for (var i = 0; i < this.waveIndex.length; i++) {
            var key = this.waveIndex[i].id;
            svg += '<g transform="translate(0,' + (svgYIndex+1)*this.ELEMENT_HEIGHT + ')">';
            svg += '<use xlink:href="#b" transform="scale(' + this.windowWidth + ',1)"/>';
            if (this.waves.vars[key].width > 1) {
                // svg += '<rect class="toggleWaveButton" x="3" y="' + 5 + '" width="10" height="' + this.ELEMENT_HEIGHT +
                //     '" style="fill: lightgray; stroke: darkgray; stroke-width: 1; cursor: pointer; content: +" ' +
                //     'onclick="toggleBusExpansion(' + i + ')"' + '></rect>';
                if (this.waveIndex[i].expanded){
                    svg += '<svg xmlns="http://www.w3.org/2000/svg" x="3" y="0" width="15" height="' + this.ELEMENT_HEIGHT + '" viewBox="0 0 30 30">' +
                        '<path class="toggleWaveButton" d="M15,3C8.373,3,3,8.373,3,15c0,6.627,5.373,12,12,12s12-5.373,12-12C27,8.373,21.627,3,15,3z M21,16h-10c-0.552,0-1-0.447-1-1s0.448-1,1-1h10c0.552,0,1,0.447,1,1S21.552,16,21,16z" style="fill: lightgray; stroke: darkgray; stroke-width: 1; cursor: pointer;" onclick="toggleBusExpansion(' + i + ')"></path>' +
                        '</svg>';
                } else {
                    svg += '<svg xmlns="http://www.w3.org/2000/svg" x="3" y="0" width="15" height="' + this.ELEMENT_HEIGHT + '" + viewBox="0 0 30 30">' +
                        '<path class="toggleWaveButton" d="M15,3C8.373,3,3,8.373,3,15c0,6.627,5.373,12,12,12s12-5.373,12-12C27,8.373,21.627,3,15,3z M21,16h-5v5 c0,0.553-0.448,1-1,1s-1-0.447-1-1v-5H9c-0.552,0-1-0.447-1-1s0.448-1,1-1h5V9c0-0.553,0.448-1,1-1s1,0.447,1,1v5h5 c0.552,0,1,0.447,1,1S21.552,16,21,16z" style="fill: lightgray; stroke: darkgray; stroke-width: 1; cursor: pointer;" onclick="toggleBusExpansion(' + i + ')"></path>' +
                        '</svg>';
                }
            }

            svg += '<rect class="waveName waveName' + i + '" width="1" height="' + this.ELEMENT_HEIGHT +
                '" style="fill:black;stroke-width:0" x="0.4" transform="scale(' + textWidth + ',1)"></rect>';
            svg += '<text class="name" x="' + (textWidth + 10) + '" y="15" text-anchor="end"><title>' +
                this.waveIndex[i].signal.scope + '/' + this.waveIndex[i].signal.name + '</title>' +
                this.waveIndex[i].signal.name + '</text>';
            svg += '<text id="value_' + i + '" class="value" x="' +
                (this.VALUE_REGION_WIDTH - 4) + '" y="15" ' +
                'transform="translate(' + (textWidth + 5) + ')" text-anchor="end"><title></title> </text>';
            svg += '<g transform="translate(' + this.textRegionWidth + ',0)">';
            var data = this.waves.vars[key].data;
            // Only consider real, single bit, and a bus; zero width signal is empty
            if (this.waveIndex[i].signal.type === 'real') {
                svg += this.busToSvg(data, 0, totalTimeWidth);
            } else if (this.waves.vars[key].width === 1) {
                // Single bit
                svg += this.bitToSvg(data, blockTimeChangeLimit, totalWavesWidth, totalTimeWidth);
            } else if (this.waves.vars[key].width !== 0) {
                svg += this.busToSvg(data, this.waves.vars[key].width, totalTimeWidth);
                //expanding multiple bits
                if (this.waveIndex[i].expanded == true && Object.keys(data).length !==0) { // i == 2
                    svg += '</g>';

                    let labelIndexStart = Number(this.waveIndex[i].signal.name.match(/\[(\d+):/)?.[1]);
                    let labelIndexEnd = Number(this.waveIndex[i].signal.name.match(/\[\d+:(\d+)\]/)?.[1]);

                    let maxNumberOfBits = this.getMaxNumberOfBits(data);

                    let decrement = false;

                    if(labelIndexStart > labelIndexEnd) {
                        decrement = true;
                    }

                    if(isNumber(labelIndexStart)) {
                        if(decrement) {
                            maxNumberOfBits = labelIndexStart - labelIndexEnd + 1;
                        }
                        else {
                            maxNumberOfBits = labelIndexEnd - labelIndexStart + 1;
                        }
                    }

                    //increasing rows number when more rows need to render
                    this.numberOfRows += maxNumberOfBits;
                    svgYIndex += maxNumberOfBits;
                    let expandedData = this.createExpandedData(data, maxNumberOfBits);
                    let labelIndex = expandedData.length - 1;

                    if(isNumber(labelIndexStart)) {
                        labelIndex = labelIndexStart
                    }


                    for (let j = 0; j < expandedData.length; ++j) {
                        svg += this.createExpandedSvgWaves(textWidth, totalWavesWidth, totalTimeWidth, expandedData[j], j, maxNumberOfBits, labelIndex);
                        if(decrement) {
                            labelIndex -= 1;
                        }
                        else {
                            labelIndex += 1;
                        }
                    }
                }
            }
            svg += '</g></g>';
            ++svgYIndex;
        }
        return svg;
    };

    this.createExpandedData = (data, maxNumberOfBits) => {
        /*
        {
            0: "xxxxx"
            100: "0011"
            200: "0101"
            300: "1011"
            400: "1101"
            500: "XXXX"
        }
         */
        let expandedData = [];

        //prepending 0 if data[j] has bits less than maxNumberOfBits
        for (const key in data) {
            let binaryDataString = data[key] + "";
            binaryDataString = binaryDataString.padStart(maxNumberOfBits, "0");
            data[key] = binaryDataString;
        }

        for (let i = 0; i < maxNumberOfBits; ++i) {
            for (const key in data) {
                //let binaryDataString = data[j] + "";
                if (!expandedData[i]) {
                    expandedData[i] = {};
                }
                expandedData[i][key] = data[key][i];

            }
        }

        return expandedData;

    }

    this.getMaxNumberOfBits = (data) => {
        let maxNumberOfBits = 1;
        for (const key in data) {
            var length = (data[key] + "").length;
            if (length > maxNumberOfBits) {
                maxNumberOfBits = length;
            }
        }
        return maxNumberOfBits;
    }


    this.createExpandedSvgWaves = (textWidth, totalWavesWidth, totalTimeWidth, data, index, busNumberOfBits = 8, labelIndex) => {
        var blockTimeChangeLimit = 1.2 * this.timePerPixel,
            svg = '';
        svg += '<g transform="translate(0,' + (index + 1) * this.ELEMENT_HEIGHT + ')">';
        svg += '<use xlink:href="#b" transform="scale(' + this.windowWidth + ',1)"/>';
        svg += '<rect class="bitName bitName' + index + '" width="1" height="' + this.ELEMENT_HEIGHT +
            '"></rect>';
        svg += '<text class="name" x="' + (textWidth + 6) + '" y="15" text-anchor="end"><title>' +
            "[" + labelIndex + "]" + '</title>' +
            "[" + labelIndex + "]" + '</text>';
        svg += '<text id="bitValue' + index + '" class="value" x="' +
            (this.VALUE_REGION_WIDTH - 4) + '" y="15" ' +
            'transform="translate(' + textWidth + ')" text-anchor="end"><title></title> </text>';
        svg += '<g transform="translate(' + this.textRegionWidth + ',0)">';

        svg += this.bitToSvg(data, blockTimeChangeLimit, totalWavesWidth, totalTimeWidth);
        //}
        svg += '</g></g>';
        //}
        return svg;
    };


// Add a function to toggle the bus expansion state
    window.toggleBusExpansion = (index) => {
        if (index >= 0 && index < this.waveIndex.length) {
            if (this.waveIndex[index].expanded !== undefined)
                this.waveIndex[index].expanded = !this.waveIndex[index].expanded;
            else {
                this.waveIndex[index].expanded = true;
            }
            this.refreshSvg();
        }
    };

    /**
     * Convert data for a single bit to SVG format.
     * @param data the wave data
     * @param blockTimeChangeLimit the time limit to use when drawing a block instead of lines
     * @param totalWavesWidth the number of pixels available for this wave
     * @param totalTimeWidth the number of pixels per time unit
     */
    this.bitToSvg = function (data, blockTimeChangeLimit, totalWavesWidth, totalTimeWidth) {
        var dto = {
            svg: '',
            start: this.currentStart,
            end: this.currentEnd,
            lastTime: this.currentStart,
            lastValue: '',
            lastLocation: 0,
            blockStart: 0,
            inBlock: false,
            time: 0
        };
        for (var time in data) {
            if (data.hasOwnProperty(time)) {
                // Convert time string to number
                dto.time = +time;
                if (dto.time < dto.lastTime) {
                    dto.lastValue = data[dto.time];
                } else {
                    if (dto.time > dto.end) {
                        break;
                    }
                    var value = data[dto.time];
                    if (dto.time !== dto.lastTime) {
                        this.bitToSvgProcessOneTime(value, dto, blockTimeChangeLimit, totalTimeWidth);
                    }
                    dto.lastValue = value;
                }
            }
        }
        var distanceRound;
        if (dto.inBlock) {
            // draw the block
            var currentLocationRound = Math.round(((dto.lastTime - this.currentStart) / this.timePerPixel).toFixed(2));
            distanceRound = currentLocationRound - dto.blockStart;
            dto.svg += '<rect x="' + dto.blockStart + '" y="1" width="' + distanceRound +
                '" height="18" fill="url(#oneZeroPattern' + (this.isChrome ? 'Chrome' : '') + ')"></rect>';
        }
        // Extend the last value to the end if needed
        if (dto.lastTime !== dto.end) {
            var lastLocationRound = Math.round(dto.lastLocation.toFixed(2));
            distanceRound = totalWavesWidth - lastLocationRound;
            dto.svg += '<use xlink:href="#' + this.getLastValueGroup(dto.lastValue) + '" transform="translate(' + lastLocationRound +
                ') scale(' + distanceRound + ',1)"/>';
        }
        return dto.svg;
    };

    this.bitToSvgProcessOneTime = function (value, dto, blockTimeChangeLimit, totalTimeWidth) {
        // We create a single SVG block if changes are too close together
        var timeChange = dto.time - dto.lastTime,
            isStart = dto.lastTime === dto.start,
            qualifiesForBlock = timeChange < blockTimeChangeLimit && !isStart && isZeroOrOne(value);
        if (dto.inBlock && qualifiesForBlock) {
            // Blocks keeps going
            dto.lastTime = dto.time;
        } else if (qualifiesForBlock && isZeroOrOne(dto.lastValue)) {
            dto.inBlock = true;
            dto.blockStart = Math.round(dto.lastLocation.toFixed(2));
            dto.lastTime = dto.time;
        } else {
            if (dto.inBlock) {
                // Draw the block to the last time
                dto.inBlock = false;
                dto.lastLocation = (dto.lastTime - this.currentStart) / this.timePerPixel;
                var lastLocationRound = Math.round(dto.lastLocation.toFixed(2)),
                    distanceRound = lastLocationRound - dto.blockStart;
                if (distanceRound > 0) {
                    dto.svg += '<rect x="' + dto.blockStart + '" y="1" width="' + distanceRound +
                        '" height="18" fill="url(#oneZeroPattern' + (this.isChrome ? 'Chrome' : '') + ')"></rect>';
                }
            }
            this.bitToSvgDraw(value, dto, isStart, totalTimeWidth, timeChange);
        }
    };

    function isZeroOrOne(value) {
        return value === 0 || value === 1;
    }

    this.bitToSvgDraw = function (value, dto, isStart, totalTimeWidth, timeChange) {
        var distance = totalTimeWidth * timeChange,
            currentLocation = dto.lastLocation + distance,
            currentLocationRound = Math.round(currentLocation.toFixed(2)),
            lastLocationRound = Math.round(dto.lastLocation.toFixed(2)),
            distanceRound = currentLocationRound - lastLocationRound;
        if (distanceRound > 0 || isStart) {
            if (distanceRound > 1) {
                if (this.isChrome) {
                    dto.svg += '<use xlink:href="#' + this.getLastValueGroup(dto.lastValue) + '" transform="translate(' +
                        (lastLocationRound + 1) + ') scale(' + distanceRound + ',1)"/>';
                } else {
                    dto.svg += '<use xlink:href="#' + this.getLastValueGroup(dto.lastValue) + '" transform="translate(' +
                        lastLocationRound + ') scale(' + distanceRound + ',1)"/>';
                }
            }
            var edge = this.getEdgeGroup(dto.lastValue, value);
            if (edge) {
                dto.svg += '<use xlink:href="#' + edge + '" transform="translate(' + currentLocationRound + ')"/>';
            }
            dto.lastLocation = currentLocation;
            dto.lastTime = dto.time;
        }
    };

    this.busToSvg = function (data, dataWidth, totalTimeWidth) {
        var start = this.currentStart,
            end = this.currentEnd,
            value,
            lastLocationRound,
            distanceRound,
            svg = '',
            dto = {
                time: null,
                lastTime: start,
                lastLocation: 0,
                lastValue: ''
            };
        for (var time in data) {
            if (data.hasOwnProperty(time)) {
                // Convert time string to number
                dto.time = +time;
                if (dto.time < dto.lastTime) {
                    dto.lastValue = data[dto.time];
                } else {
                    if (dto.time > end) {
                        break;
                    }
                    value = data[dto.time];
                    if (dto.time !== dto.lastTime) {
                        svg += this.busToSvgDraw(dto, dataWidth, totalTimeWidth);
                    }
                    dto.lastValue = value;
                }
            }
        }
        // Extend the last value to the end if needed
        if (dto.lastTime !== end) {
            lastLocationRound = Math.round(dto.lastLocation.toFixed(2));
            lastLocationRound = lastLocationRound ? lastLocationRound + 1 : lastLocationRound;
            distanceRound = this.windowWidth - lastLocationRound - this.textRegionWidth;
            svg += '<use xlink:href="#bus" transform="translate(' + lastLocationRound +
                ') scale(' + distanceRound + ',1)"/>';
            svg += this.getBusText(dto.lastValue, distanceRound, lastLocationRound, dataWidth);
        }
        return svg;
    };

    this.busToSvgDraw = function (dto, dataWidth, totalTimeWidth) {
        var distance = totalTimeWidth * (dto.time - dto.lastTime),
            currentLocation = dto.lastLocation + distance,
            currentLocationRound = Math.round(currentLocation.toFixed(2)),
            lastLocationRound = Math.round(dto.lastLocation.toFixed(2)),
            distanceRound = currentLocationRound - lastLocationRound - 2,
            svg = '';
        lastLocationRound = lastLocationRound ? lastLocationRound + 1 : lastLocationRound;
        if (distanceRound > 0) {
            if (distanceRound > 1) {
                if (this.isChrome) {
                    svg += '<use xlink:href="#bus" transform="translate(' +
                        (lastLocationRound + 1) + ') scale(' + distanceRound + ',1)"/>';
                } else {
                    svg += '<use xlink:href="#bus" transform="translate(' +
                        lastLocationRound + ') scale(' + distanceRound + ',1)"/>';
                }
                svg += this.getBusText(dto.lastValue, distanceRound, lastLocationRound, dataWidth);
            }
            if (this.isChrome) {
                svg += '<use xlink:href="#busChange" transform="translate(' + (currentLocationRound - 1) + ')"/>';
            } else {
                svg += '<use xlink:href="#busChange" transform="translate(' + (currentLocationRound - 2) + ')"/>';
            }
            dto.lastLocation = currentLocation;
            dto.lastTime = dto.time;
        }
        return svg;
    };

    this.getLastValueGroup = function (lastValue) {
        switch (lastValue) {
            case 0:
            case "0":
                return "zero";
            case 1:
            case "1":
                return "one";
            case "Z":
                return "z";
            default:
                return "x";
        }
    };

    this.getEdgeGroup = function (lastValue, currentValue) {
        if (currentValue === "X") {
            return "xEdge";
        }
        switch (lastValue) {
            case 0:
            case "0":
                return this.getZeroEdgeGroup(currentValue);
            case 1:
            case "1":
                return this.getOneEdgeGroup(currentValue);
            case "Z":
                return this.getZEdgeGroup(currentValue);
            case "X":
                return "xEdge";
            default:
                return '';
        }
    };

    this.getZeroEdgeGroup = function (currentValue) {
        if (currentValue === 1 || currentValue === "1") {
            return "risingEdge";
        } else if (currentValue === "Z") {
            return "zeroToZ";
        }
        return '';
    };

    this.getOneEdgeGroup = function (currentValue) {
        if (currentValue === 0 || currentValue === "0") {
            return "fallingEdge";
        } else if (currentValue === "Z") {
            return "oneToZ";
        }
        return '';
    };

    this.getZEdgeGroup = function (currentValue) {
        if (currentValue === 0 || currentValue === "0") {
            return "ZToZero";
        } else if (currentValue === 1 || currentValue === "1") {
            return "ZToOne";
        }
        return '';
    };

    this.getInterval = function (totalWidth, startTime, endTime) {
        var totalTime = endTime - startTime,
            numberTextWidth = this.numberWithCommas(endTime * this.waves.timescale.number).length * this.CHARACTER_WIDTH,
            minInterval = totalTime / (totalWidth / Math.max(numberTextWidth, this.MIN_PIXELS_BETWEEN_TENS)),
            multiplier = 1;
        while (minInterval > 50) {
            multiplier *= 10;
            minInterval /= 10;
        }
        if (minInterval <= 10) {
            return 10 * multiplier;
        } else if (minInterval <= 20) {
            return 20 * multiplier;
        } else if (minInterval <= 50) {
            return 50 * multiplier;
        }
    };

    /**
     * Get the value text that should show up for a bus value change.
     * @param value the bus value
     * @param distance the available space
     * @param location the location from where to display the text
     */
    this.getBusText = function (value, distance, location, width) {
        var radixValue = width ? this.getBusValue(value, width) : value;
        if(radixValue) {
            var trimmedValue = this.trimText(radixValue, distance);
            if (trimmedValue) {
                return '<text class="busData" x="0" y="14" transform="translate(' +
                    location + ')">' + trimmedValue + '</text>';
            }
        }
        return '';
    };

    this.getBusValue = function (value, width) {
        if (this.radix === 'hex') {
            return vcd2hex(value, width);
        } else if (this.radix === 'binary') {
            return vcd2bin(value, width);
        } else if (this.radix === 'decimal') {
            return vcd2decimal(value, width);
        } else if (this.radix === 'signed') {
            return vcd2SignedDec(value, width);
        } else if (this.radix === 'ascii') {
            return vcd2ascii(value, width);
        }
    };

    /**
     * Trim the beginning of the text based on available space.
     * @param text the text to trim
     * @param distance the available space
     * @return the trimmed text, with a single '*' replacing trimmed characters
     */
    this.trimText = function (text, distance) {
        var maxChars = distance > 0 ? Math.floor(distance / this.CHARACTER_WIDTH) : 0;
        if (text.length > maxChars) {
            if (maxChars === 0) {
                return '';
            } else if (maxChars === 1) {
                return '*';
            } else {
                return '*' + text.substring(text.length - maxChars + 1);
            }
        }
        return text;
    };

    this.numberWithCommas = function (x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    this.numberWithoutCommas = function (x) {
        return x.toString().replace(/,/g, '');
    };

    /**
     * Save epwave.
     */
    this.save = function (event) {
        if (!this.setEpwaveForm(event.data.action, 'save')) {
            return false;
        }
        checkToken(function () {
            $('#epwaveForm').submit();
        });
    };

    /**
     * Save epwave without popping up logIn screen.
     */
    this.forceSave = function () {
        if (!this.setEpwaveForm(contextPath + "/w/copy", 'save', 1)) {

            return false;
        }
        checkToken(function () {
            // Send a CSRF-free GET request that only works once.
            var form = $('#epwaveForm');
            form.attr('action', contextPath + '/w/copyOnce');
            form.attr('method', 'get');
            form.submit();

        });
    };

    /**
     * Check whether uploading a file is allowed.
     * @returns true if upload is allowed; false otherwise
     */
    this.isUploadAllowed = function () {
        if (!$('#sessionUserId').val()) {
            this.showLogInModal();
            return false;
        }
        return true;
    };

    /**
     * Update the epwave submission form.
     */
    this.setEpwaveForm = function (action, mode, force) {
        $('.has-error').removeClass('has-error');
        if (!force && !$('#sessionUserId').val()) {
            this.showLogInModal();
            return false;
        }
        var dumpText = '';
        // Clear any warnings
        this.waves.warning = '';
        if (mode === 'save') {
            // Validate dump
            dumpText = JSON.stringify(this.waves);
            if (dumpText.length >= this.DUMP_MAX_SIZE) {
                return this.flagValidationError("The wave dump must be less than " + this.DUMP_MAX_SIZE + " characters for saving.");
            }
        }

        // Clear previous properties
        $('#epwaveForm input[name^="properties"]').remove();

        $('#epwaveForm').attr('action', action);
        $('#epwaveName').val($.trim($('#name').val()));
        $('#epwaveDescription').val($.trim($("#description").val()));
        $('#epwaveDump').val(dumpText);
        $('#epwaveVisible').val('true');
        this.appendPropertyToForm('currentStart', this.currentStart);
        this.appendPropertyToForm('currentEnd', this.currentEnd);
        this.appendPropertyToForm('waveIndex', JSON.stringify(this.waveIndex));
        if (isNumber(this.cursorTime)) {
            this.appendPropertyToForm('cursorTime', this.cursorTime);
        }
        this.appendTypePropertyToForm();
        var signalFilter = $('#signalFilter').val();
        if (signalFilter) {
            this.appendPropertyToForm('signalFilter', signalFilter);
        }
        this.appendPropertyToForm('radix', this.radix);

        return true;
    };

    this.appendTypePropertyToForm = function () {
        var type = $('#type option:selected').val();
        if (type === 'url') {
            this.appendPropertyToForm('type_url', $('#type_url').val());
        } else if (type === 'upload') {
            this.appendPropertyToForm('type_upload', $('#type_upload input').val());
        } else if (type === 'file') {
            this.appendPropertyToForm('type_file', $('#type_file').val());
        } else {
            this.appendPropertyToForm('type_playground', $('#type_playground').attr('href'));
        }
    };

    this.checkWarnings = function () {
        if (this.waves.warning) {
            $('#loadWarningModalText').text(this.waves.warning);
            $('#loadWarningModal').modal();
        }
    };

    this.loadWave = function () {
        if (this.loading) {
            return;
        }
        EPWAVE_DEFAULT = false;
        $('.has-error').removeClass('has-error');
        if (!$('#sessionUserId').val()) {
            this.showLogInModal();
            return;
        }
        this.showLoad();
        var success = _.bind(function (msg) {
            if (msg.stackTrace) {
                expandOptions();
                $('#loadModalText').text(msg.message);
                $('#loadModal').modal();
            } else {
                this.waves = msg;
                this.checkWarnings();
                // Create new index if needed
                this.reloadIndex();
                this.createSvg();
                if (isNumber(this.cursorTime) && (this.cursorTime < this.waves.start || this.cursorTime > this.waves.end)) {
                    this.cursorTime = null;
                }
                if (isNumber(this.cursor2Time) && (this.cursor2Time < this.waves.start || this.cursor2Time > this.waves.end)) {
                    this.cursor2Time = null;
                }
                this.setMarkerByTime(this.cursorTime, 1);
                this.setMarkerByTime(this.cursor2Time, 2);

                this.populateStartEnd();
                this.populateSignalSelects($('#scopeSelect'), $('#nameSelect'),
                    $('#appendSelected'), $('#appendAll'));
            }
            this.showLoadDone();
        }, this);
        var type = $('#type option:selected').val();

        if (type === 'url' || type === 'file') {
            this.loadWaveWithUrlOrFile(type, success);
        } else if (type === 'upload') {
            this.loadWaveWithUpload(success);
        } else {
            // type is playground
            $('#infoModalBody').html('To re-load waves from EDA Playground, you must re-run:' +
                '<ul><li>Go to the saved <a href="' + $('#type_playground').attr('href') + '">EDA Playground</a> (if it exists)</li>' +
                '<li>Set the <strong>Open EPWave after run</strong> checkbox</li>' +
                '<li>Click <strong>Run</strong></li></ul>');
            $('#infoModal').modal();
            $('#typeGroup').addClass('has-error');
            this.showLoadDone();
        }
    };

    this.loadWaveWithUrlOrFile = function (type, success) {
        var fail = _.bind(function (jqXHR, textStatus) {
            alert("Error connecting to server. Load request failed: " + textStatus);
            this.showLoadDone();
        }, this);
        var typeValue = $.trim($('#type_' + type).val());
        if (!typeValue) {
            this.flagValidationError("Please specify a " + type + " for wavedump.", $('#typeGroup'));
            return;
        }
        checkToken(_.bind(function () {
            var request = $.ajax({
                type: "POST",
                url: "/w/loadWave" + capitalizeFirstLetter(type),
                data: {
                    path: typeValue,
                    signalFilter: $('#signalFilter').val(),
                    from: this.numberWithoutCommas(this.elementStart.val()),
                    to: this.numberWithoutCommas(this.elementEnd.val()),
                    cachebuster: Math.random(),
                    _csrf: $('#_csrfToken').val()
                },
                context: this
            });
            request.done(success);
            request.fail(fail);
        }, this));
    };

    this.loadWaveWithUpload = function (success) {
        checkToken(_.bind(function () {
            var uploadForm = $('#uploadForm'),
                typeValue = $.trim($('#type_upload input').val());
            if (!typeValue) {
                this.flagValidationError("Please select a wavedump to upload.", $('#typeGroup'));
                return;
            }
            $('input[name="signalFilter"]', uploadForm).val($('#signalFilter').val());
            uploadForm.fileupload({
                dataType: 'json',
                done: function (e, data) {
                    success(data.result);
                    $('#uploadForm').fileupload('destroy');
                }
            });
            uploadForm.fileupload('add', {
                fileInput: $('#type_upload input')
            });
        }, this));
    };

    this.showLoad = function () {
        this.loading = true;
        var loadButton = $('#loadButton');
        loadButton.addClass('disabled');
        $('.fa-refresh', loadButton).addClass('fa-spin');
    };

    this.showLoadDone = function () {
        this.loading = false;
        var loadButton = $('#loadButton');
        loadButton.removeClass('disabled');
        $('.fa-refresh', loadButton).removeClass('fa-spin');
    };

    this.appendPropertyToForm = function (name, value) {
        var form = $('#epwaveForm');
        form.append('<input name="properties[' + name + '].name" type="hidden" value="' + name + '"/>');
        form.append('<input name="properties[' + name + '].property" type="hidden"/>');
        $('input[name="properties[' + name + '].property"]', form).val(value);
    };

    /**
     * Show the modal instructing user to log in.
     */
    this.showLogInModal = function () {
        $('#logInModalText').text("You must log in before saving or loading waves.");
        $('#logInModal').modal();
    };

    this.flagValidationError = function (text, div) {
        $('#validationModalText').text(text);
        $('#validationModal').modal();
        if (div) {
            $(div).addClass('has-error');
        }
        this.showLoadDone();
        return false;
    };

}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function vcd2hex(vcdString, width) {
    // For every 4 bits in the binary string
    var result = vcd2hexChunks(vcdString);
    // remaining characters
    result = vcd2hexRemainder(vcdString, result);
    // check if x/z extension is needed
    if (width > vcdString.length) {
        var extend = null;
        if (vcdString[0] === 'z') {
            extend = 'Z';
        } else if (vcdString[0] === 'x') {
            extend = 'X';
        }
        if (extend) {
            var needed = Math.ceil(width / 4),
                used = Math.ceil(vcdString.length / 4),
                j;
            for (j = 0; j < (needed - used); j++) {
                result = appendToResult(result, extend);
            }
        }
    }
    return result.split("").reverse().join("");
}

/**
 * Parse VCD string in chunks of 4 -- for every 4 bits in a the binary string.
 * @param vcdString the VCD string to parse
 * @returns the result of chunk parsing
 */
function vcd2hexChunks(vcdString) {
    var hex, chunk, result = '';
    for (var i = vcdString.length - 4; i >= 0; i -= 4) {
        // grab the next 4 bits
        chunk = vcdString.substr(i, 4);
        if (chunk === 'xxxx') {
            hex = 'X';
        } else if (chunk === 'zzzz') {
            hex = 'Z';
        } else if (chunk.indexOf('x') >= 0) {
            hex = 'x';
        } else if (chunk.indexOf('z') >= 0) {
            hex = 'z';
        } else {
            hex = parseInt(chunk, 2).toString(16);
        }
        result = appendToResult(result, hex);
    }
    return result;
}

/**
 * Parse the remaining characters
 * @param vcdString the VCD string
 * @param result the current result
 * @returns the updated result
 */
function vcd2hexRemainder(vcdString, result) {
    var hex, chunk;
    if (vcdString.length % 4) {
        chunk = vcdString.substr(0, vcdString.length % 4);
        if (chunk === 'x' || chunk === 'xx' || chunk === 'xxx') {
            hex = 'X';
        } else if (chunk === 'z' || chunk === 'zz' || chunk === 'zzz') {
            hex = 'Z';
        } else if (chunk.indexOf('x') >= 0) {
            hex = 'x';
        } else if (chunk.indexOf('z') >= 0) {
            hex = 'z';
        } else {
            hex = parseInt(chunk, 2);
        }
        result = appendToResult(result, hex);
    }
    return result;
}

function vcd2bin(vcdString, width) {
    // check if x/z extension is needed
    if (width > vcdString.length) {
        var extend = null;
        if (vcdString[0] === 'z') {
            extend = 'z';
        } else if (vcdString[0] === 'x') {
            extend = 'x';
        }
        if (extend) {
            var temp = '', j,
                needed = width - vcdString.length;
            for (j = 0; j < needed; j++) {
                temp += extend;
            }
            return temp + vcdString;
        }
    }
    return vcdString;
}

function vcd2decimal(vcdString, width) {
    if (width > vcdString.length) {
        var extend = null;
        if (vcdString[0] === 'z') {
            extend = 'z';
        } else if (vcdString[0] === 'x') {
            extend = 'x';
        }
        if (extend) {
            var temp = '',
                needed = width - vcdString.length;
            for (var j = 0; j < needed; j++) {
                temp += extend;
            }
            vcdString = temp + vcdString;
        }
    }
    var decimalValue = parseInt(vcdString, 2);

    return decimalValue.toString();
}

function vcd2SignedDec(vcdString, width) {
    if (width > vcdString.length) {
        var extend = null;
        if (vcdString[0] === 'z') {
            extend = 'z';
        } else if (vcdString[0] === 'x') {
            extend = 'x';
        }
        if (extend) {
            var temp = '', j;
            var needed = width - vcdString.length;
            for (j = 0; j < needed; j++) {
                temp += extend;
            }
            return temp + vcdString;
        }
    }

    if (vcdString[0] === '1') {
        vcdString = invertBits(vcdString);
        vcdString = addBinary(vcdString, '1');
        return parseInt(vcdString, 2) * -1;
    } else {
        return parseInt(vcdString, 2);
    }
}

function invertBits(binaryString) {
    return binaryString.split('').map(bit => (bit === '0' ? '1' : '0')).join('');
}

function addBinary(a, b) {
    var carry = 0;
    var result = '';
    var bitSum;

    // Pad the shorter binary string with zeros
    while (a.length < b.length) a = '0' + a;
    while (b.length < a.length) b = '0' + b;

    // Perform binary addition
    for (var i = a.length - 1; i >= 0; i--) {
        bitSum = parseInt(a[i]) + parseInt(b[i]) + carry;
        result = (bitSum % 2).toString() + result;
        carry = Math.floor(bitSum / 2);
    }

    // Add the final carry if any
    if (carry) result = carry + result;

    return result;
}

function vcd2ascii(vcdString, width) {
    if (width > vcdString.length) {
        var extend = null;
        if (vcdString[0] === 'z') {
            extend = 'z';
        } else if (vcdString[0] === 'x') {
            extend = 'x';
        }
        if (extend) {
            var temp = '',
                needed = width - vcdString.length;
            for (var j = 0; j < needed; j++) {
                temp += extend;
            }
            vcdString = temp + vcdString;
        }
    }
    var decimalValue = parseInt(vcdString, 2);

    var asciiValue = String.fromCharCode(decimalValue);

    return asciiValue;
}

function appendToResult(result, value) {
    if (result.length !== 4 && ((result.length + 1) % 5)) {
        return result += value;
    }
    return result += '_' + value;
}
