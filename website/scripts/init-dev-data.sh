#!/bin/bash
#
geojson_filepath="public/geojson/communes.geojson"
pmtiles_filepath="public/pmtiles/communes.pmtiles"

if [[ -f "${PWD}/${geojson_filepath}" ]]; then
    echo "GeoJSON already present, generating PMTiles..."
    tippecanoe -zg -o "${PWD}/${pmtiles_filepath}" --coalesce-densest-as-needed --extend-zooms-if-still-dropping "${PWD}/${geojson_filepath}"
    echo "PMTiles generation successfull !"
    exit 1
fi

if [[ -f "${PWD}/${pmtiles_filepath}" ]]; then
    echo "PMTiles already present, quitting..."
    exit 1
fi


echo "Loading french local cities GeoJSON from opendatasoft public hub...."
if curl -o "${PWD}/${geojson_filepath}" -L "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/georef-france-commune/exports/geojson?lang=fr&timezone=Europe%2FBerlin"; then
    echo "Generating french local cities PMTiles from GeoJSON file with tippecanoe ..."
    tippecanoe -zg -o "${PWD}/${pmtiles_filepath}" --coalesce-densest-as-needed --extend-zooms-if-still-dropping "${PWD}/${geojson_filepath}"
else
    echo "Error"
    exit 1
fi
echo "PMTiles generation successfull !"
exit 1
