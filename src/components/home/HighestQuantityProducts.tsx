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

interface HighestQuantityProductsProps {
  data: ProductQuantityItem[];
}

export const HighestQuantityProducts = ({
  data,
}: HighestQuantityProductsProps) => {
  // const totalQuantities = data.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section className="w-full border rounded-lg shadow-lg p-5 mb-5">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg">Highest Quantity Products</h3>
        <Link to="/products" className="text-primary">
          See All Products
        </Link>
      </div>
      <Table>
        <TableCaption>
          A list of the products with the highest quantity on stock.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="w-20 h-20 block">
                {product.imageUrl ? (
                  <img src={product.imageUrl} />
                ) : (
                  <div className="w-15 h-15 flex items-center justify-center border border-gray-300 rounded-md">
                    <ImageOff />
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium max-w-[250px] truncate">
                {product.name}
              </TableCell>
              <TableCell>{product.sku}</TableCell>
              <TableCell className="text-right">{product.quantity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
};
