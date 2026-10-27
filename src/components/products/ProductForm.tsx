import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle } from "lucide-react";

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
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { BarcodeField } from "./BarcodeField";
import { ProductCategorySelect } from "./ProductCategorySelect";

import type {
  CreateProductPayload,
  Product,
  UpdateProductPayload,
} from "@/types/products.types";
import { centsToInputValue, parseBRLToCents } from "@/utils/currency";

// =============================
// Schema
// =============================

const baseSchema = {
  name: z.string().trim().min(1, "Nome é obrigatório").max(200),
  description: z.string().max(1000),
  categoryId: z.string().min(1, "Selecione uma categoria"),
  imageUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  priceInCents: z
    .string()
    .min(1, "Preço é obrigatório")
    .refine((v) => parseBRLToCents(v) !== null, "Preço inválido"),
  minStock: z.string().optional().or(z.literal("")),
  maxStock: z.string().optional().or(z.literal("")),
  expiryDate: z.string().optional().or(z.literal("")),
  batchNumber: z.string().max(100).optional().or(z.literal("")),
  location: z.string().max(100).optional().or(z.literal("")),
  supplier: z.string().max(200).optional().or(z.literal("")),
};

const createSchema = z.object({
  ...baseSchema,
  quantity: z
    .string()
    .min(1, "Quantidade é obrigatória")
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, {
      message: "Quantidade inválida",
    }),
});

const editSchema = z.object({
  ...baseSchema,
  quantity: z
    .string()
    .min(1, "Quantidade é obrigatória")
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, {
      message: "Quantidade inválida",
    }),
  reason: z.string().max(300),
});

type CreateFormValues = z.infer<typeof createSchema>;
type EditFormValues = z.infer<typeof editSchema>;
type FormValues = CreateFormValues | EditFormValues;

// =============================
// Helpers
// =============================

