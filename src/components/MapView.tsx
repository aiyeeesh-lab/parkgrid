import type { Facility } from '@/types';
import { useStore } from '@/store/StoreContext';
import { MapPin } from 'lucide-react';

interface MapViewProps {
  facilities?: Facility[];
  selectedId?: string;
  onSelect?: (facility: Facility) => void;
  height?: string;
  showLabels?: boolean;
}

// Lagos area bounds for our simulated map
const LAGOS_BOUNDS = {
  minLat: 6.38,
  maxLat: 6.65,
  minLng: 3.32,
  maxLng: 3.52,
};

function project(lat: number, lng: number, width: number, height: number) {
  const x = ((lng - LAGOS_BOUNDS.minLng) / (LAGOS_BOUNDS.maxLng - LAGOS_BOUNDS.minLng)) * width;
  const y = height - ((lat - LAGOS_BOUNDS.minLat) / (LAGOS_BOUNDS.maxLat - LAGOS_BOUNDS.minLat)) * height;
  return { x, y };
}

export function MapView({
  facilities: propFacilities,
  selectedId,
  onSelect,
  height = '400px',
  showLabels = true,
}: MapViewProps) {
  const { facilities: storeFacilities, getAvailableBayCount, getFacilityOccupancy } = useStore();
  const facilities = propFacilities || storeFacilities;

  const W = 800;
  const H = 600;

  // Water bodies as stylized shapes
  const lagoonPath = 'M 0,200 Q 100,180 200,220 L 200,600 L 0,600 Z';
  const oceanPath = 'M 0,0 L 800,0 L 800,120 Q 400,140 0,100 Z';

  // Area labels with approximate positions
  const areas = [
    { name: 'Victoria Island', lat: 6.434, lng: 3.424 },
    { name: 'Ikoyi', lat: 6.454, lng: 3.435 },
    { name: 'Lekki', lat: 6.447, lng: 3.474 },
    { name: 'Ikeja', lat: 6.602, lng: 3.352 },
    { name: 'Yaba', lat: 6.504, lng: 3.380 },
    { name: 'Surulere', lat: 6.485, lng: 3.350 },
  ];

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-gray-200 bg-[#eaf2f5]"
      style={{ height }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        {/* Water */}
        <path d={oceanPath} fill="#c8dde8" />
        <path d={lagoonPath} fill="#c8dde8" opacity="0.7" />

        {/* Roads - main arteries */}
        <g stroke="#d1d5db" strokeWidth="3" fill="none">
          <path d="M 50,400 Q 200,380 400,350 T 750,300" />
          <path d="M 100,100 L 100,550" />
          <path d="M 300,50 L 300,580" />
          <path d="M 500,80 L 500,500" />
          <path d="M 650,120 L 650,520" />
          <path d="M 50,200 L 750,180" />
          <path d="M 50,500 L 750,480" />
        </g>

        {/* Road labels - thinner roads */}
        <g stroke="#e5e7eb" strokeWidth="1.5" fill="none">
          <path d="M 50,300 L 750,280" />
          <path d="M 200,50 L 200,580" />
          <path d="M 400,50 L 400,580" />
          <path d="M 600,50 L 600,580" />
          <path d="M 50,150 L 750,130" />
          <path d="M 50,450 L 750,430" />
        </g>

        {/* Area labels */}
        {showLabels && areas.map((area) => {
          const { x, y } = project(area.lat, area.lng, W, H);
          return (
            <text
              key={area.name}
              x={x}
              y={y - 20}
              textAnchor="middle"
              className="fill-gray-400 text-[10px] font-medium uppercase tracking-wide"
              style={{ fontSize: '11px' }}
            >
              {area.name}
            </text>
          );
        })}

        {/* Facility markers */}
        {facilities.map((f) => {
          const { x, y } = project(f.latitude, f.longitude, W, H);
          const available = getAvailableBayCount(f.id);
          const occ = getFacilityOccupancy(f.id);
          const isSelected = f.id === selectedId;
          const isFull = available === 0;
          const markerColor = isFull ? '#ef4444' : available < 20 ? '#f59e0b' : '#10b981';

          return (
            <g
              key={f.id}
              transform={`translate(${x}, ${y})`}
              onClick={() => onSelect?.(f)}
              className={onSelect ? 'cursor-pointer' : ''}
            >
              {isSelected && (
                <circle r="28" fill={markerColor} opacity="0.15" className="animate-pulse" />
              )}
              <circle r="16" fill="white" stroke={markerColor} strokeWidth="2" />
              <circle r="10" fill={markerColor} />
              <text
                y="4"
                textAnchor="middle"
                fill="white"
                style={{ fontSize: '10px', fontWeight: 'bold' }}
              >
                {available}
              </text>
              {showLabels && (
                <text
                  y="30"
                  textAnchor="middle"
                  fill="#374151"
                  style={{ fontSize: '10px', fontWeight: 600 }}
                >
                  {f.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex flex-col gap-1 rounded-lg bg-white/90 px-3 py-2 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2 text-xs">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-gray-600">Spaces available</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span className="text-gray-600">Limited (&lt;20)</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="text-gray-600">Full</span>
        </div>
      </div>
    </div>
  );
}
