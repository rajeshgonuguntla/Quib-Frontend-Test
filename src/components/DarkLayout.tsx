import { useState, useEffect, useRef, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { LayoutDashboard, FileText, Settings as SettingsIcon, Search, LogOut, ChevronDown, Sun, Moon } from 'lucide-react';
import { useTheme, getC } from './ThemeContext';

interface DarkLayoutProps {
  children: ReactNode;
  activeNav: 'dashboard' | 'my-quizzes' | 'settings';
  title?: string;
  subtitle?: string;
  sectionLabel?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
}

export function DarkLayout({
  children, activeNav, title, subtitle, sectionLabel, showSearch = true,
  searchPlaceholder = 'Search quizzes...',
  searchValue, onSearchChange,
}: DarkLayoutProps) {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const C = getC(isDark);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'my-quizzes', label: 'My Quizzes', icon: FileText, path: '/my-quizzes' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/settings' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, color: C.text, fontFamily: "var(--display)" }}>
      {/* Top Navigation Bar */}
      <header
        className="flex-shrink-0 relative z-20"
        style={{
          background: isDark ? 'rgba(11,11,14,0.85)' : 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1.5 no-underline mr-8 flex-shrink-0" style={{ color: C.text }}>
              <span className="text-[1.1rem] font-[700] tracking-tight">Quib</span>
            </Link>

            {/* Nav Items */}
            <nav className="flex items-center gap-1 flex-1">
              {navItems.map((item) => {
                const isActive = activeNav === item.id;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-[500] text-[0.8rem] no-underline transition-all duration-200"
                    style={{
                      background: isActive ? C.redDim : 'transparent',
                      color: isActive ? C.red : C.text2,
                      border: isActive ? '1px solid rgba(225,6,0,0.15)' : '1px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = C.text;
                        e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = C.text2;
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side: Search + Upgrade + Theme + Profile */}
            <div className="flex items-center gap-3">
              {/* Inline search */}
              {showSearch && (
                <div className="relative hidden md:block">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-colors duration-200"
                    style={{ color: searchFocused ? C.red : C.text3 }}
                  />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={onSearchChange ? (e) => onSearchChange(e.target.value) : undefined}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className="w-52 focus:w-72 pl-9 pr-3 py-1.5 rounded-lg outline-none transition-all duration-300 text-[0.8rem]"
                    style={{
                      background: C.bg,
                      border: `1px solid ${searchFocused ? C.border2 : C.border}`,
                      color: C.text,
                      boxShadow: searchFocused ? '0 0 0 3px rgba(225,6,0,0.06)' : 'none',
                    }}
                  />
                </div>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{
                  background: 'transparent',
                  border: `1px solid ${C.border}`,
                  color: C.text2,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.borderColor = C.border2;
                  e.currentTarget.style.background = C.bg2;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.background = 'transparent';
                }}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              {/* Separator */}
              <div className="w-px h-5" style={{ background: C.border }} />

              {/* Profile */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  className="flex items-center gap-2.5 py-1 px-1.5 rounded-lg transition-all duration-200 cursor-pointer"
                  style={{ background: 'transparent' }}
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[0.65rem] font-[700]"
                    style={{ background: C.redDim, color: C.red, border: '1px solid rgba(225,6,0,0.2)' }}
                  >
                    RG
                  </div>
                  <div className="text-left hidden xl:block">
                    <div className="text-[0.8rem] font-[500]" style={{ color: C.text }}>Rajesh</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5" style={{ color: C.text3 }} />
                </button>

                {showProfileMenu && (
                  <div
                    className="absolute top-full right-0 mt-2 w-48 rounded-lg overflow-hidden z-50"
                    style={{
                      background: isDark ? 'rgba(17,17,21,0.9)' : 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: `1px solid ${C.border2}`,
                      boxShadow: isDark
                        ? '0 4px 6px -1px rgba(0,0,0,0.1), 0 20px 40px -4px rgba(0,0,0,0.4)'
                        : '0 4px 6px -1px rgba(0,0,0,0.06), 0 20px 40px -4px rgba(0,0,0,0.1)',
                      animation: 'dashFadeUp 0.15s ease both',
                    }}
                  >
                    <div className="px-4 py-2.5" style={{ borderBottom: `1px solid ${C.border}` }}>
                      <div className="text-sm font-[500]" style={{ color: C.text }}>Rajesh Gonuguntla</div>
                      <div className="text-xs" style={{ color: C.text3 }}>Pro Member</div>
                    </div>
                    <button
                      onClick={() => { navigate('/settings'); setShowProfileMenu(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 cursor-pointer transition-colors"
                      style={{ color: C.text2, background: 'transparent' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <SettingsIcon className="w-4 h-4" />
                      Settings
                    </button>
                    <button
                      onClick={() => { navigate('/'); setShowProfileMenu(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 cursor-pointer transition-colors"
                      style={{ color: C.red, background: 'transparent', borderTop: `1px solid ${C.border}` }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Decorative radial glow */}
        <div
          className="absolute top-0 right-0 pointer-events-none z-0"
          style={{
            width: 500,
            height: 400,
            background: 'radial-gradient(ellipse at top right, rgba(225,6,0,0.03) 0%, transparent 60%)',
          }}
        />

        {/* Content */}
        <main className="flex-1 px-6 lg:px-8 py-8 overflow-auto relative z-10">
          <div className="max-w-7xl mx-auto">
            {title && (
              <div className="mb-8">
                {sectionLabel && (
                  <p
                    className="mb-1"
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: '0.68rem',
                      color: C.red,
                      letterSpacing: '0.12em',
                      fontWeight: 500,
                    }}
                  >
                    {sectionLabel}
                  </p>
                )}
                <h1 className="text-2xl font-[400] tracking-tight mb-1" style={{ color: C.text, fontFamily: "var(--serif)" }}>{title}</h1>
                {subtitle && <p className="text-sm font-[300]" style={{ color: C.text2 }}>{subtitle}</p>}
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
