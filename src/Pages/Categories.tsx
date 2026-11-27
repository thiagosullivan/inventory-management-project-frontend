import { getApiErrorMessage } from "@/lib/api-error";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCategories } from "@/components/categories/TableCategories";

import type { Category } from "@/types/categories.types";
import { useCategoriesList } from "@/hooks/useCategoriesList";
import { CategoryFormDialog } from "@/components/categories/CategoryFormDialog";
import { DeleteCategoryDialog } from "@/components/categories/DeleteCategoryDialog";

export default function CategoriesPage() {
  const { data: categories, isLoading, isError, error } = useCategoriesList();

  // 🔹 Dialog de criar/editar — `editingCategory` null = modo criação
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // 🔹 Dialog de delete
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );

  function handleOpenCreate() {
    setEditingCategory(null);
    setFormOpen(true);
  }

  function handleOpenEdit(category: Category) {
    setEditingCategory(category);
    setFormOpen(true);
  }

  function handleOpenDelete(category: Category) {
    setDeletingCategory(category);
    setDeleteOpen(true);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="mb-3 md:mb-0">
          <h1 className="text-2xl font-bold text-primary">Categorias</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie as categorias usadas nos produtos.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="cursor-pointer min-h-9 py-4 px-2 ml-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova categoria
        </Button>
      </div>

      {/* Conteúdo */}
      {isLoading && (
        <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
          Carregando categorias...
        </div>
      )}

      {isError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-8 text-center text-sm text-destructive">
          {getApiErrorMessage(
            error,
            "Não foi possível carregar as categorias.",
          )}
        </div>
      )}

      {!isLoading && !isError && categories && categories.length === 0 && (
        <div className="rounded-md border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma categoria cadastrada ainda.
          </p>
          <Button className="mt-4" onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Criar primeira categoria
          </Button>
        </div>
      )}

      {!isLoading && !isError && categories && categories.length > 0 && (
        <TableCategories
          categories={categories}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      )}

      {/* Modais */}
      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editingCategory}
      />

      <DeleteCategoryDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        category={deletingCategory}
      />
    </div>
  );
}
