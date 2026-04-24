'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function FieldTrendLine({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No trend data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 30 }}>

        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          axisLine={{ stroke: '#d1d5db' }}
          label={{ value: 'Time', position: 'insideBottom', offset: -10, fontSize: 11 }}
        />

        <YAxis
          tick={{ fontSize: 11 }}
          axisLine={{ stroke: '#d1d5db' }}
          label={{ value: 'Fields', angle: -90, position: 'insideLeft', fontSize: 11 }}
        />

        <Tooltip />

        <Line
          type="monotone"
          dataKey="fields"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />

      </LineChart>
    </ResponsiveContainer>
  );
}