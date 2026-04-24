'use client';

import { getStageBadgeClass } from '@/lib/utils';

export default function StageBadge({ stage }) {
  if (!stage) return null;
  
  return (
    <span className={`${getStageBadgeClass(stage)} font-medium capitalize`}>
      {stage}
    </span>
  );
}