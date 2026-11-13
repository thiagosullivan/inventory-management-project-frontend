// src/components/print/PrintHeader.tsx
import { formatPrintDateTime } from "@/lib/print/print-utils";

export interface PrintHeaderProps {
  title: string;
  /** Linhas de metadados (já formatadas). Ex.: ["Filtros: Status=Concluído"] */
  metaLines?: string[];
  totalCount: number;
  generatedAt: Date;
  /** Rótulo singular do item (ex.: "evento") */
  itemLabel?: string;
}

export function PrintHeader({
  title,
  metaLines = [],
  totalCount,
  generatedAt,
  itemLabel = "item",
}: PrintHeaderProps) {
  const plural = totalCount === 1 ? itemLabel : `${itemLabel}s`;

  return (
    <div className="print-header">
      <h1 className="print-header__title">{title}</h1>
      {metaLines.map((line, i) => (
        <p key={i} className="print-header__meta">
          {line}
        </p>
      ))}
      <p className="print-header__meta pb-2">
        <strong>Impresso em:</strong> {formatPrintDateTime(generatedAt)}
        {" · "}
        <strong>Total:</strong> {totalCount} {plural}
      </p>
      <div className="h-px w-full border-t border-gray-300 mb-3" />
    </div>
  );
}
