import { ProductPagination } from "@/components/products/ProductPagination";
import { TableProducts } from "@/components/products/TableProducts";
import { useProductQueryParams } from "@/hooks/useProductQueryParams";
import { fetchProducts } from "@/services/products";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function ProductsPage() {
  const { filters, setPage } = useProductQueryParams();

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

  if (data.products.length === 0) {
    const needsRedirect = data.page > data.totalPages && data.totalPages > 0;

    if (needsRedirect) {
      return (
        <div className="text-center text-muted-foreground py-12">
          Carregando produtos...
        </div>
      );
    }

    return (
      <div className="text-center text-muted-foreground py-12">
        Nenhum produto encontrado.
      </div>
    );
  }

  return (
    <section className="flex flex-col items-center justify-center mx-auto gap-6 w-full max-w-5xl px-4 py-8">
      <TableProducts products={data.products} />
      <ProductPagination
        page={data.page}
        totalPages={data.totalPages}
        onPageChange={setPage}
        isFetching={isFetching}
      />
    </section>
  );
}
