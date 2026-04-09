import { Bell, CircleHelp, LayoutDashboard, Search, Upload, WalletCards } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Upload Data', to: '/upload', icon: Upload },
];

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 p-3 md:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-[1500px] grid-cols-1 gap-4 rounded-3xl border border-slate-200 bg-slate-100 md:grid-cols-[240px_1fr] md:gap-6 md:p-3">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white">
              <WalletCards size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">CashFlow IQ</p>
              <p className="text-xs text-slate-400">Intelligence Suite</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm md:space-y-6 md:p-5">
          <header className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">Dashboard</h1>
              <p className="text-sm text-slate-500">Cash flow intelligence at a glance</p>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
                <Search size={15} className="text-slate-400" />
                <input
                  className="w-44 border-none bg-transparent text-sm text-slate-600 outline-none"
                  placeholder="Search anything..."
                />
              </div>

              <Link
                to="/upload"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Upload size={15} />
                Upload CSV
              </Link>
              <button className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500">
                <Bell size={15} />
              </button>
              <button className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500">
                <CircleHelp size={15} />
              </button>
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
