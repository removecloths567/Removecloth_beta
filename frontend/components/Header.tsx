import React, { useState, useRef, useEffect } from 'react';
import { 
  User as UserIcon, 
  History, 
  CreditCard, 
  LogOut, 
  Settings, 
  Zap,
  Plus,
  LogIn,
  UserPlus,
  Ghost
} from 'lucide-react';
import { User, AppState, Language } from '../types';

interface HeaderProps {
  user: User;
  appState: AppState;
  language: Language;
  setLanguage: (lang: Language) => void;
  onNavigateHome: () => void;
  onNavigateApp: () => void;
  onNavigatePricing: () => void;
  onNavigateSettings: () => void;
  onNavigateHistory: () => void;
  onNavigateBilling: () => void;
  onNavigateLogin: () => void;
  onNavigateSignup: () => void;
  onLogout: () => void;
}

// Custom Solid Gold Coin Icon
const CreditIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="coinGradient" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FBBF24" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
      <filter id="glow" x="-4" y="-4" width="32" height="32" filterUnits="userSpaceOnUse">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#coinGradient)" className="drop-shadow-sm" />
    <circle cx="12" cy="12" r="10" stroke="#92400E" strokeWidth="1" strokeOpacity="0.3"/>
    <path d="M12 6V18M12 6C9.5 6 8 7.5 8 9C8 11.5 11 12 12 12C13 12 16 12.5 16 15C16 16.5 14.5 18 12 18M12 6C14.5 6 16 7.5 16 9M12 18C9.5 18 8 16.5 8 15" stroke="#FFFBEB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const Header: React.FC<HeaderProps> = ({ 
  user, appState, language, setLanguage,
  onNavigateHome, onNavigateApp, onNavigatePricing,
  onNavigateSettings, onNavigateHistory, onNavigateBilling, onNavigateLogin, onNavigateSignup,
  onLogout
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'EN', label: 'English', native: 'English', flag: '🇺🇸' },
    { code: 'HI', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' }
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (action: () => void) => {
    setIsProfileOpen(false);
    action();
  };

  // Generate GitHub-style identicon based on username/email
  const getAvatarUrl = (seed: string) => 
    `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(seed)}&backgroundColor=1e1e1e`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer flex items-center gap-1.5 md:gap-2 group select-none" onClick={onNavigateHome}>
            <span className="text-lg md:text-2xl text-white tracking-tight transition-transform duration-300 group-hover:scale-105">
              <span className="text-secondary">R</span>emove
            </span>
            <div className="bg-primary px-2 py-0.5 md:px-2.5 rounded-lg shadow-[0_0_15px_rgba(255,0,82,0.4)] transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(255,0,82,0.6)] flex items-center">
               <span className="text-lg md:text-2xl text-white tracking-tight">Cloths</span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 md:gap-6">
            
            {/* Credits Display - Visible ONLY if logged in */}
            {user.isLoggedIn && (
              <>
                <button 
                    onClick={onNavigatePricing}
                    className="group relative flex items-center gap-2 px-2 py-1.5 rounded-full bg-[#121212] border border-white/10 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,0,82,0.15)] overflow-hidden"
                >
                    {/* Background Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></div>

                    {/* Coin Container - Slightly smaller */}
                    <div className="relative w-7 h-7 rounded-full bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] border border-amber-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.15)] group-hover:scale-105 transition-transform duration-300 shrink-0">
                        <CreditIcon size={18} className="filter brightness-110" />
                    </div>

                    {/* Text Section - Adjusted Size */}
                    <span className="text-lg font-extrabold text-white leading-none tabular-nums font-sans tracking-tight group-hover:text-primary transition-colors duration-300 pb-0.5">{user.credits}</span>

                    {/* Divider - Slightly smaller */}
                    <div className="h-4 w-px bg-white/10 mx-0.5"></div>

                    {/* Add Button Section - Slightly smaller */}
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:shadow-primary/50 transition-all duration-300 transform group-hover:rotate-90 group-hover:scale-110 shrink-0">
                        <Plus size={14} strokeWidth={3} />
                    </div>
                </button>
                <div className="hidden md:block h-6 w-px bg-white/10"></div>
              </>
            )}

            {/* Profile/Menu Dropdown - Always visible */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="group relative focus:outline-none block"
              >
                {/* Avatar Container */}
                <div className={`
                  w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden relative p-[2px]
                  ${isProfileOpen 
                    ? 'bg-gradient-to-tr from-primary to-secondary shadow-[0_0_15px_rgba(255,0,82,0.5)] scale-105' 
                    : user.isLoggedIn
                        ? 'bg-gradient-to-tr from-primary/50 to-secondary/50 hover:from-primary hover:to-secondary'
                        : 'bg-white/10 hover:bg-white/20'
                   }
                `}>
                   <div className="w-full h-full rounded-full bg-black overflow-hidden relative flex items-center justify-center">
                       {user.isLoggedIn && !user.isGuest ? (
                           // GitHub-style Identicon for Registered Users
                           <img 
                             src={getAvatarUrl(user.username || user.email || 'user')}
                             alt="Avatar"
                             className="w-full h-full object-cover"
                           />
                       ) : user.isGuest ? (
                           // Guest Avatar
                           <Ghost size={20} className="text-gray-300 animate-[float_3s_ease-in-out_infinite]" />
                       ) : (
                           // Default Logged Out Icon
                           <UserIcon size={20} className="text-gray-400" />
                       )}
                   </div>
                </div>
                
                {/* Online Status Dot - Only if logged in */}
                {user.isLoggedIn && (
                   <div className={`
                        absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[3px] border-black z-10 
                        ${user.isGuest ? 'bg-amber-500' : 'bg-green-500'}
                        ${!user.isGuest && 'animate-pulse'}
                   `}></div>
                )}
              </button>

              {/* User Profile Popup - Fixed right alignment */}
              <div 
                className={`
                  absolute right-0 mt-2 w-80 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden z-50 transform transition-all duration-200 origin-top-right
                  ${isProfileOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
                `}
              >
                {user.isLoggedIn ? (
                    <>
                        {/* User Info Header */}
                        <div className="p-5 border-b border-white/5 bg-white/[0.02]">
                          <div className="flex items-center gap-4">
                            {/* Large Dropdown Avatar */}
                            <div className={`
                                w-16 h-16 rounded-full p-[2px] overflow-hidden relative shrink-0
                                ${user.isGuest ? 'bg-white/10' : 'bg-gradient-to-tr from-primary to-secondary shadow-[0_0_20px_rgba(255,0,82,0.3)]'}
                            `}>
                              <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden relative">
                                {user.isGuest ? (
                                    <Ghost size={28} className="text-gray-300 animate-[float_3s_ease-in-out_infinite]" />
                                ) : (
                                    <img 
                                        src={getAvatarUrl(user.username || user.email || 'user')}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                )}
                              </div>
                            </div>

                            <div className="min-w-0">
                              <h3 className="text-white font-bold text-lg leading-tight truncate">{user.username || (user.isGuest ? 'Guest User' : 'CyberUser')}</h3>
                              <p className="text-xs text-gray-400 font-medium truncate">{user.email || (user.isGuest ? 'Trial Access' : 'Premium Member')}</p>
                              {!user.isGuest && (
                                  <div className="flex items-center gap-1 mt-1 text-[10px] text-green-500 font-bold uppercase tracking-wider">
                                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                      Online
                                  </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Credits Card (Inside Dropdown) */}
                        <div className="p-4">
                          <div className="bg-gradient-to-br from-[#1a1a1a] to-black border border-white/10 rounded-xl p-4 relative overflow-hidden group">
                            
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Available Credits</p>
                            <div className="flex items-end justify-between">
                              <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-white">{user.credits}</span>
                                <span className="text-sm text-gray-400 font-medium">credits</span>
                              </div>
                              
                              {/* Enhanced Get More Button */}
                              <button 
                                onClick={() => handleMenuClick(onNavigatePricing)}
                                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-primary/50 border border-primary/20 rounded-lg text-xs font-bold transition-all duration-200 transform hover:scale-105 flex items-center gap-1.5 cursor-pointer"
                              >
                                <Zap size={14} fill="currentColor" />
                                Get More
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Menu Options */}
                        <div className="p-2 space-y-1">
                          <MenuOption 
                            icon={<History size={16}/>} 
                            label="Credit History" 
                            sub="View usage logs" 
                            onClick={() => handleMenuClick(onNavigateHistory)}
                          />
                          <MenuOption 
                            icon={<CreditCard size={16}/>} 
                            label="Billing" 
                            sub="Manage subscription" 
                            onClick={() => handleMenuClick(onNavigateBilling)} 
                          />
                          <MenuOption 
                            icon={<Settings size={16}/>} 
                            label="Settings" 
                            sub="Preferences" 
                            onClick={() => handleMenuClick(onNavigateSettings)}
                          />
                          <div className="h-px bg-white/5 my-1 mx-2"></div>
                          <MenuOption icon={<LogOut size={16}/>} label="Sign Out" danger onClick={() => handleMenuClick(onLogout)} />
                        </div>
                    </>
                ) : (
                    <>
                        {/* Guest / Logged Out Header */}
                        <div className="p-5 border-b border-white/5 bg-white/[0.02]">
                           <h3 className="text-white font-bold text-lg mb-1">Menu</h3>
                           <p className="text-gray-400 text-xs leading-relaxed">
                             Log in or create an account to save your work and access premium features.
                           </p>
                        </div>

                        {/* Guest Actions (Mobile mostly) */}
                        <div className="p-4 space-y-3">
                           <button 
                             onClick={() => handleMenuClick(onNavigateLogin)}
                             className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-all shadow-[0_0_20px_rgba(255,0,82,0.3)] hover:scale-[1.02]"
                           >
                              <LogIn size={18} />
                              Log In
                           </button>
                           <button 
                             onClick={() => handleMenuClick(onNavigateSignup)}
                             className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 transition-all hover:scale-[1.02]"
                           >
                              <UserPlus size={18} />
                              Create Account
                           </button>
                        </div>
                        <div className="h-px bg-white/5 my-1 mx-4"></div>
                    </>
                )}
                
                {/* Language Selection - Theme Toggle Removed */}
                <div className="px-4 py-4 bg-[#050505] border-t border-white/5">
                   
                   {/* Language */}
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 pl-1">Language</p>
                   <div className="flex gap-2 p-1 bg-surface border border-white/5 rounded-xl">
                     {languages.map((lang) => (
                       <button
                         key={lang.code}
                         onClick={() => setLanguage(lang.code as Language)}
                         className={`
                           flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all
                           ${language === lang.code
                             ? 'bg-white/10 text-white shadow-sm border border-white/10'
                             : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'}
                         `}
                       >
                         <span className="text-sm grayscale">{lang.flag}</span>
                         {lang.label}
                       </button>
                     ))}
                   </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
};

interface MenuOptionProps {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  danger?: boolean;
  onClick?: () => void;
}

const MenuOption: React.FC<MenuOptionProps> = ({ icon, label, sub, danger, onClick }) => (
  <button 
    onClick={onClick}
    className={`
    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group
    ${danger 
        ? 'hover:bg-red-500/10 text-red-400 dark:hover:text-red-400' 
        : 'hover:bg-white/5 text-gray-400 hover:text-white'}
  `}>
    <div className={`p-1.5 rounded-md ${danger ? 'bg-red-500/10' : 'bg-white/5 group-hover:bg-white/10'}`}>
      {icon}
    </div>
    <div className="text-left flex-1">
      <div className={`text-sm font-medium ${danger ? 'text-red-400' : 'text-gray-200'}`}>{label}</div>
      {sub && <div className="text-[10px] text-gray-500 group-hover:text-gray-400">{sub}</div>}
    </div>
  </button>
);