// src/components/map/InteractiveMap.tsx

import { useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { LatLngBounds, Layer, type LatLngExpression } from 'leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { getEstabelecimentosGeoJson } from '../../services/establishments';
import type { GeoJsonFeature } from '../../types/cnes';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;
function MapEventsHandler({ onBoundsChange }: { onBoundsChange: (bounds: LatLngBounds, zoom: number) => void }) {
  const map = useMapEvents({
    moveend: () => {
      onBoundsChange(map.getBounds(), map.getZoom());
    },
  });
  return null;
}

export default function InteractiveMap() {
  const [mapInfo, setMapInfo] = useState<{ bounds: LatLngBounds | null; zoom: number }>({ bounds: null, zoom: 4 });
  const ZOOM_LEVEL_TO_FETCH = 9;
  const { 
    data: geoJsonData, 
    isLoading,
    isFetching,
    isError 
  } = useQuery({
    queryKey: ['geojson-estabelecimentos', mapInfo.bounds?.toBBoxString()],
    queryFn: () => getEstabelecimentosGeoJson({ bounds: mapInfo.bounds! }),
    enabled: !!mapInfo.bounds && mapInfo.zoom >= ZOOM_LEVEL_TO_FETCH,
    staleTime: Infinity, 
  });

  const handleBoundsChange = (bounds: LatLngBounds, zoom: number) => {
    setMapInfo({ bounds, zoom });
  };

  const formatCep = (cep: string | number): string => {
    if (!cep) return '';
    const cepStr = cep.toString().padStart(8, '0');
    return `${cepStr.slice(0, 5)}-${cepStr.slice(5, 8)}`;
  };
  
  const initialPosition: LatLngExpression = [-14.235, -51.925];
  const onEachFeature = (feature: GeoJsonFeature, layer: Layer) => {
    if (feature.properties && feature.properties.nome) {
      const { nome, endereco, bairro, cep } = feature.properties;

      const contentLines = [
        `<strong>${nome}</strong>`,
        `<hr style="margin: 4px 0; border: none; border-top: 1px solid #ddd;" />`,
        endereco,
        bairro ? `Bairro: ${bairro}` : null,
        cep ? `CEP: ${formatCep(cep)}` : null,
      ];
      const popupContent = contentLines.filter(line => line).join('<br/>');

      layer.bindPopup(popupContent);
    }
  };

  if (isError) {
     return <div className="card p-4 text-sm text-red-600">Erro ao carregar dados do mapa.</div>;
  }

  return (
    <div className="card h-96 overflow-hidden rounded-lg relative">
      {(isLoading || isFetching) && mapInfo.zoom >= ZOOM_LEVEL_TO_FETCH && (
        <div className="absolute top-2 right-2 z-[1000] bg-white bg-opacity-80 p-2 rounded-md shadow-md text-sm animate-pulse">
          Buscando dados...
        </div>
      )}
      {mapInfo.zoom < ZOOM_LEVEL_TO_FETCH && (
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] bg-white bg-opacity-90 p-3 rounded-md shadow-lg text-center font-semibold">
           Aproxime o mapa para ver os estabelecimentos
         </div>
      )}

      <MapContainer center={initialPosition} zoom={4} style={{ height: '100%', width: '100%' }}>
        <MapEventsHandler onBoundsChange={handleBoundsChange} />
        
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {geoJsonData && mapInfo.zoom >= ZOOM_LEVEL_TO_FETCH && (
            <GeoJSON 
                key={mapInfo.bounds?.toBBoxString()}
                data={geoJsonData} 
                onEachFeature={onEachFeature} 
            />
        )}
      </MapContainer>
    </div>
  );
}