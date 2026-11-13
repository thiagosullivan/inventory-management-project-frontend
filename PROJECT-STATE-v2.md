Inventory Management
Projeto de gestão de estoque para prefeitura: Almoxarifado é ponto 0 único (só ele tem estoque). Outros setores pedem (PurchaseRequest) e recebem (Transfer). Uso futuro: mecânica (venda via salePriceInCents, Fase 8+).

Backend: D:\Development\ats\estoque\backend · Frontend: D:\Development\ats\estoque\frontend

1. Stack
   Backend: Node + Express + TS + Prisma v7 (output src/generated/prisma) + PostgreSQL (Neon) + Better Auth + tsx.

Frontend: Vite + React + TS + React Router v7 + TanStack Query v5 (keepPreviousData) + shadcn/ui + Tailwind + Base UI (não Radix, sem asChild) + Axios + Recharts + jsbarcode + sonner + react-hook-form + zod + browser-image-compression + uploadthing + socket.io-client (Fase 8).

Socket.io (Fase 8): JWT auth, salas user:{id} e sector:{id}.

2. Convenções
   lib/ e utils/: kebab-case. Hooks: camelCase. Componentes: PascalCase. shadcn: kebab-case (não alterar).
   Comentários: // 🔹 novo, // 🔴 legado.
   Imports: @/ (frontend); relativos com .js (backend ESM).
   Envelope backend: { success, data } — service frontend sempre desembrulha e retorna payload.
   Erros: getApiErrorMessage(err) / getApiErrorCode(err) (nunca err: any).
   UI ↔ schema: Transfer=Remessa, TransferItem=Item da remessa, PurchaseRequest=Pedido, Movement=Movimentação, Sector=Setor.
   shadcn novo: sem form.tsx antigo — RHF Controller + Field/FieldLabel/FieldError/FieldDescription de @/components/ui/field; textareas via InputGroupTextarea.
   Componente com state inicializado de prop → key={...}.
   Zod: z.string() (nunca .optional().or(z.literal(""))).
   Rotas específicas antes de param genérico.
   Busca normalizada: unaccent no backend (ILIKE), normalize-text.ts no front (comparações client-side).

3. Decisões travadas (críticas)
   Modelo:

Product.quantity = estoque do Almoxarifado. StockBySector NÃO existe.

Sector.isWarehouse boolean, exatamente 1 true, imutável, não deletável.

User.sectorId obrigatório.

StockAlert é por produto (global), sem sectorId.

SKU / Barcode / Preço:

SKU: PREFIX-NNN (BEB-001), gerado no backend, imutável.

Prefix: 3-4 letras maiúsculas, @unique. Regra: 1 palavra→3 primeiras; 2+→3 da 1ª + 1ª da 2ª; colisão→4ª letra da 1ª, depois sufixo numérico. Imutável após criação.

Barcode: numérico sequencial global (1000001...), Code 128, alocação lazy (preview GET .../next, real no POST). EAN-13/GTIN proibido.

Preço: priceInCents (Int?), Product.avgPriceInCents = média ponderada móvel (só ENTRADA com preço>0; regra MYOB). Movement.unitPriceInCents = histórico.

Impressão de etiqueta: só pós-POST (nunca preview). window.print() + print.css. Layout 60×40mm.

Contadores:

CategoryCounter (1:1) e ProductCounter (singleton) — incremento atômico em transação.

Categorias:

CustomCategory (não enum). createdById obrigatório (Restrict). prefix obrigatório.

Permissões: STAFF só mexe nas que criou; MANAGER em todas. onDelete: Restrict.

Fase 6 (Setores/Pedidos/Remessas):

TransferStatus: PENDENTE | CONCLUIDO | CANCELADO | RECUSADO

PurchaseRequestStatus: PENDENTE | EM_ATENDIMENTO | ATENDIDO | RECUSADO | CANCELADO

