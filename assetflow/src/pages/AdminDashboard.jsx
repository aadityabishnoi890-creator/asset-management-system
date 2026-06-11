import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  LineChart, Line
} from 'recharts'
import { Package, Users, Clock, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'

// ── Mock data (swap → analyticsAPI.getDashboard()) ────────────────────────
const STATS = {
  totalAssets:      42,
  activeBookings:   12,
  pendingApprovals:  5,
  overdueReturns:    3,
  totalUsers:       28,
  utilizationRate:  67,
}

const UTILIZATION_DATA = [
  { name: 'Camera',   utilization: 78 },
  { name: 'Audio',    utilization: 62 },
  { name: 'Lighting', utilization: 45 },
  { name: 'Costume',  utilization: 38 },
  { name: 'Props',    utilization: 55 },
  { name: 'Recording',utilization: 70 },
]

const CATEGORY_DATA = [
  { name: 'Camera',    value: 8  },
  { name: 'Audio',     value: 12 },
  { name: 'Lighting',  value: 6  },
  { name: 'Costume',   value: 15 },
  { name: 'Props',     value: 10 },
  { name: 'Recording', value: 5  },
]

const MONTHLY_DATA = [
  { month: 'Jan', bookings: 12, returns: 10 },
  { month: 'Feb', bookings: 18, returns: 15 },
  { month: 'Mar', bookings: 22, returns: 20 },
  { month: 'Apr', bookings: 30, returns: 28 },
  { month: 'May', bookings: 25, returns: 22 },
  { month: 'Jun', bookings: 35, returns: 30 },
]

const TOP_ASSETS = [
  { name: 'DSLR Canon EOS 5D',  count: 42 },
  { name: 'Rode NTG4+ Mic',     count: 35 },
  { name: 'Aputure 300D Light', count: 28 },
  { name: 'DJI Ronin-S',        count: 21 },
  { name: 'Zoom H6 Recorder',   count: 18 },
]

const PIE_COLORS = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']

export function AdminDashboardPage() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Platform-wide asset management overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Assets"      value={STATS.totalAssets}       icon={Package}       color="brand"  />
        <StatCard title="Active Loans"      value={STATS.activeBookings}    icon={CheckCircle}   color="green"  />
        <StatCard title="Pending Approvals" value={STATS.pendingApprovals}  icon={Clock}         color="amber"  />
        <StatCard title="Overdue Returns"   value={STATS.overdueReturns}    icon={AlertTriangle} color="red"    />
        <StatCard title="Total Users"       value={STATS.totalUsers}        icon={Users}         color="blue"   />
        <StatCard title="Utilization"       value={`${STATS.utilizationRate}%`} icon={TrendingUp} color="purple" />
      </div>

      {/* Row 1 — Bar chart + Pie chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Utilization bar chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Asset Utilization Rate</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={UTILIZATION_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                unit="%"
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                formatter={(v) => [`${v}%`, 'Utilization']}
              />
              <Bar dataKey="utilization" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category pie chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">By Category</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={CATEGORY_DATA}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                outerRadius={75}
                innerRadius={40}
                paddingAngle={3}
              >
                {CATEGORY_DATA.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, color: '#64748b' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2 — Line chart + Top assets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Monthly trend line chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Monthly Booking Trend</h2>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-3 h-0.5 bg-indigo-500 rounded-full inline-block" /> Bookings
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-3 h-0.5 bg-emerald-500 rounded-full inline-block" /> Returns
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MONTHLY_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="bookings"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 3, fill: '#6366f1' }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="returns"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 3, fill: '#22c55e' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top assets */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Most Requested</h2>
          <div className="space-y-4">
            {TOP_ASSETS.map((a, i) => (
              <div key={a.name} className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400 w-4 flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">{a.name}</p>
                  <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${(a.count / TOP_ASSETS[0].count) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-500 flex-shrink-0">{a.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 3 — Summary table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Quick Summary</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-100">
          {[
            { label: 'Assets checked out today', value: '7',  sub: '+2 from yesterday'  },
            { label: 'Assets returned today',    value: '4',  sub: 'On time: 4 / Late: 0' },
            { label: 'Upcoming due (48h)',        value: '6',  sub: 'Reminder sent to 3'  },
            { label: 'Avg loan duration',         value: '3d', sub: 'Across all categories' },
          ].map(item => (
            <div key={item.label} className="px-5 py-4">
              <p className="text-xs text-slate-500 mb-1">{item.label}</p>
              <p className="text-2xl font-bold text-slate-900">{item.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    brand:  'bg-indigo-50  text-indigo-500',
    green:  'bg-emerald-50 text-emerald-500',
    amber:  'bg-amber-50   text-amber-500',
    red:    'bg-red-50     text-red-500',
    purple: 'bg-purple-50  text-purple-500',
    blue:   'bg-blue-50    text-blue-500',
  }
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}