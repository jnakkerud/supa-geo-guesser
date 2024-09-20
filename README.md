# SupaGeoGuesser Game

## Features

Select a theme which contains images.  Get three tries to guess where an image is located.  Score 5 points if guess location correctly the first time. Otherwise 3 points
for guessing correctly the location.  2 points for guessing the state/province of the image and 1 point for the correct country.

A theme has images that reflect a common interest like State Capital Buildings in the United States.  

## Built with

[Angular](https://angular.dev/) and [Material](https://material.angular.io/) for the front end.  [Supabase](https://supabase.com/) for the database (PostgreSQL with PostGIS extensions) and authentication. 

[Flickr](https://www.flickr.com/services/api/) API's are used for image retrieval and metadata extraction.

Map uses [Leaflet](https://leafletjs.com/) with OpenStreetMap. [Nominatim](https://nominatim.org/release-docs/develop/api/Reverse/) is used for reverse geo coding.



