/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useEffect } from 'react';
import { JOURNAL_ARTICLES } from '../constants';
import { JournalArticle } from '../types';

interface JournalProps {
  onArticleClick: (article: JournalArticle) => void;
}

const JournalArticleSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col text-left animate-pulse">
      {/* Image skeleton */}
      <div className="w-full aspect-[4/3] bg-[#E3DFD5] mb-8 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F5F2EB]/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        {/* Abstract focus ring mimic */}
        <div className="absolute inset-0 m-auto w-12 h-12 rounded-full border border-[#D6D1C7]/30 opacity-40"></div>
      </div>
      
      {/* Date skeleton */}
      <div className="h-3 w-1/4 bg-[#E3DFD5]/75 mb-4" />
      
      {/* Title skeleton */}
      <div className="space-y-2 mb-5">
        <div className="h-6 w-11/12 bg-[#E3DFD5]" />
        <div className="h-6 w-3/4 bg-[#E3DFD5]" />
      </div>
      
      {/* Excerpt skeleton */}
      <div className="space-y-2">
        <div className="h-3 w-full bg-[#E3DFD5]/50" />
        <div className="h-3 w-11/12 bg-[#E3DFD5]/50" />
        <div className="h-3 w-4/5 bg-[#E3DFD5]/50" />
      </div>
    </div>
  );
};

const Journal: React.FC<JournalProps> = ({ onArticleClick }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="journal" className="bg-[#F5F2EB] py-32 px-6 md:px-12">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 pb-8 border-b border-[#D6D1C7]">
            <div>
                <span className="block text-xs font-bold uppercase tracking-[0.2em] text-[#A8A29E] mb-4">Editorial</span>
                <h2 className="text-4xl md:text-6xl font-serif text-[#2C2A26]">The Journal</h2>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                    <JournalArticleSkeleton key={`journal-skeleton-${i}`} />
                ))
            ) : (
                JOURNAL_ARTICLES.map((article) => (
                    <div key={article.id} className="group cursor-pointer flex flex-col text-left" onClick={() => onArticleClick(article)}>
                        <div className="w-full aspect-[4/3] overflow-hidden mb-8 bg-[#EBE7DE]">
                            <img 
                                src={article.image} 
                                alt={article.title} 
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 grayscale-[0.2] group-hover:grayscale-0"
                            />
                        </div>
                        <div className="flex flex-col flex-1 text-left">
                            <span className="text-xs font-medium uppercase tracking-widest text-[#A8A29E] mb-3">{article.date}</span>
                            <h3 className="text-2xl font-serif text-[#2C2A26] mb-4 leading-tight group-hover:underline decoration-1 underline-offset-4">{article.title}</h3>
                            <p className="text-[#5D5A53] font-light leading-relaxed">{article.excerpt}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </section>
  );
};

export default Journal;
