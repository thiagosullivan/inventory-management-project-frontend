import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateMovement } from "@/hooks/useProductMutations";
import type {
  CreateMovementPayload,
  MovementType,
} from "@/types/products.types";
import { parseBRLToCents } from "@/utils/currency";

const schema = z.object({
  type: z.enum(["ENTRADA", "SAIDA", "AJUSTE"]),
  quantity: z
    .string()
    .min(1, "Quantidade é obrigatória")
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, {
      message: "Quantidade inválida",
    }),
  reason: z.string().max(300),
  unitPriceInCents: z.string(),
  supplier: z.string().max(200),
});

type FormValues = z.infer<typeof schema>;

interface CreateMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  currentQuantity: number;
}

/**
 * Dialog básico de movimentação.
 * - ENTRADA: mostra preço unitário + fornecedor (opcionais)
 * - SAIDA/AJUSTE: esconde preço/fornecedor
 * A bipagem por código de barras fica pra Fase 4.7.
 */
export function CreateMovementDialog({
  open,
  onOpenChange,
  productId,
  productName,
  currentQuantity,
}: CreateMovementDialogProps) {
  const mutation = useCreateMovement(productId);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "ENTRADA",
      quantity: "",
      reason: "",
      unitPriceInCents: "",
      supplier: "",
    },
  });

  const watchedType = form.watch("type");
  const isEntrada = watchedType === "ENTRADA";

  async function handleSubmit(values: FormValues) {
    const payload: CreateMovementPayload = {
      type: values.type as MovementType,
      quantity: Number(values.quantity),
      reason: values.reason.trim() || null,
    };

    if (values.type === "ENTRADA") {
      const price = values.unitPriceInCents
        ? parseBRLToCents(values.unitPriceInCents)
        : null;
      payload.unitPriceInCents = price;
      payload.supplier = values.supplier.trim() || null;
    }

    try {
      await mutation.mutateAsync(payload);
      form.reset();
      onOpenChange(false);
    } catch {
      // toast já foi disparado no hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-primary">
            Nova movimentação
          </DialogTitle>
          <DialogDescription>
            <strong className="text-base font-bold text-black mb-2">
              {productName}
            </strong>{" "}
            · estoque atual:{" "}
            <span className="font-mono">{currentQuantity}</span>
          </DialogDescription>
        </DialogHeader>

        <form
          id="movement-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
          noValidate
        >
          <FieldGroup>
            <div className="flex gap-x-4">
              <Controller
                name="type"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="movement-type">Tipo *</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="movement-type" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ENTRADA">Entrada</SelectItem>
                        <SelectItem value="SAIDA">Saída</SelectItem>
                        <SelectItem value="AJUSTE">Ajuste</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="quantity"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="movement-quantity">
                      {watchedType === "AJUSTE"
                        ? "Nova quantidade total *"
                        : "Quantidade *"}
                    </FieldLabel>
                    <Input
                      {...field}
                      id="movement-quantity"
                      type="number"
                      min={0}
                      inputMode="numeric"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    <FieldDescription>
                      {watchedType === "AJUSTE"
                        ? "O estoque será redefinido para este valor."
                        : watchedType === "SAIDA"
                          ? "Será subtraído do estoque atual."
                          : "Será somado ao estoque atual."}
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="reason"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="movement-reason">Motivo</FieldLabel>
                  <Input
                    {...field}
                    id="movement-reason"
                    placeholder="Ex.: Compra, uso interno, inventário"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {isEntrada && (
              <>
                <Controller
                  name="unitPriceInCents"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="movement-price">
                        Preço unitário (R$)
                      </FieldLabel>
                      <Input
                        {...field}
                        id="movement-price"
                        inputMode="decimal"
                        placeholder="0,00"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                      />
                      <FieldDescription>
                        Preço pago nesta entrada. Recalcula a média ponderada se
                        &gt; 0. Deixe vazio ou 0 para doações/brindes.
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="supplier"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="movement-supplier">
                        Fornecedor
                      </FieldLabel>
                      <Input
                        {...field}
                        id="movement-supplier"
                        placeholder="Ex.: Distribuidora XYZ"
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </>
            )}
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="movement-form"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Salvando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
