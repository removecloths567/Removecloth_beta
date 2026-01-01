
import React, { useState } from 'react';
import { Sparkles, ArrowLeft, Zap, ShieldCheck, Clock, Loader2, CreditCard } from 'lucide-react';

interface PricingPageProps {
  onBack: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://vercelpay.vercel.app/api/main?action=generate-payment-link', {
        method: 'POST',
        headers: {
          'X-API-Key': 'qa5sgG6qD3paygate_master_key_777baR1J23',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: 500,
          expiresInHours: 1,
          source: 'api'
        })
      });

      const data = await response.json();

      if (data.success && data.paymentLink) {
        // Open the payment link in a new browser window as requested
        window.open(data.paymentLink, '_blank');
      } else {
        throw new Error(data.message || 'Failed to generate payment link');
      }
    } catch (err: any) {
      console.error('Payment Error:', err);
      setError('Service temporarily busy. Please try again in a few moments.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    "500 Instant Generation Credits",
    "Priority AI Processing Pipeline",
    "Ultra-HD 4K Result Resolution",
    "No Watermarks on Output",
    "Access to All Advanced Modes",
    "24/7 VIP Dedicated Support"
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/10 blur-[150px] rounded-full animate-pulse-slow" style={{animationDelay: '2s'}}></div>

      <div className="max-w-4xl w-full relative z-10 flex flex-col items-center">
        
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="absolute -top-16 left-0 flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 text-gray-400 hover:text-white transition-all group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-black uppercase tracking-widest text-xs">Return</span>
        </button>
        
        <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter uppercase">
              Elite <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Access</span>
            </h1>
            <p className="text-gray-400 text-lg font-bold uppercase tracking-[0.3em] max-w-2xl">
              One simple plan for unlimited creative power
            </p>
        </div>

        {/* Single Premium Plan Card */}
        <div className="w-full max-w-md bg-[#050505] border-2 border-white/10 rounded-[3rem] p-8 md:p-12 shadow-[0_0_100px_rgba(0,0,0,1)] relative overflow-hidden group transition-all duration-700 hover:border-primary/50 hover:shadow-primary/10">
            {/* Top Badge */}
            <div className="absolute top-0 right-0 px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-bl-3xl shadow-lg">
              Most Popular
            </div>

            <div className="mb-10">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Premium Credits</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-white tracking-tighter">$500</span>
                <span className="text-gray-500 font-black uppercase tracking-widest text-xs">One-Time</span>
              </div>
            </div>

            <div className="space-y-5 mb-12">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-4 group/item">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover/item:scale-110 transition-transform">
                    <Sparkles size={14} />
                  </div>
                  <span className="text-gray-400 group-hover/item:text-gray-200 transition-colors text-sm font-bold uppercase tracking-tight">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-3 animate-[fadeIn_0.3s_ease-out]">
                <ShieldCheck size={16} />
                {error}
              </div>
            )}

            <button 
              onClick={handlePurchase}
              disabled={isLoading}
              className={`w-full py-6 rounded-3xl font-black text-white text-xl uppercase tracking-[0.2em] transition-all relative overflow-hidden flex items-center justify-center gap-4 group active:scale-95 ${isLoading ? 'opacity-80' : 'gradient-bg hover:shadow-[0_0_50px_rgba(255,0,82,0.6)]'}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Generating Secure Link...
                </>
              ) : (
                <>
                  <Zap size={24} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
                  Initialize Checkout
                </>
              )}
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>

            <div className="mt-8 flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">
                    <Clock size={12} />
                    Link expires in 1 hour
                </div>
                <div className="flex gap-4 opacity-30 grayscale hover:grayscale-0 transition-all">
                    <img src="https://www.visa.com.pk/dam/VCOM/regional/ve/romania/blogs/images/visa-logo-800x450.jpg" alt="Visa" className="h-6" />
                    <CreditCard size={24} className="text-white" />
                </div>
            </div>
        </div>

        <p className="mt-12 text-gray-500 text-xs font-bold uppercase tracking-[0.4em] max-w-sm text-center leading-relaxed">
          Secured by industry-standard 256-bit encryption. <br/> No hidden fees or recurring charges.
        </p>

      </div>
    </div>
  );
};