function toNumberOrNull(s: string | undefined): number | null {
  if (!s || s.trim() === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function buildCreatePayload(v: CreateFormValues): CreateProductPayload {
  return {
    name: v.name.trim(),
    description: v.description?.trim() || null,
    categoryId: v.categoryId,
    imageUrl: v.imageUrl?.trim() || null,
    priceInCents: parseBRLToCents(v.priceInCents),
    quantity: Number(v.quantity),
    minStock: toNumberOrNull(v.minStock),
    maxStock: toNumberOrNull(v.maxStock),
    expiryDate: v.expiryDate || null,
    batchNumber: v.batchNumber?.trim() || null,
    location: v.location?.trim() || null,
    supplier: v.supplier?.trim() || null,
  };
}

function buildUpdatePayload(
  v: EditFormValues,
  originalQuantity: number,
): UpdateProductPayload {
  const payload: UpdateProductPayload = {
    name: v.name.trim(),
    description: v.description?.trim() || null,
    categoryId: v.categoryId,
    imageUrl: v.imageUrl?.trim() || null,
    priceInCents: parseBRLToCents(v.priceInCents),
    minStock: toNumberOrNull(v.minStock),
    maxStock: toNumberOrNull(v.maxStock),
    expiryDate: v.expiryDate || null,
    batchNumber: v.batchNumber?.trim() || null,
    location: v.location?.trim() || null,
    supplier: v.supplier?.trim() || null,
  };

  const newQuantity = Number(v.quantity);
  if (newQuantity !== originalQuantity) {
    payload.quantity = newQuantity;
    payload.reason = v.reason?.trim() || "Ajuste manual via edição";
  }

  return payload;
}

// =============================
// Component
// =============================

interface ProductFormProps {
  mode: "create" | "edit";
  product?: Product;
  onSubmitCreate?: (payload: CreateProductPayload) => Promise<void>;
  onSubmitEdit?: (payload: UpdateProductPayload) => Promise<void>;
  isSubmitting?: boolean;
}

/**
 * Form de produto.
 *
 * ⚠️ O state interno do RHF é inicializado direto dos props. Quando o
 * `product` mudar (editar A → editar B), o componente pai deve remontar
 * este form com `key={product.id}`. Assim não precisamos de `useEffect`
 * com `form.reset(...)` (que dispara `set-state-in-effect` no ESLint).
 */
export function ProductForm({
  mode,
  product,
  onSubmitCreate,
  onSubmitEdit,
  isSubmitting,
}: ProductFormProps) {
  const schema = mode === "create" ? createSchema : editSchema;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      categoryId: product?.categoryId ?? "",
      imageUrl: product?.imageUrl ?? "",
      priceInCents: centsToInputValue(product?.priceInCents),
      quantity: product ? String(product.quantity) : "0",
      minStock: product?.minStock != null ? String(product.minStock) : "5",
      maxStock: product?.maxStock != null ? String(product.maxStock) : "",
      expiryDate: product?.expiryDate ? product.expiryDate.slice(0, 10) : "",
      batchNumber: product?.batchNumber ?? "",
      location: product?.location ?? "",
      supplier: product?.supplier ?? "",
      ...(mode === "edit" ? { reason: "" } : {}),
    },
  });

  const watchedQuantity = Number(form.watch("quantity") ?? 0);
  const quantityChanged =
    mode === "edit" &&
    product !== undefined &&
    watchedQuantity !== product.quantity;

  async function handleSubmit(values: FormValues) {
    if (mode === "create" && onSubmitCreate) {
      await onSubmitCreate(buildCreatePayload(values as CreateFormValues));
    } else if (mode === "edit" && onSubmitEdit && product) {
      await onSubmitEdit(
        buildUpdatePayload(values as EditFormValues, product.quantity),
      );
    }
  }

  return (
    <form
      id="product-form"
      onSubmit={form.handleSubmit(handleSubmit)}
      className="space-y-6"
      noValidate
    >
      {/* Identificação */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Identificação
        </h3>

        <FieldGroup>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="md:col-span-2"
                >
                  <FieldLabel htmlFor="product-name">Nome *</FieldLabel>
                  <Input
                    {...field}
                    id="product-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="Ex.: Água mineral 500ml"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="categoryId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-category">
                    Categoria *
                  </FieldLabel>
                  <ProductCategorySelect
                    value={field.value}
                    onChange={field.onChange}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {mode === "edit" && product && (
              <Field>
                <FieldLabel htmlFor="product-sku">SKU</FieldLabel>
                <Input
                  id="product-sku"
                  value={product.sku}
                  readOnly
                  className="font-mono"
                />
                <FieldDescription>
                  SKU é imutável após a criação.
                </FieldDescription>
              </Field>
            )}

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="md:col-span-2"
                >
                  <FieldLabel htmlFor="product-description">
                    Descrição
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id="product-description"
                      placeholder="Detalhes opcionais sobre o produto"
                      rows={3}
                      className="min-h-20 resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums">
                        {field.value.length}/1000
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="imageUrl"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="md:col-span-2"
                >
                  <FieldLabel htmlFor="product-image">URL da imagem</FieldLabel>
                  <Input
                    {...field}
                    id="product-image"
                    type="url"
                    aria-invalid={fieldState.invalid}
                    placeholder="https://..."
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <BarcodeField
            mode={mode}
            value={mode === "edit" ? product?.barcode : undefined}
          />
        </FieldGroup>
      </section>

      {/* Preço */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground">Preço</h3>

        <FieldGroup>
          <Controller
            name="priceInCents"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="product-price">
                  Preço de compra (R$) *
                </FieldLabel>
                <Input
                  {...field}
                  id="product-price"
                  inputMode="decimal"
                  aria-invalid={fieldState.invalid}
                  placeholder="0,00"
                  autoComplete="off"
                />
                <FieldDescription>
                  Usado como último preço de compra. A média ponderada é
                  recalculada em cada ENTRADA com preço &gt; 0.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {mode === "edit" && product?.avgPriceInCents != null && (
            <p className="text-xs text-muted-foreground">
              Média ponderada atual:{" "}
              <span className="font-mono">
                {centsToInputValue(product.avgPriceInCents)}
              </span>{" "}
              (não é alterada por esta edição)
            </p>
          )}
        </FieldGroup>
      </section>

      {/* Estoque */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground">Estoque</h3>

        <FieldGroup>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Controller
              name="quantity"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-quantity">
                    {mode === "create"
                      ? "Quantidade inicial *"
                      : "Quantidade atual *"}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="product-quantity"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="minStock"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-min-stock">
                    Estoque mínimo
                  </FieldLabel>
                  <Input
                    {...field}
                    id="product-min-stock"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="maxStock"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-max-stock">
                    Estoque máximo
                  </FieldLabel>
                  <Input
                    {...field}
                    id="product-max-stock"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          {quantityChanged && (
            <div className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3 flex gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-700 dark:text-amber-400">
                  Alteração de quantidade
                </p>
                <p className="text-amber-700/80 dark:text-amber-400/80">
                  Alterar a quantidade aqui cria um{" "}
                  <strong>AJUSTE manual</strong> no histórico do produto. Para
                  registrar uma entrada ou saída com tipo correto, use o botão{" "}
                  <strong>Movimentar</strong> na página do produto.
                </p>
              </div>
            </div>
          )}

          {mode === "edit" && quantityChanged && (
            <Controller
              name="reason"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-reason">
                    Motivo do ajuste
                  </FieldLabel>
                  <Input
                    {...field}
                    id="product-reason"
                    placeholder="Ex.: Inventário, correção de contagem"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          )}
        </FieldGroup>
      </section>

      {/* Validade e lote */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Validade e lote
        </h3>

        <FieldGroup>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="expiryDate"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-expiry">
                    Data de validade
                  </FieldLabel>
                  <Input
                    {...field}
                    id="product-expiry"
                    type="date"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="batchNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-batch">Lote</FieldLabel>
                  <Input
                    {...field}
                    id="product-batch"
                    placeholder="Ex.: L2026-10A"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        </FieldGroup>
      </section>

      {/* Localização e fornecedor */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Localização e fornecedor
        </h3>

        <FieldGroup>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="location"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="product-location">
                    Localização
                  </FieldLabel>
                  <Input
                    {...field}
                    id="product-location"
                    placeholder="Ex.: Prateleira A3"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
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
                  <FieldLabel htmlFor="product-supplier">Fornecedor</FieldLabel>
                  <Input
                    {...field}
                    id="product-supplier"
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
          </div>
        </FieldGroup>
      </section>

      {/* Submit */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" form="product-form" disabled={isSubmitting}>
          {isSubmitting
            ? "Salvando..."
            : mode === "create"
              ? "Criar produto"
              : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}
