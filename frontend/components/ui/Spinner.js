'use client';

export default function Spinner({ size = 'md', fullPage = false }) {
  const sizes = {
    xs: 'w-3 h-3 border-2',
    sm: 'w-6 h-6 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div className="flex items-center justify-center">
      <div
        className={`${sizes[size]} border-primary border-t-transparent rounded-full animate-spin`}
        style={{ borderTopColor: 'transparent' }}
      />
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center space-y-3">
          {spinner}
          <p className="text-xs text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return spinner;
}