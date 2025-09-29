import { useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import localGeoJson from './../../assets/json/br_states.json';

type StateChoroplethDataItem = {
  uf: string;
  valor: number;
};

type ChoroplethMapProps = {
  data?: StateChoroplethDataItem[];
  isLoading?: boolean;
  isError?: boolean;
  min?: number;
  max?: number;
};

function getDynamicColor(value: number, min: number, max: number) {
  const colors = ['#FEE5D9', '#FCBBA1', '#FC9272', '#FB6A4A', '#DE2D26', '#A50F15'];
  
  if (min === max) return colors[0];

  const percentage = (value - min) / (max - min);
  const colorIndex = Math.min(
    colors.length - 1,
    Math.floor(percentage * colors.length)
  );
  
  return colors[colorIndex];
}

export default function ChoroplethMap({ data = [], isLoading = false, isError = false, min = 0, max = 0 }: ChoroplethMapProps) {
  const [geoJson] = useState<any>(localGeoJson as any);

  const styleFeature = (feature?: any) => {
    if (!feature) return {};
    const stateUf = feature.id;
    const item = data.find(d => d.uf === stateUf);

    const fillColor = item ? getDynamicColor(item.valor, min, max) : '#E2E8F0';

    return { fillColor, weight: 1, opacity: 1, color: 'white', fillOpacity: 0.7 };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const stateName = feature.geometry_name;
    const stateUf = feature.id;
    const item = data.find(d => d.uf === stateUf);
    
    const content = `<strong>${stateName}</strong><br />Cobertura: ${item ? item.valor.toFixed(1) : 'Sem dados'} est./100k hab.`;
    layer.bindTooltip(content);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full bg-slate-50 text-sm text-slate-500 rounded-lg">Carregando dados...</div>;
  }
  if (isError) {
    return <div className="flex items-center justify-center h-full bg-red-50 text-sm text-red-600 rounded-lg">Erro ao carregar dados.</div>;
  }
  
  return (
    <div className='relative w-full h-full'>
      <MapContainer center={[-14.235, -51.9253]} zoom={4} scrollWheelZoom={false} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <GeoJSON 
          key={JSON.stringify(data)} 
          data={geoJson} 
          style={styleFeature}
          onEachFeature={onEachFeature}
        />
      </MapContainer>
    </div>
  );
}