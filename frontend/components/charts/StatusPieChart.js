'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from 'recharts';
import { useState } from 'react';

const COLORS = ['#12c233', '#F59E0B', '#6B7280'];

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  
  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="#374151" fontSize={12} fontWeight="bold">
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="#6B7280" fontSize={11}>
        {`${value} fields (${(percent * 100).toFixed(0)}%)`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.9}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
        opacity={0.3}
      />
    </g>
  );
};

export default function StatusPieChart({ data }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!data || data.length === 0 || data.every(d => d.value === 0)) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No data available
      </div>
    );
  }

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <defs>
          {COLORS.map((color, index) => (
            <filter key={index} id={`shadow-${index}`}>
              <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.2" />
            </filter>
          ))}
        </defs>
        <Pie
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          dataKey="value"
          onMouseEnter={onPieEnter}
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]} 
              stroke="white"
              strokeWidth={2}
              filter={`url(#shadow-${index % COLORS.length})`}
            />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [`${value} fields`, 'Count']}
          contentStyle={{ 
            fontSize: '12px', 
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}
        />
        <Legend 
          wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
          iconType="circle"
          formatter={(value, entry) => <span className="text-gray-700">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}