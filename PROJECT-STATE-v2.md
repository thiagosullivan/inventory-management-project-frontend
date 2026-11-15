# Inventory Management

Projeto de gestão de estoque para prefeitura. Almoxarifado é ponto 0 (único com estoque). Outros setores pedem (PurchaseRequest) e recebem (Transfer). Uso futuro: mecânica (venda, Fase 8+).

Backend: `D:\Development\ats\estoque\backend` · Frontend: `D:\Development\ats\estoque\frontend`

## Stack

Backend: Node + Express + TS + Prisma v7 (output `src/generated/prisma`) + PostgreSQL (Neon) + Better Auth + tsx.

Frontend: Vite + React + TS + React Router v7 + TanStack Query v5 (`keepPreviousData`) + shadcn/ui + Tailwind + Base UI (sem `asChild`) + Axios + Recharts + jsbarcode + sonner + react-hook-form + zod + browser-image-compression + uploadthing + `react-number-format` + `socket.io-client` (Fase 8).

## Convenções

- `lib/`/`utils/`: kebab-case. Hooks: camelCase. Componentes: PascalCase. shadcn: kebab-case (não alterar).
- Comentários: `// 🔹 novo`, `// 🔴 legado`.
- Imports: `@/` (front); relativos com `.js` (back ESM).
- Backend envelope: `{ success, data }` — service front desembrulha.
- Erros: `getApiErrorMessage(err)` / `getApiErrorCode(err)` (nunca `err: any`).
- UI ↔ schema: Transfer=Remessa, TransferItem=Item da remessa, PurchaseRequest=Pedido, Movement=Movimentação, Sector=Setor.
- shadcn: sem `form.tsx` antigo — RHF Controller + `Field`/`FieldLabel`/`FieldError`/`FieldDescription` de `@/components/ui/field`; textareas via `InputGroupTextarea`.
- Componente com state inicializado de prop → `key={...}` no pai.
- Zod: `z.string()` (nunca `.optional().or(z.literal(""))` — só quando for opcional de verdade).
- Rotas específicas antes de param genérico.
- Busca: unaccent no backend (ILIKE), `normalize-text.ts` no front.

## Decisões travadas

**Modelo:** `Product.quantity` = estoque do Almox. `StockBySector` NÃO existe. `Sector.isWarehouse` bool, exatamente 1 true, imutável, não deletável. `User.sectorId` obrigatório. `StockAlert` global (sem sectorId).

**SKU/Barcode/Preço:**

- SKU: `PREFIX-NNN` (ex.: `BEB-001`), gerado no backend, imutável.
- Prefix: 3-4 letras maiúsculas, `@unique`. Regra: 1 palavra → 3 primeiras; 2+ → 3 da 1ª + 1ª da 2ª; colisão → 4ª letra da 1ª, depois sufixo numérico.
- Barcode: numérico sequencial global (`1000001...`), Code 128, lazy (`GET .../next` preview, real no POST). EAN-13/GTIN proibido.
- `Product.priceInCents` (Int?), `Product.avgPriceInCents` = média ponderada móvel (só ENTRADA com preço > 0, regra MYOB). `Movement.unitPriceInCents` = histórico.
- `minStock Int? @default(0)` (era 5, mudou na Fase 6.6).
- No form: `priceInCents` é `number` (reais, float) no RHF; `reaisToCents` converte pra centavos no payload. Máscara com `react-number-format`.
- Datas: `formatDate` em **UTC** (datas puras — `expiryDate`), `formatDateTime` em **BRT** (com hora — `createdAt`). `getExpiryBadge` calcula em UTC.

**Fase 6 (Setores/Pedidos/Remessas):**

