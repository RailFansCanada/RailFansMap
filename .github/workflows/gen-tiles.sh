#!/bin/bash

# Combine all data files in config.json into a single feature collection
yarn node utils/assemble-data.js

tippecanoe -l rail-map -B0 -z22 -o tiles.mbtiles build/assembled.json

# Extract .pbf from mbtiles
mb-util --image_format=pbf tiles.mbtiles tiles
cd tiles
gzip -v -d -r -S .pbf *
find . -type f -exec mv '{}' '{}'.pbf \;
