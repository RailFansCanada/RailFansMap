# Contributing

There are many ways to contribute to the rail map, including adding new data, reporting data errors or bugs, or adding new features. All contributions are welcome.

There are a number of [how-to guides](/HOW_TO.md) available on how to complete specific tasks when adding/modifying data and features.

## Reporting an Error or Bug

Please open an issue on this repository to report the problem. Include as many details as possible so that the problem can be identified.
If you are able to, please feel free to try and fix the problem yourself.

If you do not have a GitHub account, errors and bugs can also be reported to `map@railfans.ca`.

## Development Environment Setup

Compiling the map requires Node.js installed. Dependencies are managed with yarn.

The map is built with mapbox-gl-js, which requires an access token to use.
You can obtain one for free from [Mapbox](mapbox.com).
Once you have your access token, create a `local.env` file with the following content:
```env
MAPBOX_KEY={your access token here}
BASE_URL=https://www.railfans.ca
```

Build and run the app locally:
```bash
$ yarn start
```

This will build the map app and start a web server to use the app. Typically the server is available at `http://localhost:8080` after building.

## Running Tests

Tests are used to validate data to ensure that all properties are specified correctly. To run the tests:

```bash
$ yarn test
```

## FAQ

* **Q: Can I add fantasy lines to the map?**  
A: We strive to be as accurate as possible and therefore we only include data for lines that exist, are under-construction, or are being officially studied. You are welcome to fork this project and create your own maps however.

* **Q: Can I add data for a new region to the map?**  
A: We are currently focusing on urban rail systems in Canada and there are many that still need to be added. We will happily accept contributions for these regions. 

If you have any additional questions, feel free to open an issue or start a discussion on this repository.