- `TransferStatus`: PENDENTE | CONCLUIDO | CANCELADO | RECUSADO.
- `PurchaseRequestStatus`: PENDENTE | EM_ATENDIMENTO | ATENDIDO | RECUSADO | CANCELADO.
- Criar Transfer (Almox/MANAGER): debita `Product.quantity`, cria N `Movement TRANSFERENCIA` (qty negativo) + `StockHistory`, transação atômica. `fromSectorId` forçado.
- Confirmar (destino): `Transfer` → CONCLUIDO; cria 1 `Movement SAIDA` por item (qty negativo, CONCLUIDO, `transferId`, setores, `unitPriceInCents = avgPriceInCents`, reason "Remessa <id> confirmada — <sector>"). NÃO cria `StockHistory` nem debita de novo. Objetivo: métricas do dashboard.
- Recusar (destino) / Cancelar (Almox/MANAGER): `refusalReason` / `cancelReason` **obrigatórios**, devolvem estoque, criam `StockHistory` de devolução. `Movement TRANSFERENCIA` vira RECUSADO (recusa) ou CANCELADO (cancel).
- **Duplicação visual no `/history`:** TRANSFERENCIA + SAIDA do mesmo produto na mesma Transfer. Filtrar TRANSFERENCIA quando existe SAIDA correspondente (tela e papel).
- `PurchaseRequest`: N Transfers por pedido. Item não cadastrado → `notes` (textarea), NÃO `PurchaseRequestItem` com productId null.
- Finalizar pedido: manual, trava = nenhuma Transfer PENDENTE. `finalizeNote` obrigatório se houver Transfer RECUSADO/CANCELADO ou soma enviada < pedida.
- Recusar pedido: Almox/MANAGER, `refusalReason` obrigatório, final. Cancelar: setor criador/MANAGER.
- Visibilidade: setor comum vê só o próprio; Almox/MANAGER veem tudo.
- ENTRADA de produto: só STAFF Almox/MANAGER. SAIDA/AJUSTE: qualquer setor.
- Bipagem: só em `/movements` via `CreateTransferDialog` (Enter, sem debounce). NÃO em `/products/:id`.
- `/movements` = ação; `/requests` = pedidos; `/history` = consulta (Fase 6.5). Filtros na URL.
- `MovementStatus`: PENDENTE | CONCLUIDO | CANCELADO | RECUSADO (ganhou RECUSADO na 6.5).

**Auth/perfil (Fase 6.1):**

- Backend fonte da verdade: `GET /me` (fora do `/admin`, só `authenticate`) retorna `user` com `sector: { id, name, isWarehouse }`.
- Front hidrata via `getMe()`. `MeResult` discriminado: `{ status: "ok", user } | { status: "unauthenticated" } | { status: "inactive" }`.
- `authenticate` retorna 401 se `!fullUser`, 403 `{ code: "USER_INACTIVE" }` se `!isActive`.
- `AuthContext` trata inactive → stub `{ isActive: false }` → `ProtectedRoute` manda pra `/account-suspended` (standalone).
- Pós-login: MANAGER ou STAFF Almox → `/dashboard`; demais STAFF → `/requests`.

**Permissões de Produto:**

- `/products` e `/products/:id` em `WarehouseOnlyRoute` + guard defensivo no componente.
- Editar: criador OU MANAGER OU STAFF Almox (backend expandido na 6.6 — antes era só criador/MANAGER).
- Botão "Movimentar" dentro de `canEdit`.

**Outros:**

- Imagem: UploadThing (free 2GB) + browser-image-compression. `Product.imageUrl String?`.
- `/history` só Almox/MANAGER (front `WarehouseOnlyRoute` + back 403).
- Usuários: só inativados (nunca deletados). MANAGER não se auto-rebaixa.
- `Notification` + Socket.io entram na Fase 8.

## Modelos Prisma (principais)

- `Sector`: id, name(unique), description?, isWarehouse(bool), isActive, timestamps. Relações: users, movementsFrom/To, transfersFrom/To, purchaseRequests.
- `Transfer`: fromSectorId, toSectorId, purchaseRequestId?, status, reason?, refusalReason?, cancelReason?, createdById, confirmedById?, refusedById?, cancelledById?, timestamps. + items, movements.
- `TransferItem`: transferId(Cascade), productId(Restrict), quantity.
- `PurchaseRequest`: sectorId, status, notes?, refusalReason?, finalizeNote?, createdById, finalizedById?, refusedById?, timestamps. + items, transfers.
- `PurchaseRequestItem`: requestId(Cascade), productId(Restrict), quantity.
- `User`: + sectorId (obrigatório) + sector.
- `Movement`: + fromSectorId?, toSectorId?, transferId?. quantity negativo em TRANSFERENCIA e SAIDA. Sem `purchaseRequestId` no schema.
- `Product`: + requestItems, transferItems. quantity coluna. minStock `@default(0)`.
- `StockHistory`: id, productId, oldQuantity, newQuantity, movementId?, changedById, changedAt, reason.
- Enums: `MovementType` ENTRADA|SAIDA|AJUSTE|TRANSFERENCIA; `MovementStatus` PENDENTE|CONCLUIDO|CANCELADO|RECUSADO; `TransferStatus` PENDENTE|CONCLUIDO|CANCELADO|RECUSADO; `PurchaseRequestStatus` PENDENTE|EM_ATENDIMENTO|ATENDIDO|RECUSADO|CANCELADO.

