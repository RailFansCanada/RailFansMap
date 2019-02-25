/*
 * MIT License
 *
 * Copyright (c) 2019 O-Train Fans
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

mapboxgl.accessToken = 'pk.eyJ1IjoiZGVsbGlzZCIsImEiOiJjam9obzZpMDQwMGQ0M2tsY280OTh2M2o5In0.XtnbkAMU7nIMkq7amsiYdw';
let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    center: [-75.699, 45.420],
    zoom: 10
});

let excludeYards = getParameterByName('yards') === "false";
let showLine = getParameterByName('line');
let greedyGestures = getParameterByName('greedyGestures') === "false";

map.on('load', () => {

    map.loadImage('images/station.png', (error, image) => {
        if (error) throw error;
        map.addImage('station', image);
    });

    loadJson('data/stage2south.json', (data) => {
        loadLine(data, 'trillium');
    });

    map.on('zoom', () => {
    });

    let layers = map.getStyle().layers;
    // Find the index of the first symbol layer in the map style
    let firstSymbolId;
    for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol') {
            firstSymbolId = layers[i].id;
            break;
        }
    }

    map.addSource('stage2east', {
        type: 'geojson',
        data: 'data/stage2east.json'
    });

    map.addSource('stage2south', {
        type: 'geojson',
        data: 'data/stage2south.json'
    });

    map.addSource('stage2west', {
        type: 'geojson',
        data: 'data/stage2west.json'
    });

    map.addSource('stage1', {
        type: 'geojson',
        data: 'data/stage1.json'
    });

    map.addSource('belfast', {
        type: 'geojson',
        data: 'data/belfastYard.json'
    });

    map.addSource('moodie', {
        type: 'geojson',
        data: 'data/moodieYard.json'
    });

    map.addSource('walkley', {
        type: 'geojson',
        data: 'data/walkleyYard.json'
    });

    map.addLayer({
        id: "belfast",
        type: "line",
        source: 'belfast',
        filter: ['!=', 'name', 'Outline'],
        threshold: 10,
        layout: {
            "line-join": "round",
            "line-cap": "round"
        },
        paint: {
            "line-color": ['get', 'color'],
            "line-width": 2
        }
    });

    map.addLayer({
        id: "moodie",
        type: "line",
        source: 'moodie',
        filter: ['!=', 'name', 'Outline'],
        threshold: 10,
        layout: {
            "line-join": "round",
            "line-cap": "round"
        },
        paint: {
            "line-color": ['get', 'color'],
            "line-width": 2
        }
    });

    map.addLayer({
        id: "walkley",
        type: "line",
        source: 'walkley',
        filter: ['!=', 'name', 'Outline'],
        threshold: 10,
        layout: {
            "line-join": "round",
            "line-cap": "round"
        },
        paint: {
            "line-color": ['get', 'color'],
            "line-width": 2
        }
    });

    map.addLayer({
        id: "stage2e",
        type: "line",
        source: 'stage2east',
        filter: ['!=', 'name', 'Outline'],
        threshold: 10,
        layout: {
            "line-join": "round",
            "line-cap": "round"
        },
        paint: {
            "line-color": ['get', 'color'],
            "line-width": 3
        }
    });

    map.addLayer({
        id: "stage2w",
        type: "line",
        source: 'stage2west',
        filter: ['!=', 'name', 'Outline'],
        threshold: 10,
        layout: {
            "line-join": "round",
            "line-cap": "round"
        },
        paint: {
            "line-color": ['get', 'color'],
            "line-width": 3
        }
    }, firstSymbolId);


    /*map.addLayer({
        id: "stage2s",
        type: "line",
        source: 'stage2south',
        filter: ['!=', 'name', 'Outline'],
        threshold: 10,
        layout: {
            "line-join": "round",
            "line-cap": "round",
        },
        paint: {
            "line-color": ['get', 'color'],
            "line-width": 3
        }
    }, firstSymbolId);
    map.addLayer({
        id: "stage2s-labels",
        type: "symbol",
        source: 'stage2south',
        filter: ['!=', 'name', 'Tracks'],
        layout: {
            "text-field": "{name}"
        },
        paint: {
        }
    });*/


    map.addLayer({
        id: "stage1",
        type: "line",
        source: 'stage1',
        filter: ['!=', 'name', 'Outline'],
        threshold: 10,
        layout: {
            "line-join": "round",
            "line-cap": "round"
        },
        paint: {
            "line-color": ['get', 'color'],
            "line-width": 3
        }
    }, firstSymbolId);
});

function loadLine(line, name) {
    map.addSource(name, {
        'type': 'geojson',
        data: line
    });

    map.addLayer({
        id: `${name}-tracks`,
        type: 'line',
        source: name,
        filter: ['==', 'type', 'tracks'],
        layout: {
            "line-join": "round",
            "line-cap": "round"
        },
        paint: {
            "line-color": ['get', 'color'],
            "line-width": 3
        }
    });

    map.addLayer({
        id: `${name}-platforms`,
        type: 'fill',
        source: name,
        filter: ['==', 'type', 'station-platforms'],
        paint: {
            "fill-color": ['get', 'color'],
            'fill-opacity': 0.6
        }
    });

    map.addLayer({
        id: `${name}-labels`,
        type: 'symbol',
        source: name,
        filter: ['==', 'type', 'station-label'],
        minzoom: 10,
        layout: {
            //"text-field": "{OBJECTID}"
            "icon-image": "station",
            "text-field": "{name}",
            "text-anchor": "left",
            "text-offset": [0.75, 0],
            "text-optional": true,
            "icon-optional": false,
            "icon-allow-overlap": true
        },
        "paint": {
            "icon-color": "#00ff00",
            "icon-halo-color": "#fff",
            "icon-halo-width": 2
        }
    });

    map.on('click', `${name}-labels`, (e) => {
        window.parent.location.href = `https://www.otrainfans.ca/${e.features[0].properties.url}`;
    });

    map.on('mouseenter', `${name}-labels`, () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', `${name}-labels`, () => {
        map.getCanvas().style.cursor = '';
    })
}