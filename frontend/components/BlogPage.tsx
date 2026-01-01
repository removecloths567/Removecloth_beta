import React from 'react';
import { ArrowLeft, Search, Calendar, ChevronRight } from 'lucide-react';
import { blogPosts, featuredPosts } from '../blogData';

interface BlogPageProps {
  onBack: () => void;
  onNavigateArticle: (id: number) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onBack, onNavigateArticle }) => {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50 dark:bg-black animate-[fadeIn_0.5s_ease-out] transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation */}
        <button 
          onClick={onBack}
          className="group mb-12 flex items-center gap-3 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-primary/50 transition-all duration-300 shadow-sm"
        >
          <ArrowLeft size={20} className="text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors" />
          <span className="text-gray-700 dark:text-gray-300 font-bold group-hover:text-gray-900 dark:group-hover:text-white">Back</span>
        </button>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-block px-3 py-1 mb-4 rounded-full bg-gray-100 dark:bg-white/10 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-300">
                Blog
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                Discover our latest news
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-10">
                Discover the achievements that set us apart. From groundbreaking projects to industry accolades, we take pride in our accomplishments.
            </p>

            {/* Search Bar - Responsive Adjustments */}
            <div className="flex items-center max-w-lg mx-auto bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full p-1.5 pl-4 md:p-2 md:pl-6 shadow-lg focus-within:border-primary/50 transition-colors">
                <Search className="text-gray-400 shrink-0" size={20} />
                <input 
                    type="text" 
                    placeholder="Search articles..." 
                    className="flex-1 bg-transparent border-none focus:ring-0 px-2 md:px-4 py-2 text-gray-900 dark:text-white placeholder-gray-500 outline-none w-full min-w-0"
                />
                <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 text-sm md:px-6 md:py-2.5 md:text-base rounded-full font-bold transition-all shadow-md whitespace-nowrap shrink-0">
                    Find Now
                </button>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Left Column: Articles Grid */}
            <div className="w-full lg:w-2/3">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8 border-b border-gray-200 dark:border-white/10 pb-4">
                    Latest Articles
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {blogPosts.map((article) => (
                        <div 
                            key={article.id} 
                            onClick={() => onNavigateArticle(article.id)}
                            className="group cursor-pointer flex flex-col h-full bg-white dark:bg-surface border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="aspect-[4/3] overflow-hidden relative">
                                <img 
                                    src={article.image} 
                                    alt={article.title} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                />
                                <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-lg text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                                    {article.tag}
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                    {article.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 flex-1">
                                    {article.desc}
                                </p>
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-white/5">
                                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                        <Calendar size={12} /> {article.date}
                                    </span>
                                    <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        Read More <ChevronRight size={12} />
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column: Sidebar */}
            <div className="w-full lg:w-1/3">
                <div className="sticky top-24">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 border-b border-gray-200 dark:border-white/10 pb-4">
                        Featured
                    </h2>

                    <div className="space-y-6">
                        {featuredPosts.map((item) => (
                            <div 
                                key={item.id} 
                                onClick={() => onNavigateArticle(item.id)}
                                className="group flex gap-4 items-start cursor-pointer p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                                <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                                    <img 
                                        src={item.image} 
                                        alt={item.title} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                    />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-400 mb-1">{item.date}</div>
                                    <h4 className="font-bold text-gray-900 dark:text-white leading-tight group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h4>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>

        </div>
      </div>
    </div>
  );
};