Transfer (remessa): 1 header + N itens. Criar (Almox/MANAGER) → debita Product.quantity, cria N Movement TRANSFERENCIA (quantity negativo) + StockHistory, transação atômica. fromSectorId forçado no backend.

Confirmar/recusar: destino. Cancelar: Almox/MANAGER, cancelReason obrigatório, só se PENDENTE. Recusa/cancelamento devolvem estoque.

Confirmar remessa cria 1 Movement SAIDA por item (quantity negativo, status CONCLUIDO, transferId, fromSectorId, toSectorId, unitPriceInCents = avgPriceInCents, reason = "Remessa <id> confirmada — <toSector.name>"). NÃO cria StockHistory e NÃO debita estoque de novo. Objetivo: entrar nas métricas do dashboard.

Motivos obrigatórios (auditoria): Transfer.refusalReason e Transfer.cancelReason obrigatórios nas ações de recusa/cancelamento — backend valida trim(), front exige preenchimento via dialog (Textarea/Input).

PurchaseRequest (pedido): N transfers por pedido. Item não cadastrado → notes (textarea), NÃO PurchaseRequestItem com productId: null.

Finalizar pedido: manual, trava = nenhuma Transfer PENDENTE. finalizeNote obrigatório se houver Transfer RECUSADO/CANCELADO OU soma enviada < soma pedida.

Recusar pedido: Almox/MANAGER, refusalReason obrigatório, final. Cancelar: setor criador/MANAGER.

Visibilidade: setor comum vê só o próprio; Almox/MANAGER veem tudo.

ENTRADA de produto: só STAFF do Almox/MANAGER. SAIDA/AJUSTE: qualquer setor.

Bipagem: só em /movements via CreateTransferDialog (Enter, sem debounce). NÃO existe em /products/:id.

/movements = ação; /requests = pedidos; /history = consulta (Fase 6.5). Filtros na URL.

MovementStatus (após Fase 6.5): PENDENTE | CONCLUIDO | CANCELADO | RECUSADO

CANCELADO = Almox cancela a remessa antes do destino agir (cancelTransfer).

RECUSADO = destino recusa a remessa (refuseTransfer) — o Movement TRANSFERENCIA correspondente também vira RECUSADO (não mais CANCELADO).

Recusa de pedido (PurchaseRequest RECUSADO) não gera Movement (só quando a remessa é criada).

Auth / perfil (Fase 6.1 — fechado):

Backend é fonte da verdade do sector: GET /me (fora do /admin, só authenticate) retorna req.user com sector: { id, name, isWarehouse }. authenticate inclui sector no select e em req.user.

Front hidrata o user via getMe(), não via session.user do Better Auth. LoginForm chama getMe() e faz setUser(me). AuthContext chama getMe() no mount.

getMe() retorna MeResult discriminado: { status: "ok", user } | { status: "unauthenticated" } | { status: "inactive" }.

Backend: authenticate retorna 401 se !fullUser e 403 { code: "USER_INACTIVE" } se !fullUser.isActive.

AuthContext trata inactive setando stub { isActive: false } → ProtectedRoute intercepta e manda pra /account-suspended.

/account-suspended é standalone. PublicRoute trata user.isActive === false → /account-suspended.

Navegação pós-login: MANAGER ou STAFF Almox → /dashboard; demais STAFF → /requests (LoginForm e PublicRoute).

User.sector obrigatório no tipo front, mas guards usam user.sector?.isWarehouse defensivo.

Imagem: UploadThing (free 2GB) + browser-image-compression. Product.imageUrl String?. Limpeza de órfã = Fase 9.

Outras:

/history = Movement + Transfer juntos (Fase 6.5, backend + frontend implementados).

R1 (/reports/requests) = auditoria pedidos. R2 (/reports/consumption) = consumo = remessas CONCLUIDO. R2b (/reports/manual-output) = saídas manuais (Movement SAIDA sem transferId). Todos só Almox/MANAGER.

/history só Almox/MANAGER (front via WarehouseOnlyRoute + backend 403).

