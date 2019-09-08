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

mapboxgl.accessToken = 'pk.eyJ1IjoiZGVsbGlzZCIsImEiOiJjam9obzZpMDQwMGQ0M2tsY280OTh2M2o5In0.XtnbkAMU7nIMkq7amsiYdw'
//mapboxgl.accessToken = 'pk.eyJ1IjoiZGVsbGlzZCIsImEiOiJjandmbGc5MG8xZGg1M3pudXl6dTQ3NHhtIn0.6eYbb2cN8YUexz_F0ZCqUQ';
// let map = null = new mapboxgl.Map({
//     container: 'map',
//     style: 'mapbox://styles/mapbox/light-v9',
//     center: [-75.6294, 45.3745], 
//     zoom: 11, 
//     bearing: -30,
//     hash: true
// });

let map = null;

document.addEventListener('DOMContentLoaded', () => {
    loadMap()
})

let toggleOptions = {
    dark: false,
    satellite: false,
    stage3west: false,
    stage3south: false,
    stage3north: false
}

/**
 * Read the current state of toggle options from the url params and/or the url bar
 * URL params override local storage data, except for dark mode (which isn't present in url)
 * Satellite view overrides dark mode in all cases
 */
function syncToggleOptionsState() {
    // Dark mode
    let mql = window.matchMedia('(prefers-color-scheme: dark)')
    if (mql.matches) {
        toggleOptions.dark = true;
    } else if ('dark' in localStorage) {
        toggleOptions.dark = localStorage['dark']
    }

    mql.addListener((media) => {
        if (!toggleOptions.satellite) {
            toggleOptions.dark = media.matches
        }
    })
}

let firstSymbolId;
let count = 0;

let trillium;
let confederation;
let confederationEast;
let confederationWest;
let kanata;

function setupDataDisplay() {
    map.loadImage('images/station.png', (error, image) => {
        if (error) throw error;
        map.addImage('station', image);
    });

    loadJson('data/stage2south.json', (data) => {
        trillium = data;
        count++;
        loadLine(data, 'trillium');
    });

    loadJson('data/stage2east.json', (data) => {
        confederationEast = data;
        count++;
        loadLine(data, "confederation-east");
    });

    loadJson('data/stage2west.json', (data) => {
        confederationWest = data;
        count++;
        loadLine(data, "confederation-west");
    });

    loadJson('data/stage1.json', (data) => {
        confederation = data;
        count++;
        loadLine(data, "confederation");
    });

    loadJson('data/stage3kanata.json', (data) => {
        kanata = data
        count++
        loadLine(data, "kanata")
    })


    let layers = map.getStyle().layers;
    // Find the index of the first symbol layer in the map style
    for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol') {
            firstSymbolId = layers[i].id;
            break;
        }
    }

    if (!toggleOptions.satellite) {
        let buildingColor = toggleOptions.dark ? '#212121' : '#eeeeee'
        map.addLayer({
            'id': '3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
                'fill-extrusion-color': buildingColor,

                // use an 'interpolate' expression to add a smooth transition effect to the
                // buildings as the user zooms in
                'fill-extrusion-height': [
                    "interpolate", ["linear"], ["zoom"],
                    15, 0,
                    15.05, ["get", "height"]
                ],
                'fill-extrusion-base': [
                    "interpolate", ["linear"], ["zoom"],
                    15, 0,
                    15.05, ["get", "min_height"]
                ],
                'fill-extrusion-opacity': .6
            }
        }, firstSymbolId);
    }

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
        layout: {
            "line-join": "round",
            "line-cap": "round"
        },
        paint: {
            "line-color": ['get', 'color'],
            "line-width": 2
        }
    }, firstSymbolId);

    map.addLayer({
        id: "moodie",
        type: "line",
        source: 'moodie',
        filter: ['!=', 'name', 'Outline'],
        layout: {
            "line-join": "round",
            "line-cap": "round"
        },
        paint: {
            "line-color": ['get', 'color'],
            "line-width": 2
        }
    }, firstSymbolId);

    map.addLayer({
        id: "walkley",
        type: "line",
        source: 'walkley',
        filter: ['!=', 'name', 'Outline'],
        layout: {
            "line-join": "round",
            "line-cap": "round"
        },
        paint: {
            "line-color": ['get', 'color'],
            "line-width": 2
        }
    }, firstSymbolId);
}

function clearData() {
    map.removeLayer('belfast')
    map.removeLayer('walkley')
    map.removeLayer('moodie')

    removeLine('confederation')
    removeLine('confederation-east')
    removeLine('confederation-west')
    removeLine('trillium')
}

function removeLine(name) {
    map.remove(`${name}-tracks`)
    map.remove(`${name}-platforms`)
    map.remove(`${name}-labels`)
    map.remove(`${name}-labels-hover`)
}

