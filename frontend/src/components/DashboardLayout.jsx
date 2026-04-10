/**
 * App shell layout.
 * Provides shared navigation, top actions, and helper UI wrappers around page content.
 */
import { Bell, CircleHelp, LayoutDashboard, Moon, Search, Sun, Upload, WalletCards, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useSearch } from '../context/SearchContext.jsx';

const navItems = [
  { label: 'LedgerFlow Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'LedgerFlow Upload', to: '/upload', icon: Upload },
];

function highlightMatch(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-yellow-100 dark:bg-yellow-800/50">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function computeResults(q, { transactions, summary, aiInsights }) {
  if (!q) return [];
  const lower = q.toLowerCase();
  const results = [];

  const matchedTx = (transactions || [])
    .filter((tx) => {
      const dateStr = new Date(tx.date).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });
      return (
        dateStr.toLowerCase().includes(lower) ||
        String(tx.income).includes(lower) ||
        String(tx.expenses).includes(lower)
      );
    })
    .slice(0, 5);

  if (matchedTx.length) {
    results.push({ type: 'section', label: 'Transactions' });
    matchedTx.forEach((tx) => {
      const dateStr = new Date(tx.date).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });
      results.push({
        type: 'transaction',
        label: dateStr,
        sub: `Income $${Number(tx.income).toLocaleString()} · Expenses $${Number(tx.expenses).toLocaleString()}`,
      });
    });
  }

  const kpis = summary
    ? [
        { label: 'Total Revenue', value: summary.totalRevenue },
        { label: 'Total Expenses', value: summary.totalExpenses },
        { label: 'Net Cash Flow', value: summary.netCashFlow },
        { label: 'Cash Runway (days)', value: summary.cashRunway },
      ]
    : [];
  const matchedKpis = kpis.filter(
    ({ label, value }) =>
      label.toLowerCase().includes(lower) || String(value ?? '').includes(lower)
  );
  if (matchedKpis.length) {
    results.push({ type: 'section', label: 'KPIs' });
    matchedKpis.forEach(({ label, value }) =>
      results.push({ type: 'kpi', label, sub: value != null ? String(value) : '—' })
    );
  }

  const insightTexts = aiInsights
    ? [
        aiInsights.summary,
        ...(aiInsights.insights || []),
        ...(aiInsights.risks || []),
        ...(aiInsights.recommendations || []),
      ].filter(Boolean)
    : [];
  const matchedInsights = insightTexts
    .filter((t) => t.toLowerCase().includes(lower))
    .slice(0, 3);
  if (matchedInsights.length) {
    results.push({ type: 'section', label: 'Insights' });
    matchedInsights.forEach((text) =>
      results.push({
        type: 'insight',
        label: text.length > 90 ? text.slice(0, 90) + '…' : text,
      })
    );
  }

  return results;
}

function DashboardLayout({ children }) {
  // Header utility state: lightweight client-side interactions for onboarding and status prompts.
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [theme, setTheme] = useState('light');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const { query, setQuery, debouncedQuery, searchData } = useSearch();

  useEffect(() => {
    const storedTheme = localStorage.getItem('ledgerflow-theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('ledgerflow-theme', theme);
  }, [theme]);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const notifications = [
    {
      id: 'upload-reminder',
      title: 'Upload latest CSV',
      body: 'Upload fresh transaction data to keep forecasts and AI insights accurate.',
    },
    {
      id: 'ai-refresh',
      title: 'Refresh AI insights',
      body: 'Use the refresh button in AI Insights after uploading new data.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-3 transition-colors duration-300 dark:bg-slate-950 md:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-[1500px] grid-cols-1 gap-4 rounded-3xl border border-slate-200 bg-slate-100 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[240px_1fr] md:gap-6 md:p-3">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900 md:p-5">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900">
              <WalletCards size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">LedgerFlow</p>
              <p className="text-xs text-slate-400 dark:text-slate-400">Intelligence Suite</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900 md:space-y-6 md:p-5">
          <header className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 md:text-2xl">LedgerFlow Dashboard</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">LedgerFlow intelligence at a glance</p>
            </div>

            <div className="relative flex items-center gap-2 md:gap-3">
              <div ref={searchRef} className="relative hidden md:flex">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 transition-colors duration-300 dark:border-slate-700 dark:bg-slate-800">
                  <Search size={15} className="shrink-0 text-slate-400 dark:text-slate-500" />
                  <input
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
                    onFocus={() => setSearchOpen(true)}
                    onKeyDown={(e) => { if (e.key === 'Escape') { setQuery(''); setSearchOpen(false); } }}
                    className="w-44 border-none bg-transparent text-sm text-slate-600 outline-none dark:text-slate-200"
                    placeholder="Search anything..."
                    aria-label="Global search"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => { setQuery(''); setSearchOpen(false); }}
                      className="shrink-0 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                      aria-label="Clear search"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {searchOpen && debouncedQuery && (() => {
                  const results = computeResults(debouncedQuery, searchData);
                  return (
                    <div className="absolute left-0 top-full z-30 mt-2 max-h-96 w-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900">
                      {results.length === 0 ? (
                        <p className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
                          No results for <span className="font-medium text-slate-700 dark:text-slate-200">"{debouncedQuery}"</span>
                        </p>
                      ) : (
                        <div className="p-2">
                          {results.map((item, idx) => {
                            if (item.type === 'section') {
                              return (
                                <p key={`section-${idx}`} className="mt-2 px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 first:mt-0">
                                  {item.label}
                                </p>
                              );
                            }
                            return (
                              <div
                                key={`result-${idx}`}
                                className="rounded-xl px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-default"
                              >
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                                  {highlightMatch(item.label, debouncedQuery)}
                                </p>
                                {item.sub && (
                                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                    {highlightMatch(item.sub, debouncedQuery)}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              <Link
                to="/upload"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                <Upload size={15} />
                Upload CSV
              </Link>

              <button
                type="button"
                onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors duration-300 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
                aria-label="Toggle dark mode"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowNotifications((prev) => !prev);
                  setShowHelp(false);
                }}
                className="relative grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors duration-300 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
              >
                <Bell size={15} />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowHelp(true);
                  setShowNotifications(false);
                }}
                className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors duration-300 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
              >
                <CircleHelp size={15} />
              </button>

              {showNotifications && (
                <div className="absolute right-12 top-12 z-20 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</p>
                    <button
                      type="button"
                      onClick={() => setShowNotifications(false)}
                      className="text-xs font-medium text-slate-500 transition-colors duration-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      Close
                    </button>
                  </div>
                  <div className="space-y-2">
                    {notifications.map((note) => (
                      <div key={note.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3 transition-colors duration-300 dark:border-slate-700 dark:bg-slate-800">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{note.title}</p>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{note.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </header>

          {children}
        </main>
      </div>

      {showHelp && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/60 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Help & Quick Start</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Use this checklist to get LedgerFlow fully functional.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors duration-300 hover:text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:text-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
              <li>Set <code>DATABASE_URL</code> and <code>GEMINI_API_KEY</code> in <code>backend/.env</code>.</li>
              <li>Run <code>backend/config/schema.sql</code> in Supabase SQL Editor.</li>
              <li>Upload <code>sample_data.csv</code> from the Upload Data page.</li>
              <li>Open Dashboard and click Refresh in AI Insights.</li>
            </ol>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to="/upload"
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition-colors duration-300 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                onClick={() => setShowHelp(false)}
              >
                Go to Upload
              </Link>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardLayout;
