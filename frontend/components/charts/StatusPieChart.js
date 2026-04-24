'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = {
  Active: '#22C55E',
  'At Risk': '#F59E0B',
  Completed: '#6B7280',
};

export default function StatusPieChart({ data }) {
  if (!data || data.length === 0 || data.every(d => d.value === 0)) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No data available
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>

        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          label={renderCustomLabel}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell 
              key={index}
              fill={COLORS[entry.name]} 
              stroke="white"
              strokeWidth={2}
            />
          ))}
        </Pie>

        <Tooltip 
          formatter={(value) => [
            `${value} fields (${((value / total) * 100).toFixed(1)}%)`,
            'Status'
          ]}
          contentStyle={{ 
            fontSize: '12px', 
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}
        />

        <Legend 
          wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
          iconType="circle"
        />

      </PieChart>
    </ResponsiveContainer>
  );
}