Notification (tabela) + Socket.io entram na Fase 8.

Usuários: só inativados (nunca deletados). MANAGER não se auto-rebaixa.

4. Modelos Prisma (principais)
   Sector: id, name(unique), description?, isWarehouse(bool), isActive, timestamps. Relações: users, movementsFrom/To, transfersFrom/To, purchaseRequests.

Transfer: fromSectorId, toSectorId, purchaseRequestId?, status, reason?, refusalReason?, cancelReason?, createdById, confirmedById?, refusedById?, cancelledById?, timestamps. Relações + items, movements.

TransferItem: transferId(Cascade), productId(Restrict), quantity.

PurchaseRequest: sectorId, status, notes?, refusalReason?, finalizeNote?, createdById, finalizedById?, refusedById?, timestamps. Relações + items, transfers.

PurchaseRequestItem: requestId(Cascade), productId(Restrict), quantity.

User: + sectorId (obrigatório) + sector.

Movement: + fromSectorId?, toSectorId?, transferId?. quantity negativo em TRANSFERENCIA e em SAIDA. Sem purchaseRequestId no schema. Sem @@unique([transferId, type]).

Product: + requestItems, transferItems. quantity coluna.

Enums:

MovementType: ENTRADA | SAIDA | AJUSTE | TRANSFERENCIA

MovementStatus: PENDENTE | CONCLUIDO | CANCELADO | RECUSADO

TransferStatus: PENDENTE | CONCLUIDO | CANCELADO | RECUSADO

PurchaseRequestStatus: PENDENTE | EM_ATENDIMENTO | ATENDIDO | RECUSADO | CANCELADO

5. Endpoints (backend)
   Produtos:
   POST /admin/products (Almox/MANAGER) — gera SKU + barcode + Movement ENTRADA inicial
   GET /admin/products (filtros + paginação) / /:id / /sku/:sku / /barcode/:barcode
   GET /admin/products/barcode/next (preview)
   PATCH /admin/products/:id / DELETE /admin/products/:id (hard)
   POST /admin/products/:id/movements (ENTRADA só Almox/MANAGER; SAIDA/AJUSTE qualquer setor)
   GET /admin/products/:id/movements / /history

Setores:
GET /admin/sectors (STAFF+MANAGER) / POST (MANAGER, bloqueia isWarehouse dup) / PATCH (MANAGER, isWarehouse imutável) / DELETE (MANAGER, Restrict) / GET /options → {label,value,isWarehouse}[]

Transfers:
POST /admin/transfers (Almox/MANAGER) — debita estoque, N Movements TRANSFERENCIA
GET /admin/transfers (filtrada por setor) / /:id
PATCH /:id/confirm / /refuse (destino; refusalReason obrigatório) / /cancel (Almox/MANAGER, cancelReason obrigatório)
PATCH /:id/confirm também cria N Movements SAIDA.

Purchase Requests:
POST /admin/purchase-requests (setor não-Almox/MANAGER)
GET /admin/purchase-requests (filtrada) / /:id / /catalog
PATCH /:id/refuse / /finalize (trava + finalizeNote condicional) / /cancel
GET /:id retorna transfers com refusalReason incluso.

Outros:
GET /admin/movements (global paginada)
GET /admin/history (Fase 6.5) — lista unificada Movement + Transfer, agrupando por transferId; ver seção 6.
Categorias: GET/POST/PATCH/DELETE /admin/categories + /options → {label,value,prefix}[]
Users: GET/POST /admin/users, PATCH /:id/status|role|sector, GET /options
Dashboard: GET /admin/dashboard/overview|stock|activity|alerts
GET /admin/stock/summary, PATCH /admin/alerts/:id/resolve
GET /me (fora do /admin, só authenticate) → { user } com sector. 200 (ativo), 401 (não encontrado), 403 { code: "USER_INACTIVE" } (desativado).

