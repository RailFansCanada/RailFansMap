document.getElementById("submit").addEventListener("click", function(e) {
    let inputText = document.getElementById("input").value;
    let input = JSON.parse(inputText);

    let pointLists = input.feature.geometry.paths;
    let convertedPoints = [];

    for (let i = 0; i < pointLists.length; i++) {
        let points = pointLists[i];
        for (let j = 0; j < pointLists[i].length; j++) {
            let converted = proj4('EPSG:3857', 'EPSG:4326', points[j]);
            convertedPoints.push(converted);
        }
    }

    document.getElementById("output").value = JSON.stringify(convertedPoints);
});