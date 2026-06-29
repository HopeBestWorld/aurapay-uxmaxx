import { MagicProvider } from '@/context/MagicContext';
import { ZeroDevProvider } from '@/context/ZeroDevContext';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Add suppressHydrationWarning here ✨ */}
      <body suppressHydrationWarning>
        <MagicProvider>
          <ZeroDevProvider>
            {children}
          </ZeroDevProvider>
        </MagicProvider>
      </body>
    </html>
  );
}