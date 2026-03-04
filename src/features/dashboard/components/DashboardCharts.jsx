import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function DashboardCharts({ porSetor, porStatus, theme, s }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
      <div className={`${s.card} p-6 rounded-[2.5rem]`}>
        <h3 className="text-lg font-black uppercase italic text-red-600 mb-6">Volume por Setor</h3>
        <div className="h-80">
          {porSetor.length === 0 ? (
            <div className={`h-full flex items-center justify-center ${s.sub} text-sm`}>Sem dados no periodo</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porSetor} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#fff',
                    border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                  }}
                  labelStyle={{ color: theme === 'dark' ? '#fff' : '#0f172a' }}
                />
                <Bar dataKey="total" fill="#dc2626" radius={[4, 4, 0, 0]} name="Falhas" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className={`${s.card} p-6 rounded-[2.5rem]`}>
        <h3 className="text-lg font-black uppercase italic text-red-600 mb-6">Status (aberto vs concluido)</h3>
        <div className="h-80">
          {porStatus.length === 0 ? (
            <div className={`h-full flex items-center justify-center ${s.sub} text-sm`}>Sem dados no periodo</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={porStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {porStatus.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#0f172a' : '#fff',
                    border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
