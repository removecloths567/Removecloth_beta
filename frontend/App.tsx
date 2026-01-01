
import React, { useState, useEffect, useRef } from 'react';
import { AgeGate } from './components/AgeGate';
import { LandingPage } from './components/LandingPage';
import { AppInterface } from './components/AppInterface';
import { PricingPage } from './components/PricingPage';
import { LegalPage } from './components/LegalPages';
import { SettingsPage } from './components/SettingsPage';
import { CreditHistoryPage } from './components/CreditHistoryPage';
import { HistoryGallery } from './components/HistoryGallery';
import { BillingPage } from './components/BillingPage';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { BlogPage } from './components/BlogPage';
import { BlogPostPage } from './components/BlogPostPage';
import { Header } from './components/Header';
import { User, AppState, Language, API_URL, WS_URL, HistoryItem } from './types';
import { blogPosts, featuredPosts } from './blogData';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  // Global State
  const [ageVerified, setAgeVerified] = useState<boolean>(false);
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  
  // Track previous state to handle "Back" from Pricing/Pages
  const [previousAppState, setPreviousAppState] = useState<AppState>(AppState.LANDING);
  
  // Blog State
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);

  const [language, setLanguage] = useState<Language>('EN');
  const [user, setUser] = useState<User>({
    credits: 0,
    isLoggedIn: false,
    isGuest: false
  });

  // WebSocket Reference
  const wsRef = useRef<WebSocket | null>(null);

  // Check local storage for previous verification & Auth Token
  useEffect(() => {
    // Age Gate
    const verified = localStorage.getItem('age_verified');
    if (verified === 'true') {
      setAgeVerified(true);
    }

    // Auth Check
    const token = localStorage.getItem('auth_token');
    if (token) {
      verifyToken(token);
    }
  }, []);

  // WebSocket Effect: Connect when logged in
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    
    if (user.isLoggedIn && !user.isGuest && token && !wsRef.current) {
        connectWebSocket(token);
    }

    return () => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    };
  }, [user.isLoggedIn, user.isGuest]);

  
  const saveToLocalHistory = (url: string, settings?: any) => {
    const saved = localStorage.getItem('user_generation_history');
    let history: HistoryItem[] = [];
    if (saved) {
      try { history = JSON.parse(saved); } catch (e) { history = []; }
    }
    
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(7),
      url: url,
      timestamp: Date.now(),
      settings: settings
    };

    // Keep only last 50 generations to avoid quota issues
    const updated = [newItem, ...history].slice(0, 50);
    localStorage.setItem('user_generation_history', JSON.stringify(updated));
  };

  const connectWebSocket = (token: string) => {
    try {
        // Pass token in query params as browsers don't support custom headers for WS natively
        const socket = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);
        
        socket.onopen = () => {
            console.log("⚡ Real-time Signal Synchronized");
            wsRef.current = socket;
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("🛰️ Received from Core:", data);
                
                // Balance updates
                if (data.credits !== undefined) {
                    handleUpdateCredits(data.credits);
                }

                // IMAGE GENERATION HISTORY INTERCEPTION
                // Logic: If the socket sends a result URL (due to async generation on backend)
                if (data.type === 'generation_complete' && data.result_url) {
                    saveToLocalHistory(data.result_url, data.settings);
                }
            } catch (err) {
                console.error("Malformed signal data", err);
            }
        };

        socket.onerror = (error) => {
            console.error("Communication error", error);
        };

        socket.onclose = () => {
            console.log("📡 Signal connection severed");
            wsRef.current = null;
            // Retry connection after a delay if still logged in
            if (user.isLoggedIn && !user.isGuest) {
                setTimeout(() => connectWebSocket(token), 5000);
            }
        };
    } catch (err) {
        console.error("Failed to initialize signal", err);
    }
  };

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser({
          credits: userData.credits ?? 0,
          isLoggedIn: true,
          isGuest: false,
          username: userData.name || userData.email.split('@')[0],
          email: userData.email,
          user_id: userData.id
        });
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error("Auth check failed", error);
    }
  };

  const handleAgeVerify = () => {
    localStorage.setItem('age_verified', 'true');
    setAgeVerified(true);
  };

  const handleUpdateCredits = (newAmount: number) => {
    setUser(prev => ({ ...prev, credits: newAmount }));
  };

  // Called after Login/Signup API success
  const handleLoginSuccess = async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      await verifyToken(token);
    }
    setAppState(AppState.LANDING);
    window.scrollTo(0, 0);
  };

  const handleGuestLogin = () => {
    setUser({ 
        ...user, 
        isLoggedIn: true, 
        isGuest: true,
        credits: 1,
        username: 'Guest'
    });
    setAppState(AppState.LANDING);
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    if (wsRef.current) wsRef.current.close();
    setUser({ credits: 0, isLoggedIn: false, isGuest: false });
    setAppState(AppState.LANDING);
    window.scrollTo(0, 0);
  };

  // --- Navigation Handlers ---

  const navigateWithHistory = (target: AppState) => {
    if (appState !== target) {
        setPreviousAppState(appState);
        setAppState(target);
        window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    setAppState(previousAppState);
    window.scrollTo(0, 0);
  };

  const handleAuthClose = () => {
    setAppState(AppState.LANDING);
    window.scrollTo(0, 0);
  };

  const handleNavigateToArticle = (id: number) => {
    setSelectedArticleId(id);
    setAppState(AppState.BLOG_ARTICLE);
    window.scrollTo(0, 0);
  };

  const handleBackToBlog = () => {
     setAppState(AppState.BLOG);
     window.scrollTo(0, 0);
  };

  const navigateToApp = () => navigateWithHistory(AppState.APP);
  const navigateToHome = () => navigateWithHistory(AppState.LANDING);
  const navigateToPricing = () => navigateWithHistory(AppState.PRICING);
  
  const navigateToPrivacy = () => navigateWithHistory(AppState.PRIVACY);
  const navigateToTerms = () => navigateWithHistory(AppState.TERMS);
  const navigateToRefund = () => navigateWithHistory(AppState.REFUND);
  const navigateToSettings = () => navigateWithHistory(AppState.SETTINGS);
  const navigateToHistory = () => navigateWithHistory(AppState.HISTORY);
  const navigateToBilling = () => navigateWithHistory(AppState.BILLING);
  const navigateToLogin = () => navigateWithHistory(AppState.LOGIN);
  const navigateToSignup = () => navigateWithHistory(AppState.SIGNUP);
  const navigateToBlog = () => navigateWithHistory(AppState.BLOG);

  const handleTryNow = () => {
    if (user.isLoggedIn) {
      navigateToApp();
    } else {
      navigateToLogin();
    }
  };

  const renderContent = () => {
    switch(appState) {
      case AppState.LANDING:
        return (
          <>
            <LandingPage onTryNow={handleTryNow} language={language} />
            <Footer 
              language={language} 
              onPrivacy={navigateToPrivacy} 
              onTerms={navigateToTerms} 
              onRefund={navigateToRefund} 
              onBlog={navigateToBlog}
            />
          </>
        );
      case AppState.APP:
        return <AppInterface user={user} onUpdateCredits={handleUpdateCredits} onNavigatePricing={navigateToPricing} />;
      case AppState.PRICING:
        return <PricingPage onBack={handleBack} />;
      
      case AppState.PRIVACY:
        return <LegalPage type="privacy" onBack={handleBack} />;
      case AppState.TERMS:
        return <LegalPage type="terms" onBack={handleBack} />;
      case AppState.REFUND:
        return <LegalPage type="refund" onBack={handleBack} />;
      case AppState.SETTINGS:
        return <SettingsPage onBack={handleBack} />;
      case AppState.HISTORY:
        // Changed from CreditHistoryPage to HistoryGallery as requested
        return <HistoryGallery onBack={handleBack} />;
      case AppState.BILLING:
        return <BillingPage onBack={handleBack} onUpgrade={navigateToPricing} />;
      
      case AppState.LOGIN:
        return (
          <LoginPage 
            onBack={handleBack} 
            onClose={handleAuthClose}
            onLoginSuccess={handleLoginSuccess} 
            onNavigateSignup={navigateToSignup} 
          />
        );
      case AppState.SIGNUP:
        return (
          <SignupPage 
            onBack={handleBack} 
            onClose={handleAuthClose}
            onGuestLogin={handleGuestLogin}
            onLoginSuccess={handleLoginSuccess} 
            onNavigateLogin={navigateToLogin} 
            onNavigatePrivacy={navigateToPrivacy}
            onNavigateTerms={navigateToTerms}
          />
        );
      case AppState.BLOG:
        return <BlogPage onBack={handleBack} onNavigateArticle={handleNavigateToArticle} />;
      
      case AppState.BLOG_ARTICLE:
        const allPosts = [...blogPosts, ...featuredPosts];
        const article = allPosts.find(p => p.id === selectedArticleId);
        if (!article) return <BlogPage onBack={handleBack} onNavigateArticle={handleNavigateToArticle} />;
        return <BlogPostPage article={article} onBack={handleBackToBlog} />;

      default:
        return <LandingPage onTryNow={handleTryNow} language={language} />;
    }
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-primary selection:text-white bg-[var(--color-background)]">
      
      {!ageVerified && <AgeGate onVerify={handleAgeVerify} />}

      <div className={!ageVerified ? 'blur-sm pointer-events-none h-screen overflow-hidden' : ''}>
        
        <Header 
          user={user} 
          appState={appState}
          language={language}
          setLanguage={setLanguage}
          onNavigateHome={navigateToHome}
          onNavigateApp={navigateToApp}
          onNavigatePricing={navigateToPricing}
          onNavigateSettings={navigateToSettings}
          onNavigateHistory={navigateToHistory}
          onNavigateBilling={navigateToBilling}
          onNavigateLogin={navigateToLogin}
          onNavigateSignup={navigateToSignup}
          onLogout={handleLogout}
        />

        <main>
          {renderContent()}
        </main>

      </div>
    </div>
  );
}

