import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateCategory,
  useUpdateCategory,
} from "@/hooks/useCategoriesList";
import { getApiErrorCode, getApiErrorMessage } from "@/lib/api-error";
import type { Category } from "@/types/categories.types";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
}: CategoryFormDialogProps) {
  const formKey = category?.id ?? "new";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent key={formKey} className="sm:max-w-[480px]">
        <CategoryFormContent
          category={category ?? null}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}

// =============================
// Conteúdo (state inicializado direto das props)
// =============================

interface CategoryFormContentProps {
  category: Category | null;
  onOpenChange: (open: boolean) => void;
}

function CategoryFormContent({
  category,
  onOpenChange,
}: CategoryFormContentProps) {
  const isEditing = Boolean(category);

  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const isPending = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("O nome é obrigatório.");
      return;
    }

    const payload = {
      name: trimmedName,
      description: description.trim() || null,
    };

    try {
      if (isEditing && category) {
        await updateMutation.mutateAsync({ id: category.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch (err: unknown) {
      const code = getApiErrorCode(err);

      if (code === "CATEGORY_ALREADY_EXISTS") {
        setError("Já existe uma categoria com esse nome.");
      } else if (code === "FORBIDDEN") {
        setError("Você não tem permissão para modificar esta categoria.");
      } else {
        setError(getApiErrorMessage(err, "Não foi possível salvar."));
      }
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar categoria" : "Nova categoria"}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Atualize as informações da categoria."
            : "Preencha os dados para criar uma nova categoria."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category-name">Nome</Label>
          <Input
            id="category-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Alimentos"
            autoFocus
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-description">
            Descrição <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Textarea
            id="category-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Uma breve descrição da categoria"
            rows={3}
            disabled={isPending}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Salvando..."
              : isEditing
                ? "Salvar alterações"
                : "Criar categoria"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
