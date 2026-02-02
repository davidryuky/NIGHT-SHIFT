import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Task, TaskStatus, PomodoroSession } from '../types';

interface StatsProps {
  tasks: Task[];
  pomodoroSessions: PomodoroSession[];
}

const Stats: React.FC<StatsProps> = ({ tasks, pomodoroSessions }) => {
  // Task Distribution Data
  const taskData = [
    { name: 'Todo', value: tasks.filter(t => t.status === TaskStatus.TODO).length, color: '#3b82f6' },
    { name: 'WIP', value: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length, color: '#eab308' },
    { name: 'Review', value: tasks.filter(t => t.status === TaskStatus.CODE_REVIEW).length, color: '#a855f7' },
    { name: 'Done', value: tasks.filter(t => t.status === TaskStatus.DONE).length, color: '#00ff9d' },
  ];

  // Pomodoro Focus Data (Last 7 Days)
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        dateStr: d.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: d.toDateString(),
        minutes: 0,
      });
    }
    return days;
  };

  const focusData = getLast7Days();
  pomodoroSessions.forEach(session => {
    const sessionDate = new Date(session.timestamp).toDateString();
    const day = focusData.find(d => d.fullDate === sessionDate);
    if (day) {
      day.minutes += session.durationMinutes;
    }
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Distribution Card */}
        <div className="h-64 bg-night-900 border border-gray-800 rounded-lg p-5 flex flex-col">
          <h3 className="text-gray-400 text-xs font-mono mb-4 uppercase tracking-widest">Shift Distribution</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskData}>
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
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {taskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pomodoro Focus Card */}
        <div className="h-64 bg-night-900 border border-gray-800 rounded-lg p-5 flex flex-col">
          <h3 className="text-gray-400 text-xs font-mono mb-4 uppercase tracking-widest">Focus Intensity (Minutes)</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={focusData}>
                <XAxis 
                  dataKey="dateStr" 
                  tick={{ fill: '#6b7280', fontSize: 10 }} 
                  axisLine={false} 
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0c', borderColor: '#333', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="minutes" fill="var(--color-neon-purple)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;