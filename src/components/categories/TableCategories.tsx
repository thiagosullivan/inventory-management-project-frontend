import { useAuth } from "@/contexts/AuthContext";
import type { Category } from "@/types/categories.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { formatDate } from "@/lib/format-date";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontalIcon } from "lucide-react";

interface TableCategoriesProps {
  categories: Category[];
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
}

export function TableCategories({
  categories,
  onEdit,
  onDelete,
}: TableCategoriesProps) {
  const { user } = useAuth();

  return (
    <div className="w-full rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Categoria</TableHead>
            <TableHead>Criado por</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead className="text-right">Produtos</TableHead>
            <TableHead className="text-right w-16">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => {
            const isManager = user?.role === "MANAGER";
            const isCreator = user?.id === category.createdById;
            const canModify = isManager || isCreator;

            return (
              <TableRow
                key={category.id}
                className={`${isCreator && !isManager && "bg-primary/10"}`}
              >
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{category.name}</span>
                      {/* 🔹 Badge "Criado por você" — só pro criador (não pro MANAGER
                          olhando categoria que ele mesmo criou) */}
                      {isCreator && !isManager && (
                        <Badge
                          variant="outline"
                          className="border-green-500/50 text-green-600 dark:text-green-400 text-xs"
                        >
                          Criado por você
                        </Badge>
                      )}
                    </div>
                    {category.description && (
                      <span className="text-xs text-muted-foreground">
                        {category.description}
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  {category.createdBy ? (
                    <span className="text-sm">
                      {category.createdBy.name ?? "—"}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>

                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(category.createdAt)}
                  </span>
                </TableCell>

                <TableCell className="text-right font-mono tabular-nums">
                  {category._count?.products ?? 0}
                </TableCell>

                <TableCell className="text-right">
                  {/* 🔹 Só renderiza o menu se o usuário pode modificar */}
                  {canModify ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <MoreHorizontalIcon />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit?.(category)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onDelete?.(category)}
                        >
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    // 🔹 Se não pode modificar, não mostra o menu
                    // (evita dropdown com items desabilitados)
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
