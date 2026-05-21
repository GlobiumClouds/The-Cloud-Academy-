/**
 * App-wide providers wrapper
 * Keeps layout.js clean and avoids "use client" on layout itself.
 */
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { queryClient } from "@/lib/queryClient";
import MaintenanceProvider from "./MaintenanceProvider";

export default function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <MaintenanceProvider>
          {children}
        </MaintenanceProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
