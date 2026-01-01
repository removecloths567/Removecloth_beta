import React from 'react';
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react';
import { BlogPost } from '../blogData';

interface BlogPostPageProps {
  article: BlogPost;
  onBack: () => void;
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({ article, onBack }) => {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50 dark:bg-black animate-[fadeIn_0.5s_ease-out] transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation */}
        <button 
          onClick={onBack}
          className="group mb-8 flex items-center gap-3 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-primary/50 transition-all duration-300 shadow-sm"
        >
          <ArrowLeft size={20} className="text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors" />
          <span className="text-gray-700 dark:text-gray-300 font-bold group-hover:text-gray-900 dark:group-hover:text-white">Back</span>
        </button>

        <article className="bg-white dark:bg-surface border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            {/* Hero Image */}
            <div className="w-full h-[300px] md:h-[400px] relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                <img 
                    src={article.image} 
                    alt={article.title} 
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-6 left-6 md:left-10 z-20">
                    <span className="px-3 py-1 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-lg mb-3 inline-block shadow-lg">
                        {article.tag}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-lg max-w-3xl">
                        {article.title}
                    </h1>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-6 md:p-10">
                {/* Meta Data */}
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-6 mb-8">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                            <Calendar size={16} />
                            <span>{article.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                            <User size={16} />
                            <span>RemoveCloths Team</span>
                        </div>
                    </div>
                    <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-primary transition-colors">
                        <Share2 size={20} />
                    </button>
                </div>

                {/* Text Content */}
                <div className="prose dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: article.content }} />
                </div>
            </div>
        </article>

      </div>
    </div>
  );
};