import React from 'react';

interface RecordContentProps {
  children: React.ReactNode;
}

export default function RecordContent({ children }: RecordContentProps) {
  return (
    <div className="space-y-6">
      {children}
    </div>
  );
}
