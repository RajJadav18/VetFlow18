import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
  AreaChart, Area,
} from 'recharts';

const TOOLTIP = { background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'8px', fontSize:11, color:'var(--text-1)' };

const WEEKLY = [
  {day:'Mon',cases:52,critical:2},{day:'Tue',cases:68,critical:4},{day:'Wed',cases:43,critical:1},
  {day:'Thu',cases:91,critical:6},{day:'Fri',cases:61,critical:3},{day:'Sat',cases:35,critical:1},{day:'Sun',cases:27,critical:0},
];
const MONTHLY = [
  {month:'Oct',cases:890,revenue:620000},{month:'Nov',cases:920,revenue:680000},{month:'Dec',cases:1100,revenue:780000},
  {month:'Jan',cases:980,revenue:690000},{month:'Feb',cases:1020,revenue:720000},{month:'Mar',cases:1060,revenue:750000},{month:'Apr',cases:847,revenue:840000},
];
const SPECIES = [
  {name:'Canine',value:45,color:'#00C896'},{name:'Feline',value:25,color:'#3B82F6'},
  {name:'Bovine',value:16,color:'#FF8C42'},{name:'Wildlife',value:14,color:'#7EE8A2'},
];
const URGENCY = [
  {name:'Critical',value:3,color:'#FF3B3B'},{name:'High',value:7,color:'#FF8C42'},
  {name:'Medium',value:12,color:'#FFCC00'},{name:'Low',value:25,color:'#00C896'},
];
const BRANCHES = [
  {branch:'Mumbai Central',cases:847,critical:3,response:4.2,ambTrips:42,wildlife:12,grade:'A+',score:97},
  {branch:'Bandra West',   cases:612,critical:1,response:5.8,ambTrips:28,wildlife:5, grade:'B+',score:84},
  {branch:'Andheri East',  cases:944,critical:5,response:6.1,ambTrips:58,wildlife:8, grade:'A', score:89},
  {branch:'Navi Mumbai',   cases:444,critical:0,response:3.9,ambTrips:19,wildlife:3, grade:'A+',score:98},
];
const RESPONSE_TREND = [
  {week:'W1',time:7.2},{week:'W2',time:6.8},{week:'W3',time:6.1},{week:'W4',time:5.4},{week:'W5',time:4.9},{week:'W6',time:4.8},
];

const GRADE_COLORS = { 'A+':'badge-low', 'A':'badge-low', 'B+':'badge-med', 'B':'badge-med', 'C':'badge-high' };

