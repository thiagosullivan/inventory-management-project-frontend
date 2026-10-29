// src/components/movements/CreateTransferDialog.tsx
import { useMemo, useRef, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { Plus, Search, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { fetchProductByBarcode } from "@/services/products";
import { usePurchaseRequest } from "@/hooks/usePurchaseRequest";
import { usePurchaseRequestCatalog } from "@/hooks/usePurchaseRequestCatalog";
import { useCreateTransfer } from "@/hooks/useTransferMutations";
import { getApiErrorCode } from "@/lib/api-error";
import type { SectorOption } from "@/types/sectors.types";
import type { Product } from "@/types/products.types";
import { toast } from "sonner";

export interface CreateTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseRequestId?: string | null;
  destinationOptions: SectorOption[];
}

interface LineItem {
  productId: string;
  barcode: string;
  name: string;
  sku: string;
  quantity: number;
  /** quando vem de pedido, guarda a quantidade pedida pra aviso de estoque */
  quantityOrdered?: number;
}

const MAX_REASON = 300;

function dedupeAdd(lines: LineItem[], incoming: LineItem): LineItem[] {
  const idx = lines.findIndex((l) => l.productId === incoming.productId);
  if (idx === -1) return [...lines, incoming];
  const copy = [...lines];
  copy[idx] = {
    ...copy[idx],
    quantity: copy[idx].quantity + incoming.quantity,
    // se vier de pedido e já existir, mantém o quantityOrdered maior
    quantityOrdered: copy[idx].quantityOrdered ?? incoming.quantityOrdered,
  };
  return copy;
}

function productToLine(p: Product, quantity = 1): LineItem {
  return {
    productId: p.id,
    barcode: p.barcode,
    name: p.name,
    sku: p.sku,
    quantity,
  };
}

function isNotFound(err: unknown): boolean {
  const code = getApiErrorCode(err);
  const status = (err as { response?: { status?: number } })?.response?.status;
  return code === "PRODUCT_NOT_FOUND" || status === 404;
}

// =============================
// Wrapper: controla montagem/desmontagem
// =============================

export function CreateTransferDialog(props: CreateTransferDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        {props.open && (
          <CreateTransferForm
            key={props.purchaseRequestId ?? "avulso"}
            {...props}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// =============================
// Corpo do form — só monta quando open
// =============================

function CreateTransferForm({
  onOpenChange,
  purchaseRequestId = null,
  destinationOptions,
}: CreateTransferDialogProps) {
  const isFromRequest = !!purchaseRequestId;

  const requestQuery = usePurchaseRequest(purchaseRequestId ?? undefined);
  const catalogQuery = usePurchaseRequestCatalog();
  const createMutation = useCreateTransfer();

  // --- Itens iniciais (derivados do pedido, snapshot no primeiro render) ---
  const initialLines = useMemo<LineItem[]>(() => {
    if (!isFromRequest) return [];
    const items = requestQuery.data?.items;
    if (!items) return [];
    return items.map((it) => ({
      productId: it.productId,
      barcode: it.product.barcode,
      name: it.product.name,
      sku: it.product.sku,
      quantity: it.quantity,
      quantityOrdered: it.quantity,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // snapshot intencional — key remonta quando muda pedido

  const [toSectorId, setToSectorId] = useState("");
  const [reason, setReason] = useState("");
  const [lines, setLines] = useState<LineItem[]>(initialLines);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scanPending, setScanPending] = useState(false);
  const barcodeRef = useRef<HTMLInputElement>(null);
  const [searchInput, setSearchInput] = useState("");

  // =============================
  // Estoque atual dos itens (derivado, sem setState)
  // =============================

  const stockQueries = useQueries({
    queries: lines.map((l) => ({
      queryKey: ["products", "byBarcode", l.barcode],
      enabled: isFromRequest && !!l.barcode,
      staleTime: 0,
      retry: false,
      queryFn: async (): Promise<Product | null> => {
        try {
          return await fetchProductByBarcode(l.barcode);
        } catch (err) {
          if (isNotFound(err)) return null;
          throw err;
        }
      },
    })),
  });

  const availableByProductId = useMemo(() => {
    const map = new Map<string, number | undefined>();
    lines.forEach((l, i) => {
      const q = stockQueries[i]?.data;
      if (q) map.set(l.productId, q.quantity);
    });
    return map;
  }, [lines, stockQueries]);

  // =============================
  // Busca manual
  // =============================

  const catalog = useMemo(() => catalogQuery.data ?? [], [catalogQuery.data]);

  const filteredCatalog = useMemo(() => {
    const term = searchInput.trim().toLowerCase();
    if (!term) return [];
    return catalog
      .filter((p) => {
        if (lines.some((l) => l.productId === p.id)) return false;
        return (
          p.name.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term) ||
          p.barcode.toLowerCase().includes(term)
        );
      })
      .slice(0, 8);
  }, [catalog, searchInput, lines]);

  function handleManualAdd(productId: string) {
    const p = catalog.find((c) => c.id === productId);
    if (!p) return;
    setLines((prev) =>
      dedupeAdd(prev, {
        productId: p.id,
        barcode: p.barcode,
        name: p.name,
        sku: p.sku,
        quantity: 1,
      }),
    );
    setSearchInput("");
  }

  // =============================
  // Bipagem
  // =============================

  async function handleScanEnter() {
    const code = barcodeInput.trim();
    if (!code || scanPending) return;

    setScanPending(true);
    try {
      let product: Product | null = null;
      try {
        product = await fetchProductByBarcode(code);
      } catch (err) {
        if (isNotFound(err)) product = null;
        else throw err;
      }

      if (!product) {
        toast.error(`Produto não encontrado para "${code}".`);
        return;
      }

      setLines((prev) => dedupeAdd(prev, productToLine(product!, 1)));
      setBarcodeInput("");
      barcodeRef.current?.focus();
    } finally {
      setScanPending(false);
    }
  }

  function handleBarcodeKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleScanEnter();
    }
  }

  // =============================
  // Quantidade / remoção
  // =============================

  function setLineQuantity(productId: string, raw: string) {
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    const q = Math.max(1, Math.floor(n));
    setLines((prev) =>
      prev.map((l) => (l.productId === productId ? { ...l, quantity: q } : l)),
    );
  }

  function removeLine(productId: string) {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }

  // =============================
  // Submit
  // =============================

  const requestStatus = requestQuery.data?.status;
  const requestBlocksCreate =
    isFromRequest &&
    requestStatus !== undefined &&
    requestStatus !== "PENDENTE" &&
    requestStatus !== "EM_ATENDIMENTO";

  const canSubmit =
    !createMutation.isPending &&
    !requestBlocksCreate &&
    toSectorId.length > 0 &&
    lines.length > 0 &&
    lines.every((l) => l.quantity >= 1);

  async function handleSubmit() {
    if (!canSubmit) return;
    try {
      await createMutation.mutateAsync({
        toSectorId,
        purchaseRequestId: purchaseRequestId ?? null,
        reason: reason.trim() || null,
        items: lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
        })),
      });
      onOpenChange(false);
    } catch {
      // toast já disparado no hook
    }
  }

  // =============================
  // Render
  // =============================

  if (isFromRequest && requestQuery.isLoading) {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-primary">
            Nova remessa
          </DialogTitle>
          <DialogDescription>
            Vinculada ao pedido {purchaseRequestId?.slice(0, 8)}.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Carregando pedido...</p>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-base font-bold text-primary">
          Nova remessa
        </DialogTitle>
        <DialogDescription>
          {isFromRequest
            ? `Vinculada ao pedido ${purchaseRequestId?.slice(0, 8)}.`
            : "Remessa avulsa (sem pedido)."}
        </DialogDescription>
      </DialogHeader>

      {requestBlocksCreate && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-900">
          Este pedido não aceita novas remessas (status:{" "}
          <strong>{requestStatus}</strong>).
        </div>
      )}

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="transfer-toSector">Setor destino *</FieldLabel>
          <Select
            value={toSectorId || null}
            onValueChange={(v) => setToSectorId(v ?? "")}
          >
            <SelectTrigger id="transfer-toSector" className="w-full">
              <SelectValue placeholder="Selecione o setor destino" />
            </SelectTrigger>
            <SelectContent>
              {destinationOptions.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>
            Apenas setores ativos (exceto Almoxarifado).
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="transfer-reason">Motivo</FieldLabel>
          <Input
            id="transfer-reason"
            value={reason}
            maxLength={MAX_REASON}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex.: reposição de estoque do setor"
            autoComplete="off"
          />
        </Field>
      </FieldGroup>

      {/* Bipagem */}
      <div className="rounded border p-3 space-y-2">
        <Label htmlFor="transfer-barcode">Bipar código de barras</Label>
        <Input
          id="transfer-barcode"
          ref={barcodeRef}
          value={barcodeInput}
          onChange={(e) => setBarcodeInput(e.target.value)}
          onKeyDown={handleBarcodeKeyDown}
          placeholder="Passe o leitor ou digite e aperte Enter"
          autoComplete="off"
          disabled={scanPending}
        />
        <FieldDescription>
          Enter adiciona o produto. Se já estiver na lista, soma a quantidade.
        </FieldDescription>
      </div>

      {/* Busca manual */}
      <div className="rounded border p-3 space-y-2">
        <Label htmlFor="transfer-search">Adicionar do catálogo</Label>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="transfer-search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nome, SKU ou código"
            autoComplete="off"
            className="pl-9"
          />
        </div>

        {searchInput.trim().length > 0 && (
          <ul className="max-h-56 overflow-y-auto divide-y">
            {filteredCatalog.length === 0 && (
              <li className="px-2 py-3 text-sm text-muted-foreground">
                Nenhum produto encontrado.
              </li>
            )}
            {filteredCatalog.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => handleManualAdd(p.id)}
                  className="w-full flex items-center justify-between gap-2 px-2 py-2 text-left hover:bg-muted"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {p.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {p.sku} · {p.barcode}
                      {p.isOutOfStock ? " · sem estoque" : ""}
                    </span>
                  </span>
                  <Plus size={16} className="shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Itens */}
      <div className="rounded border">
        <div className="bg-muted/50 px-3 py-2 text-xs font-semibold uppercase tracking-wide">
          Itens da remessa ({lines.length})
        </div>
        {lines.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            Nenhum item adicionado.
          </p>
        ) : (
          <ul className="divide-y">
            {lines.map((l) => {
              const available = availableByProductId.get(l.productId);
              const overOrdered =
                l.quantityOrdered !== undefined &&
                available !== undefined &&
                l.quantityOrdered > available;
              const noStock = available === 0;
              return (
                <li key={l.productId} className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{l.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {l.sku} · {l.barcode}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLine(l.productId)}
                      title="Remover item"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-end gap-3">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor={`qty-${l.productId}`} className="text-xs">
                        Quantidade
                      </Label>
                      <Input
                        id={`qty-${l.productId}`}
                        type="number"
                        min={1}
                        inputMode="numeric"
                        value={l.quantity}
                        onChange={(e) =>
                          setLineQuantity(l.productId, e.target.value)
                        }
                        className="w-28"
                      />
                    </div>

                    {l.quantityOrdered !== undefined && (
                      <div className="text-xs text-muted-foreground">
                        Pedido: <strong>{l.quantityOrdered}</strong>
                        {available !== undefined && (
                          <>
                            {" "}
                            · Estoque: <strong>{available}</strong>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {overOrdered && !noStock && (
                    <p className="text-xs text-amber-800">
                      Quantidade pedida maior que o estoque atual do
                      Almoxarifado — o backend pode recusar por estoque
                      insuficiente.
                    </p>
                  )}
                  {noStock && (
                    <p className="text-xs text-red-700">
                      Sem estoque no Almoxarifado para este produto.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={createMutation.isPending}
        >
          Cancelar
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={!canSubmit}>
          {createMutation.isPending ? "Salvando..." : "Criar remessa"}
        </Button>
      </DialogFooter>
    </>
  );
}
