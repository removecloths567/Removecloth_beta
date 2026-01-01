import React, { useState } from 'react';
import { ArrowLeft, Bell, Lock, Globe, Moon, Trash2, Smartphone, Mail } from 'lucide-react';

interface SettingsPageProps {
  onBack: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [marketing, setMarketing] = useState(false);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50 dark:bg-black animate-[fadeIn_0.5s_ease-out] transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={onBack}
          className="group mb-8 flex items-center gap-3 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-primary/50 transition-all duration-300 shadow-sm"
        >
          <ArrowLeft size={20} className="text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors" />
          <span className="text-gray-700 dark:text-gray-300 font-bold group-hover:text-gray-900 dark:group-hover:text-white">Back</span>
        </button>

        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Settings</h1>

        <div className="space-y-6">
          
          {/* Account Section */}
          <div className="bg-white dark:bg-surface border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
             <div className="p-4 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 font-bold text-gray-700 dark:text-gray-200">Account</div>
             <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary"><Mail size={20}/></div>
                      <div>
                        <div className="text-gray-900 dark:text-white font-medium">Email Address</div>
                        <div className="text-sm text-gray-500">user@example.com</div>
                      </div>
                   </div>
                   <button className="px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Change</button>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary"><Lock size={20}/></div>
                      <div>
                        <div className="text-gray-900 dark:text-white font-medium">Password</div>
                        <div className="text-sm text-gray-500">Last changed 3 months ago</div>
                      </div>
                   </div>
                   <button className="px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Reset</button>
                </div>
             </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-white dark:bg-surface border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
             <div className="p-4 bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 font-bold text-gray-700 dark:text-gray-200">Preferences</div>
             <div className="p-6 space-y-6">
                
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="p-2 bg-secondary/10 rounded-lg text-secondary"><Bell size={20}/></div>
                      <div>
                        <div className="text-gray-900 dark:text-white font-medium">Email Notifications</div>
                        <div className="text-sm text-gray-500">Receive updates about your generations</div>
                      </div>
                   </div>
                   <Toggle checked={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} />
                </div>

                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="p-2 bg-secondary/10 rounded-lg text-secondary"><Smartphone size={20}/></div>
                      <div>
                        <div className="text-gray-900 dark:text-white font-medium">Marketing Emails</div>
                        <div className="text-sm text-gray-500">Receive offers and promotions</div>
                      </div>
                   </div>
                   <Toggle checked={marketing} onChange={() => setMarketing(!marketing)} />
                </div>
                
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="p-2 bg-secondary/10 rounded-lg text-secondary"><Globe size={20}/></div>
                      <div>
                        <div className="text-gray-900 dark:text-white font-medium">Language</div>
                        <div className="text-sm text-gray-500">English (US)</div>
                      </div>
                   </div>
                </div>

             </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-2xl overflow-hidden shadow-sm">
             <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-red-100 dark:bg-red-500/10 rounded-lg text-red-600 dark:text-red-500"><Trash2 size={20}/></div>
                    <div>
                      <div className="text-gray-900 dark:text-white font-medium">Delete Account</div>
                      <div className="text-sm text-gray-500">Permanently remove all data and credits</div>
                    </div>
                </div>
                <button className="px-4 py-2 rounded-lg bg-white dark:bg-red-500/10 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20 hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors font-medium">Delete</button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const Toggle = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
  <button 
    onClick={onChange}
    className={`w-12 h-6 rounded-full relative transition-colors duration-300 focus:outline-none ${checked ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`}
  >
    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform duration-300 ${checked ? 'left-7' : 'left-1'}`}></div>
  </button>
);