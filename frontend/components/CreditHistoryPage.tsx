import React from 'react';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react';

interface CreditHistoryPageProps {
  onBack: () => void;
}

export const CreditHistoryPage: React.FC<CreditHistoryPageProps> = ({ onBack }) => {
  const history = [
    { id: 1, type: 'used', desc: 'Image Generation (Naked Mode)', amount: -1, date: 'Oct 24, 2024 • 10:23 AM', status: 'Completed' },
    { id: 2, type: 'purchase', desc: 'Premium Plan Subscription', amount: +500, date: 'Oct 23, 2024 • 09:15 PM', status: 'Success' },
    { id: 3, type: 'used', desc: 'Image Generation (Lingerie Mode)', amount: -1, date: 'Oct 23, 2024 • 08:30 PM', status: 'Completed' },
    { id: 4, type: 'used', desc: 'Image Generation (Bikini Mode)', amount: -1, date: 'Oct 22, 2024 • 02:45 PM', status: 'Completed' },
    { id: 5, type: 'bonus', desc: 'Daily Login Bonus', amount: +5, date: 'Oct 22, 2024 • 09:00 AM', status: 'Claimed' },
  ];

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

        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Credit History</h1>

        <div className="bg-white dark:bg-surface border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-6 md:col-span-5">Activity</div>
                <div className="col-span-3 md:col-span-3 text-right">Amount</div>
                <div className="col-span-3 md:col-span-2 hidden md:block">Date</div>
                <div className="col-span-3 md:col-span-2 text-right">Status</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-100 dark:divide-white/5">
                {history.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                        
                        {/* Activity */}
                        <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${item.amount > 0 ? 'bg-green-500/10 text-green-600 dark:text-green-500' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                                {item.amount > 0 ? <ArrowDownLeft size={18}/> : <ArrowUpRight size={18}/>}
                            </div>
                            <div>
                                <div className="text-gray-900 dark:text-white font-medium text-sm">{item.desc}</div>
                                <div className="text-xs text-gray-500 md:hidden">{item.date}</div>
                            </div>
                        </div>

                        {/* Amount */}
                        <div className={`col-span-3 md:col-span-3 text-right font-bold ${item.amount > 0 ? 'text-green-600 dark:text-green-500' : 'text-gray-400 dark:text-gray-300'}`}>
                            {item.amount > 0 ? '+' : ''}{item.amount}
                        </div>

                        {/* Date (Desktop) */}
                        <div className="col-span-3 md:col-span-2 hidden md:block text-sm text-gray-500 flex items-center gap-2">
                             <Clock size={14} />
                             {item.date.split('•')[0]}
                        </div>

                        {/* Status */}
                        <div className="col-span-3 md:col-span-2 text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                item.status === 'Success' || item.status === 'Completed' || item.status === 'Claimed'
                                ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-500' 
                                : 'bg-gray-100 dark:bg-gray-100/10 text-gray-500 dark:text-gray-400'
                            }`}>
                                {item.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Footer Pagination */}
            <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] flex justify-center">
                <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Load More</button>
            </div>
        </div>

      </div>
    </div>
  );
};