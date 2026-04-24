'use client';

import LayoutClient from '@/components/LayoutClient';

export default function Providers({ children }) {
  return (
    <LayoutClient>
      {children}
    </LayoutClient>
  );
}