6. Fase 6.5 — Relatórios e /history (contratos fechados, backend + /history frontend implementados)
   6.1 /admin/history (implementado — backend + frontend)
   Fonte: Movement + Transfer, com visibilidade por setor:

MANAGER e STAFF Almox → veem tudo.

STAFF de setor comum → só Movements/Transfers onde seu setor participa (fromSectorId ou toSectorId). Mas /history é restrito a Almox/MANAGER (front WarehouseOnlyRoute + backend 403), então a visibilidade por setor só se aplica a STAFF do Almox (que vê tudo) ou MANAGER.

Parâmetros (query):

type (MovementType) — se presente, exclui Transfers do resultado (Transfer não tem type).

status (MovementStatus | TransferStatus) — Movements filtram por MovementStatus; Transfers por TransferStatus. Se valor não existir em MovementStatus (ex.: RECUSADO), Movements ficam vazios (sem 500); se não existir em TransferStatus, Transfers ficam fora.

createdById, productId, dateFrom, dateTo (ISO; filtram Movement.createdAt e Transfer.createdAt).

search: filtra os dois lados:

Movements: product.name, product.sku, Movement.reason (unaccent + ILIKE).

Transfers: product.name/sku dos itens (contains insensitive) OU Transfer.reason (contains insensitive).

page (default 1), limit (default 20, max 100), sortOrder (asc|desc, default desc).

includeTransfers (default true): true → agrupa por transferId (TRANSFER event com movements[] dentro); false → lista bruta de Movements (cada um vira MOVEMENT event, inclusive os com transferId).

hasTransfer (true|false|ausente): true → só Movements com transferId; false → só Movements sem transferId (e exclude Transfers); ausente → todos.

Shape (HistoryEvent discriminado):

{ eventType: "MOVEMENT", createdAt, movement: HistoryMovementRef }

{ eventType: "TRANSFER", createdAt, transfer: HistoryTransferRef, movements: HistoryMovementRef[] }

HistoryMovementRef: id, type, status, quantity, reason, unitPriceInCents, createdAt, product {id,name,sku,imageUrl}, createdBy {id,name}, fromSector {id,name,isWarehouse}|null, toSector|null.

HistoryTransferRef: id, status, createdAt, confirmedAt/refusedAt/cancelledAt, reason/refusalReason/cancelReason, fromSector, toSector, createdBy, items[], \_count {items}.

Paginação: total = Movements sem transferId + Transfers (quando includeTransfers=true); Movements brutos (quando false). totalPages = ceil(total/limit).

Erros: 400 INVALID_INCLUDE_TRANSFERS / INVALID_HAS_TRANSFER (valores ≠ "true"/"false"); 403 FORBIDDEN (não-Almox/MANAGER); 401.

6.2 R1 — GET /admin/reports/requests (Almox/MANAGER)
Query: dateFrom?, dateTo? (default mês corrente), sectorId?, status?, page? (default 1), limit? (default 20, max 100), sortBy? (createdAt | finalizedAt | sectorName, default createdAt), sortOrder? (asc|desc, default desc).

Filtro de período por PurchaseRequest.createdAt. Todos os status incluídos por default.

Response: requests: RequestReportRow[] + summary (totalRequests, byStatus Record<PurchaseRequestStatus,number>, totalRequestedQty, totalSentQty, overallFulfillmentPct 0–100) + paginação.

RequestReportRow: id, sectorId, sectorName, status, createdAt, finalizedAt, createdById, createdByName, totals {requestedQty, sentQty, fulfillmentPct}, items[] {productId, productName, productSku, requestedQty, sentQty, fulfillmentPct}.
"Enviado" = soma de TransferItem.quantity das Transfers CONCLUIDO por produto.

6.3 R2 — GET /admin/reports/consumption (global, Almox/MANAGER)
Query: dateFrom?, dateTo? (default últimos 6 meses), priorityThreshold? (default 50), limit? (default 10, max 100 = top N por setor).

