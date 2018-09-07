/*
 * MIT License
 *
 * Copyright (c) 2018 O-Train Fans
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

let map;

let excludeYards = getParameterByName('yards') === "false";
let showLine = getParameterByName('line');
let greedyGestures = getParameterByName('greedyGestures') === "false";

/**
 * Converts a Polyline made of {lat, lng} objects to jsts points for use with the jsts library.
 * @param boundaries The Polyline array of {lat, lng} points.
 * @returns {Array} An array of jsts points.
 */
function latLng2Jsts(boundaries) {
    let coordinates = [];
    let length = 0;
    if (boundaries && boundaries.getLength) length = boundaries.getLength();
    else if (boundaries && boundaries.length) length = boundaries.length;
    for (let i = 0; i < length; i++) {
        if (boundaries.getLength) coordinates.push(new jsts.geom.Coordinate(
            boundaries.getAt(i).lat(), boundaries.getAt(i).lng()));
        else if (boundaries.length) coordinates.push(new jsts.geom.Coordinate(
            boundaries[i].lat, boundaries[i].lng));
    }
    return coordinates;
}

/**
 * Converts an array of jsts points back to {lat, lng} objects.
 * @param geometry The jsts points array.
 * @returns {Array} An array of {lat, lng} points.
 */
function jsts2LatLng(geometry) {
    let coordinateArray = geometry.getCoordinates();
    latLngCoordinates = [];
    for (let i = 0; i < coordinateArray.length; i++) {
        latLngCoordinates.push(new google.maps.LatLng(coordinateArray[i].x, coordinateArray[i].y));
    }
    return latLngCoordinates;
}

/**
 * Loads a rail line and its stations onto the map.
 * @param line The rail line to load. See data.js for examples.
 * @param map The GoogleMap to load the line on to.
 */
