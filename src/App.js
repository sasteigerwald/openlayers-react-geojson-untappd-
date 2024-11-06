import React, { useState, useEffect, useRef } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import 'ol/ol.css';
import Style from 'ol/style/Style';
import Circle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { GeoJSON } from 'ol/format';
import UntappdGeoJson from './data/untappd.geojson';
import Popup from 'ol-popup';

function App() {
    const [map, setMap] = useState();
    const mapElement = useRef();
    const mapRef = useRef();
    mapRef.current = map;
    const popupRef = useRef(null);
        
    useEffect(() => {
        const osmLayer = new TileLayer({
            preload: Infinity,
            source: new OSM(),
        });
    
        const untappdLayer = new VectorLayer({
            source: new VectorSource({
                url: UntappdGeoJson,
                format: new GeoJSON()
            }),
            style: new Style({
                image: new Circle({
                    radius: 5,
                    fill: new Fill({color: 'rgba(242,142,28,0.6)'}),
                    stroke: new Stroke({color: 'rgba(242,142,28)', width: 1})
                })
            })
        });

        const initialMap = new Map({
            target: mapElement.current,
            layers: [osmLayer, untappdLayer],
            view: new View({
                center: [0, 0],
                zoom: 0,
            }),
        });

        const popup = new Popup();
        initialMap.addOverlay(popup);
        popupRef.current = popup;

        initialMap.on('click', (event) => {
            const features = [];
            initialMap.forEachFeatureAtPixel(event.pixel, (feature) => {
                features.push(feature);
            });

            if (features.length > 0) {
                const coordinates = features[0].getGeometry().getCoordinates();
                let currentPage = 0;
                const totalPages = features.length;

                const showPage = (page) => {
                    let feature = features[page];
                    let content = '<b>' + feature.get('beer_name') + '</b><br>by ' + feature.get('brewery_name');
                    if (feature.get('venue_name')) {
                        content += '<br>at ' + feature.get('venue_name');
                    }
                    const date = new Date(feature.get('created_at'));
                    const options = { year: 'numeric', month: 'short', day: '2-digit' };
                    const formattedDate = date.toLocaleDateString('en-US', options);
                    content += '<br>on ' + formattedDate + '<br>';

                    content += '<br><br>';
                    content += `<a href="#" id="prevPage" ${page === 0 ? 'style="pointer-events: none; color: grey;"' : ''}>&lt;</a>`;
                    content += ` <span>${page + 1} of ${totalPages}</span> `;
                    content += `<a href="#" id="nextPage" ${page === totalPages - 1 ? 'style="pointer-events: none; color: grey;"' : ''}>&gt;</a>`;

                    popup.show(coordinates, content);

                    if (page > 0) {
                        document.getElementById('prevPage').onclick = (e) => {
                            e.preventDefault();
                            showPage(page - 1);
                        };
                    }
                    if (page < totalPages - 1) {
                        document.getElementById('nextPage').onclick = (e) => {
                            e.preventDefault();
                            showPage(page + 1);
                        };
                    }
                };

                showPage(currentPage);
            } else {
                popup.hide();
            }
        });

        setMap(initialMap);
    }, []);


    return (
      <div style={{height:'100vh',width:'100%'}} ref={mapElement} className="map-container" />
    );
}

export default App;