interface QRCodeCardProps {
  value: string;
  size?: number;
}

export function QRCodeCard({ value, size = 160 }: QRCodeCardProps) {
  // Generate deterministic pseudo-QR pattern from string
  const cells = 21;
  const grid: boolean[][] = [];
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }
  let rng = Math.abs(hash);
  const next = () => {
    rng = (rng * 1103515245 + 12345) & 0x7fffffff;
    return rng;
  };

  for (let r = 0; r < cells; r++) {
    grid[r] = [];
    for (let c = 0; c < cells; c++) {
      // Finder patterns (corners)
      const isFinder =
        (r < 7 && c < 7) || (r < 7 && c >= cells - 7) || (r >= cells - 7 && c < 7);
      if (isFinder) {
        const lr = r < 7 ? r : r - (cells - 7);
        const lc = c < 7 ? c : c - (cells - 7);
        const isBorder = lr === 0 || lr === 6 || lc === 0 || lc === 6;
        const isInner = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
        grid[r][c] = isBorder || isInner;
      } else {
        grid[r][c] = next() % 2 === 0;
      }
    }
  }

  const cellSize = size / cells;

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div
        className="rounded-lg bg-white p-2 border border-gray-200"
        style={{ width: size + 16, height: size + 16 }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {grid.map((row, r) =>
            row.map((on, c) =>
              on ? (
                <rect
                  key={`${r}-${c}`}
                  x={c * cellSize}
                  y={r * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill="#111827"
                />
              ) : null
            )
          )}
        </svg>
      </div>
      <p className="text-xs font-mono font-medium text-gray-500">{value}</p>
    </div>
  );
}