Fonte: só Transfer CONCLUIDO. consumedValueInCents = Σ TransferItem.quantity × Movement.unitPriceInCents (SAIDA da transfer, histórico real; não Product.avgPriceInCents).

Response: period, summary {totalConsumedQty, totalConsumedValueInCents, totalSectors, totalProducts, monthsInRange, priorityProductsCount}, bySector[] {sectorId, sectorName, totalConsumedQty, totalConsumedValueInCents, productsCount, topProducts[] com priority}, overallTopProducts[].

Regra de prioridade: monthsWithConsumption / monthsInRange ≥ 0.8 OU consumedQty >= priorityThreshold. Calculado no backend, retornado priority: boolean.

Mês de consumo = Transfer.confirmedAt (UTC). monthsInRange e monthKey usam getUTCFullYear/getUTCMonth (imune a fuso).

priorityProductsCount (global): produtos DISTINTOS com prioridade em qualquer setor.

6.4 R2 — GET /admin/reports/consumption/:sectorId (Almox/MANAGER)
Mesmos query params (exceto limit = top N produtos do setor). Response: sector {id,name}, period, summary {totalConsumedQty, totalConsumedValueInCents, productsCount, monthsInRange, priorityProductsCount}, products[] com monthlyBreakdown[] (YYYY-MM; zero para meses sem consumo) e priority.

summary soma sobre o productMap INTEIRO (não só top N).

6.5 R2b — GET /admin/reports/manual-output (Almox/MANAGER)
Fonte: Movement com type = SAIDA e transferId IS NULL. Query: dateFrom?, dateTo? (default mês corrente), sectorId? (fromSectorId), productId?, page? (default 1), limit? (default 20, max 100).

Response: movements[] {id, createdAt, productId, productName, productSku, productImageUrl, quantity (negativo), reason, fromSectorId, fromSectorName, createdById, createdByName, unitPriceInCents, totalValueInCents = |quantity| × unitPrice} + summary {totalMovements, totalQty (soma |qty|), totalValueInCents, bySector[] {sectorId, sectorName, totalMovements, totalQty, totalValueInCents}} + paginação.

Se fromSectorId for null (saídas criadas via /products/:id/movements), fromSectorName = null e a movimentação NÃO entra em bySector (só no summary global). Front exibe "—".

7. Filtros /admin/products
   search (unaccent), categoryId, minQuantity, maxQuantity, hasExpiryDate (tri-state), isExpiring/isLowStock/isExpired (só "true"), createdById, page, limit (max 100), sortBy (createdAt/updatedAt/name/quantity/expiryDate), sortOrder.

8. Filtros /admin/dashboard/stock
   categoryId, location+locationExact, supplier+supplierExact, limit (por seção), sectorId (Fase 7).

9. FASES — STATUS
   Fase 1 — URL fonte da verdade ✅
   Fase 2 — UI filtros ✅
   Fase 3 — CRUD categorias ✅
   Fase 4 — /stock ✅
   Fase 4.5/4.5.1 — polish + prefix/counters/normalize ✅
   Fase 5 + 4.6 — SKU/barcode/preço/média ✅
   Fase 6 — setores/pedidos/remessas + upload ✅
   Fase 6.1 — auth/sector + Movement SAIDA + motivos obrigatórios ✅
   🔹 Fase 6.5 — /history + R1 + R2 + R2b — backend R1/R2/R2b ✅ + /history backend ✅ + /history frontend ✅ (com animação, sub-lista distinta, Select Todos/Movimentações/Transferências, filtro RECUSADO, busca nos dois lados). Próximo: 3 telas de relatório (R1/R2/R2b) no front.
   Fase 7 — dashboard (filtros setor + KPIs) ⬜
   Fase 7.5 — /users (MANAGER) ⬜
   Fase 8 — /alerts + Socket.io + badge ⬜
   Fase 9 — polish ⬜

10. Frontend Fase 6.5
    /history ✅ implementado:

