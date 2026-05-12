import React from 'react';

interface StrategyProps {
  title: string;
  tags: string;
  summary: string;
  price: string;
}

export const StrategyCard = ({ title, tags, summary, price }: StrategyProps) => {
  return (
    <div className="border-l-2 border-zinc-800 bg-zinc-900/30 p-5 font-sans">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-bold tracking-tight uppercase text-zinc-200">{title}</h3>
        <span className="font-mono text-xs bg-zinc-800 px-2 py-1 text-zinc-400">{price}</span>
      </div>
      <div className="flex gap-2 mb-4">
        {tags.split(',').map(tag => (
          <span key={tag} className="text-[10px] border border-zinc-700 px-2 py-0.5 text-zinc-500 uppercase">
            {tag.trim()}
          </span>
        ))}
      </div>
      <p className="text-xs leading-relaxed text-zinc-400 font-light italic">
        {summary}
      </p>
    </div>
  );
};