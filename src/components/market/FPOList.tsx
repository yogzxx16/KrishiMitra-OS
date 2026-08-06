import React from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Users,
  Phone,
  Star,
  Package,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAppStore } from '../../store/appStore';
import { formatDistance } from '../../utils/formatters';
import type { FPOEntity } from '../../types';
import { CROP_BASELINE_DATA } from '../../config/constants';

interface FPOCardProps {
  fpo: FPOEntity;
  index: number;
}

function FPOCard({ fpo, index }: FPOCardProps) {
  const { setSelectedFPO, selectedFPO } = useAppStore();
  const isSelected = selectedFPO?.id === fpo.id;

  return (
    <motion.article
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className={[
        'rounded-lg border p-4 cursor-pointer transition-all duration-200 shadow-sm',
        isSelected
          ? 'bg-green-50 border-[var(--color-goi-green)] ring-1 ring-[var(--color-goi-green)]'
          : 'bg-white border-gray-200 hover:border-[var(--color-goi-green)] hover:shadow-md',
      ].join(' ')}
      onClick={() => setSelectedFPO(isSelected ? null : fpo)}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedFPO(isSelected ? null : fpo)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-gray-900 truncate">{fpo.name}</h4>
            {isSelected && (
              <CheckCircle2 className="h-4 w-4 text-[var(--color-goi-green)] shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-600 font-medium">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate">
              {fpo.block}, {fpo.district}
            </span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <Badge variant="slate" size="sm">
            {formatDistance(fpo.distanceKm)}
          </Badge>
          <div className="flex items-center gap-0.5 mt-1.5 justify-end">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(fpo.rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
                aria-hidden="true"
              />
            ))}
            <span className="text-[10px] text-gray-500 font-semibold ml-1">{fpo.rating}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {fpo.procurementCrops.map((cropId) => {
          const crop = CROP_BASELINE_DATA[cropId];
          return crop ? (
            <Badge key={cropId} variant="amber" size="sm">
              {crop.emoji} {crop.name}
            </Badge>
          ) : null;
        })}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
          <Users className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{fpo.memberCount.toLocaleString('en-IN')} members</span>
        </div>
        <a
          href={`tel:${fpo.contactPhone}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-xs font-semibold text-[var(--color-goi-navy)] hover:text-blue-800 transition-colors bg-blue-50 px-2 py-1 rounded"
          aria-label={`Call ${fpo.name}`}
        >
          <Phone className="h-3 w-3" aria-hidden="true" />
          <span>Call FPO</span>
        </a>
      </div>
    </motion.article>
  );
}

// ─── FPO List ─────────────────────────────────────────────────────────────────

interface FPOListProps {
  fpos: FPOEntity[];
  onIntentionClick: () => void;
}

export function FPOList({ fpos, onIntentionClick }: FPOListProps) {
  const { selectedFPO } = useAppStore();

  if (fpos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg bg-gray-50">
        <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm font-semibold">No Procurement Centers Found</p>
        <p className="text-xs mt-1 text-gray-500">Try expanding the search radius.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {fpos.map((fpo, i) => (
        <FPOCard key={fpo.id} fpo={fpo} index={i} />
      ))}

      {selectedFPO && (
        <div className="sticky bottom-0 pt-3 pb-2 bg-white/80 backdrop-blur border-t border-gray-100 mt-4">
          <Button
            variant="amber"
            size="lg"
            fullWidth
            onClick={onIntentionClick}
          >
            Submit Official Procurement Interest ({selectedFPO.name})
          </Button>
        </div>
      )}
    </div>
  );
}
