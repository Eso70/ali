import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "چوونەژوورەوە - Ali Network",
  description: "چوونەژوورەوە بۆ بەڕێوەبردنی Ali Network",
  robots: "noindex, nofollow", // Don't index login page
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div 
      className="min-h-screen bg-primary" 
      style={{ 
        backgroundColor: '#ffffff',
        background: '#ffffff',
        backgroundImage: 'none'
      }}
    >
      {children}
    </div>
  );
}