## Endpoints

**Produtos:**

- `POST /admin/products` (Almox/MANAGER) — gera SKU + barcode + Movement ENTRADA inicial. minStock default 0. expiryDate salvo UTC meia-noite.
- `GET /admin/products` (filtros + paginação) / `/:id` / `/sku/:sku` / `/barcode/:barcode` / `/barcode/next`.
- `PATCH /admin/products/:id` / `DELETE /admin/products/:id`.
- `POST /admin/products/:id/movements` (ENTRADA só Almox/MANAGER; SAIDA/AJUSTE qualquer).
- `GET /admin/products/:id/movements` / `/history` — history inclui `movement` com status/reason/transferId/createdAt/fromSector/toSector (Fase 6.6).

**Setores:** GET/POST/PATCH/DELETE `/admin/sectors` + `/options` → `{ label, value, isWarehouse }[]`.

**Transfers:** POST/GET `/admin/transfers` (+`/:id`) / PATCH `/:id/confirm` / `/:id/refuse` / `/:id/cancel`.

**Purchase Requests:** POST/GET `/admin/purchase-requests` (+`/:id`, `/catalog`) / PATCH `/:id/refuse` / `/:id/finalize` / `/:id/cancel`.

**Outros:** GET `/admin/movements`, GET `/admin/history`, CRUD `/admin/categories` + `/options`, CRUD `/admin/users` + `/options`, `/admin/dashboard/overview|stock|activity|alerts`, `/admin/stock/summary`, PATCH `/admin/alerts/:id/resolve`, GET `/me`.

## Fase 6.5 — Relatórios (contratos fechados)

- `/admin/history`: Movement + Transfer agrupado por transferId. Query: type/status/createdById/productId/dateFrom/dateTo/search/page/limit/sortOrder/includeTransfers/hasTransfer. Shape `HistoryEvent` discriminado (MOVEMENT / TRANSFER com movements[]). `/history` front pronto.
- **R1** `GET /admin/reports/requests`: auditoria pedidos. `RequestReportRow` com `totals { requestedQty, sentQty, fulfillmentPct }`. Enviado = TransferItem.quantity de Transfers CONCLUIDO.
- **R2** `GET /admin/reports/consumption`: só Transfer CONCLUIDO. `consumedValueInCents = Σ TransferItem.quantity × Movement.unitPriceInCents` (SAIDA histórica). Prioridade: `monthsWithConsumption / monthsInRange ≥ 0.8` OU `consumedQty >= priorityThreshold`. Mês = `Transfer.confirmedAt` (UTC).
- **R2 setor** `GET /admin/reports/consumption/:sectorId`: `monthlyBreakdown[]` (YYYY-MM), `priority`. Summary soma sobre productMap inteiro (não top N).
- **R2b** `GET /admin/reports/manual-output`: Movement SAIDA com `transferId IS NULL`. `fromSectorId` null → exibe "—" e não entra em bySector.
- Backend R1/R2/R2b 100% validado no Insomnia. **Telas no front ainda não implementadas** (próximas, início da Fase 7).

## Filtros

**`/admin/products`:** search (unaccent), categoryId, minQuantity, maxQuantity, hasExpiryDate (tri-state), isExpiring/isLowStock/isExpired (só "true"), createdById, page, limit (max 100), sortBy (createdAt/updatedAt/name/quantity/expiryDate), sortOrder.

**`/admin/dashboard/stock`:** categoryId, location+locationExact, supplier+supplierExact, limit (por seção), sectorId (Fase 7).

**`/stock`:** `categoryId`, `location`/`locationExact`, `supplier`/`supplierExact`.

## FASES — STATUS

