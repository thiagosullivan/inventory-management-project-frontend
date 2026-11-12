// src/pages/HistoryPage.tsx
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronRight, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useDebounce } from "@/hooks/useDebounce";
import { useHistory } from "@/hooks/useHistory";
import { TransferDetailsDialog } from "@/components/movements/TransferDetailsDialog";
import { MovementDetailsDialog } from "@/components/history/MovementDetailsDialog";
import {
  HISTORY_DEFAULTS,
  MOVEMENT_STATUS_VALUES,
  MOVEMENT_TYPE_VALUES,
  parseHistoryFilters,
  serializeHistoryFilters,
} from "@/lib/history-query-params";
import type {
  HistoryEvent,
  HistoryFilters,
  HistoryMovementRef,
  MovementStatus,
  MovementType,
} from "@/types/history.types";

// =============================
// Labels
// =============================

const TYPE_LABEL: Record<MovementType, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
  AJUSTE: "Ajuste",
  TRANSFERENCIA: "Transferência",
};

const STATUS_LABEL: Record<MovementStatus, string> = {
  PENDENTE: "Pendente",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

const STATUS_CLASS: Record<MovementStatus, string> = {
  PENDENTE: "bg-amber-100 text-amber-900 border-amber-300",
  CONCLUIDO: "bg-emerald-100 text-emerald-900 border-emerald-300",
  CANCELADO: "bg-zinc-200 text-zinc-800 border-zinc-300",
};

const TRANSFER_STATUS_LABEL: Record<
  "PENDENTE" | "CONCLUIDO" | "CANCELADO" | "RECUSADO",
  string
> = {
  PENDENTE: "Pendente",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
  RECUSADO: "Recusado",
};

const TRANSFER_STATUS_CLASS: Record<
  "PENDENTE" | "CONCLUIDO" | "CANCELADO" | "RECUSADO",
  string
> = {
  PENDENTE: "bg-amber-100 text-amber-900 border-amber-300",
  CONCLUIDO: "bg-emerald-100 text-emerald-900 border-emerald-300",
  CANCELADO: "bg-zinc-200 text-zinc-800 border-zinc-300",
  RECUSADO: "bg-red-100 text-red-900 border-red-300",
};

const ALL_VALUE = "__all__";

type EventMode = "all" | "movements" | "transfers";

const EVENT_MODE_LABEL: Record<EventMode, string> = {
  all: "Todos",
  movements: "Movimentações",
  transfers: "Transferências",
};

// =============================
// Formatters
// =============================

function formatDateTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCents(value: number | null): string {
  if (value === null) return "—";
  return (value / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function sectorsSummary(m: HistoryMovementRef): string {
  const from = m.fromSector?.name ?? "—";
  const to = m.toSector?.name ?? "—";
  return `${from} → ${to}`;
}

/**
 * 🔹 Wrapper animado para o painel de expandir.
 * Truque CSS: grid-template-rows 0fr → 1fr anima a altura sem precisar
 * medir o conteúdo. O filho precisa ter `overflow-hidden` e `min-h-0`.
 */
function CollapsiblePanel({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        "grid transition-all duration-300 ease-out",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      ].join(" ")}
    >
      <div className="overflow-hidden min-h-0">{children}</div>
    </div>
  );
}

// =============================
// Página
// =============================

export default function HistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => parseHistoryFilters(searchParams),
    [searchParams],
  );

  // search input local (debounced antes de ir pra URL)
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const debouncedSearch = useDebounce(searchInput, 400);

  // Quando o debounce estabiliza, reflete na URL (se mudou)
  useMemo(() => {
    const current = filters.search ?? "";
    if (debouncedSearch === current) return;
    updateFilters({ search: debouncedSearch || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // =============================
  // Modo de evento (Todos / Movimentações / Transferências)
  // Derivado de hasTransfer:
  //   undefined → all (includeTransfers=true, sem hasTransfer)
  //   false     → movements (includeTransfers=false, hasTransfer=false)
  //   true      → transfers (includeTransfers=true, hasTransfer=true)
  // =============================

  const eventMode: EventMode =
    filters.hasTransfer === true
      ? "transfers"
      : filters.hasTransfer === false
        ? "movements"
        : "all";

  const includeTransfers = eventMode !== "movements";

  const historyQuery = useHistory({
    ...filters,
    sortOrder: filters.sortOrder ?? HISTORY_DEFAULTS.sortOrder,
    includeTransfers,
  });

  // Expand state (transferId)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Dialogs
  const [movementDetail, setMovementDetail] =
    useState<HistoryMovementRef | null>(null);
  const [transferDetailId, setTransferDetailId] = useState<string | null>(null);

  // =============================
  // URL helpers
  // =============================

  function updateFilters(patch: Partial<HistoryFilters>) {
    const next: HistoryFilters = { ...filters, ...patch };
    // ao mudar filtro (exceto page/limit), volta pra página 1
    const isFilterChange =
      patch.type !== undefined ||
      patch.status !== undefined ||
      patch.dateFrom !== undefined ||
      patch.dateTo !== undefined ||
      patch.search !== undefined ||
      patch.includeTransfers !== undefined ||
      patch.hasTransfer !== undefined ||
      patch.createdById !== undefined ||
      patch.productId !== undefined;
    if (isFilterChange) next.page = 1;

    setSearchParams(serializeHistoryFilters(next), { replace: true });
  }

  function goToPage(page: number) {
    setSearchParams(serializeHistoryFilters({ ...filters, page }), {
      replace: true,
    });
  }

  function setEventMode(mode: EventMode) {
    if (mode === "all") {
      updateFilters({ hasTransfer: undefined });
    } else if (mode === "movements") {
      updateFilters({ hasTransfer: false });
    } else {
      updateFilters({ hasTransfer: true });
    }
  }

  // =============================
  // Dados derivados
  // =============================

  const data = historyQuery.data;
  const events = data?.events ?? [];
  const total = data?.total ?? 0;
  const page = filters.page ?? HISTORY_DEFAULTS.page;
  const limit = filters.limit ?? HISTORY_DEFAULTS.limit;
  const totalPages = data?.totalPages ?? 1;
  const fromRow = total === 0 ? 0 : (page - 1) * limit + 1;
  const toRow = Math.min(page * limit, total);

  // =============================
  // Render helpers
  // =============================

  function renderMovementRow(m: HistoryMovementRef, depth = 0) {
    return (
      <tr key={m.id} className="border-t">
        <td
          className="px-4 py-3 whitespace-nowrap"
          style={{ paddingLeft: 16 + depth * 16 }}
        >
          {formatDateTime(m.createdAt)}
        </td>
        <td className="px-4 py-3">
          <div className="flex flex-col items-center gap-y-1 w-fit">
            <span
              className={`inline-block w-fit rounded border px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[m.status]}`}
            >
              {STATUS_LABEL[m.status]}
            </span>
            <span className="text-sm text-muted-foreground">
              {TYPE_LABEL[m.type]}
            </span>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex flex-col">
            <Link className="font-medium" to={`/products/${m.product.id}`}>
              {m.product.name}
            </Link>
            <span className="text-xs font-mono text-muted-foreground">
              {m.product.sku}
            </span>
          </div>
        </td>
        <td className="px-4 py-3 text-xs">{sectorsSummary(m)}</td>
        <td
          className={`px-4 py-3 font-mono ${m.quantity < 0 ? "text-red-600" : "text-emerald-700"}`}
        >
          {m.quantity}
        </td>
        <td className="px-4 py-3 text-xs">
          <div className="flex flex-col">
            <span>{m.createdBy.name ?? "—"}</span>
            <span className="text-muted-foreground">
              {formatCents(m.unitPriceInCents)}
            </span>
          </div>
        </td>
        <td className="px-4 py-3 text-right">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setMovementDetail(m)}
            title="Ver detalhes"
            className="cursor-pointer hover:text-primary"
          >
            <Eye size={16} />
          </Button>
        </td>
      </tr>
    );
  }

  function renderTransferEvent(
    event: Extract<HistoryEvent, { eventType: "TRANSFER" }>,
  ) {
    const { transfer, movements } = event;
    const isOpen = expanded[transfer.id] === true;
    const movementsCount = movements.length;

    return (
      <>
        <tr key={transfer.id} className="border-t bg-muted/20">
          <td className="px-4 py-3 whitespace-nowrap">
            {formatDateTime(transfer.createdAt)}
          </td>
          <td className="px-4 py-3">
            <span
              className={`inline-block rounded border px-2 py-0.5 text-xs font-semibold ${TRANSFER_STATUS_CLASS[transfer.status]}`}
            >
              {TRANSFER_STATUS_LABEL[transfer.status]}
            </span>
            <span className="ml-2 text-xs text-muted-foreground">Remessa</span>
          </td>
          <td className="px-4 py-3">
            <div className="flex flex-col">
              <span className="font-medium">
                {transfer._count.items} item(ns)
              </span>
              <span className="text-xs text-muted-foreground">
                {transfer.items
                  .slice(0, 2)
                  .map((it) => `${it.product.name} (${it.quantity})`)
                  .join(", ")}
                {transfer.items.length > 2 ? "…" : ""}
              </span>
            </div>
          </td>
          <td className="px-4 py-3 text-xs">
            {transfer.fromSector.name} → {transfer.toSector.name}
          </td>
          <td className="px-4 py-3 text-xs text-muted-foreground">—</td>
          <td className="px-4 py-3 text-xs">
            <div className="flex flex-col">
              <span>{transfer.createdBy.name ?? "—"}</span>
              <span className="text-muted-foreground">
                {movementsCount} movimentaç{movementsCount === 1 ? "ão" : "ões"}
              </span>
            </div>
          </td>
          <td className="px-4 py-3 text-right">
            <div className="flex items-center justify-end gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setTransferDetailId(transfer.id)}
                title="Ver remessa"
                className="cursor-pointer hover:text-primary"
              >
                <Eye size={16} />
              </Button>
              {movementsCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setExpanded((prev) => ({
                      ...prev,
                      [transfer.id]: !prev[transfer.id],
                    }))
                  }
                  title={isOpen ? "Recolher" : "Expandir"}
                  className="cursor-pointer"
                >
                  {isOpen ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </Button>
              )}
            </div>
          </td>
        </tr>
        {/* {isOpen && movements.map((m) => renderMovementRow(m, 1))} */}

        {/* 🔹 Sub-lista animada, com visual próprio (separado da tabela) */}
        <tr className="border-t">
          <td colSpan={7} className="p-0 bg-transparent">
            <CollapsiblePanel open={isOpen}>
              <div className="bg-muted/60 border-y border-dashed px-6 py-5">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                  Movimentações desta remessa ({movementsCount})
                </p>

                <ul className="flex flex-col gap-2">
                  {movements.map((m) => (
                    <li
                      key={m.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 text-xs"
                    >
                      <div className="flex flex-col min-w-[160px]">
                        <span className="font-medium">{m.product.name}</span>
                        <span className="font-mono text-muted-foreground">
                          {m.product.sku}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block rounded border px-2 py-0.5 text-[11px] font-semibold ${STATUS_CLASS[m.status]}`}
                        >
                          {STATUS_LABEL[m.status]}
                        </span>
                        <span className="text-muted-foreground">
                          {TYPE_LABEL[m.type]}
                        </span>
                      </div>

                      <div className="text-muted-foreground">
                        {sectorsSummary(m)}
                      </div>

                      <div
                        className={`font-mono ${m.quantity < 0 ? "text-red-600" : "text-emerald-700"}`}
                      >
                        {m.quantity}
                      </div>

                      <div className="flex flex-col text-right">
                        <span>{m.createdBy.name ?? "—"}</span>
                        <span className="text-muted-foreground">
                          {formatCents(m.unitPriceInCents)}
                        </span>
                      </div>

                      <div className="text-muted-foreground whitespace-nowrap">
                        {formatDateTime(m.createdAt)}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setMovementDetail(m)}
                        title="Ver detalhes"
                        className="cursor-pointer hover:text-primary"
                      >
                        <Eye size={14} />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </CollapsiblePanel>
          </td>
        </tr>
      </>
    );
  }

  // =============================
  // Render
  // =============================

  return (
    <section className="flex flex-col mx-auto gap-6 w-full max-w-6xl px-4 py-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Histórico</h1>
          <p className="text-sm text-muted-foreground">
            Linha do tempo unificada de movimentações e remessas.
          </p>
        </div>
      </header>

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1 min-w-[200px] flex-1">
          <Label htmlFor="filter-search">Buscar</Label>
          <Input
            id="filter-search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Produto, SKU ou motivo"
            autoComplete="off"
          />
        </div>

        <div className="flex flex-col gap-1 min-w-[160px]">
          <Label htmlFor="filter-event">Eventos</Label>
          <Select
            value={eventMode}
            onValueChange={(v) => {
              if (v === null) return;
              setEventMode(v as EventMode);
            }}
          >
            <SelectTrigger id="filter-event">
              <SelectValue placeholder="Todos">
                {EVENT_MODE_LABEL[eventMode]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="movements">Movimentações</SelectItem>
              <SelectItem value="transfers">Transferências</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1 min-w-[140px]">
          <Label htmlFor="filter-type">Tipo</Label>
          <Select
            value={filters.type ?? ALL_VALUE}
            onValueChange={(v) => {
              if (v === null) return;
              updateFilters({
                type: v === ALL_VALUE ? undefined : (v as MovementType),
              });
            }}
          >
            <SelectTrigger id="filter-type">
              <SelectValue placeholder="Todos">
                {filters.type ? TYPE_LABEL[filters.type] : "Todos"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Todos</SelectItem>
              {MOVEMENT_TYPE_VALUES.map((t) => (
                <SelectItem key={t} value={t}>
                  {TYPE_LABEL[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1 min-w-[140px]">
          <Label htmlFor="filter-status">Status</Label>
          <Select
            value={filters.status ?? ALL_VALUE}
            onValueChange={(v) => {
              if (v === null) return;
              updateFilters({
                status: v === ALL_VALUE ? undefined : (v as MovementStatus),
              });
            }}
          >
            <SelectTrigger id="filter-status">
              <SelectValue placeholder="Todos">
                {filters.status ? STATUS_LABEL[filters.status] : "Todos"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Todos</SelectItem>
              {MOVEMENT_STATUS_VALUES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1 min-w-[160px]">
          <Label htmlFor="filter-dateFrom">De</Label>
          <Input
            id="filter-dateFrom"
            type="date"
            value={filters.dateFrom?.slice(0, 10) ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              updateFilters({
                dateFrom: v ? `${v}T00:00:00.000Z` : undefined,
              });
            }}
          />
        </div>

        <div className="flex flex-col gap-1 min-w-[160px]">
          <Label htmlFor="filter-dateTo">Até</Label>
          <Input
            id="filter-dateTo"
            type="date"
            value={filters.dateTo?.slice(0, 10) ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              updateFilters({
                dateTo: v ? `${v}T23:59:59.999Z` : undefined,
              });
            }}
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Data</th>
              <th className="px-4 py-3 font-semibold">Status / Tipo</th>
              <th className="px-4 py-3 font-semibold">Produto / Remessa</th>
              <th className="px-4 py-3 font-semibold">Setores</th>
              <th className="px-4 py-3 font-semibold">Qtd</th>
              <th className="px-4 py-3 font-semibold">Autor / Valor</th>
              <th className="px-4 py-3 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {historyQuery.isLoading && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Carregando histórico...
                </td>
              </tr>
            )}
            {historyQuery.isError && !historyQuery.isLoading && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-destructive"
                >
                  Erro ao carregar histórico.
                </td>
              </tr>
            )}
            {!historyQuery.isLoading &&
              !historyQuery.isError &&
              events.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Nenhum evento encontrado.
                  </td>
                </tr>
              )}
            {events.map((event) =>
              event.eventType === "TRANSFER"
                ? renderTransferEvent(event)
                : renderMovementRow(event.movement),
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {total === 0 ? "0 resultados" : `${fromRow}–${toRow} de ${total}`}
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
            className="cursor-pointer"
          >
            Anterior
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
            className="cursor-pointer"
          >
            Próxima
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <MovementDetailsDialog
        movement={movementDetail}
        open={movementDetail !== null}
        onOpenChange={(open) => {
          if (!open) setMovementDetail(null);
        }}
      />

      <TransferDetailsDialog
        transferId={transferDetailId}
        open={transferDetailId !== null}
        onOpenChange={(open) => {
          if (!open) setTransferDetailId(null);
        }}
      />
    </section>
  );
}
