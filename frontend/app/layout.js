import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata = {
  title: 'SmartSeason - Field Monitoring System',
  description: 'Agricultural field monitoring and management platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}