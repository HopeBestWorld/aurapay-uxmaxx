import { MagicProvider } from '@/context/MagicContext';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MagicProvider>
          {children}
        </MagicProvider>
      </body>
    </html>
  );
}