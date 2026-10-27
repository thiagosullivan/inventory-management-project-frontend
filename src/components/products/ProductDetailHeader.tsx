import { useNavigate } from "react-router-dom";
import { ArrowLeft, MoreHorizontal, Package, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductDetailResponse } from "@/types/products.types";
import { formatCentsToBRL } from "@/utils/currency";

interface ProductDetailHeaderProps {
  product: ProductDetailResponse;
  canEdit: boolean;
  onMovement: () => void;
  onPrint: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Cabeçalho de /products/:id.
 * "Voltar" usa navigate(-1) com fallback pra /products (se não há histórico).
 */
export function ProductDetailHeader({
  product,
  canEdit,
  onMovement,
  onPrint,
  onEdit,
  onDelete,
}: ProductDetailHeaderProps) {
  const navigate = useNavigate();

  function handleBack() {
    // navigate(-1) volta pro histórico. Se o usuário abriu o link direto
    // (deep link), não há histórico → /products.
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/products");
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Imagem */}
        <div className="h-20 w-20 rounded-md bg-muted flex-shrink-0 overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Nome + meta */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold truncate">{product.name}</h1>
          <div className="flex flex-wrap gap-2 items-center mt-1 text-sm text-muted-foreground">
            <span className="font-mono">{product.sku}</span>
            <span>·</span>
            <span className="font-mono">{product.barcode}</span>
            {product.category && (
              <>
                <span>·</span>
                <Badge variant="outline">{product.category.name}</Badge>
              </>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {formatCentsToBRL(product.priceInCents)} · {product.quantity}{" "}
            unidades
          </p>
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onPrint}>
            <Printer className="h-4 w-4 mr-1" />
            Etiqueta
          </Button>
          <Button onClick={onMovement}>Movimentar</Button>
          {canEdit && (
            <Select
              value=""
              onValueChange={(v) => {
                if (v === "edit") onEdit();
                if (v === "delete") onDelete();
              }}
            >
              <SelectTrigger className="w-9 h-9 p-0 justify-center">
                <SelectValue placeholder={<MoreHorizontal />} />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="edit">Editar</SelectItem>
                <SelectItem
                  value="delete"
                  className="text-destructive focus:text-destructive"
                >
                  Deletar
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
}
