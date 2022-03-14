# How-To Guides

This document contains a set of how-to guides for contributing to this project.

- [Data Editing Basics](#data-editing-basics)
- [Adding a New Rail Line](#adding-a-new-rail-line)
  - [Creating a New Data File](#creating-a-new-data-file)
  - [Adding your Data File to the Config](#adding-your-data-file-to-the-config)
  - [Bounding Boxes](#bounding-boxes)
  - [Adding a New Icon](#adding-a-new-icon)
  - [Testing your New Line](#testing-your-new-line)

# Data Editing Basics

All map data is represented as GeoJSON files and there are many ways that these files can be edited. The current recommended editor for map data is [QGIS](https://www.qgis.org/) which is a general purpose open-source GIS application which can be used to edit geospatial data (like GeoJSON).

[geojson.io](https://geojson.io) is a simple web-based tool that can also be used to make simple edits to GeoJSON data.

GeoJSON files are just text files, so any text editor (like [VSCode](https://code.visualstudio.com/)) can also be used to edit the data, although this is only recommended for small changes to feature properties, not for editing geometry.

In general, there is no one specific software that must be used for editing data and you should use whatever you are most comfortable with.

# Adding a New Rail Line

This section will detail how to add data for a new rail line that is not already a part of the map.
Every rail line is represented by a JSON file in the GeoJSON format.
Each one of these files contains a "FeatureCollection" where each feature represents a part of the rail line including the tracks, platforms, labels, etc.. These files are stored under the `/data` directory of this project, and are grouped by city and/or system. If there is not already a city/system directory that suits your line, feel free to create a new one.

## Creating a New Data File

Create a new file for your new line, give it a descriptive name, and a `.json` file extension. Next, open the file in your preferred text editor and copy the following template into the file:

```json
{
  "type": "FeatureCollection",
  "metadata": {
    "id": "",
    "type": "rail-line",
    "color": "",
    "icon": "",
    "name": "",
    "description": "",
    "sources": []
  },
  "bbox": [],
  "features": []
}
```

### Line Metadata

Here you can start filling out some of the details for line.
The following table explains how to fill out the mandatory metadata fields that the map needs.

| Property      | Description                                                                                                                                                                | Example                                                                            |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `id`          | A unique identifier for this line. Generally you can use `{city or system}/{line number or name}` as a template for the id.                                                | e.g. `toronto/1` or `go/mi` (for Toronto Line 1 and GO Milton Line, respectively). |
| `type`        | This tells the map what kind of data this file contains. This should be left as `rail-line`                                                                                |                                                                                    |
| `color`       | A hexadecimal color string that will control the color of the line when shown on the map.                                                                                  | e.g. `"#FF0000"`                                                                   |
| `icon`        | Controls the icon used to represent the line on the map, and in the legend. For now this can be left blank, this will be covered in [a later section](#adding-a-new-icon). |                                                                                    |
| `name`        | This should be the _primary_ official name of the rail line. This is displayed in the map legend.                                                                          | e.g. `"Line 1"`                                                                    |
| `description` | Some additional information about the line, such as an alternate name or future opening date(s). This can be left blank if there is no suitable description.               | e.g. `"Yonge - University"` or `"(Opening 2025)"`.                                 |
| `sources`     | A list of sources from which you will be adding data from. This can be filled out now, or later.                                                                           | e.g. `["OpenStreetMap"]`                                                           |

The `bbox` property will be [filled in later](#bounding-boxes).

### Adding Geometry and Features

The three main types of features that any rail line on the needs are 1. tracks, 2. station labels, and 3. station platforms.

Note: only a subset of possible features and feature properties are described here. To see all available options, see the [dataspec](/DATASPEC.md) document.

#### 1. Tracks

The tracks for a line shown on the map are made up of many individual `LineString` features. Each one of these features must have a `type` property with the value `tracks`.

#### 2. Station Labels

The station labels are displayed on the map with a circle, along with a text label that includes which lines serve that station.
These are represented by `Point` features that are typically centered on the middle of the station's platforms.

If a station serves multiple lines, the label points for both lines can be aligned together so that they overlap on the map (and look like a single label).

Station labels require several properties which control how they are displayed.

| Property | Description                                    | Example                           |
| -------- | ---------------------------------------------- | --------------------------------- |
| `type`   | Must always have a value of `"station-label"`. |                                   |
| `name`   | The name of the station.                       | e.g. `"Union"`                    |
| `lines`  | A list of all lines which serve the station    | e.g. `["toronto/1", "toronto/2"]` |

Since the labels can become quite cluttered, at lower zoom levels only the labels for select "major" stations are shown. These are typically terminal stations, transfer stations, or stations at notable locations.
A major station can be marked by adding a `major` property with a value of `true`.

#### 3. Station Platforms

Station platforms are represented by `MultiPolygon` features.
A station could have multiple platforms, but we want each station to be represented by a single feature so each feature could contain multiple polygons (hence `MultiPolygon`).

Each platform feature must have a `type` property with the value `"station-platforms"`. To help identify them, every platform feature should also include a `name` property with the name of the station.

## Adding your Data File to the Config

The map is configured through the [`config.json`](/src/config.json) file which instructs the map which data files to load. The config object has two main parts: agencies and regions.

### Agencies

An agency entry represents a transit agency and is where data files are specified to be loaded in by the map. These entries also determine how the map legend will be laid out.

To add a new agency (if it is not already in the list), you can copy the following template to add to the list:

```json
{
  "id": "",
  "name": "",
  "data": [],
  "bbox": []
}
```

The `id` should uniquely identify this entry, and the `name` should be the name of the transit agency being added.

The `data` property is a list of files to be loaded as part of this agency.
Each item in the list should be a path to a data file within the `data` directory (minus the `data/` part). e.g. `toronto/line1.json`

The `bbox` property will be [filled in later](#bounding-boxes).

### Regions

A region defines a general area where one or more agencies exist.
This part of the configuration is used to populate the "Quick Navigation" menu which allows users to quickly jump between different areas on the map.

To add a region, copy the following template to add to the list:

```json
{
  "id": "",
  "title": "",
  "agencies": [],
  "location": [],
  "bbox": []
}
```

The `id` should be a unique identifier for this region.
The `title` should be a name for the region, e.g. `"Ottawa-Gatineau"`.
The `agencies` property defines a list of agencies (using the `id` property of one or more entries in the agencies list) which are contained within region.
The `location` property defines a location where a label for the region can be placed on the map, as a `[longitude, latitude]` value.

The `bbox` property will be filled in in the next section.

## Bounding Boxes

Bounding boxes are spaces that bound a certain feature or collection of features.
The map application uses these bounding boxes to animating the map between locations, i.e. the map is moved so that an entire bounding box is visible on screen.

For this reason, all data files, agencies, and regions must have bounding box properties defined to allow the map to perform these animations correctly.

A bounding box is defined as `[west, south, east, north]` where each value is a latitude or longitude value. Some editing tools can compute these values for you, but a utility script is included with this project to calculate them.

To calculate a bounding box for a data file in this project, run the following command:

```bash
yarn node utils/bbox.js {your data file}
# e.g. yarn node utils/bbox.js toronto/line1.json

# Output:
bbox for toronto/line1.json: [-79.52793127830097, 43.6452559, -79.3770742, 43.795826398803186]
```

This value can be copied into your data file as the `bbox` property.

To calculate the bounding box for an agency or region defined in the config file, run the following:

```bash
yarn node utils/bbox.js config

# Output:
Agencies:
    oc-transpo: [-75.93239095708121, 45.26587692566606, -75.47978870927166, 45.49642647588418]
    sto: [-75.86578535776559, 45.39536917415158, -75.69585303512089, 45.43724924103122]
    ttc: [-79.60331150195182, 43.6356882, -79.2449002, 43.795826398803186]
Regions:
    ottawa-gatineau: [-75.93239095708121, 45.26587692566606, -75.47978870927166, 45.49642647588418]
    toronto: [-79.60331150195182, 43.6356882, -79.2449002, 43.795826398803186]
```

You can then copy the corresponding bounding box values to your new agency or region.

## Adding a New Icon

The icons on the map are defined in the `/icons` directory, and organized in the same way as the data files.
Each icon is a `.svg` file.

To add an icon for your new line, copy one of the existing icons and open the file in a vector editing program (like Inkscape) to update the colour and content of the icon. To relate your new data file to this icon, update the `icon` property of the file's metadata to be a path to your new file (minus to `/icons` part, e.g. `"ottawa/line2.svg"`).

## Testing your New Line

To test your new line, first follow the [setup instructions](/CONTRIBUTING.md#development-environment-setup). Once you launch the application, open the localhost link in your browser and you should see the new line displayed on the map.
