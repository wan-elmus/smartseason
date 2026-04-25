'use client';

export default function Card({ children, title, className = '', headerAction = null }) {
  return (
    <div className={`bg-white rounded-xl shadow-md shadow-gray-200/50 border border-gray-100 overflow-hidden ${className}`}>
      {title && (
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}