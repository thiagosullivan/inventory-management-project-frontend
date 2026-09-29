import { ProductFilters } from "@/components/ProductFilters";
import { ProductPagination } from "@/components/products/ProductPagination";
import { TableProducts } from "@/components/products/TableProducts";
import { Button } from "@/components/ui/button";
import { useProductQueryParams } from "@/hooks/useProductQueryParams";
import { fetchProducts } from "@/services/products";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function ProductsPage() {
  const { filters, setPage, clearFilters, hasActiveFilters } =
    useProductQueryParams();

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => fetchProducts(filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
  });

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

  return (
    <section className="flex flex-col items-center justify-center mx-auto gap-6 w-full max-w-6xl px-4 py-8">
      <ProductFilters isLoading={isFetching} />

      {needsRedirect ? (
        <div className="text-center text-muted-foreground py-12">
          Carregando produtos...
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center gap-4 text-center text-muted-foreground py-12">
          {hasActiveFilters ? (
            <>
              <p>Nenhum produto encontrado com esses filtros.</p>
              <Button variant="outline" onClick={clearFilters}>
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
          <ProductPagination
            page={data.page}
            totalPages={data.totalPages}
            onPageChange={setPage}
            isFetching={isFetching}
          />
        </>
      )}
    </section>
  );
}
