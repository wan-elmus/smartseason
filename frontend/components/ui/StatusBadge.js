'use client';

import { getStatusColor } from '@/lib/utils';

export default function StatusBadge({ status }) {
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
      {status}
    </span>
  );
}