'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AgentWorkloadBar({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 py-8">No agents data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="agent_name" angle={-45} textAnchor="end" height={80} />
        <YAxis />
        <Tooltip />
        <Bar dataKey="field_count" fill="#2E7D32" name="Fields Assigned" />
      </BarChart>
    </ResponsiveContainer>
  );
}