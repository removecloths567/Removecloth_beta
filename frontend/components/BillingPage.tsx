import React from 'react';
import { ArrowLeft, CreditCard, CheckCircle2, Download } from 'lucide-react';

interface BillingPageProps {
  onBack: () => void;
  onUpgrade: () => void;
}

export const BillingPage: React.FC<BillingPageProps> = ({ onBack, onUpgrade }) => {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50 dark:bg-black animate-[fadeIn_0.5s_ease-out] transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="group mb-8 flex items-center gap-3 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-primary/50 transition-all duration-300 shadow-sm"
        >
          <ArrowLeft size={20} className="text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors" />
          <span className="text-gray-700 dark:text-gray-300 font-bold group-hover:text-gray-900 dark:group-hover:text-white">Back</span>
        </button>

        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Billing & Subscription</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            {/* Current Plan */}
            <div className="bg-white dark:bg-surface border border-gray-200 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <CheckCircle2 size={100} className="text-primary"/>
                </div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Current Plan</h3>
                <div className="text-3xl font-black text-gray-900 dark:text-white mb-4">Premium <span className="text-primary">Plan</span></div>
                <div className="flex items-center gap-2 mb-6">
                    <span className="text-2xl text-gray-900 dark:text-white font-bold">$39.99</span>
                    <span className="text-gray-500">/ month</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">Renews on: <span className="text-gray-900 dark:text-white font-bold">Nov 23, 2024</span></div>
                <div className="flex gap-3">
                    <button onClick={onUpgrade} className="flex-1 py-2.5 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-all font-bold text-sm">Change Plan</button>
                    <button className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all font-bold text-sm">Cancel</button>
                </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-surface border border-gray-200 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-sm">
                 <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-4">Payment Method</h3>
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-8 bg-gray-100 dark:bg-white/10 rounded flex items-center justify-center border border-gray-200 dark:border-transparent">
                        <div className="w-6 h-4 bg-red-500/80 rounded-sm"></div>
                    </div>
                    <div>
                        <div className="text-gray-900 dark:text-white font-bold">Mastercard ending in 8832</div>
                        <div className="text-sm text-gray-500">Expires 12/25</div>
                    </div>
                 </div>
                 <button className="w-full py-2.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all font-bold text-sm flex items-center justify-center gap-2">
                    <CreditCard size={16}/> Update Payment Method
                 </button>
            </div>
        </div>

        {/* Invoice History */}
        <div className="bg-white dark:bg-surface border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white">Invoice History</h3>
                <button className="text-xs text-primary font-bold hover:underline">View All</button>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-white/5">
                {[
                    { date: 'Oct 23, 2024', amount: '$39.99', id: 'INV-2024-001' },
                    { date: 'Sep 23, 2024', amount: '$39.99', id: 'INV-2024-002' },
                    { date: 'Aug 23, 2024', amount: '$9.99', id: 'INV-2024-003' },
                ].map((inv) => (
                    <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg text-gray-400"><CreditCard size={18}/></div>
                            <div>
                                <div className="text-gray-900 dark:text-white font-medium text-sm">Premium Plan</div>
                                <div className="text-xs text-gray-500">{inv.date} • {inv.id}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                             <span className="font-bold text-gray-900 dark:text-white">{inv.amount}</span>
                             <button className="p-2 text-gray-400 hover:text-primary transition-colors">
                                <Download size={18}/>
                             </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};