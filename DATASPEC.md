# Rail Map Data Specification

This page details the way data is structured for presentation on the Rail Map.

## Project Structure

There are three key components to presenting a rail line or system on the map: the `data` directory, `icons` directory, and the `config.json` file.

The data files that contain the actual track alignments, stations, etc. for each rail line and rail yard are stored under the `data` directory. This directory groups files by region/system, e.g. `gatineau`, `ottawa`, and `go`.

Each rail line has an associated icon that helps to identify it when displayed on the map. This directory is grouped just like the `data` directory.

The `config.json` file, located under the `src` directory, is used to configure which rail lines will actually be shown on the map.

## Data Files

Every rail line, proposed extension, or rail yard gets its own `.json` data file. Each file contains the geometry for the tracks, platforms, and station labels as a [GeoJSON](https://datatracker.ietf.org/doc/html/rfc7946) `FeatureCollection`. Storing the data in this format makes it both easy to load into the map, and also to export for use by others. Certain properties specified within the JSON document control how the data will be displayed on the map.

### Metadata

A typical data definition file will look something like this:

```json
{
    "type": "FeatureCollection",
    "metadata": {
        "id": "...",
        "type": "...",
        ...
    },
    "features": [...]
}
```

The `type` property specifies that this is a GeoJSON `FeatureCollection` object, while the `features` property lists the features contained in the collection (see below).

The `metadata` proeprty is not a standard part of GeoJSON and is used specifically by the rail map to identify which rail line or yard is being defined by a particular file. The following properties can be defined in the `metadata` object:

| Property    | Required | Type                                                                   | Description                                                                                                                                                                                                                                                    | Examples                                                             |
| ----------- | -------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| id          | yes      | `string`                                                               | A unique identifier for this `FeatureCollection`, usually in the format `{region}/{name}`                                                                                                                                                                      | `ottawa/1` for Ottawa's Line 1 <br/> `go/ki` for GO's Kitchener Line |
| type        | yes      | `"rail-line"`, `"streetcar-line"`, `"rail-yard"` or `"streetcar-yard"` | Identifies what kind of data this file defines                                                                                                                                                                                                                 |
| color       | yes\*    | Hex Colour String                                                      | The colour of the rail line, commonly used to identify the line.                                                                                                                                                                                               | `#D62937`, Ottawa Line 1's red colour                                |
| offset      | no       | `number`                                                               | Controls the relative offset of the track alignment when shown on the map. Used when multiple lines overlap on the same track.                                                                                                                                 | `0.5`, `-0.5`                                                        |
| icon        | yes\*    | `string`                                                               | Specifies a relative path to the rail line's icon located under the `icons` directory.                                                                                                                                                                         | `ottawa/line1.svg`                                                   |
| name        | yes      | `string`                                                               | The primary name of the rail line or rail yard being described                                                                                                                                                                                                 | `Line 1`, `Milton Line`                                              |
| description | yes      | `string`                                                               | A description of the line or yard.                                                                                                                                                                                                                             | `Stages 1 and 2 of the Confederation Line, Line 1`                   |
| notes       | no       | `string`                                                               | Any additional info about the data                                                                                                                                                                                                                             | `*(Station locations and names are approximated)`                    |
| sources     | yes      | `string[]`                                                             | A list of sources from which the data was sourced from                                                                                                                                                                                                         | `["City of Ottawa"]`                                                 |
| filterKey   | no       | `string`                                                               | If included, this key will enable a toggle option in the legend. If the filter key begins with a `!` the layer will be displayed if the corresponding toggle is _not_ enabled.                                                                                 | `ontarioLine`, or `!ontarioLine`                                     |
| searchTerms | no       | `string[]`                                                             | A list of additional search terms can be provided for a file to help the search functionality find this rail line/yard. The list is usually used to provide unofficial names, abbreviations, or other details that wouldn't otherwise be included in the data. | `["Airport Branch", "Trillium Line]` for Ottawa's Line 4             |

\*Only applicable to rail lines, not rail yards

A complete example of the `metadata` object, for Toronto's Line 4:

```json
"metadata": {
  "type": "rail-line",
  "color": "#B32078",
  "offset": 0,
  "id": "toronto/4",
  "icon": "toronto/line4.svg",
  "name": "Line 4",
  "description": "Sheppard",
  "sources": ["OpenStreetMap"]
}
```

### Features

Features specify actual geometry. GeoJSON allows for a variety of different types of geometry, however the rail map only makes use of `Point`, `LineString`, `Polygon` and `MultiPolygon` geometries. GeoJSON `Feature` objects can define additional `properties`, similar to the metadata object described above. These properties are used to change the way the data is interpreted and displayed on the map, primarily by specifying a `type` property which describes what the `Feature` is meant to represent.

- [Tracks](#tracks)
- [Overpass](#overpass)
- [Station Label](#station-label)
- [Yard Label](#yard-label)
- [Station Platforms](#station-platforms)
- [Station Platforms (Future!)](#station-platforms-future)
- [Tunnels](#tunnels)

#### Tracks

Type: `"tracks"`  
Geometry: `LineString`

A feature with `"tracks"` type in its properties **must** have `LineString` geometry. These define segments of track alignments, including yards, switches, and crossovers. A single rail line or rail yard will be made up of many track segments. No other properties can be specified on these features.

```json
{
  "type": "Feature",
  "properties": { "type": "tracks" },
  "geometry": {
    "type": "LineString",
    "coordinates": [...]
  }
}
```

#### Overpass

Type: `"overpass"`  
Geometry: `LineString`

Similar to a `tracks` feature, but used to mark overpasses and elevated segments of track. These features are intended to overlap a corresponding `tracks` segment. No other properties can be specified for an overpass.

```json
{
  "type": "Feature",
  "properties": {
    "type": "overpass"
  },
  "geometry": {
    "type": "LineString",
    "coordinates": [...]
  }
}
```

#### Station Label

Type: `"station-label"`  
Geometry: `Point`

A `"station-label"` feature must have `Point` geometry. These features define the position of a station, and are displayed as circles on the map along with a label for the station's name. Some additional properties are required or can be specified.

| Property    | Required | Type                   | Description                                                                                                                                                                                               | Examples                                     |
| ----------- | -------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| name        | yes      | `string`               | The display name of the station                                                                                                                                                                           | `Sheppard-Yonge`, `Don Mills`                |
| lines       | yes      | `string[]`             | A list of the ID's of all lines which serve this particular station. (See section about metadata)                                                                                                         | `["toronto/1", "toronto/4"]`                 |
| major       | no       | `boolean`              | Used to define "major" stations, like terminal stations or transfer stations. The labels for these stations will have higher priority when the map is viewed at low zoom levels.                          | `true` for Union station                     |
| url         | no       | `string`               | A absolute path to a page about this station on the RailFans Canada site                                                                                                                                  | `https://otrain.railfans.ca/station/hurdman` |
| searchTerms | no       | `string[]`             | Additional terms that could be used to search for this station.                                                                                                                                           | `["Airport"]` for Pearson on the UPX.        |
| scale       | no       | `"regular" \| "large"` | What scale to use for these station labels, `large` being used for stations with long distances between them (e.g. VIA). Large scale labels will be shown at lower zoom levels than regular scale labels. | `"large"` for any VIA station.               |

```json
{
  "type": "Feature",
  "properties": {
    "lines": ["toronto/1", "toronto/4"],
    "type": "station-label",
    "name": "Sheppard-Yonge",
    "major": true
  },
  "geometry": {
    "type": "Point",
    "coordinates": [-79.41091819624391, 43.761456152318885]
  }
}
```

#### Station Connector Label

Type: `"station-connector-label"`  
Geometry: `LineString`

A `"station-connector-label"` is used to represent a transfer station where the location of the stations' labels may not overlap directly. The `LineString` used for these features should start and end at the corresponding station's label points. This is shown as a "connector blob" on the map at low zoom levels, and as a dashed outline at high zoom levels.

| Property | Required | Type       | Description                                                                                       | Examples                         |
| -------- | -------- | ---------- | ------------------------------------------------------------------------------------------------- | -------------------------------- |
| name     | yes      | `string`   | The display name of the station                                                                   | `Sheppard-Yonge`, `Don Mills`    |
| lines    | yes      | `string[]` | A list of the ID's of all lines which serve this particular station. (See section about metadata) | `["toronto/1", "toronto/4"]`     |
| url      | no       | `string`   | A relative path to a page about this station on the RailFans Canada site                          | `otrain/line-1-stations/hurdman` |

```json
{
  "type": "Feature",
  "properties": {
    "lines": ["toronto/1", "toronto/2"],
    "type": "station-connector-label",
    "name": "Spadina",
    "url": "subway/transfer-stations/spadina"
  },
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [-79.404884499396815, 43.667098033956847],
      [-79.404897438695755, 43.669282344826279]
    ]
  }
}
```

#### Yard Label

Type: `"yard-label"`  
Geometry: `Point`

A `"yard-label"` feature is similar to a `station-label`, but is used to specify the location of, and display a name for a rail yard on the map.

| Property | Required | Type     | Description                                                              | Examples               |
| -------- | -------- | -------- | ------------------------------------------------------------------------ | ---------------------- |
| name     | yes      | `string` | The name of the rail yard                                                | `Walkley Yard`         |
| url      | no       | `string` | A relative path to a page about this station on the RailFans Canada site | `otrain/yards/walkley` |

```json
{
  "type": "Feature",
  "properties": {
    "type": "yard-label",
    "name": "Walkley Yard",
    "url": "otrain/yards/walkley"
  },
  "geometry": { "type": "Point", "coordinates": [-75.65288, 45.36539] }
}
```

#### Station Platforms

Type: `"station-platforms"`  
Geometry: `MultiPolygon`

A `"station-platforms"` feature defines the outline of one or more platforms for a particular station. Even if a station has multiple platforms, they should be grouped together into a single `MultiPolygon` geometry. One additional property should be specified for these features.

| Property | Required | Type     | Description                     | Examples                      |
| -------- | -------- | -------- | ------------------------------- | ----------------------------- |
| name     | yes      | `string` | The display name of the station | `Sheppard-Yonge`, `Don Mills` |

```json
{
  "type": "Feature",
  "properties": {
    "name": "Kichi Zìbì",
    "type": "station-platforms"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [-75.75914024850704, 45.3930352994829],
        [-75.7591020907687, 45.393008296688464],
        [-75.75990128326562, 45.39245276856882],
        [-75.75992031226208, 45.3924395412222],
        [-75.75995668055637, 45.39246525863866],
        [-75.75914024850704, 45.3930352994829]
      ]
    ]
  }
}
```

#### Station Platforms (Future!)

Type: `"station-platforms-future"`  
Geometry: `MultiPolygon`

A `"station-platforms-future"` feature defines the outline of one or more platform **extensions** for a particular station. Even if a station has multiple proposed platform extensions, they should be grouped together into a single `MultiPolygon` geometry. One additional property should be specified for these features.

| Property | Required | Type     | Description                     | Examples                      |
| -------- | -------- | -------- | ------------------------------- | ----------------------------- |
| name     | yes      | `string` | The display name of the station | `Sheppard-Yonge`, `Don Mills` |

```json
{
  "type": "Feature",
  "properties": {
    "name": "Kichi Zìbì",
    "type": "station-platforms-future"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [-75.75995668055633, 45.392465258638616],
        [-75.75992031226214, 45.392439541222174],
        [-75.7600112262604, 45.39237634497599],
        [-75.760047148092, 45.39240174763221],
        [-75.75995668055633, 45.392465258638616]
      ]
    ]
  }
}
```

#### Tunnels

Type: `"tunnel"`  
Geometry: `Polygon`

A `"tunnel"` feature defines the outline of a tunnel that a rail line or rail yard may use. A name may be included for a tunnel, but it is not currently used.

| Property | Required | Type     | Description                              | Examples           |
| -------- | -------- | -------- | ---------------------------------------- | ------------------ |
| name     | no       | `string` | A common or official name for the tunnel | `Connaught Tunnel` |

```json
{
  "type": "Feature",
  "properties": {
    "name": "Connaught Tunnel",
    "type": "tunnel"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": []
  }
}
```

## Icons

Icons are a simple `.svg` file that contains a coloured circle, and a small bit of text (a number, letter, or two letters in the case of GO lines) that identify the line.

Any of the existing icons located under [`icons/`](icons/) can be used as a template for creating new icons by simply updating the colour and text, and saving a new copy.

## Configuration File

The configuration file contains a definition for each transit agency/system being displayed on the map, along with some other information to help the map display the data.

### Agency

Each agency needs a `name` and `bbox` (bounding box) defined, along with a list of `data` files. All properties are required.

| Property | Type                          | Description                                                                                                                                                   | Examples                                                        |
| -------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| name     | `string`                      | The name of the transit agency, or transit system                                                                                                             | `OC Transpo`                                                    |
| bbox     | `BBox` (array of 4 `number`s) | A bounding box that encompasses all of the rail lines that belong to this agency. Used by the map to determine which systems are actively visible on the map. | `[-75.93239,45.26587,-75.47978,45.49642]`                       |
| data     | `string[]`                    | A list of all data files corresponding to this agency, relative to the `data` directory. Yards should be listed first, then lines in lexicographic order.     | `["ottawa/belfastYard.json", "ottawa/greenbankYard.json", ...]` |

## Data Validation

Some validation of the data and configuration is validated automatically when a PR is opened that modifies or adds new data. All data files and the configuration file is validated to ensure that they follow the spec outlined on this page (i.e. all required properties are present, and of the correct type).

In addition to schema validation, the bounding boxes specified in the `config.json` file for each agency is also validated to ensure that they do cover the entire agency's dataset.
