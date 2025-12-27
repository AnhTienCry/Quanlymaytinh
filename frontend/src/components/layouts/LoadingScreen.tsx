import React from 'react';

export const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900">
    <div className="text-center">
      <div className="spinner mx-auto mb-4" />
      <p className="text-slate-400">Đang tải...</p>
    </div>
  </div>
);
