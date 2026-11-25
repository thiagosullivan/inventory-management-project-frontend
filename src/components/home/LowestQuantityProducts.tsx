import { Link } from "react-router-dom";

import type { ProductQuantityItem } from "@/types/dashboard.types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ImageOff } from "lucide-react";

interface LowestQuantityProductsProps {
  data: ProductQuantityItem[];
}

export default function LowestQuantityProducts({
  data,
}: LowestQuantityProductsProps) {
  // const totalQuantities = data.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section className="w-full min-w-0 border rounded-lg shadow-lg p-4 md:p-5 mb-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="font-medium text-base md:text-lg truncate">
          Produtos com Menores Quantidades
        </h3>
        <Link
          to="/produtos"
          className="text-sm text-primary shrink-0 hover:underline"
        >
          Ver todos
        </Link>
      </div>
      <Table className="w-full">
        <TableCaption>
          Uma lista dos produtos com menores quantidades no estoque
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">Imagem</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead className="w-24">SKU</TableHead>
            <TableHead className="w-20 text-right">Qtd.</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="w-14">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    className="w-11 h-11 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-11 h-11 flex items-center justify-center border border-gray-300 rounded-md">
                    <ImageOff className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium max-w-0 w-full truncate">
                {product.name}
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {product.sku}
              </TableCell>
              <TableCell className="text-right font-medium">
                {product.quantity}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
