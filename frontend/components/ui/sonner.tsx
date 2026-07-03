'use client';

import { Toaster as Sonner, type ToasterProps } from 'sonner';

// This app is permanently dark-themed (no next-themes/theme toggle), so the
// theme is hardcoded rather than read from a theme provider.
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      style={
        {
          '--normal-bg': 'hsl(var(--popover))',
          '--normal-text': 'hsl(var(--popover-foreground))',
          '--normal-border': 'hsl(var(--border))',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
