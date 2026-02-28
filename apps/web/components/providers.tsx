"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type * as React from "react";
import { AppQueryProvider } from "@/lib/query-provider";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppQueryProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        disableTransitionOnChange
        enableColorScheme
        enableSystem
      >
        {children}
      </NextThemesProvider>
    </AppQueryProvider>
  );
}