interface FooterProps {
  language: Language;
  onPrivacy: () => void;
  onTerms: () => void;
  onRefund: () => void;
  onBlog: () => void;
}

const Footer: React.FC<FooterProps> = ({ language, onPrivacy, onTerms, onRefund, onBlog }) => {
  return (
    <footer className="bg-[#050505]/60 backdrop-blur-2xl border-t border-white/5 pt-16 pb-8 mt-auto relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
          
          <div className="max-w-sm">
             <div className="flex items-center gap-2 mb-4 select-none">
                <span className="text-2xl text-white tracking-tight font-normal">
                  <span className="text-secondary font-semibold">R</span>emove
                </span>
                <div className="bg-primary px-3 py-1 rounded-xl shadow-[0_0_15px_rgba(255,0,82,0.3)] flex items-center">
                   <span className="text-2xl text-white tracking-tight font-normal">Cloths</span>
                </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              The most advanced AI engine designed for seamless editing. Professional results in seconds. Privacy focused.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-4">
             <button onClick={onPrivacy} className="text-left text-gray-400 hover:text-primary transition-colors text-sm font-medium block">Privacy Policy</button>
             <button onClick={onTerms} className="text-left text-gray-400 hover:text-primary transition-colors text-sm font-medium block">Terms of use</button>
             <button onClick={onRefund} className="text-left text-gray-400 hover:text-primary transition-colors text-sm font-medium block">Refund Policy</button>
             <button onClick={onBlog} className="text-left text-gray-400 hover:text-primary transition-colors text-sm font-medium block">Blog</button>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-500 text-xs">
            © 2024 RemoveCloths AI. {language === 'EN' ? 'All rights reserved.' : 'सर्वाधिकार सुरक्षित।'}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default App;
