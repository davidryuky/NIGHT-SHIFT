import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Task, TaskStatus, PomodoroSession } from '../types';

interface StatsProps {
  tasks: Task[];
  pomodoroSessions: PomodoroSession[];
}

const FocusHeatmap: React.FC<{ sessions: PomodoroSession[] }> = ({ sessions }) => {
  // Generate last 6 months of data for a Github-style heatmap
  const now = new Date();
  const weeksToShow = 26; // ~6 months
  const totalDays = weeksToShow * 7;
  
  const daysMap: Record<string, number> = {};
  sessions.forEach(s => {
    const dateKey = new Date(s.timestamp).toDateString();
    daysMap[dateKey] = (daysMap[dateKey] || 0) + s.durationMinutes;
  });

  const heatmapData = [];
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toDateString();
    heatmapData.push({
      date: key,
      value: daysMap[key] || 0
    });
  }

  const getHeatColor = (value: number) => {
    if (value === 0) return 'bg-white/5';
    if (value < 25) return 'bg-gray-700';
    if (value < 60) return 'bg-gray-500';
    if (value < 120) return 'bg-gray-300';
    return 'bg-white';
  };

  return (
    <div className="bg-night-900 border border-gray-800 rounded-lg p-5 flex flex-col w-full overflow-hidden">
      <h3 className="text-gray-400 text-[10px] font-mono mb-4 uppercase tracking-[0.2em]">Focus_Heatmap (Last 180 Days)</h3>
      <div className="flex flex-wrap gap-1 items-start justify-start max-w-full">
        {heatmapData.map((day, idx) => (
          <div 
            key={idx}
            title={`${day.date}: ${day.value} min focus`}
            className={`w-2.5 h-2.5 rounded-[1px] ${getHeatColor(day.value)} transition-all hover:ring-1 hover:ring-white/50 cursor-crosshair`}
          />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-end gap-2 text-[8px] font-mono text-gray-600 uppercase">
        <span>Less</span>
        <div className="w-2 h-2 rounded-[1px] bg-white/5" />
        <div className="w-2 h-2 rounded-[1px] bg-gray-700" />
        <div className="w-2 h-2 rounded-[1px] bg-gray-500" />
        <div className="w-2 h-2 rounded-[1px] bg-gray-300" />
        <div className="w-2 h-2 rounded-[1px] bg-white" />
        <span>More</span>
      </div>
    </div>
  );
};

const Stats: React.FC<StatsProps> = ({ tasks, pomodoroSessions }) => {
  const taskData = [
    { name: 'Todo', value: tasks.filter(t => t.status === TaskStatus.TODO).length, color: '#444' },
    { name: 'WIP', value: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length, color: '#777' },
    { name: 'Review', value: tasks.filter(t => t.status === TaskStatus.CODE_REVIEW).length, color: '#aaa' },
    { name: 'Done', value: tasks.filter(t => t.status === TaskStatus.DONE).length, color: '#fff' },
  ];

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
      <FocusHeatmap sessions={pomodoroSessions} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-night-900 border border-gray-800 rounded-lg p-5 flex flex-col">
          <h3 className="text-gray-400 text-[10px] font-mono mb-4 uppercase tracking-[0.2em]">Shift Distribution</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskData}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'JetBrains Mono' }} 
                  axisLine={false} 
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020202', border: '1px solid #333', color: '#fff', fontSize: '10px' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{fill: 'rgba(255,255,255,0.02)'}}
                />
                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                  {taskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="h-64 bg-night-900 border border-gray-800 rounded-lg p-5 flex flex-col">
          <h3 className="text-gray-400 text-[10px] font-mono mb-4 uppercase tracking-[0.2em]">Focus Velocity</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={focusData}>
                <XAxis 
                  dataKey="dateStr" 
                  tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'JetBrains Mono' }} 
                  axisLine={false} 
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020202', border: '1px solid #333', color: '#fff', fontSize: '10px' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{fill: 'rgba(255,255,255,0.02)'}}
                />
                <Bar dataKey="minutes" fill="#888" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;