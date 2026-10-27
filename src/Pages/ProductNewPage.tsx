import { useState } from "react";
import { ProductForm } from "@/components/products/ProductForm";
import { ProductCreatedDialog } from "@/components/products/ProductCreatedDialog";
import { LabelPrintDialog } from "@/components/products/LabelPrintDialog";
import { useCreateProduct } from "@/hooks/useProductMutations";
import type { CreateProductPayload, Product } from "@/types/products.types";

export default function ProductNewPage() {
  const mutation = useCreateProduct();
  const [created, setCreated] = useState<Product | null>(null);
  const [createdOpen, setCreatedOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);

  async function handleCreate(payload: CreateProductPayload) {
    try {
      const product = await mutation.mutateAsync(payload);
      setCreated(product);
      setCreatedOpen(true);
    } catch {
      // toast já no hook
    }
  }

  return (
    <section className="flex flex-col mx-auto gap-6 w-full max-w-3xl px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold">Novo produto</h1>
        <p className="text-sm text-muted-foreground mt-1">
          O SKU e o código de barras são gerados automaticamente ao salvar.
        </p>
      </div>

      <ProductForm
        mode="create"
        onSubmitCreate={handleCreate}
        isSubmitting={mutation.isPending}
      />

      {/* Modal pós-criação */}
      <ProductCreatedDialog
        open={createdOpen}
        onOpenChange={setCreatedOpen}
        product={created}
        onPrintLabel={() => {
          setCreatedOpen(false);
          setPrintOpen(true);
        }}
      />

      {/* Dialog de impressão (só abre com produto real já criado) */}
      <LabelPrintDialog
        open={printOpen}
        onOpenChange={setPrintOpen}
        product={created}
      />
    </section>
  );
}
