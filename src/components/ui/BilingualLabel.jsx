import React from 'react';

/**
 * BilingualLabel Component
 * Displays primary English label with a secondary Tamil sub-caption in monospace styling,
 * strictly adhering to DESIGN.md typography hierarchy.
 */
export default function BilingualLabel({ en, ta, className = "", enClassName = "", taClassName = "" }) {
  if (!ta) {
    return <span className={className}>{en}</span>;
  }

  return (
    <div className={`inline-flex flex-col leading-tight ${className}`}>
      <span className={`font-semibold ${enClassName}`}>{en}</span>
      <span className={`text-[10px] font-mono tracking-wider opacity-60 ${taClassName}`}>{ta}</span>
    </div>
  );
}
