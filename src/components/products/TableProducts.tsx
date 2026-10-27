import { MoreHorizontalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Product } from "@/types/products.types";
import { Badge } from "../ui/badge";
import { getStockStatus } from "@/lib/product-status";
import { formatCentsToBRL } from "@/utils/currency";
import { Link, useNavigate } from "react-router-dom";
import { DeleteProductDialog } from "./DeleteProductDialog";
import { useState } from "react";

interface TableProductsProps {
  products: Product[];
}

export function TableProducts({ products }: TableProductsProps) {
  const navigate = useNavigate();
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  return (
    <div className="w-full rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Imagem</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Qtd.</TableHead>
            <TableHead className="text-right">Preço</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right w-16">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const status = getStockStatus(product);
            return (
              <TableRow key={product.id}>
                <TableCell>
                  {product.imageUrl ? (
                    <img
                      src={
                        product.imageUrl === null
                          ? "https://img.icons8.com/color/1200/no-image.jpg"
                          : product.imageUrl
                      }
                      alt={product.name}
                      className="h-15 w-15 rounded-md object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <img
                      src="https://img.icons8.com/color/1200/no-image.jpg"
                      alt={product.name}
                      className="h-15 w-15 rounded-md object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <Link
                      to={`/products/${product.id}`}
                      className="font-medium hover:text-primary duration-150"
                    >
                      {product.name}
                    </Link>
                    {product.sku && (
                      <span className="text-xs text-muted-foreground">
                        {product.sku}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {product.category ? (
                    <Badge variant="outline">{product.category.name}</Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {product.quantity}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatCentsToBRL(product.priceInCents)}
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontalIcon />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="cursor-pointer hover:bg-gray-200/90! duration-150"
                        render={(props) => (
                          <Link {...props} to={`/products/${product.id}`}>
                            Ver detalhes
                          </Link>
                        )}
                      />
                      <DropdownMenuItem className="cursor-pointer hover:bg-gray-200/90! duration-150">
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer duration-150"
                        variant="destructive"
                        onClick={() => setProductToDelete(product)}
                      >
                        Deletar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <DeleteProductDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
        product={productToDelete}
        onDeleted={() => navigate("/products")}
      />
      ;
    </div>
  );
}
