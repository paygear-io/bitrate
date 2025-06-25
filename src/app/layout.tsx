// This root layout is intentionally simple. 
// The main layout logic is in `src/app/[locale]/layout.tsx`.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
