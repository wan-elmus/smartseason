'use client';

import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { getRelativeTime } from '@/lib/utils';

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
      {/* 👇 enforce minimum table width for proper spacing */}
      <table className="min-w-[720px] w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase whitespace-nowrap">
              Field Name
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase whitespace-nowrap">
              Crop
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase whitespace-nowrap">
              Stage
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase whitespace-nowrap">
              Status
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase whitespace-nowrap">
              Last Update
            </th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-700 uppercase whitespace-nowrap">
              Action
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {displayFields.map((field) => (
            <tr key={field.id} className="hover:bg-gray-50 transition-colors">
              
              {/* Field Name */}
              <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                {field.name}
              </td>

              {/* Crop */}
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                {field.crop_type}
              </td>

              {/* Stage */}
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                {field.current_stage || '—'}
              </td>

              {/* Status */}
              <td className="px-4 py-3 whitespace-nowrap">
                <StatusBadge status="At Risk" size="sm" />
              </td>

              {/* Last Update */}
              <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                {field.last_update
                  ? getRelativeTime(field.last_update)
                  : 'No updates'}
              </td>

              {/* Action */}
              <td className="px-4 py-3 text-center whitespace-nowrap">
                <Button
                  href={`/fields/${field.id}`}
                  variant="danger"
                  size="xs"
                >
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