export default function Analytics() {
  const [period, setPeriod] = useState('week');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="font-head text-xl font-bold">Analytics</div>
        <div className="flex rounded-lg p-1" style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)' }}>
          {['week','month','year'].map(p => (
            <button key={p} onClick={()=>setPeriod(p)}
              className="px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all"
              style={{ background:period===p?'var(--bg-surface)':'transparent', color:period===p?'var(--text-1)':'var(--text-3)', border:period===p?'1px solid var(--border)':'1px solid transparent' }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['📊','2,847','Total Cases 2026',    '↑ 18% vs 2025', true,  'var(--accent)' ],
          ['⚡','4.8m', 'Avg Response Time',   '↓ 2.1m faster',  true,  'var(--blue)'   ],
          ['🤖','94.2%','Triage Accuracy',     '↑ 2.4% this month',true,'var(--wild)'   ],
          ['🏡','312',  'Strays Rescued',      '↑ 34 this month', true,  'var(--purple)' ],
        ].map(([icon,val,label,trend,up,color]) => (
          <motion.div key={label} className="card relative overflow-hidden" whileHover={{ y:-2 }}>
            <div className="absolute top-0 inset-x-0 h-px" style={{ background:`linear-gradient(90deg,transparent,${color},transparent)`, opacity:0.5 }} />
            <div className="text-lg mb-2">{icon}</div>
            <div className="font-head text-3xl font-black mb-1" style={{ color }}>{val}</div>
            <div className="text-xs font-medium mb-1" style={{ color:'var(--text-2)' }}>{label}</div>
            <div className={`text-[10px] font-mono ${up?'text-emerald-400':'text-red-400'}`}>{trend}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart */}
        <div className="lg:col-span-2 card">
          <div className="text-xs font-bold uppercase tracking-wider font-mono mb-4 flex items-center gap-2" style={{ color:'var(--text-3)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background:'var(--accent)' }} />Weekly Case Volume
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={WEEKLY} barGap={4}>
              <XAxis dataKey="day" tick={{ fontSize:10, fill:'var(--text-3)', fontFamily:'DM Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:'var(--text-3)', fontFamily:'DM Mono' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} cursor={{ fill:'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="cases"    name="Total Cases"    fill="var(--accent)" radius={[4,4,0,0]} maxBarSize={24} />
              <Bar dataKey="critical" name="Critical Cases" fill="var(--crit)"   radius={[4,4,0,0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut */}
        <div className="card">
          <div className="text-xs font-bold uppercase tracking-wider font-mono mb-4 flex items-center gap-2" style={{ color:'var(--text-3)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background:'var(--accent)' }} />Species Breakdown
          </div>
          <div className="flex flex-col items-center">
            <PieChart width={160} height={160}>
              <Pie data={SPECIES} cx={78} cy={78} innerRadius={48} outerRadius={72} dataKey="value" strokeWidth={0}>
                {SPECIES.map((e,i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
            <div className="space-y-2 w-full mt-2">
              {SPECIES.map(s => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background:s.color }} />
                    <span style={{ color:'var(--text-2)' }}>{s.name}</span>
                  </div>
                  <span className="font-mono font-semibold">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue trend */}
        <div className="card">
          <div className="text-xs font-bold uppercase tracking-wider font-mono mb-4 flex items-center gap-2" style={{ color:'var(--text-3)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background:'var(--blue)' }} />Revenue Trend (₹ Lakhs)
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={MONTHLY}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize:10, fill:'var(--text-3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:'var(--text-3)' }} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/100000).toFixed(0)}L`} />
              <Tooltip contentStyle={TOOLTIP} formatter={v=>[`₹${(v/100000).toFixed(1)}L`,'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Response time trend */}
        <div className="card">
          <div className="text-xs font-bold uppercase tracking-wider font-mono mb-4 flex items-center gap-2" style={{ color:'var(--text-3)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background:'var(--wild)' }} />Response Time Improvement (min)
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={RESPONSE_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fontSize:10, fill:'var(--text-3)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:'var(--text-3)' }} axisLine={false} tickLine={false} domain={[3,8]} />
              <Tooltip contentStyle={TOOLTIP} formatter={v=>[`${v} min`,'Response Time']} />
              <Line type="monotone" dataKey="time" stroke="var(--wild)" strokeWidth={2.5} dot={{ fill:'var(--wild)', r:4 }} activeDot={{ r:6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Branch comparison */}
      <div className="card overflow-hidden p-0">
        <div className="px-5 py-4" style={{ borderBottom:'1px solid var(--border)' }}>
          <div className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2" style={{ color:'var(--text-3)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background:'var(--accent)' }} />Branch Performance Comparison
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ padding:'8px 20px' }}>Branch</th>
              <th>Cases</th><th>Critical</th><th>Avg Response</th><th>Amb. Trips</th><th>Wildlife</th><th>Score</th><th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {BRANCHES.map((b, i) => (
              <motion.tr key={b.branch} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.08 }}>
                <td style={{ padding:'13px 20px' }} className="font-semibold text-xs">{b.branch}</td>
                <td className="font-mono text-xs">{b.cases}</td>
                <td className="font-mono text-xs" style={{ color:'var(--crit)' }}>{b.critical}</td>
                <td className="font-mono text-xs" style={{ color: b.response<5?'var(--accent)':b.response<6?'var(--warn)':'var(--high)' }}>{b.response}m</td>
                <td className="font-mono text-xs">{b.ambTrips}</td>
                <td className="font-mono text-xs" style={{ color:'var(--wild)' }}>{b.wildlife}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full" style={{ background:'var(--bg-elevated)' }}>
                      <div className="h-full rounded-full" style={{ width:`${b.score}%`, background: b.score>=95?'var(--accent)':b.score>=85?'var(--warn)':'var(--high)' }} />
                    </div>
                    <span className="font-mono text-[10px]" style={{ color:'var(--text-3)' }}>{b.score}</span>
                  </div>
                </td>
                <td><span className={`badge ${GRADE_COLORS[b.grade]||'badge-idle'}`}>{b.grade}</span></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
