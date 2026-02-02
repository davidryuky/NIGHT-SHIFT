import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Task, TaskStatus, PomodoroSession } from '../types';

interface StatsProps {
  tasks: Task[];
  pomodoroSessions: PomodoroSession[];
}

const FocusHeatmap: React.FC<{ sessions: PomodoroSession[] }> = ({ sessions }) => {
  // Gera os últimos 180 dias para o mapa de calor
  const now = new Date();
  const totalDays = 180;
  
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

  // Define a opacidade baseada no nível de foco, usando a cor neon principal do tema
  const getHeatStyle = (value: number) => {
    if (value === 0) return { backgroundColor: 'var(--color-neon-blue)', opacity: 0.05 };
    if (value < 25) return { backgroundColor: 'var(--color-neon-green)', opacity: 0.2 };
    if (value < 60) return { backgroundColor: 'var(--color-neon-green)', opacity: 0.4 };
    if (value < 120) return { backgroundColor: 'var(--color-neon-green)', opacity: 0.7 };
    return { backgroundColor: 'var(--color-neon-green)', opacity: 1 };
  };

  return (
    <div className="bg-night-900/60 border border-gray-800 rounded-lg p-5 flex flex-col w-full overflow-hidden backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-400 text-[10px] font-mono uppercase tracking-[0.2em]">Focus_Heatmap (Last 180 Days)</h3>
        <div className="flex items-center gap-2 text-[8px] font-mono text-gray-500 uppercase">
          <span>Less</span>
          <div className="w-2 h-2 rounded-[1px]" style={{ backgroundColor: 'var(--color-neon-green)', opacity: 0.1 }} />
          <div className="w-2 h-2 rounded-[1px]" style={{ backgroundColor: 'var(--color-neon-green)', opacity: 0.3 }} />
          <div className="w-2 h-2 rounded-[1px]" style={{ backgroundColor: 'var(--color-neon-green)', opacity: 0.5 }} />
          <div className="w-2 h-2 rounded-[1px]" style={{ backgroundColor: 'var(--color-neon-green)', opacity: 0.7 }} />
          <div className="w-2 h-2 rounded-[1px]" style={{ backgroundColor: 'var(--color-neon-green)', opacity: 1 }} />
          <span>More</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1 items-start justify-start max-w-full">
        {heatmapData.map((day, idx) => (
          <div 
            key={idx}
            title={`${day.date}: ${day.value} min focus`}
            style={getHeatStyle(day.value)}
            className="w-2.5 h-2.5 rounded-[1px] transition-all hover:scale-125 cursor-crosshair hover:z-10"
          />
        ))}
      </div>
    </div>
  );
};

const Stats: React.FC<StatsProps> = ({ tasks, pomodoroSessions }) => {
  // Mapeamento de tarefas usando cores do tema
  const taskData = [
    { name: 'Todo', value: tasks.filter(t => t.status === TaskStatus.TODO).length, color: 'var(--color-night-700)' },
    { name: 'WIP', value: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length, color: 'var(--color-neon-blue)' },
    { name: 'Review', value: tasks.filter(t => t.status === TaskStatus.CODE_REVIEW).length, color: 'var(--color-neon-purple)' },
    { name: 'Done', value: tasks.filter(t => t.status === TaskStatus.DONE).length, color: 'var(--color-neon-green)' },
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
        <div className="h-64 bg-night-900/60 border border-gray-800 rounded-lg p-5 flex flex-col backdrop-blur-sm">
          <h3 className="text-gray-400 text-[10px] font-mono mb-4 uppercase tracking-[0.2em]">Shift Distribution</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskData}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#666', fontSize: 10, fontFamily: 'JetBrains Mono' }} 
                  axisLine={false} 
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-night-950)', 
                    border: '1px solid var(--color-night-700)', 
                    borderRadius: '4px',
                    color: '#fff', 
                    fontSize: '10px', 
                    fontFamily: 'JetBrains Mono' 
                  }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{fill: 'rgba(255,255,255,0.03)'}}
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

        <div className="h-64 bg-night-900/60 border border-gray-800 rounded-lg p-5 flex flex-col backdrop-blur-sm">
          <h3 className="text-gray-400 text-[10px] font-mono mb-4 uppercase tracking-[0.2em]">Focus Velocity (Min/Day)</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={focusData}>
                <XAxis 
                  dataKey="dateStr" 
                  tick={{ fill: '#666', fontSize: 10, fontFamily: 'JetBrains Mono' }} 
                  axisLine={false} 
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-night-950)', 
                    border: '1px solid var(--color-night-700)', 
                    borderRadius: '4px',
                    color: '#fff', 
                    fontSize: '10px', 
                    fontFamily: 'JetBrains Mono' 
                  }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{fill: 'rgba(255,255,255,0.03)'}}
                />
                <Bar dataKey="minutes" fill="var(--color-neon-blue)" opacity={0.8} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;