function loadLine(line, map) {
    if (showLine != null && line.lineNumber.toString() !== showLine) {
        return;
    }

    // Convert outline to jsts data to build an outline.
    let geoInput = latLng2Jsts(line.outline);
    let geometryFactory = new jsts.geom.GeometryFactory();
    let shell = geometryFactory.createLineString(geoInput);
    let polygonPoints = shell.buffer(0.0001 * line.weightBias);

    let polygonOptions = {
        paths: jsts2LatLng(polygonPoints),
        geodesic: true,
        strokeColor: line.colour,
        fillColor: line.colour,
        fillOpacity: 1.0,
        strokeWeight: 0,
        zIndex: 999
    };

    let outlinePolygon = new google.maps.Polygon(polygonOptions);
    outlinePolygon.setMap(map);

    let outlinePolyline = new google.maps.Polyline({
        path: line.outline,
        geodesic: true,
        strokeColor: line.colour,
        strokeWeight: 5 * line.weightBias,
        zIndex: 999
    });

    // Add the actual track lines
    for (let i = 0; i < line.tracks.length; i++) {
        let track = new google.maps.Polyline({
            path: line.tracks[i].path,
            geodesic: true,
            strokeColor: line.colour,
            strokeWeight: 3,
        });
        track.setMap(map);
    }

    // Add station and platform outlines
    for (let i = 0; i < line.stations.length; i++) {
        const station = line.stations[i];

        for (let j = 0; j < station.platformGeometry.length; j++) {
            const stationPolygon = new google.maps.Polygon({
                paths: station.platformGeometry[j],
                strokeWeight: 1,
                strokeColor: line.colour,
                fillColor: line.colour,
                fillOpacity: 0.5,
                strokeOpacity: 1.0,
                indexID: i,
            });
            stationPolygon.setMap(map);
        }

        for (let j = 0; j < station.stationOutline.length; j++) {
            const stationPolygon = new google.maps.Polygon({
                paths: station.stationOutline[j],
                strokeWeight: 1,
                strokeColor: line.colour,
                fillColor: line.colour,
                fillOpacity: 0.5,
                strokeOpacity: 1.0,
                indexID: i,
                zIndex: 1000
            });
            stationPolygon.setMap(map);

            if (station.link != null) {
                google.maps.event.addListener(stationPolygon, 'click', function () {
                    window.parent.location.href = "https://www.otrainfans.ca/" + line.stations[this.indexID].link;
                });
            }
        }

        // Displays a text label with the name of the station.
        if (station.displayLabel == null || station.displayLabel) {
            let markerLabel = new MarkerWithLabel({
                labelContent: station.name.toUpperCase(),
                position: station.point,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 0
                },
                map: map,
                labelClass: 'stationLabel',
                labelAnchor: new google.maps.Point(30, -10),
                indexID: i
            });

            let iconMarker = new google.maps.Marker({
                position: station.point,
                map: map,
                icon: {
                    path: "M 7.7498477,4.2333336 A 3.5165141,3.5165141 0 0 1 4.2333336,7.7498477 3.5165141,3.5165141 0 0 1 0.71681952,4.2333336 3.5165141,3.5165141 0 0 1 4.2333336,0.71681952 3.5165141,3.5165141 0 0 1 7.7498477,4.2333336 Z",
                    fillColor: "#FFFFFF",
                    strokeColor: "#000000",
                    fillOpacity: 1.0,
                    anchor: new google.maps.Point(4, 4),
                    size: new google.maps.Size(32, 32)
                }
            });

            let largeIconMarker = new google.maps.Marker({
                position: station.point,
                map: map,
                icon: {
                    path: "M 7.7498477,4.2333336 A 3.5165141,3.5165141 0 0 1 4.2333336,7.7498477 3.5165141,3.5165141 0 0 1 0.71681952,4.2333336 3.5165141,3.5165141 0 0 1 4.2333336,0.71681952 3.5165141,3.5165141 0 0 1 7.7498477,4.2333336 Z",
                    fillColor: "#FFFFFF",
                    strokeColor: "#000000",
                    fillOpacity: 1.0,
                    anchor: new google.maps.Point(4, 4),
                    size: new google.maps.Size(32, 32),
                    scale: 1.5
                }
            });

            // Pan the map when the iconMarker is clicked (only appears at a distance).
            google.maps.event.addListener(iconMarker, 'click', function() {
               map.panTo(this.position);
               map.setZoom(17);
            });

            google.maps.event.addListener(largeIconMarker, 'click', function(e) {
                map.panTo(this.position);
                map.setZoom(17);
            });

            if (station.link != null) {
                google.maps.event.addListener(markerLabel, 'click', function () {
                    window.parent.location.href = "https://www.otrainfans.ca/" + line.stations[this.indexID].link;
                });
            }

            // Hides labels when zoomed out to avoid label clutter.
            map.addListener('zoom_changed', function() {
                if (map.zoom < 13) {
                    markerLabel.setMap(null);
                    iconMarker.setMap(map);
                    largeIconMarker.setMap(null);
                } else {
                    markerLabel.setMap(map);
                    iconMarker.setMap(null);
                    largeIconMarker.setMap(map);
                }
            })
        }
    }

    map.addListener('zoom_changed', function () {
        if (map.getZoom() > 15) {
            outlinePolyline.setMap(null);
            outlinePolygon.setMap(map);
        } else {
            outlinePolyline.setMap(map);
            outlinePolygon.setMap(null);
        }

        if (map.getZoom() === 16) {
            polygonOptions.fillOpacity = 0.8;
            outlinePolygon.setOptions(polygonOptions);
        } else if (map.getZoom() === 17) {
            polygonOptions.fillOpacity = 0.5;
            outlinePolygon.setOptions(polygonOptions);
        } else if (map.getZoom() >= 18) {
            polygonOptions.fillOpacity = 0.1;
            outlinePolygon.setOptions(polygonOptions);
        } else {
            polygonOptions.fillOpacity = 1.0;
            outlinePolygon.setOptions(polygonOptions);
        }
    });
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 45.416667, lng: -75.683333},
        zoom: 15,
        gestureHandling: !greedyGestures ? 'greedy' : 'cooperative',
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
            {
                "featureType": "administrative",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#949494"
                    }
                ]
            },
            {
                "featureType": "landscape",
                "elementType": "all",
                "stylers": [
                    {
                        "color": "#f2f2f2"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "all",
                "stylers": [
                    {
                        "saturation": -100
                    },
                    {
                        "lightness": 45
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "simplified"
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "all",
                "stylers": [
                    {
                        "color": "#cfdcdd"
                    },
                    {
                        "visibility": "on"
                    }
                ]
            }
        ]
    });

    if (!excludeYards) {
        loadLine(walkleyYard, map);
        loadLine(belfastYard, map);
    }

    let viewBounds = new google.maps.LatLngBounds();

    if (showLine === "2" || showLine == null) {
        loadLine(trilliumLine, map);

        trilliumLine.outline.forEach(function(e) {
           viewBounds.extend(e);
        });
    }
    if (showLine === "1" || showLine == null) {
        loadLine(confederationLine, map);

        confederationLine.outline.forEach(function(e) {
            viewBounds.extend(e);
        });
    }

    map.fitBounds(viewBounds, -128);
}

initMap();