src/types/history.types.ts (espelho do backend; MovementStatus inclui RECUSADO; HistoryStatusFilter = MovementStatus | TransferStatus).

src/lib/history-query-params.ts (HISTORY_DEFAULTS, HISTORY_STATUS_VALUES com 4, MOVEMENT_TYPE_VALUES; parse/serialize; hasTransfer serializado sempre que definido).

src/services/history.ts (fetchHistory).

src/hooks/useHistory.ts (TanStack Query + keepPreviousData + staleTime 30s).

src/components/history/MovementDetailsDialog.tsx.

src/pages/HistoryPage.tsx: Select "Eventos" (Todos/Movimentações/Transferências), Select Tipo, Select Status (Pendente/Concluído/Cancelado/Recusado), De/Até, Buscar com debounce. Tabela com expand animado (CollapsiblePanel grid-rows 0fr→1fr + opacity). Sub-lista de Movements com visual próprio (bg-muted/40, dashed, cards), não tabela. Botão "Limpar filtros" (disabled quando não há filtro ativo). Link do produto → /products/:id.

src/routes.tsx: /history dentro de WarehouseOnlyRoute.

Sidebar já tem History → /history.

Pendências /history:

TransferDetailsDialog mostra a remessa completa (correto; o search filtra a lista, não o dialog).

"Limpar filtros" reseta searchInput e URL.

Próximas telas:

/reports/requests (R1) — auditoria pedidos (tabs por status, período, filtro por setor), comparativo pedido × enviado, imprimível.

/reports/consumption (R2) — consumo por setor, recomendações, itens prioritários (badge). Visão global + por setor.

/reports/manual-output (R2b) — saídas manuais, standalone com link cruzado.

/reports/requests e /reports/consumption e /reports/manual-output: só Almox + MANAGER (WarehouseOnlyRoute).

11. Bugs já corrigidos (não repetir)
    categoryAlertMap TDZ no dashboardService

locationExact/supplierExact não repassados no controller

resolvedBy string → resolvedById FK

where.category → where.categoryId

imageUrl: p.id → p.imageUrl

asChild (Base UI) → buttonVariants + Link

<Cell> Recharts → fill no dado

SelectValue mostrando ID/all → selectedOption + fallback

Search sem unaccent → unaccent

SignUpEmail falhava sem sectorId → additionalFields required

sectorService.updateSector lia data.isWarehouse → checagem no controller

productController.createMovement com 2 args → 4 args

Import ../../generated → ../generated em movement.types.ts

useRefuseTransfer quebrado em /movements → dialog de recusa obrigatório

refusalReason não exibido em RequestTransfersList → corrigido

refusalReason ausente do payload de GET /admin/purchase-requests/:id → adicionado em requestDetailInclude e PurchaseRequestTransferDetailRef

Crash Cannot read properties of undefined (reading 'isWarehouse') → /me + getMe() + user.sector?.isWarehouse defensivo

Desconecta ao navegar / refresh em /dashboard → /me montado + 2º useEffect removido

STAFF setor comum indo para /dashboard → LoginForm/PublicRoute redirecionam

Loop de redirect em /account-suspended → standalone + PublicRoute trata isActive === false

getMe engolia 403 → MeResult discriminado + stub { isActive: false }

monthsBetween off-by-one em R2 → getUTCFullYear/getUTCMonth (UTC)

/history: type=ENTRADA/SAIDA/AJUSTE retornava todas as Transfers → buildTransferWhere exclui Transfers quando filters.type presente

/history: status=RECUSADO dava 500 → buildMovementWhere força id in ["none"] quando status não existe em MovementStatus

/history: search=caixa retornava Transfers sem "caixa" → buildTransferWhere aplica search em items.some.product.name/sku OU Transfer.reason

/history: Movement de remessa recusada aparecia como CANCELADO → MovementStatus ganhou RECUSADO; refuseTransfer seta RECUSADO

