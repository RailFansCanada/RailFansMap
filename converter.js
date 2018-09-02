document.getElementById("submit").addEventListener("click", function(e) {
    let inputText = document.getElementById("input").value;
    let input = JSON.parse(inputText);

    let pointLists = input.features[0].geometry.paths;
    let convertedPoints = [];

    for (let i = 0; i < pointLists.length; i++) {
        let points = pointLists[i];
        for (let j = 0; j < pointLists[i].length; j++) {
            let converted = proj4('EPSG:3857', 'EPSG:4326', points[j]);
            let point = {lng: converted[0], lat: converted[1]};

            convertedPoints.push(point);
        }
    }

    if (document.getElementById("reverse").checked) {
        let json = JSON.stringify(convertedPoints.reverse());
        json = json.replace(/\"([^(\")"]+)\":/g,"$1:");
        document.getElementById("output").value = json;
    } else {
        let json = JSON.stringify(convertedPoints);
        json = json.replace(/\"([^(\")"]+)\":/g,"$1:");
        document.getElementById("output").value = json;
    }
});