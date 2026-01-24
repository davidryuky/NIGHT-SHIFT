import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Task, TaskStatus } from '../types';

interface StatsProps {
  tasks: Task[];
}

const Stats: React.FC<StatsProps> = ({ tasks }) => {
  // Calculate distribution
  const data = [
    { name: 'Todo', value: tasks.filter(t => t.status === TaskStatus.TODO).length, color: '#3b82f6' },
    { name: 'WIP', value: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length, color: '#eab308' },
    { name: 'Review', value: tasks.filter(t => t.status === TaskStatus.CODE_REVIEW).length, color: '#a855f7' },
    { name: 'Done', value: tasks.filter(t => t.status === TaskStatus.DONE).length, color: '#00ff9d' },
  ];

  return (
    <div className="h-48 w-full bg-night-800 border border-gray-800 rounded-lg p-4">
      <h3 className="text-gray-400 text-xs font-mono mb-2 uppercase tracking-widest">Shift Velocity</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#6b7280', fontSize: 10 }} 
            axisLine={false} 
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0a0a0c', borderColor: '#333', color: '#fff' }}
            itemStyle={{ color: '#fff' }}
            cursor={{fill: 'transparent'}}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Stats;
