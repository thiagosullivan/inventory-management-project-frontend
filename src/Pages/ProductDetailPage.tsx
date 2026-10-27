import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

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

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProduct(id);
  const { user } = useAuth(); // ajuste pro seu hook real

  const [movementOpen, setMovementOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);

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
  const isCreator = user?.id === product.createdById;
  const canEdit = isManager || isCreator;

  return (
    <section className="flex flex-col mx-auto gap-6 w-full max-w-5xl px-4 py-8">
      <ProductDetailHeader
        product={product}
        canEdit={canEdit}
        onMovement={() => setMovementOpen(true)}
        onPrint={() => setPrintOpen(true)}
        onEdit={() => setEditOpen(true)}
        onDelete={() => setDeleteOpen(true)}
      />

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="movements">Movimentações</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
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

      <CreateMovementDialog
        open={movementOpen}
        onOpenChange={setMovementOpen}
        productId={product.id}
        productName={product.name}
        currentQuantity={product.quantity}
      />

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
        open={printOpen}
        onOpenChange={setPrintOpen}
        product={product}
      />
    </section>
  );
}