- Fase 1–5, 4.5/4.5.1/4.6 ✅
- Fase 6 (setores/pedidos/remessas + upload) ✅
- Fase 6.1 (auth/sector + Movement SAIDA + motivos) ✅
- Fase 6.5 (backend R1/R2/R2b + /history backend + /history frontend) ✅
- **Fase 6.6 — Impressão + cadastro/edição + badges** ✅ (ver seção abaixo)
- **Fase 7 — Dashboard (filtros setor + KPIs) + 3 telas de relatório (R1/R2/R2b) no front** ⬜ ← próximo
- Fase 7.5 — `/users` (MANAGER) ⬜
- Fase 8 — `/alerts` + Socket.io + badge ⬜
- Fase 9 — polish ⬜

## Fase 6.6 — Impressão (concluída)

**Infra (reusável em qualquer página):**

- `src/styles/print-base.css`: `@page` A4 retrato, margem 15×12mm. Esconde `#root` em `printing-label` e `printing-list`; mostra `#print-portal-root`. `.print-only` escondido na tela. **Importado no `App.tsx`** (se não importar, bordas/espaçamentos somem).
- `src/styles/label-print.css`: escopo `body.printing-label`. Esconde tudo (`> * { display: none }`) exceto `#print-portal-root`. `.print-label` 60×40mm, topo-esquerdo. `page-break-inside: avoid`.
- `src/styles/list-print.css`: escopo `body.printing-list`. Layout B (tabela 4 colunas) + ficha do produto + resumo de stock + detalhamento de pedidos. `thead` repetido, `break-inside: avoid` por `<tr>`, `box-sizing: border-box`, `print-spacer` (4mm) entre grupos (spacer via `<td>` com `height`, não `<tr>`).
- `src/lib/print/print-mode.ts`: `enterPrintMode("label"|"list")` / `exitPrintMode()`.
- `src/lib/print/print-utils.ts`: `formatPrintDateTime(value: string|Date|null|undefined)` (aceita null), `formatPrintCents`, `PRINT_MAX_EVENTS = 500`.
- `src/lib/shorten-id.ts`: `shortenId(id)` → `8 chars…`.
- `src/lib/stock-history-badge.ts`: `getHistoryEventKind(entry)` (deriva `DEVOLUCAO` do `reason`), `HISTORY_EVENT_LABEL`, `HISTORY_EVENT_BADGE`.
- `src/lib/product-badges.tsx`: `getStockBadge(quantity, minStock)` (OK/Baixo/Esgotado), `getExpiryBadge(expiryDate)` (OK/Vence em Xd/Vencido, em UTC).
- `src/components/print/`: `PrintDialog` (radio "página atual" vs "todos" + 1 `extraCheckbox`; reset via `key` no pai), `PrintHeader`, `PrintFooter`, `PrintLayout` (`.print-only.print-doc`), `PrintPortal` (renderiza em `#print-portal-root` do `index.html`, sem state/effect).
- `index.html` tem `<div id="print-portal-root"></div>` no `<body>`.

**Telas imprimíveis implementadas:**

- **Etiqueta** (`LabelPrintDialog`): renderiza preview no dialog + etiqueta no `PrintPortal` (fora do dialog). `handlePrint` → `enterPrintMode("label")` + 2×`requestAnimationFrame` → `window.print()`. `afterprint` limpa. 1 página, topo-esquerdo.
- **`/history`**: `HistoryPrintView` (layout B). Botão "Imprimir" sempre abre dialog (checkbox é escolha do usuário). "Imprimir tudo" via `toast.promise` + loop de fetch (limite 500). Filtra TRANSFERENCIA duplicada quando existe SAIDA.
- **Ficha do produto** (`ProductDetailPage`): botão "Ficha" no `ProductDetailHeader` + `PrintDialog` (1 checkbox "incluir listas") + `ProductPrintView` via `PrintPortal`. Lazy fetch de movements/history no clique.
- **`/products` lista**: botão "Imprimir" + `PrintDialog` (checkbox "incluir detalhes completos" — categoria/média/local) + `ProductListPrintView` (5 colunas).
- **`/stock`**: botão "Imprimir" + `PrintDialog` (checkbox "incluir distribuição") + `StockPrintView` (resumo 5 cards + 4 seções de alerta + 3 tabelas de distribuição opcionais).
- **`/requests` lista**: botão "Imprimir" + `PrintDialog` (checkbox "incluir detalhamento de itens") + `RequestListPrintView` (6 colunas). Quando checkbox marcado, `enrichWithItems` busca detalhe de cada pedido (N+1 via `fetchPurchaseRequestById`) e renderiza sub-tabela de itens (`colSpan`) por pedido.
- **`/requests` detalhe** (`RequestDetailsDialog`): botão "Imprimir" no header + `PrintDialog` (checkbox "incluir remessas", default marcado) + `RequestPrintView` (cabeçalho + itens + remessas + motivos).

