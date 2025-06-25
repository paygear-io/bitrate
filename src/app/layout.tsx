// This root layout is required for the internationalized routing setup.
// It should not render the `<html>` and `<body>` tags, as those are
// handled by the layout in the `[locale]` segment.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
