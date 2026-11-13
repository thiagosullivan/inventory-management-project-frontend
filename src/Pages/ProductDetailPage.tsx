// src/pages/ProductDetailPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ProductDetailHeader } from "@/components/products/ProductDetailHeader";
import { ProductDetailsTab } from "@/components/products/ProductDetailsTab";
import { ProductMovementsTab } from "@/components/products/ProductMovementsTab";
import { ProductHistoryTab } from "@/components/products/ProductHistoryTab";
import { CreateMovementDialog } from "@/components/products/CreateMovementDialog";
import { EditProductDialog } from "@/components/products/EditProductDialog";
import { DeleteProductDialog } from "@/components/products/DeleteProductDialog";
import { LabelPrintDialog } from "@/components/products/LabelPrintDialog";
import { useProduct } from "@/hooks/useProduct";

import { PrintDialog } from "@/components/print/PrintDialog";
import { PrintLayout } from "@/components/print/PrintLayout";
import { PrintPortal } from "@/components/print/PrintPortal";
import { ProductPrintView } from "@/components/products/ProductPrintView";
import { enterPrintMode, exitPrintMode } from "@/lib/print/print-mode";
import {
  fetchProductHistory,
  fetchProductMovements,
} from "@/services/products";
import type {
  ProductDetailResponse,
  StockHistoryEntry,
  MovementResponse,
} from "@/types/products.types";

interface PrintPayload {
  product: ProductDetailResponse;
  movements: MovementResponse[];
  history: StockHistoryEntry[];
  includeLists: boolean;
  generatedAt: Date;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProduct(id);
  const { user } = useAuth();

  const [movementOpen, setMovementOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [printLabelOpen, setPrintLabelOpen] = useState(false);

  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [printPayload, setPrintPayload] = useState<PrintPayload | null>(null);
  const [includeLists, setIncludeLists] = useState(true);

  // afterprint: limpa modo e desmonta a ficha
  useEffect(() => {
    function onAfterPrint() {
      exitPrintMode();
      setPrintPayload(null);
    }
    window.addEventListener("afterprint", onAfterPrint);
    return () => window.removeEventListener("afterprint", onAfterPrint);
  }, []);

  // Dispara window.print() depois que o payload montou
  useEffect(() => {
    if (!printPayload) return;
    enterPrintMode("list");
    const raf = requestAnimationFrame(() => {
      toast.dismiss();
      window.print();
    });
    return () => cancelAnimationFrame(raf);
  }, [printPayload]);

  if (isLoading) {
    return (
      <div className="text-center text-muted-foreground py-12">
        Carregando produto...
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-destructive">Produto não encontrado.</p>
        <Button variant="outline" onClick={() => navigate("/products")}>
          Voltar para produtos
        </Button>
      </div>
    );
  }

  const isManager = user?.role === "MANAGER";
  const isWarehouseUser = user?.sector?.isWarehouse === true;
  const canManage = isManager || isWarehouseUser;

  // =============================
  // Impressão da ficha
  // =============================

  async function loadAndPrint() {
    if (!product) return;
    const toastId = toast.loading("Carregando dados para impressão...");
    try {
      const [movementsRes, historyRes] = await Promise.all([
        includeLists
          ? fetchProductMovements(product.id)
          : Promise.resolve(null),
        includeLists ? fetchProductHistory(product.id) : Promise.resolve(null),
      ]);

      toast.dismiss(toastId);
      setPrintPayload({
        product,
        movements: movementsRes?.movements ?? [],
        history: historyRes?.history ?? [],
        includeLists,
        generatedAt: new Date(),
      });
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar dados para impressão.", { id: toastId });
    }
  }

  function handlePrintConfirm() {
    setPrintDialogOpen(false);
    setTimeout(() => {
      void loadAndPrint();
    }, 150);
  }

  function buildMetaLines(): string[] {
    return [
      `Produto: ${product!.sku} · ${product!.name}`,
      `Categoria: ${product!.category?.name ?? "—"} · Quantidade atual: ${product!.quantity} un.`,
    ];
  }

  return (
    <section className="flex flex-col mx-auto gap-6 w-full max-w-5xl px-4 py-8">
      <ProductDetailHeader
        product={product}
        canEdit={canManage}
        onMovement={() => setMovementOpen(true)}
        onPrint={() => setPrintLabelOpen(true)}
        onPrintSheet={() => setPrintDialogOpen(true)}
        onEdit={() => setEditOpen(true)}
        onDelete={() => setDeleteOpen(true)}
      />

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details" className="cursor-pointer">
            Detalhes
          </TabsTrigger>
          <TabsTrigger value="movements" className="cursor-pointer">
            Movimentações
          </TabsTrigger>
          <TabsTrigger value="history" className="cursor-pointer">
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <ProductDetailsTab product={product} />
        </TabsContent>

        <TabsContent value="movements" className="mt-4">
          <ProductMovementsTab
            productId={product.id}
            onNewMovement={() => setMovementOpen(true)}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <ProductHistoryTab productId={product.id} />
        </TabsContent>
      </Tabs>

      {canManage && (
        <CreateMovementDialog
          open={movementOpen}
          onOpenChange={setMovementOpen}
          productId={product.id}
          productName={product.name}
          currentQuantity={product.quantity}
        />
      )}

      <EditProductDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        product={product}
      />

      <DeleteProductDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        product={product}
        onDeleted={() => navigate("/products")}
      />

      <LabelPrintDialog
        open={printLabelOpen}
        onOpenChange={setPrintLabelOpen}
        product={product}
      />

      {/* Dialog de opções da ficha */}
      <PrintDialog
        key={printDialogOpen ? "open" : "closed"}
        open={printDialogOpen}
        onOpenChange={setPrintDialogOpen}
        title="Imprimir ficha do produto"
        totalCount={1}
        pageSize={1}
        currentLabel="Ficha completa do produto"
        allLabel="Ficha completa do produto"
        extraCheckbox={{
          label: "Incluir movimentações e histórico",
          checked: includeLists,
          onCheckedChange: setIncludeLists,
        }}
        onConfirm={handlePrintConfirm}
      />

      {/* Ficha no portal, fora do #root */}
      {printPayload && (
        <PrintPortal>
          <PrintLayout
            title="Ficha do produto"
            metaLines={buildMetaLines()}
            totalCount={
              printPayload.movements.length + printPayload.history.length
            }
            generatedAt={printPayload.generatedAt}
            itemLabel="registro"
          >
            <ProductPrintView
              product={printPayload.product}
              movements={printPayload.movements}
              history={printPayload.history}
              includeLists={printPayload.includeLists}
            />
          </PrintLayout>
        </PrintPortal>
      )}
    </section>
  );
}