/history: filtro de Status não tinha RECUSADO → HISTORY_STATUS_VALUES (4) no front + HistoryStatusFilter no back

12. Comandos
    Backend: npm run dev | npx prisma migrate dev --name X → generate → db seed | npx prisma migrate reset --force (dropa + recria + seed) | npx prisma studio | matar node: Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

Frontend: npm run dev | npm run build (validação real) | npx tsc --noEmit | npx shadcn@latest add X | buscar asChild: Select-String -Path "src\*\*\*.tsx" -Pattern "asChild"

Teste rápido /me (Insomnia): POST {{ _.baseurl }}/auth/sign-in/email com user ativo → 200; GET {{ _.baseurl }}/me → 200 com user.sector. Com user desativado: GET /me → 403 com { code: "USER_INACTIVE" }.

13. Pendências (backlog)
    Imediato: 3 telas de relatório (R1 → R2 → R2b) → Fase 7 → 7.5 → 8 → 9.

/history: TransferDetailsDialog mostra remessa completa (correto). Se um dia houver /transfers/:id no front, linha do TRANSFER pode linkar direto.

getActivityMetrics revisar: agora conta SAIDA de transferência confirmada. Validar que TRANSFERENCIA continua não contada e que SAIDA entra em totalExits, entriesExitsRatio, byPeriod, byUser, byProduct, trends.

R2b manual-output: no front, standalone com link cruzado "ver saídas manuais do setor X". fromSectorId null → exibir "—" e não entrar em bySector.

Outras: ProductPagination muitas páginas | filtros mobile | página por categoria | Tooltip nativo→shadcn em "Deletar" | refatorar CategoriesPage (useState+2 dialogs→reducer) | truncamento /stock | DashboardPage service próprio | impressora térmica | QR Code (descartado) | webcam (descartado) | múltiplos códigos/produto | deletar imagem órfã UploadThing (Fase 9) | Neon Object Storage (futura) | transformação imagem backend | Supplier entidade | salePriceInCents | relatórios de gasto | PATCH /products/:id/average-cost | tsconfig paths sem baseUrl (Fase 9) | import.meta.dirname (Fase 9) | code-splitting React.lazy (~1.4MB/422KB gzip)

⚠️ Fase 9 (polish) — itens a discutir com a IA:

Refatorar AuthContext (additionalFields required: true no Better Auth vs. /me como fonte da verdade). Parcialmente resolvido na 6.1; decidir se remove ou mantém para signup.

14. PROTOCOLO IA
    Avisar contexto cedo ao notar 2+ sinais (repetir pergunta, esquecer arquivo, confundir decisão, resposta genérica, perder fio). Não esperar travar.

Entregar .md sempre como texto puro, sem bloco triple-backtick externo (o .md tem blocos internos — quebra parser). Começar em # Inventory Management e terminar no último parágrafo. Exceções (partes, comentário) só se pedido.

Fim de fase: usuário diz "Terminamos Fase X, atualiza .md" → marcar concluída, adicionar arquivos/decisões/pendências, atualizar próxima.

Migração: usuário anexa .md → IA atualiza e devolve texto puro → usuário salva → novo chat: "Continuando projeto inventory management. Anexei PROJECT-STATE.md. Quero [fase]."

