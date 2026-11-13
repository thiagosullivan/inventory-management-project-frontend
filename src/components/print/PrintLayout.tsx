// src/components/print/PrintLayout.tsx
import type { ReactNode } from "react";
import { PrintHeader, type PrintHeaderProps } from "./PrintHeader";
import { PrintFooter } from "./PrintFooter";

export interface PrintLayoutProps extends PrintHeaderProps {
  children: ReactNode;
}

export function PrintLayout({ children, ...headerProps }: PrintLayoutProps) {
  return (
    <div className="print-only print-doc">
      <PrintHeader {...headerProps} />
      {children}
      <PrintFooter />
    </div>
  );
}
