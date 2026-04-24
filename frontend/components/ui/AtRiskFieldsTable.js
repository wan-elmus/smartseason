'use client';

import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { getRelativeTime } from '@/lib/utils';
import { Eye } from 'lucide-react';

export default function AtRiskFieldsTable({ fields, maxDisplay = 5, onViewAll }) {
  const displayFields = fields?.slice(0, maxDisplay) || [];
  const hasMore = fields?.length > maxDisplay;

  if (displayFields.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">No at-risk fields at this time</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-semibold  text-gray-800 uppercase tracking-wider">
              Field Name
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold  text-gray-800 uppercase tracking-wider">
              Crop
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold  text-gray-800 uppercase tracking-wider">
              Stage
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold  text-gray-800 uppercase tracking-wider">
              Status
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold  text-gray-800 uppercase tracking-wider">
              Last Update
            </th>
            <th className="text-center font-semibold px-4 py-3 text-xs text-gray-800 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {displayFields.map((field) => (
            <tr key={field.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">
                {field.name}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {field.crop_type}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {field.current_stage || '—'}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status="At Risk" size="sm" />
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">
                {field.last_update
                  ? getRelativeTime(field.last_update)
                  : 'No updates'}
              </td>
              <td className="px-4 py-3 text-center">
                <Button
                  href={`/fields/${field.id}`}
                  variant="danger"
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

      {hasMore && onViewAll && (
        <div className="pt-4 pb-2 px-4 border-t border-gray-100 flex justify-center">
          <Button onClick={onViewAll} variant="primary" size="sm">
            View All {fields.length}
          </Button>
        </div>
      )}
    </div>
  );
}