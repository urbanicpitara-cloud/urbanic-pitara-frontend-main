// components/ThemeProvider.tsx
import { ReactNode } from "react";

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  return <div className="bg-background text-foreground font-sans">{children}</div>;
}
