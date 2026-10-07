interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  formatValue?: (v: number) => string;
}

export function BarChart({ data, height = 200, color = '#10b981', formatValue }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const barWidth = 100 / (data.length * 1.5);

  return (
    <div className="w-full">
      <div className="flex items-end justify-around gap-2" style={{ height }}>
        {data.map((d, i) => {
          const pct = (d.value / max) * 100;
          return (
            <div key={i} className="flex flex-1 flex-col items-center justify-end gap-2">
              <span className="text-xs font-medium text-gray-500">
                {formatValue ? formatValue(d.value) : d.value.toLocaleString()}
              </span>
              <div
                className="w-full max-w-[40px] rounded-t-md transition-all hover:opacity-80"
                style={{ height: `${pct}%`, backgroundColor: color, minHeight: '4px' }}
              />
              <span className="text-xs text-gray-400">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  formatValue?: (v: number) => string;
}

export function LineChart({ data, height = 200, color = '#0f766e', formatValue }: LineChartProps) {
  const W = 800;
  const H = height;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const chartW = W - padding.left - padding.right;
  const chartH = H - padding.top - padding.bottom;

  const values = data.map((d) => d.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1 || 1)) * chartW;
    const y = padding.top + chartH - ((d.value - min) / range) * chartH;
    return { x, y, value: d.value, label: d.label };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x},${padding.top + chartH} L ${points[0].x},${padding.top + chartH} Z`;

  const yTicks = 5;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) => min + (range * i) / yTicks);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y-axis grid lines */}
        {tickValues.map((tv, i) => {
          const y = padding.top + chartH - ((tv - min) / range) * chartH;
          return (
            <g key={i}>
              <line x1={padding.left} y1={y} x2={W - padding.right} y2={y} stroke="#f3f4f6" strokeWidth="1" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fill="#9ca3af" style={{ fontSize: '10px' }}>
                {formatValue ? formatValue(tv) : Math.round(tv).toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* Area */}
        <path d={areaPath} fill="url(#areaGradient)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="white" stroke={color} strokeWidth="2" />
            <text x={p.x} y={H - padding.bottom + 18} textAnchor="middle" fill="#9ca3af" style={{ fontSize: '11px' }}>
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

interface DonutChartProps {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({ segments, size = 160, centerLabel, centerValue }: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = size / 2;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * (radius - strokeWidth / 2);

  let offset = 0;
  const arcs = segments.map((s) => {
    const pct = s.value / total;
    const dash = pct * circumference;
    const arc = { ...s, dash, offset };
    offset += dash;
    return arc;
  });

  return (
    <div className="flex items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
          />
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx={radius}
              cy={radius}
              r={radius - strokeWidth / 2}
              fill="none"
              stroke={arc.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
              strokeDashoffset={-arc.offset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerValue && <span className="text-xl font-bold text-gray-900">{centerValue}</span>}
            {centerLabel && <span className="text-xs text-gray-500">{centerLabel}</span>}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-gray-600">{s.label}</span>
            <span className="font-medium text-gray-900">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
