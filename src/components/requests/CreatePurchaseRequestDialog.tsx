// src/components/requests/CreatePurchaseRequestDialog.tsx
import { useMemo, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";

import { usePurchaseRequestCatalog } from "@/hooks/usePurchaseRequestCatalog";
import { useCreatePurchaseRequest } from "@/hooks/usePurchaseRequestMutations";
import type { CatalogProduct } from "@/types/purchaseRequests.types";

export interface CreatePurchaseRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MAX_NOTES = 500;

interface LineItem {
  productId: string;
  barcode: string;
  name: string;
  sku: string;
  quantity: number;
  imageUrl?: string | null;
}

function dedupeAdd(lines: LineItem[], incoming: LineItem): LineItem[] {
  const idx = lines.findIndex((l) => l.productId === incoming.productId);
  if (idx === -1) return [...lines, incoming];
  const copy = [...lines];
  copy[idx] = {
    ...copy[idx],
    quantity: copy[idx].quantity + incoming.quantity,
  };
  return copy;
}

// =============================
// Wrapper
// =============================

export function CreatePurchaseRequestDialog(
  props: CreatePurchaseRequestDialogProps,
) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        {props.open && <CreatePurchaseRequestForm {...props} />}
      </DialogContent>
    </Dialog>
  );
}

// =============================
// Form (só monta quando open)
// =============================

function CreatePurchaseRequestForm({
  onOpenChange,
}: CreatePurchaseRequestDialogProps) {
  const catalogQuery = usePurchaseRequestCatalog();
  const createMutation = useCreatePurchaseRequest();

  const [lines, setLines] = useState<LineItem[]>([]);
  const [notes, setNotes] = useState("");
  const [searchInput, setSearchInput] = useState("");

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

  function handleAdd(product: CatalogProduct) {
    setLines((prev) =>
      dedupeAdd(prev, {
        productId: product.id,
        barcode: product.barcode,
        name: product.name,
        sku: product.sku,
        imageUrl: product.imageUrl,
        quantity: 1,
      }),
    );
    setSearchInput("");
  }

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

  const canSubmit =
    !createMutation.isPending &&
    lines.length > 0 &&
    lines.every((l) => l.quantity >= 1);

  async function handleSubmit() {
    if (!canSubmit) return;
    try {
      await createMutation.mutateAsync({
        items: lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
        })),
        notes: notes.trim() || null,
      });
      onOpenChange(false);
    } catch {
      // toast já disparado no hook
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-base font-bold text-primary">
          Novo pedido
        </DialogTitle>
        <DialogDescription>
          Selecione os produtos do catálogo e informe a quantidade desejada.
        </DialogDescription>
      </DialogHeader>

      {/* Busca */}
      <div className="space-y-2">
        <Label htmlFor="request-search">Buscar produto</Label>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="request-search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nome, SKU ou código"
            autoComplete="off"
            className="pl-9"
          />
        </div>

        {searchInput.trim().length > 0 && (
          <ul className="max-h-56 overflow-y-auto divide-y rounded border">
            {filteredCatalog.length === 0 && (
              <li className="px-2 py-3 text-sm text-muted-foreground">
                Nenhum produto encontrado.
              </li>
            )}
            {filteredCatalog.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => handleAdd(p)}
                  className="w-full flex items-center justify-between gap-2 px-2 py-2 text-left hover:bg-muted"
                >
                  <div className="min-w-0 flex items-center">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} className="w-16 h-16 block" />
                    ) : (
                      <></>
                    )}

                    <div>
                      <span className="block truncate text-sm font-medium">
                        {p.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {p.sku} · {p.barcode}
                        {p.isOutOfStock ? " · sem estoque" : ""}
                      </span>
                    </div>
                  </div>
                  <Plus size={16} className="shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Itens */}
      <div className="rounded border mb-2">
        <div className="bg-muted/50 px-3 py-2 text-xs font-semibold uppercase tracking-wide">
          Itens do pedido ({lines.length})
        </div>
        {lines.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            Nenhum item adicionado.
          </p>
        ) : (
          <ul className="divide-y">
            {lines.map((l) => (
              <li key={l.productId} className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex items-center">
                    {l.imageUrl ? (
                      <img src={l.imageUrl} className="w-16 h-16 block" />
                    ) : (
                      <></>
                    )}
                    <div>
                      <p className="truncate text-sm font-medium">{l.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {l.sku} · {l.barcode}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLine(l.productId)}
                    title="Remover item"
                    className="cursor-pointer hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>

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
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Observações */}
      <div className="space-y-1">
        <Label htmlFor="request-notes" className="mb-2">
          Observações
        </Label>
        <Textarea
          id="request-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, MAX_NOTES))}
          placeholder="Itens não cadastrados no sistema, urgência, etc."
          rows={3}
          maxLength={MAX_NOTES}
        />
        <p className="text-xs text-muted-foreground text-right">
          {notes.length}/{MAX_NOTES}
        </p>
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
          {createMutation.isPending ? "Enviando..." : "Criar pedido"}
        </Button>
      </DialogFooter>
    </>
  );
}
