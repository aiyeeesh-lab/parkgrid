import { useState } from 'react';
import type { ParkingBay, BayStatus } from '@/types';
import { ParkingBayCell } from './ParkingBayCell';
import { StatusBadge } from './ui';
import { bayStatusConfig } from '@/lib/status';

interface ParkingGridProps {
  bays: ParkingBay[];
  onBayClick?: (bay: ParkingBay) => void;
  showFilters?: boolean;
}

const filterStatuses: BayStatus[] = ['AVAILABLE', 'RESERVED', 'ACTIVE', 'TURNOVER', 'MAINTENANCE'];

export function ParkingGrid({ bays, onBayClick, showFilters = true }: ParkingGridProps) {
  const [filter, setFilter] = useState<BayStatus | 'ALL'>('ALL');

  const levels = [...new Set(bays.map((b) => b.level))].sort((a, b) => a - b);
  const filtered = filter === 'ALL' ? bays : bays.filter((b) => b.status === filter);

  const counts: Record<BayStatus, number> = {
    AVAILABLE: 0, RESERVED: 0, ACTIVE: 0, TURNOVER: 0, MAINTENANCE: 0,
  };
  bays.forEach((b) => counts[b.status]++);

  return (
    <div>
      {showFilters && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === 'ALL' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({bays.length})
          </button>
          {filterStatuses.map((s) => {
            const cfg = bayStatusConfig[s];
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filter === s ? `${cfg.solidBg} ${cfg.solidText}` : `${cfg.bg} ${cfg.text} hover:opacity-80`
                }`}
              >
                {cfg.label} ({counts[s]})
              </button>
            );
          })}
        </div>
      )}

      {levels.map((level) => {
        const levelBays = filtered.filter((b) => b.level === level);
        if (levelBays.length === 0) return null;
        return (
          <div key={level} className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <h4 className="text-sm font-semibold text-gray-700">Level {level}</h4>
              <span className="text-xs text-gray-400">({levelBays.length} bays)</span>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
              {levelBays.map((bay) => (
                <ParkingBayCell key={bay.id} bay={bay} compact onClick={onBayClick} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
