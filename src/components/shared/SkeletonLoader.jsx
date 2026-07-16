'use client';

import React from 'react';

export default function SkeletonLoader({ type = 'list', rows = 5, cols = 4, count = 3 }) {
  const pulseClass = 'skeleton';

  if (type === 'table') {
    return (
      <div className="w-full card overflow-hidden select-none">
        <div className="flex border-b border-border bg-surface p-4">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={`th-${i}`} className={`h-4 w-24 mr-8 ${pulseClass}`} />
          ))}
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, rIdx) => (
            <div key={`tr-${rIdx}`} className="flex p-4 items-center">
              {Array.from({ length: cols }).map((_, cIdx) => (
                <div
                  key={`td-${rIdx}-${cIdx}`}
                  className={`h-4 mr-8 ${pulseClass}`}
                  style={{ width: `${40 + ((rIdx * 7 + cIdx * 13) % 50)}px` }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 select-none">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={`card-${idx}`} className="card p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div className={`h-5 w-24 ${pulseClass}`} />
              <div className={`h-4 w-12 ${pulseClass}`} />
            </div>
            <div className="space-y-2">
              <div className={`h-4 w-full ${pulseClass}`} />
              <div className={`h-4 w-5/6 ${pulseClass}`} />
            </div>
            <div className="pt-2 flex justify-between items-center border-t border-border-subtle">
              <div className={`h-4 w-16 ${pulseClass}`} />
              <div className={`h-4 w-20 ${pulseClass}`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default type = 'list'
  return (
    <div className="space-y-3 w-full card p-4 select-none">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={`list-${idx}`} className="flex items-center space-x-4">
          <div className={`size-8 rounded-none ${pulseClass}`} />
          <div className="space-y-2 flex-1">
            <div className={`h-4 w-2/5 ${pulseClass}`} />
            <div className={`h-3 w-4/5 ${pulseClass}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
