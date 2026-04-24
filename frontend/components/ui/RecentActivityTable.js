'use client';

import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { Eye } from 'lucide-react';

export default function RecentActivityTable({ updates, maxDisplay = 5 }) {
  const displayUpdates = updates?.slice(0, maxDisplay) || [];

  if (displayUpdates.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">No recent updates</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-800 uppercase tracking-wider">
              Field
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-800 uppercase tracking-wider">
              Stage
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-800 uppercase tracking-wider">
              Date
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-800 uppercase tracking-wider">
              Notes
            </th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-800 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {displayUpdates.map((update) => (
            <tr key={update.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">
                {update.field_name || `Field #${update.field_id}`}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={update.new_stage} size="xs" />
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">
                {new Date(update.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </td>
              <td className="px-4 py-3 text-gray-600 text-xs max-w-xs truncate">
                {update.notes || '—'}
              </td>
              <td className="px-4 py-3 text-center">
                <Button
                  href={`/fields/${update.field_id}`}
                  variant="primary"
                  size="xs"
                >
                  {/* <Eye className="w-3.5 h-3.5 mr-1" /> */}
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}