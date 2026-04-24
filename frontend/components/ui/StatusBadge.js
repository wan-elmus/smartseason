'use client';

export default function StatusBadge({ status, size = 'sm' }) {
  const colors = {
    Active: 'bg-green-100 text-green-800',
    'At Risk': 'bg-yellow-100 text-yellow-800',
    Completed: 'bg-gray-100 text-gray-800',
  };
  
  const sizes = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };
  
  const color = colors[status] || 'bg-gray-100 text-gray-800';
  
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizes[size]} ${color}`}>
      {status}
    </span>
  );
}