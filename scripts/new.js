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
    zoom: 15
});

map.on('load', () => {

    map.on('zoom', () => {

    })

    map.addSource('stage2east', {
       type: 'geojson',
       data: 'data/stage2east.json'
    });

   map.addLayer({
       id: "stage2e",
       type: "line",
       source: 'stage2east',
       filter: ['!=', 'name', 'Outline'],
       layout: {
           "line-join": "round",
           "line-cap": "round"
       },
       paint: {
           "line-color": "#ff0800",
           "line-width": 2
       }
   });

    let baseWidth = 20; // 20px
    let baseZoom = 15; // zoom 15
    map.addLayer({
        id: "stage2eo",
        type: "line",
        source: 'stage2east',
        filter: ['==', 'name', 'Outline'],
        layout: {
            "line-join": "round",
            "line-cap": "round"
        },
        paint: {
            "line-color": "#ff0800",
            "line-opacity": 0.5,
            "line-width": {
                "type": "exponential",
                "base": 2,
                "stops": [
                    [0, baseWidth * Math.pow(2, (0 - baseZoom))],
                    [24, baseWidth * Math.pow(2, (24 - baseZoom))]
                ]
            }
        }
    });
});