**Comportamento:** cabeçalhos/rodapés do Chrome aparecem no papel até o usuário desmarcar "Cabeçalhos e rodapés" no diálogo de impressão. **Não é bug** — se for crítico, geração de PDF no backend (Fase 9).

**Cadastro/edição de produto (fixes da 6.6):**

- Schema Zod unificado (`productSchema`) — `reason` opcional, `priceInCents: z.number().optional().refine(...)` (não `.nullable()` — quebra o TS Resolver do RHF).
- `<NumericFormat>`: `value={field.value ?? ""}`, `onValueChange={(v) => field.onChange(v.floatValue ?? undefined)}`.
- `formatDate` em UTC (evita "voltar 1 dia" por BRT).
- `toDateInputValue` no edit (formata ISO UTC pra input `type="date"`).
- `getProductById` inclui `category: { id, name, prefix }`.
- Categoria aparece em `ProductDetailHeader` (badge), `ProductDetailsTab` (card Localização), `ProductPrintView` (ficha).
- Badge de estoque em `ProductDetailsTab` (OK/Baixo/Esgotado), badge de validade no card de validade.
- `/stock` mantém datas escritas (sem badges — decisão).
- Editar produto: backend expandido pra `isCreator || isManager || isAlmoxarifadoStaff`.

**Histórico enriquecido (`ProductHistoryTab`):**

- `ProductHistoryChart` (Recharts, linha do saldo, agrega por dia se > 30 registros).
- Agrupamento por dia (cabeçalho sticky).
- Delta explícito (`+5`, `-2`, `0`).
- Botão "Ver detalhes" (abre `TransferDetailsDialog` se `movement.transferId`, senão `MovementDetailsDialog`). Adapter `stockHistoryToMovementRef` em `src/lib/stock-history-adapter.ts`.
- Badge "Devolução" via `getHistoryEventKind`.
- Backend `getProductHistory` inclui `movement` com status/reason/transferId/createdAt/fromSector/toSector.

**ID de remessa padronizado:**

- Listas: `shortenId(transfer.id)` (8 chars + "…").
- Dialog: ID completo + botão copiar (`CopyId` em `TransferDetailsDialog`).

**Fixes importantes (não repetir):**

- `/stock` e `/products?isExpiring=true`/`isExpired=true` filtram `quantity > 0` (produto sem estoque não "vence"). `getStockMetrics` e `listProducts` alinhados (contador e lista).
- `/history`: filtro de TRANSFERENCIA duplicada (tela + papel).
- Dialog de ficha sempre abre (checkbox é escolha do usuário).
- `toast.promise` no "imprimir tudo" (não `toast.loading` + `dismiss` manual).
- `flushSync(() => setPrintDialogOpen(false))` + `setTimeout(150)` antes de montar payload (evita dialog no papel).
- `#root` escondido com `display: none` (não `visibility: hidden` — causava página em branco).
- `print-base.css` precisa ser importado no `App.tsx` (bordas somem se não).

## Comandos

**Backend:** `npm run dev` | `npx prisma migrate dev --name X` → `generate` → `db seed` | `npx prisma migrate reset --force` | `npx prisma studio` | matar node: `Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force`.

**Frontend:** `npm run dev` | `npm run build` (validação real) | `npx tsc --noEmit` | `npx shadcn@latest add X` | buscar `asChild`: `Select-String -Path "src\*\*\*.tsx" -Pattern "asChild"`.

**Teste rápido /me (Insomnia):** `POST /auth/sign-in/email` com user ativo → 200; `GET /me` → 200 com `user.sector`. Com user desativado: 403 `{ code: "USER_INACTIVE" }`.

## Pendências (backlog)

**Próximo imediato:** Fase 7 — dashboard com filtros de setor + KPIs. Depois 3 telas de relatório no front (R1 → R2 → R2b, na ordem acordada).

**Fase 7.5:** `/users` (MANAGER).

**Fase 8:** `/alerts` + Socket.io + badge.

**Fase 9 (polish):**

