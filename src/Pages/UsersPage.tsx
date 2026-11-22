import { Button } from "@/components/ui/button";
import { DeleteUserDialog } from "@/components/users/DeleteUserDialog";
import { UserFilters } from "@/components/users/UserFilters";
import { UserFormDialog } from "@/components/users/UserFormDialog";
import { UsersTable } from "@/components/users/UsersTable";
import { useAuth } from "@/contexts/AuthContext";
import { useUsersList } from "@/hooks/useUsers";
import { getApiErrorMessage } from "@/lib/api-error";
import type { User, UserFilters as UserFiltersType } from "@/types/users.types";
import { useMemo, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 10;

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [filters, setFilters] = useState<UserFiltersType>({
    page: 1,
    limit: PAGE_SIZE,
  });
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);

  const { data, isLoading, isError, error, refetch } = useUsersList(filters);

  const navigate = useNavigate();

  // MANAGER não aparece na lista (regra de produto)
  const visibleUsers = useMemo(
    () => (data?.users ?? []).filter((u) => u.role !== "MANAGER"),
    [data],
  );

  const total = data?.total ?? 0;
  const page = filters.page ?? 1;
  const limit = filters.limit ?? PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (!currentUser) return null;

  function openCreate() {
    setFormMode("create");
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(user: User) {
    setFormMode("edit");
    setEditing(user);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <Button
        variant="outline"
        onClick={() => navigate(-1)}
        className="cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Voltar
      </Button>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Usuários</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os usuários do sistema. Gerentes não aparecem nesta lista.
          </p>
        </div>
        <Button onClick={openCreate} className="cursor-pointer min-h-9 p-2">
          <Plus className="h-4 w-4 mr-2" />
          Novo usuário
        </Button>
      </div>

      {/* Filtros */}
      <UserFilters value={filters} onChange={setFilters} />

      {/* Estados */}
      {isLoading && (
        <p className="text-sm text-muted-foreground">Carregando usuários...</p>
      )}

      {isError && (
        <div className="rounded border border-destructive/40 bg-destructive/5 p-3 text-sm">
          <p className="text-destructive">
            {getApiErrorMessage(error, "Erro ao carregar usuários.")}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 cursor-pointer"
            onClick={() => refetch()}
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {visibleUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum usuário encontrado com os filtros atuais.
            </p>
          ) : (
            <UsersTable
              users={visibleUsers}
              currentUserId={currentUser.id}
              onEdit={openEdit}
              onDelete={setDeleting}
            />
          )}

          {/* Paginação */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              {total} usuário(s) • página {page} de {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() =>
                  setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))
                }
                className="cursor-pointer"
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() =>
                  setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))
                }
                className="cursor-pointer"
              >
                Próxima
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Dialogs */}
      <UserFormDialog
        key={`${formMode}-${editing?.id ?? "new"}-${formOpen ? "open" : "closed"}`}
        mode={formMode}
        user={editing}
        open={formOpen}
        onOpenChange={setFormOpen}
        currentUserId={currentUser.id}
      />

      <DeleteUserDialog
        user={deleting}
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      />
    </div>
  );
}
