'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = [
  '#22C55E', // green
  '#EAB308', // mustard
  '#3B82F6', // blue
  '#EF4444', // red
  '#8B5CF6', // purple
  '#06B6D4', // cyan
];

export default function CropDistributionBar({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No crop data available
      </div>
    );
  }

  const formattedData = data.map((item) => ({
    name: item.crop_type,
    value: item.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formattedData} margin={{ top: 20, right: 20, left: 0, bottom: 30 }}>
        
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

        <XAxis
          dataKey="name"
          tick={{ fontSize: 11 }}
          axisLine={{ stroke: '#d1d5db' }}
          label={{ value: 'Crop Type', position: 'insideBottom', offset: -10, fontSize: 11 }}
        />

        <YAxis
          tick={{ fontSize: 11 }}
          axisLine={{ stroke: '#d1d5db' }}
          label={{ value: 'Number of Fields', angle: -90, position: 'insideLeft', fontSize: 11 }}
        />

        <Tooltip
          formatter={(value) => [`${value} fields`, 'Count']}
        />

        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {formattedData.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>

      </BarChart>
    </ResponsiveContainer>
  );
}