let map;

/**
 * Converts a polyline path to a polygon
 * @param path
 * @param width
 * @returns {*[]}
 */
function convertLineToPolygon(path, width) {
    const polygonRightPoints = [];
    const polygonLeftPoints = [];

    for (let i = 0; i < trilliumLineOutline.length; i++) {
        const firstCenter = new google.maps.LatLng(path[i]);
        const secondCenter = new google.maps.LatLng(path[i + 1]);

        const segmentHeading = google.maps.geometry.spherical.computeHeading(firstCenter, secondCenter);

        const leftPoint = google.maps.geometry.spherical.computeOffset(firstCenter, width, segmentHeading + 90);
        const rightPoint = google.maps.geometry.spherical.computeOffset(firstCenter, width, segmentHeading - 90);

        polygonLeftPoints.push(leftPoint);
        polygonRightPoints.push(rightPoint);
    }

    return polygonLeftPoints.concat(polygonRightPoints.reverse());
}

function initMap() {
    let trilliumPolygonOptions = {
        paths: convertLineToPolygon(trilliumLineOutline, 10),
        geodesic: true,
        strokeColor: '#76BE43',
        fillColor: '#76BE43',
        strokeOpacity: 1.0,
        fillOpacity: 1.0,
        strokeWeight: 0
    };

    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 45.416667, lng: -75.683333},
        zoom: 15
    });

    const trilliumLinePolygon = new google.maps.Polygon(trilliumPolygonOptions);
    trilliumLinePolygon.setMap(map);

    const trilliumLinePolyline = new google.maps.Polyline({
        path: trilliumLineOutline,
        geodesic: true,
        strokeColor: '#76BE43',
        strokeWeight: 5
    });
    trilliumLinePolyline.setMap(map);

    const tTrackM = new google.maps.Polyline({
        path: trilliumLineMain,
        geodesic: true,
        strokeColor: '#76BE43',
        strokeWeight: 3
    });
    tTrackM.setMap(map);

    const tBrookfieldP = new google.maps.Polyline({
        path: trilliumBrookfieldPassing,
        geodesic: true,
        strokeColor: '#76BE43',
        strokeWeight: 3
    });
    tBrookfieldP.setMap(map);

    const tGladstoneP = new google.maps.Polyline({
        path: trilliumGladstonePassing,
        geodesic: true,
        strokeColor: '#76BE43',
        strokeWeight: 3
    });
    tGladstoneP.setMap(map);

    const tCarletonP = new google.maps.Polyline({
        path: trilliumCarletonPassing,
        geodesic: true,
        strokeColor: '#76BE43',
        strokeWeight: 3
    });
    tCarletonP.setMap(map);

    map.addListener('zoom_changed', function () {
        console.log("Zoom: " + map.getZoom());

        if (map.getZoom() > 15) {
            trilliumLinePolyline.setMap(null);
            trilliumLinePolygon.setMap(map);
        } else {
            trilliumLinePolyline.setMap(map);
            trilliumLinePolygon.setMap(null);
        }

        if (map.getZoom() === 16) {
            trilliumPolygonOptions.fillOpacity = 0.8;
            trilliumLinePolygon.setOptions(trilliumPolygonOptions)
        } else if (map.getZoom() === 17) {
            trilliumPolygonOptions.fillOpacity = 0.5;
            trilliumLinePolygon.setOptions(trilliumPolygonOptions)
        } else if (map.getZoom() >= 18) {
            trilliumPolygonOptions.fillOpacity = 0.1;
            trilliumLinePolygon.setOptions(trilliumPolygonOptions)
        } else {
            trilliumPolygonOptions.fillOpacity = 1;
            trilliumLinePolygon.setOptions(trilliumPolygonOptions)
        }
    });
}