Quando precisar de arquivo, marcar [BACK] ou [FRONT] e entregar em blocos separados (## 🖥️ Backend / ## 🎨 Frontend).

Sempre que fizer uma pergunta, dar recomendação junto.

15. ONDE PARAMOS
    Fases 1–5, 4.5/4.5.1/4.6, 6, 6.1 concluídas ✅.

Fase 6.5 — backend R1/R2/R2b 100% validado no Insomnia ✅. /history backend ✅ (agrupamento, filtros type/status/search nos dois lados, hasTransfer, RECUSADO, 403 Almox/MANAGER). /history frontend ✅ (Select Todos/Movimentações/Transferências, filtro RECUSADO no Status, expand animado, sub-lista distinta, limpar filtros, WarehouseOnlyRoute).

Testes automatizados: instalar Vitest + Supertest (backend) e Playwright (frontend) no fim da Fase 6.5, depois das 3 telas de relatório prontas. Não escrever testes agora (contratos ainda mudam com o front). Escopo inicial: smoke test por endpoint (200 + shape mínimo) para R1/R2/R2b//history; depois regras (permissão, filtros, prioridade, paginação, agrupamento). Diferenciar no currículo: Supertest = integration test de API; Playwright = E2E.

Próximo passo imediato: 3 telas de relatório no front (R1 → R2 → R2b), na ordem acordada.

Não bloqueadores: TS5101 (baseUrl) e \_\_dirname → Fase 9.

Última atualização: 12/11/2026.

16. CHANGELOG v3.2 → v3.3
    🔹 /history backend implementado e validado: types, service, controller, routes, mount em /admin. Agrupamento por transferId (TRANSFER event com movements[]), listagem bruta (includeTransfers=false), filtros type/status/createdById/productId/dateFrom/dateTo/search/page/limit/sortOrder, hasTransfer (true/false/ausente), search nos dois lados (Movements: name/sku/reason com unaccent; Transfers: nome/sku dos itens e reason com contains insensitive), total honesto (Movements sem transferId + Transfers).

🔹 /history restrito a Almox/MANAGER: frontend WarehouseOnlyRoute + backend 403 FORBIDDEN no controller.

🔹 MovementStatus ganhou RECUSADO (migração add_recusado_to_movement_status). refuseTransfer seta MovementStatus.RECUSADO (não CANCELADO). cancelTransfer continua CANCELADO. Distinção: Cancelado = Almox cancela antes do destino; Recusado = destino recusa.

🔹 Filtro de Status no /history front inclui RECUSADO (HISTORY_STATUS_VALUES com 4); HistoryStatusFilter = MovementStatus | TransferStatus no back e no front; badge de Movement RECUSADO em vermelho.

🔹 /history frontend implementado: Select "Eventos" (Todos/Movimentações/Transferências) derivando includeTransfers + hasTransfer; filtro de RECUSADO; expand animado (CollapsiblePanel grid-rows 0fr→1fr); sub-lista de Movements com visual próprio (bg-muted/40, dashed, cards) em vez de tabela; botão "Limpar filtros"; link do produto → /products/:id; /history em WarehouseOnlyRoute; Sidebar já tem History.

🔹 Correções de /history no backend: type presente exclui Transfers; status inválido em MovementStatus força Movements vazio (sem 500); search em Transfers (itens e reason); hasTransfer (true/false) filtrando Movements por transferId e excluindo Transfers quando false.

🔹 Seed ampliado: cobre Movement ENTRADA/SAIDA/SAIDA-manual/AJUSTE/TRANSFERENCIA em todos os status (PENDENTE/CONCLUIDO/CANCELADO/RECUSADO), Transfer PENDENTE/CONCLUIDO/CANCELADO/RECUSADO, PurchaseRequest PENDENTE/EM_ATENDIMENTO/ATENDIDO/RECUSADO/CANCELADO, SAIDA manual (transferId null) para R2b. Idempotente (findFirst antes de create).

🔹 Regra de prioridade R2 confirmada em UTC: monthsBetween e monthKey usam getUTCFullYear/getUTCMonth; Transfer.confirmedAt é referência de mês de consumo. 2.4 validado (monthsInRange=3 para ago–out/2026).

🔹 R2 global: priorityProductsCount = produtos DISTINTOS com prioridade em qualquer setor (não ocorrências por setor). Summary do R2 setor soma sobre o productMap inteiro (não top N).

🔹 Decisão de testes automatizados registrada para o fim da Fase 6.5: Vitest + Supertest (backend), Playwright (frontend). Não implementar agora.

🔹 Decisão de escopo: /history frontend entregue; 3 telas de relatório (R1/R2/R2b) no front são o próximo passo.
