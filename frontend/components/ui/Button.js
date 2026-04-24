'use client';

import { useRouter } from 'next/navigation';
import Spinner from '@/components/ui/Spinner';

export default function Button({ 
  children, 
  onClick, 
  href,
  type = 'button', 
  variant = 'primary', 
  size = 'sm',
  disabled = false, 
  loading = false,
  className = '' 
}) {
  const router = useRouter();

  const handleClick = (e) => {
    if (href) {
      e.preventDefault();
      router.push(href);
    } else if (onClick) {
      onClick(e);
    }
  };

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary',
    danger: 'bg-danger text-white hover:bg-red-700 focus:ring-danger',
    outline: 'border border-primary text-primary hover:bg-primary/5 focus:ring-primary',
    ghost: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
  };
  
  const sizes = {
    xs: 'px-2 py-1 text-xs rounded',
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-base rounded-md',
    lg: 'px-5 py-2.5 text-base rounded-lg',
  };
  
  const isLink = !!href;
  
  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`${variants[variant]} ${sizes[size]} font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <Spinner size="xs" />
        </div>
      ) : children}
    </button>
  );
}