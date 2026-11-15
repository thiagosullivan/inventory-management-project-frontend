import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { toast } from "sonner";

import { ProductFilters } from "@/components/ProductFilters";
import { LimitSelect } from "@/components/products/LimitSelect";
import { ProductPagination } from "@/components/products/ProductPagination";
import { RangeDisplay } from "@/components/products/RangeDisplay";
import { TableProducts } from "@/components/products/TableProducts";
import { Button } from "@/components/ui/button";
import { useProductQueryParams } from "@/hooks/useProductQueryParams";
import { fetchProducts } from "@/services/products";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

// 🔹 Importações de Impressão
import { PrintDialog } from "@/components/print/PrintDialog";
import { PrintLayout } from "@/components/print/PrintLayout";
import { PrintPortal } from "@/components/print/PrintPortal";
import { ProductListPrintView } from "@/components/products/ProductListPrintView";
import { enterPrintMode, exitPrintMode } from "@/lib/print/print-mode";
import { PRINT_MAX_EVENTS } from "@/lib/print/print-utils";
import type { Product } from "@/types/products.types";

interface PrintPayload {
  products: Product[];
  includeDetails: boolean;
  generatedAt: Date;
}

export default function ProductsPage() {
  const { filters, setPage, setLimit, clearFilters, hasActiveFilters } =
    useProductQueryParams();

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => fetchProducts(filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
  });

  // 🔹 Estados de Impressão
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [printPayload, setPrintPayload] = useState<PrintPayload | null>(null);

  // 🔹 Efeito para disparar o window.print() após montar o payload
  useEffect(() => {
    if (!printPayload) return;
    enterPrintMode("list");
    const raf = requestAnimationFrame(() => {
      toast.dismiss();
      window.print();
    });
    return () => cancelAnimationFrame(raf);
  }, [printPayload]);

  // 🔹 Limpa o modo de impressão após fechar
  useEffect(() => {
    function onAfterPrint() {
      exitPrintMode();
      setPrintPayload(null);
    }
    window.addEventListener("afterprint", onAfterPrint);
    return () => window.removeEventListener("afterprint", onAfterPrint);
  }, []);

  useEffect(() => {
    if (!data) return;
    if (data.page > data.totalPages && data.totalPages > 0) {
      setPage(data.totalPages);
    }
  }, [data, setPage]);

  if (isLoading) {
    return (
      <div className="text-center text-muted-foreground py-12">
        Carregando produtos...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center text-destructive py-12">
        Erro ao carregar produtos.
      </div>
    );
  }

  const needsRedirect = data.page > data.totalPages && data.totalPages > 0;
  const isEmpty = data.products.length === 0;

  // =============================
  // Handlers de Impressão
  // =============================

  async function startPrintAll() {
    const toastId = toast.loading(
      "Carregando lista completa para impressão...",
    );
    try {
      const collected: Product[] = [];
      let p = 1;
      const fetchLimit = 100; // usa o max do backend

      while (true) {
        const res = await fetchProducts({
          ...filters,
          page: p,
          limit: fetchLimit,
        });
        collected.push(...res.products);
        if (p >= res.totalPages) break;
        if (collected.length >= PRINT_MAX_EVENTS) break;
        p++;
      }

      const capped = collected.slice(0, PRINT_MAX_EVENTS);
      toast.dismiss(toastId);
      setPrintPayload({
        products: capped,
        includeDetails,
        generatedAt: new Date(),
      });
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar produtos para impressão.", { id: toastId });
    }
  }

  function startPrintCurrent() {
    setPrintPayload({
      products: data?.products ?? [],
      includeDetails,
      generatedAt: new Date(),
    });
  }

  function handlePrintConfirm(scope: "current" | "all") {
    setPrintDialogOpen(false);
    setTimeout(() => {
      if (scope === "current") startPrintCurrent();
      else void startPrintAll();
    }, 150);
  }

  function buildMetaLines(): string[] {
    const parts: string[] = [];
    if (filters.search) parts.push(`Busca="${filters.search}"`);
    if (filters.isLowStock) parts.push(`Estoque baixo`);
    if (filters.isExpired) parts.push(`Vencidos`);
    if (filters.isExpiring) parts.push(`Vencendo`);
    return parts.length > 0 ? [`Filtros: ${parts.join(" · ")}`] : [];
  }

  return (
    <section className="flex flex-col items-center justify-center mx-auto gap-6 w-full max-w-6xl px-4 py-8">
      <div className="w-full flex items-start justify-between">
        <ProductFilters isLoading={isFetching} />

        {/* 🔹 Botão de Imprimir */}
        <Button
          variant="outline"
          onClick={() => setPrintDialogOpen(true)}
          disabled={isEmpty}
          className="cursor-pointer ml-auto ml-4 min-h-9 p-2"
        >
          <Printer size={16} className="mr-2" />
          Imprimir
        </Button>
      </div>

      {needsRedirect ? (
        <div className="text-center text-muted-foreground py-12">
          Carregando produtos...
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center gap-4 text-center text-muted-foreground py-12">
          {hasActiveFilters ? (
            <>
              <p>Nenhum produto encontrado com esses filtros.</p>
              <Button variant="destructive" onClick={clearFilters}>
                Limpar filtros
              </Button>
            </>
          ) : (
            <p>Nenhum produto cadastrado.</p>
          )}
        </div>
      ) : (
        <>
          <TableProducts products={data.products} />

          <LimitSelect value={filters.limit} onChange={setLimit} />

          <ProductPagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={setPage}
            isFetching={isFetching}
          />
          <RangeDisplay
            page={data.page}
            limit={data.limit}
            total={data.total}
          />
        </>
      )}

      {/* 🔹 Dialog de impressão */}
      <PrintDialog
        key={printDialogOpen ? "open" : "closed"}
        open={printDialogOpen}
        onOpenChange={setPrintDialogOpen}
        title="Imprimir lista de produtos"
        totalCount={data?.total ?? 0}
        currentLabel={`${Math.min(filters.limit, data?.total ?? 0)} produtos desta página`}
        allLabel={`${data?.total ?? 0} produtos (todos os filtros)`}
        pageSize={filters.limit}
        extraCheckbox={{
          label: "Incluir detalhes completos (categoria, média, local)",
          checked: includeDetails,
          onCheckedChange: setIncludeDetails,
        }}
        onConfirm={handlePrintConfirm}
      />

      {/* 🔹 Payload de impressão */}
      {printPayload && (
        <PrintPortal>
          <PrintLayout
            title="Lista de Produtos"
            metaLines={buildMetaLines()}
            totalCount={printPayload.products.length}
            generatedAt={printPayload.generatedAt}
            itemLabel="produto"
          >
            <ProductListPrintView
              products={printPayload.products}
              includeDetails={printPayload.includeDetails}
            />
          </PrintLayout>
        </PrintPortal>
      )}
    </section>
  );
}