function loadLine(line, name) {
    map.addSource(name, {
        'type': 'geojson',
        attribution: 'Data: City of Ottawa',
        data: line
    });

    map.addLayer({
        id: `${name}-tunnel`,
        type: 'fill',
        source: name,
        filter: ['==', 'type', 'tunnel'],
        minzoom: 14,
        paint: {
            "fill-color": ['get', 'color'],
            'fill-opacity': ['interpolate', ['linear'], ['zoom'],
                14, 0,
                15, 0.5
            ]
        }
    }, firstSymbolId)

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
    }, firstSymbolId);

    map.addLayer({
        id: `${name}-overpass`,
        type: 'line',
        source: name,
        filter: ['==', 'type', 'overpass'],
        minzoom: 14,
        layout: {
            "line-join": "round",
            "line-cap": "square"
        },
        paint: {
            "line-color": ['get', 'color'],
            "line-width": 1.5,
            "line-gap-width": [
                "interpolate", ["exponential", 2], ["zoom"],
                14, 0,
                15, 5
            ]
        }
    })

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
            "icon-allow-overlap": true,
            "text-size": 14
        },
        paint: {
            "text-halo-width": 1,
            "text-color": toggleOptions.dark ? "#FFFFFF" : "#212121",
            "text-halo-color": toggleOptions.dark ? "#212121" : "#FFFFFF"
        }
    });

    map.addLayer({
        id: `${name}-labels-hover`,
        type: 'symbol',
        source: name,
        minzoom: 10,
        filter: ['all', ['==', 'name', ""], ['==', 'type', 'station-label']],
        layout: {
            "text-field": "{name}",
            "text-anchor": "left",
            "text-offset": [0.75, 0],
            "text-allow-overlap": true,
            "text-size": 14
        },
        paint: {
            "text-halo-width": 1,
            "text-color": toggleOptions.dark ? "#FFFFFF" : "#212121",
            "text-halo-color": toggleOptions.dark ? "#212121" : "#FFFFFF"
        }
    });

    map.on('click', `${name}-labels`, (e) => {
        if (e.features[0].properties.url != null) {
            window.parent.location.href = `https://www.otrainfans.ca/${e.features[0].properties.url}`
        }
    })

    let lastFeatureId;
    // Using mousemove is more accurate than mouseenter/mouseleave for hover effects
    map.on('mousemove', (e) => {
        let fs = map.queryRenderedFeatures(e.point, { layers: [`${name}-labels`] });
        if (fs.length > 0) {
            map.getCanvas().style.cursor = 'pointer';

            let f = fs[0];
            if (f.properties.name !== lastFeatureId) {
                lastFeatureId = f.properties.name;

                // Show this element on the "hover labels" layer
                map.setFilter(`${name}-labels-hover`, ['all', ['==', 'name', f.properties.name], ['==', 'type', 'station-label']]);
            }
        } else {
            map.getCanvas().style.cursor = '';
            // Reset the "hover labels" layer
            map.setFilter(`${name}-labels-hover`, ['all', ['==', 'name', ""], ['==', 'type', 'station-label']]);
            lastFeatureId = undefined;
        }
    });

}

function getLngLatFromFeatures(features) {
    let points = [];
    for (let feature of features.filter((e) => e.properties.type === "station-label")) {
        points.push(feature.geometry.coordinates)
    }

    return points;
}

function loadMap(style = "mapbox://styles/mapbox/light-v9") {
    if (map != null) {
        map.remove()
    }

    map = new mapboxgl.Map({
        container: 'map-container',
        style: style,
        center: [-75.6294, 45.3745],
        zoom: 11,
        bearing: -30,
        hash: true
    })

    map.on('load', () => {
        setupDataDisplay()
    })
}

// Toggle the map between light and dark modes
document.getElementById('dark-toggle').addEventListener('click', () => {
    if (toggleOptions.dark && !toggleOptions.satellite) {
        loadMap('mapbox://styles/mapbox/light-v9')
        document.getElementById('toggle-container').classList.remove('dark')
        document.getElementById('logo').style.backgroundImage = `url('../images/logo_dark.png')`
    } else {
        loadMap('mapbox://styles/mapbox/dark-v9')
        document.getElementById('toggle-container').classList.add('dark')
        document.getElementById('logo').style.backgroundImage = `url('../images/logo_light.png')`
    }
    toggleOptions.satellite = false;
    toggleOptions.dark = !toggleOptions.dark;
})

// Toggle the map between satellite mode and whatever light/dark mode was previously active
document.getElementById('satellite-toggle').addEventListener('click', () => {
    if (toggleOptions.satellite) {
        if (toggleOptions.dark) {
            loadMap('mapbox://styles/mapbox/light-v9')
            document.getElementById('logo').style.backgroundImage = `url('../images/logo_dark.png')`
        } else {
            loadMap('mapbox://styles/mapbox/dark-v9')
            document.getElementById('logo').style.backgroundImage = `url('../images/logo_light.png')`
        }
    } else {
        loadMap('mapbox://styles/mapbox/satellite-streets-v9')
        document.getElementById('logo').style.backgroundImage = `url('../images/logo_light.png')`
    }
    toggleOptions.satellite = !toggleOptions.satellite;
})