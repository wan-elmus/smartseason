'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useEffect, useState } from 'react';

export default function AgentWorkloadBar({ data }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No agent data available
      </div>
    );
  }

  const getLeftMargin = () => {
    if (isMobile) return 60;
    return 100;
  };

  const getYAxisWidth = () => {
    if (isMobile) return 55;
    return 90;
  };

  const getFontSize = () => {
    if (isMobile) return 9;
    return 11;
  };

  const chartHeight = isMobile ? 280 : 320;
  const barRadius = [0, 6, 6, 0];

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart 
        data={data} 
        layout="vertical" 
        margin={{ left: getLeftMargin(), right: 20, top: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

        <XAxis 
          type="number" 
          tick={{ fontSize: getFontSize(), fill: '#6B7280' }}
          axisLine={{ stroke: '#d1d5db' }}
          label={{ 
            value: 'Fields', 
            position: 'insideBottom', 
            offset: -5, 
            fontSize: isMobile ? 9 : 11,
            style: { fill: '#6B7280' }
          }}
        />

        <YAxis 
          type="category" 
          dataKey="agent_name" 
          tick={{ fontSize: getFontSize(), fill: '#374151' }}
          width={getYAxisWidth()}
          axisLine={{ stroke: '#d1d5db' }}
          tickFormatter={(value) => {
            if (isMobile && value.length > 12) {
              return value.substring(0, 10) + '...';
            }
            return value;
          }}
        />

        <Tooltip 
          formatter={(value) => [`${value} fields`, 'Assigned']}
          contentStyle={{ 
            fontSize: '12px', 
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            backgroundColor: 'white'
          }}
        />

        <Bar 
          dataKey="field_count" 
          fill="#22c55e"
          radius={barRadius}
        >
          {data.map((_, index) => (
            <Cell key={index} fill="#22c55e" />
          ))}
        </Bar>

      </BarChart>
    </ResponsiveContainer>
  );
}