- Refatorar AuthContext (additionalFields required vs `/me` fonte da verdade).
- Testes automatizados: Vitest + Supertest (backend) e Playwright (frontend). Smoke test por endpoint + regras. Supertest = integration API; Playwright = E2E. Instalar depois das 3 telas de relatório.
- `PrintDialog` com N `extraCheckboxes` (hoje aceita 1). Fase 9 se virar necessidade.
- Impressão múltipla de etiquetas por folha A4 (grid de N etiquetas) — **não foi pedida**, ideia registrada.
- Geração de PDF no backend (Puppeteer/pdfkit) — só se cabeçalhos do Chrome forem críticos. **Não é bug.**
- Imprimir comprovante de remessa a partir do `TransferDetailsDialog` (feature separada).
- **Performance `/requests` com itens:** `enrichWithItems` faz N+1 requests (`fetchPurchaseRequestById` por pedido). Para 500 pedidos = 500 requests. **Mover pro backend** (incluir `items` na listagem via `include`) — 1 request. Patch: no `purchaseRequestService.listPurchaseRequests`, adicionar `items: { include: { product: { select: { name, sku, barcode } } } }` no `include` do `findMany`.
- Outras: ProductPagination muitas páginas | filtros mobile | página por categoria | Tooltip nativo → shadcn em "Deletar" | refatorar `CategoriesPage` (useState + 2 dialogs → reducer) | truncamento `/stock` | `DashboardPage` service próprio | impressora térmica | QR Code (descartado) | webcam (descartado) | múltiplos códigos/produto | deletar imagem órfã UploadThing | Neon Object Storage (futura) | Supplier entidade | `salePriceInCents` | relatórios de gasto | `PATCH /products/:id/average-cost` | tsconfig paths sem baseUrl | `import.meta.dirname` | code-splitting React.lazy (~1.4MB / 422KB gzip).

**Não bloqueadores:** TS5101 (baseUrl) e `__dirname` → Fase 9.

## Bugs já corrigidos (não repetir)

- categoryAlertMap TDZ no dashboardService.
- locationExact/supplierExact não repassados no controller.
- `resolvedBy` string → `resolvedById` FK.
- `where.category` → `where.categoryId`.
- `imageUrl: p.id` → `p.imageUrl`.
- `asChild` (Base UI) → `buttonVariants` + `Link`.
- `<Cell>` Recharts → `fill` no dado.
- `SelectValue` mostrando ID/all → `selectedOption` + fallback.
- Search sem unaccent → unaccent.
- `SignUpEmail` falhava sem sectorId → `additionalFields required`.
- `sectorService.updateSector` lia `data.isWarehouse` → checagem no controller.
- `productController.createMovement` com 2 args → 4 args.
- Import `../../generated` → `../generated` em `movement.types.ts`.
- `useRefuseTransfer` quebrado em `/movements` → dialog de recusa obrigatório.
- `refusalReason` não exibido em `RequestTransfersList` → corrigido.
- `refusalReason` ausente do payload de `GET /admin/purchase-requests/:id` → adicionado.
- Crash `Cannot read properties of undefined (reading 'isWarehouse')` → `/me` + `getMe()` + `user.sector?.isWarehouse` defensivo.
- Desconecta ao navegar/refresh em `/dashboard` → `/me` montado + 2º `useEffect` removido.
- STAFF setor comum indo para `/dashboard` → `LoginForm`/`PublicRoute` redirecionam.
- Loop de redirect em `/account-suspended` → standalone + `PublicRoute` trata `isActive === false`.
- `getMe` engolia 403 → `MeResult` discriminado + stub `{ isActive: false }`.
- `monthsBetween` off-by-one em R2 → `getUTCFullYear`/`getUTCMonth` (UTC).
- `/history`: `type=ENTRADA/SAIDA/AJUSTE` retornava todas as Transfers → `buildTransferWhere` exclui Transfers quando `filters.type` presente.
- `/history`: `status=RECUSADO` dava 500 → `buildMovementWhere` força `id in ["none"]` quando status não existe em `MovementStatus`.
- `/history`: `search=caixa` retornava Transfers sem "caixa" → `buildTransferWhere` aplica search em `items.some.product.name/sku` OU `Transfer.reason`.
- `/history`: Movement de remessa recusada aparecia como CANCELADO → `MovementStatus` ganhou RECUSADO; `refuseTransfer` seta RECUSADO.
- `/history`: filtro de Status não tinha RECUSADO → `HISTORY_STATUS_VALUES` (4) no front + `HistoryStatusFilter` no back.
- Etiqueta imprimia o modal inteiro → `LabelPrintDialog` renderiza no `PrintPortal` + `body.printing-label > * { display: none }` + import do `label-print.css`.
- Página em branco antes da etiqueta → `#root` escondido em `printing-label` com `display: none`.
- `/history` colorido na 1ª folha → `body.printing-list #root { display: none }` + `#print-portal-root { display: block }`.
- Toast preso no "imprimir tudo" → `toast.promise`.
- Dialog aparecia no papel → `flushSync` + `setTimeout(150)`.
- Layout B sem bordas → CSS do layout B (não misturar com A) + `box-sizing: border-box` + `print-spacer` via `<td>`.
- `print-base.css` não importado → bordas somem.
- Produto: data "1 dia a menos" → `formatDate` em UTC + `getExpiryBadge` em UTC.
- Produto: "Preço inválido" → schema `number` + `NumericFormat` com `floatValue` + `reaisToCents`.
- Produto: `minStock` default 5 → 0.
- Produto: edição bloqueada pra STAFF Almox → backend expandido.
- Produto: categoria não aparecia → `getProductById` inclui `category`.
- Produto: devolução sem badge → `getHistoryEventKind`.
- Produto: `ProductHistoryTab` pobre → chart + agrupamento + delta + dialogs.
- Produto: `StockHistory` faltando em transfers do seed → seed simula criação + ação.
- Produto: ID truncado inconsistente → `shortenId` + `CopyId`.
- Produto: TS Resolver conflito → schema unificado com `reason` opcional.
- Produto: `NumericFormat` vazio no edit → `value ?? ""` + `floatValue ?? undefined`.
- Seed: `Giz de Cera` não existia → `Caixa de Lápis de Cor`.
- `/stock`: lista de vencidos/vencendo e contadores incluíam `quantity === 0` → filtrado em `getStockMetrics` (backend) e alinhado em `listProducts`.

