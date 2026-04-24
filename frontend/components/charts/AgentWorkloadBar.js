'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const PRIMARY_COLOR = '#12c233';

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
        margin={{ left: 80, right: 20, top: 20, bottom: 20 }}
      >
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#12c233" />
            <stop offset="100%" stopColor="#3ace4e" />
          </linearGradient>
          <filter id="barShadow" x="-5%" y="-10%" width="110%" height="130%">
            <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.15" />
          </filter>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          type="number" 
          tick={{ fontSize: 10, fill: '#6B7280' }}
          axisLine={{ stroke: '#d1d5db' }}
        />
        <YAxis 
          type="category" 
          dataKey="agent_name" 
          tick={{ fontSize: 11, fill: '#374151' }}
          width={80}
          axisLine={{ stroke: '#d1d5db' }}
        />
        <Tooltip 
          formatter={(value) => [`${value} fields`, 'Assigned']}
          contentStyle={{ 
            fontSize: '12px', 
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}
          cursor={{ fill: '#f3f4f6' }}
        />
        <Bar 
          dataKey="field_count" 
          fill="url(#barGradient)" 
          radius={[0, 6, 6, 0]}
          filter="url(#barShadow)"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill="url(#barGradient)" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}