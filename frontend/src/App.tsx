import './App.css';
import 'leaflet/dist/leaflet.css';

import { CircleMarker, LayerGroup, Map as LeafletMap, TileLayer } from 'leaflet';
import React, { useEffect, useRef, useState } from 'react';

import { Point } from './interfaces';
import { getData, preparePointsToMap } from './providers';

const App: React.FunctionComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [markers, setMarkers] = useState<LayerGroup | null>(null);

  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
    addData();
    setInterval(() => addData(), 2000);
  }, []);

  async function addData() {
    const data = await getData();
    setPoints(await preparePointsToMap(data));
  }

  function getColor(type: number) {
    switch (type) {
      case 1:
        return 'blue';
      case 2:
        return 'green';
      case 3:
        return 'red';
      case 4:
        return 'orange';
    }
  }

  useEffect(() => {
    if (mapRef.current) {
      const map = new LeafletMap(mapRef.current);
      map.setView([59.436962, 24.753574], 13);
      const tileLayer = new TileLayer(
        'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
        {
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          id: 'mapbox/light-v10',
          accessToken: 'pk.eyJ1IjoibGFmaW4iLCJhIjoiY2tjZ203MXljMGM2ajJ5cWszMG1wY2ExdCJ9.cPdi63ptWIqYt6MRLMseVg',
        },
      );
      map.addLayer(tileLayer);
      const markersLayer = new LayerGroup();
      map.addLayer(markersLayer);
      setMarkers(markersLayer);
    }
  }, [mapRef]);

  useEffect(() => {
    if (markers) {
      markers.eachLayer((marker) => marker.remove());
      for (const point of points) {
        const circleMarker = new CircleMarker([point.latitude, point.longitude], {
          radius: 3,
          fill: true,
          weight: 1,
          color: getColor(point.vehicleType),
        });
        markers.addLayer(circleMarker);
      }
    }
  }, [points, markers]);

  return <div ref={mapRef} />;
};

export default App;
