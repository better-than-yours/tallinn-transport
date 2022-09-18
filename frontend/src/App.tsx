import 'maplibre-gl/dist/maplibre-gl.css';
import './App.css';

import { GeoJSONSource, LngLatLike, Map } from 'maplibre-gl';
import React, { useEffect, useRef, useState } from 'react';

import { Point } from './interfaces';
import { getData, preparePointsToMap } from './providers';

const App: React.FunctionComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map>();
  const [location, setLocation] = useState<GeolocationCoordinates>();
  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
    addData();
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation(pos.coords),
      (e) => console.warn(`ERROR(${e.code}): ${e.message}`),
      { timeout: 5000 },
    );
    const timer = setInterval(() => addData(), 2000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  async function addData() {
    const data = await getData();
    setPoints(await preparePointsToMap(data));
  }

  const locationPoint = {
    type: 'Point',
    coordinates: [],
  } as GeoJSON.Point;
  const pointCollection = {
    type: 'FeatureCollection',
    features: [],
  } as GeoJSON.FeatureCollection;

  useEffect(() => {
    if (mapRef.current) {
      const map = new Map({
        container: mapRef.current,
        style: 'https://api.maptiler.com/maps/basic-v2/style.json?key=mVHQWR5Hlz1ibUQkpoRM',
        center: [24.753574, 59.436962],
        zoom: 12,
      });
      map.on('load', function () {
        setMap(map);
        map.addSource('location', {
          type: 'geojson',
          data: locationPoint,
        });
        map.addLayer({
          id: 'location',
          type: 'circle',
          source: 'location',
          paint: {
            'circle-radius': 6,
            'circle-color': 'gray',
          },
        });
        map.addSource('points', {
          type: 'geojson',
          data: pointCollection,
        });
        map.addLayer({
          id: 'point-number',
          type: 'symbol',
          source: 'points',
          layout: {
            'text-field': '{lineNumber}',
            'text-size': 10,
            'text-offset': [0.7, -0.5],
          },
        });
        map.addLayer({
          id: 'point-circle',
          type: 'circle',
          source: 'points',
          paint: {
            'circle-radius': 3,
            'circle-color': [
              'case',
              ['==', ['get', 'vehicleType'], 1],
              'blue',
              ['==', ['get', 'vehicleType'], 2],
              'green',
              ['==', ['get', 'vehicleType'], 3],
              'red',
              ['==', ['get', 'vehicleType'], 4],
              'orange',
              'black',
            ],
          },
        });
      });
    }
  }, [mapRef]);

  useEffect(() => {
    if (map && location) {
      locationPoint.coordinates = [location.longitude, location.latitude];
      const source = map.getSource('location') as GeoJSONSource;
      source.setData(locationPoint);
      map.jumpTo({ center: locationPoint.coordinates as LngLatLike, zoom: 13 });
    }
  }, [location, map]);

  useEffect(() => {
    if (map && points) {
      pointCollection.features = [
        ...points.map((point) => ({
          type: 'Feature',
          id: `point-${point.vehicleType}-${point.vehicleNumber}`,
          properties: { vehicleType: point.vehicleType, lineNumber: point.lineNumber },
          geometry: {
            type: 'Point',
            coordinates: [point.longitude, point.latitude],
          },
        })),
      ] as GeoJSON.Feature[];
      const source = map.getSource('points') as GeoJSONSource;
      source.setData(pointCollection);
    }
  }, [points, map]);

  return <div ref={mapRef} />;
};

export default App;
