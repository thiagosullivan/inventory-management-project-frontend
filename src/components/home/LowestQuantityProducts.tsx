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

interface LowestQuantityProductsProps {
  data: ProductQuantityItem[];
}

export default function LowestQuantityProducts({
  data,
}: LowestQuantityProductsProps) {
  // const totalQuantities = data.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section className="w-full border rounded-lg shadow-lg p-5 mb-5">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg">Lowest Quantity Products</h3>
        <Link to="/products" className="text-primary">
          See All Products
        </Link>
      </div>
      <Table>
        <TableCaption>
          A list of the products with the lowest quantity on stock
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="w-20 h-20 block">
                <img
                  src={
                    product.imageUrl === null
                      ? "https://img.icons8.com/color/1200/no-image.jpg"
                      : product.imageUrl
                  }
                />
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
}