## Seed

5 usuários: `admin@estoque.com` (MANAGER/Admin@123), `almoxarifado@estoque.com` (STAFF Almox/Staff@123), `almoxarifado2@estoque.com` (STAFF Almox/Staff@123), `cozinha@estoque.com` (STAFF/Staff@123), `escola@estoque.com` (STAFF/Staff@123).

3 setores (Almoxarifado `isWarehouse=true`, Cozinha, Escola). 6 categorias. 10 produtos. ~30 movimentações manuais em ~30 dias (`addManualMovement` helper) para gerar > 20 StockHistory em vários produtos. 5 Transfers (PENDENTE, CONCLUIDO ×2, CANCELADO, RECUSADO) com StockHistory completo. 3 PurchaseRequests (PENDENTE, RECUSADO, CANCELADO). Seed idempotente (`findFirst` antes de `create`). Usar `npx prisma migrate reset --force` para recriar tudo.

## Protocolo IA

- **Este .md é contexto de chat para chat.** Mantenha-o **enxuto**. Remova bugs antigos, pensamentos, ideias em espera, explicações longas — mantenha só o que ajuda o **próximo chat a implementar a próxima feature** sem reler código. Se crescer, corte sem dó.
- Avisar contexto cedo ao notar 2+ sinais (repetir pergunta, esquecer arquivo, confundir decisão, perder fio).
- Entregar .md sempre como texto puro (bloco único), **sem** triple-backtick externo.
- Fim de fase: usuário diz "Terminamos Fase X, atualiza .md" → marcar ✅, adicionar decisões/pendências, atualizar próxima.
- Quando precisar de arquivo, marcar `[BACK]` ou `[FRONT]` e entregar em blocos separados (`## 🖥️ Backend` / `## 🎨 Frontend`).
- Sempre que fizer pergunta, dar recomendação junto.

## ONDE PARAMOS

Fases 1–6.1 ✅. Fase 6.5 ✅ (backend R1/R2/R2b + `/history` backend + frontend). **Fase 6.6 ✅** — impressão completa (`/history`, ficha do produto, `/products` lista, `/stock`, `/requests` lista + detalhe), cadastro/edição de produto, badges, histórico enriquecido, ID padronizado, categoria na UI.

**Próximo passo imediato: Fase 7** — dashboard com filtros de setor + KPIs. Depois 3 telas de relatório no front (R1 → R2 → R2b).

Última atualização: 15/11/2026.
