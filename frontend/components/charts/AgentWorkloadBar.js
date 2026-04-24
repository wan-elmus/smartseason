'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AgentWorkloadBar({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No agent data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart 
        data={data} 
        layout="vertical" 
        margin={{ left: 90, right: 20, top: 20, bottom: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

        <XAxis 
          type="number" 
          tick={{ fontSize: 10, fill: '#6B7280' }}
          axisLine={{ stroke: '#d1d5db' }}
          label={{ value: 'Fields Assigned', position: 'insideBottom', offset: -10, fontSize: 11 }}
        />

        <YAxis 
          type="category" 
          dataKey="agent_name" 
          tick={{ fontSize: 11, fill: '#374151' }}
          width={90}
          axisLine={{ stroke: '#d1d5db' }}
          label={{ value: 'Agents', angle: -90, position: 'insideLeft', fontSize: 11 }}
        />

        <Tooltip 
          formatter={(value) => [`${value} fields`, 'Assigned']}
          contentStyle={{ 
            fontSize: '12px', 
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}
        />

        <Bar 
          dataKey="field_count" 
          fill="#22c55e"
          radius={[0, 6, 6, 0]}
        >
          {data.map((_, index) => (
            <Cell key={index} fill="#22c55e" />
          ))}
        </Bar>

      </BarChart>
    </ResponsiveContainer>
  );
}