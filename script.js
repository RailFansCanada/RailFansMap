let map;

let excludeYards = getParameterByName('yards') === "false";
let showLine = getParameterByName('line');
let greedyGestures = getParameterByName('greedyGestures') === "false";

/**
 * Converts a polyline path to a polygon
 * @param path
 * @param width
 * @returns {*[]}
 */
function convertLineToPolygon(path, width) {
    const polygonRightPoints = [];
    const polygonLeftPoints = [];

    for (let i = 0; i < path.length; i++) {
        const firstCenter = new google.maps.LatLng(path[i]);
        const secondCenter = new google.maps.LatLng(path[i + 1]);

        const segmentHeading = google.maps.geometry.spherical.computeHeading(firstCenter, secondCenter);

        const leftPoint = google.maps.geometry.spherical.computeOffset(firstCenter, width, segmentHeading + 90);
        const rightPoint = google.maps.geometry.spherical.computeOffset(firstCenter, width, segmentHeading - 90);

        polygonLeftPoints.push(leftPoint);
        polygonRightPoints.push(rightPoint);

        if (i === path.length - 1) {
            const leftSecondPoint = google.maps.geometry.spherical.computeOffset(secondCenter, width, segmentHeading + 90);
            const rightSecondPoint = google.maps.geometry.spherical.computeOffset(secondCenter, width, segmentHeading - 90);

            polygonLeftPoints.push(leftSecondPoint);
            polygonRightPoints.push(rightSecondPoint);

            new google.maps.Marker({
                position: leftSecondPoint,
                map: map,
                title: i.toString()
            });

            new google.maps.Marker({
                position: rightSecondPoint,
                map: map,
                title: i.toString()
            });
        }

        /*new google.maps.Marker({
            position: leftPoint,
            map: map,
            title: i.toString()
        });

        new google.maps.Marker({
            position: rightPoint,
            map: map,
            title: i.toString()
        });*/
    }

    return polygonLeftPoints.concat(polygonRightPoints.reverse());
}

function latLng2Jsts(boundaries) {
    var coordinates = [];
    var length = 0;
    if (boundaries && boundaries.getLength) length = boundaries.getLength();
    else if (boundaries && boundaries.length) length = boundaries.length;
    for (var i = 0; i < length; i++) {
        if (boundaries.getLength) coordinates.push(new jsts.geom.Coordinate(
            boundaries.getAt(i).lat(), boundaries.getAt(i).lng()));
        else if (boundaries.length) coordinates.push(new jsts.geom.Coordinate(
            boundaries[i].lat, boundaries[i].lng));
    }
    return coordinates;
}

var jsts2LatLng = function (geometry) {
    var coordArray = geometry.getCoordinates();
    GMcoords = [];
    for (var i = 0; i < coordArray.length; i++) {
        GMcoords.push(new google.maps.LatLng(coordArray[i].x, coordArray[i].y));
    }
    return GMcoords;
};

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
                google.maps.event.addListener(stationPolygon, 'click', function (e) {
                    window.parent.location.href = "https://www.otrainfans.ca/" + line.stations[this.indexID].link;
                });
            }
        }

        if (station.displayLabel == null || station.displayLabel) {
            new MarkerWithLabel({
                labelContent: station.name.toUpperCase(),
                position: station.point,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 0
                },
                map: map,
                labelClass: 'stationLabel',
                labelAnchor: new google.maps.Point(30, 0)
            });
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
        zoom: 13,
        gestureHandling: !greedyGestures ? 'greedy' : 'cooperative',
        styles: [
            {
                "featureType": "administrative",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#444444"
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

    loadLine(trilliumLine, map);
    loadLine(confederationLine, map);
}

initMap();