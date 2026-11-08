1. IDENTIDADE
   Projeto: Inventory management (estoque) — backend D:\Development\ats\estoque\backend, frontend D:\Development\ats\estoque\frontend

Domínio: Almoxarifado é ponto 0 único (só ele tem estoque). Outros setores pedem (PurchaseRequest) e recebem (Transfer).

Uso: prefeitura (compra) + mecânica (venda futura via salePriceInCents, Fase 8+)

2. STACK
   Backend: Node + Express + TS + Prisma v7 (output src/generated/prisma) + PostgreSQL (Neon) + Better Auth + tsx

Frontend: Vite + React + TS + React Router v7 + TanStack Query v5 (keepPreviousData) + shadcn/ui + Tailwind + Base UI (não Radix, sem asChild) + Axios + Recharts + jsbarcode (Code 128) + sonner + react-hook-form + zod + browser-image-compression + uploadthing + socket.io-client (Fase 8)

Socket.io (Fase 8): JWT auth, salas user:{id} e sector:{id}

3. CONVENÇÕES
   lib/ e utils/: kebab-case. Hooks: camelCase. Componentes: PascalCase. shadcn: kebab-case (não alterar).

Comentários: // 🔹 novo, // 🔴 legado.

Imports: @/ (frontend); relativos com .js (backend ESM).

Envelope backend: { success, data } — service frontend sempre desembrulha e retorna payload.

Erros: getApiErrorMessage(err) / getApiErrorCode(err) (nunca err: any).

UI ↔ schema: Transfer=Remessa, TransferItem=Item da remessa, PurchaseRequest=Pedido, Movement=Movimentação, Sector=Setor.

shadcn novo: sem form.tsx antigo — usar RHF Controller + Field/FieldLabel/FieldError/FieldDescription de @/components/ui/field; textareas via InputGroupTextarea.

Componente com state inicializado de prop → key={...} (regra react-hooks/set-state-in-effect).

Zod: z.string() (nunca .optional().or(z.literal(""))).

Rotas específicas antes de param genérico.

4. DECISÕES TRAVADAS (críticas)
   Modelo
   Product.quantity = coluna Int (estoque do Almoxarifado). StockBySector NÃO existe.

Sector.isWarehouse boolean, exatamente 1 true, imutável, não deletável.

User.sectorId obrigatório.

StockAlert é por produto (global), sem sectorId.

SKU / Barcode / Preço
SKU: PREFIX-NNN (BEB-001), gerado no backend, imutável.

Prefix: 3-4 letras maiúsculas, @unique. Regra: 1 palavra→3 primeiras; 2+→3 da 1ª + 1ª da 2ª; colisão→4ª letra da 1ª, depois sufixo numérico. Imutável após criação.

Barcode: numérico sequencial global (1000001...), Code 128, alocação lazy (preview GET .../next, real no POST). EAN-13/GTIN proibido (GS1).

Preço: priceInCents (centavos, Int?). Product.priceInCents = cache último preço compra. Product.avgPriceInCents = média ponderada móvel (só ENTRADA com preço>0; regra MYOB: preço null/0 não recalcula). Movement.unitPriceInCents = histórico.

Impressão de etiqueta: só pós-POST (nunca preview). window.print() + src/styles/print.css. Layout 60×40mm.

Contadores
CategoryCounter (1:1 com categoria) e ProductCounter (singleton) — incremento em transação atômica, concorrência silenciosa.

Categorias
CustomCategory (não enum). createdById obrigatório (Restrict). prefix obrigatório.

Permissões: STAFF só mexe nas que criou; MANAGER em todas. onDelete: Restrict (bloqueia se tiver produtos).

Fase 6 — Setores/Pedidos/Remessas
TransferStatus: PENDENTE | CONCLUIDO | CANCELADO | RECUSADO

PurchaseRequestStatus: PENDENTE | EM_ATENDIMENTO | ATENDIDO | RECUSADO | CANCELADO

Transfer (remessa): 1 header + N itens. Criar (Almoxarifado/MANAGER) → debita Product.quantity, cria N Movement TRANSFERENCIA (quantity negativo) + StockHistory, transação atômica. fromSectorId forçado no backend.

Confirmar/recusar: destino. Cancelar: STAFF Almoxarifado/MANAGER, cancelReason obrigatório, só se PENDENTE. Recusa/cancelamento devolvem estoque.

🔹 Confirmação de remessa cria Movement de SAIDA (Fase 6.5 antecipada): no confirmTransfer, além de marcar Transfer.CONCLUIDO e os Movement TRANSFERENCIA como CONCLUIDO, cria 1 Movement SAIDA por item (quantity negativo, status CONCLUIDO, transferId, fromSectorId, toSectorId, unitPriceInCents = avgPriceInCents, reason = "Remessa <id> confirmada — <toSector.name>"). NÃO cria StockHistory (o débito real foi na criação via TRANSFERENCIA) e NÃO debita estoque de novo. Objetivo: entrar nas métricas do dashboard (getActivityMetrics só conta ENTRADA/SAIDA/AJUSTE; TRANSFERENCIA não é contada). Recusa/cancelamento antes da confirmação → SAIDA nunca é criado, então métricas ficam corretas automaticamente.

🔹 Motivos obrigatórios (auditoria): Transfer.refusalReason e Transfer.cancelReason (ambos String? no schema) são obrigatórios nas ações de recusa/cancelamento — backend valida trim() e front exige preenchimento via dialog com Textarea (detalhes) ou Input (tabela /movements). refusalReason foi adicionado ao select de requestDetailInclude em purchaseRequestService e ao tipo PurchaseRequestTransferDetailRef.

PurchaseRequest (pedido): N transfers por pedido. Item não cadastrado → notes (textarea), NÃO PurchaseRequestItem com productId: null.

Finalizar pedido: manual, trava = nenhuma Transfer PENDENTE. finalizeNote obrigatório se houver Transfer RECUSADO/CANCELADO OU soma enviada < soma pedida.

Recusar pedido: Almoxarifado/MANAGER, refusalReason obrigatório, final (não reabre). Cancelar: setor criador/MANAGER.

Visibilidade: setor comum vê só o próprio; Almoxarifado/MANAGER veem tudo.

ENTRADA de produto: só STAFF do Almoxarifado ou MANAGER. SAIDA/AJUSTE: qualquer setor.

Bipagem: só em /movements via CreateTransferDialog (Enter, sem debounce). NÃO existe em /products/:id.

/movements = ação; /requests = pedidos; /history = consulta (Fase 6.5). Filtros na URL.

🔹 Auth / perfil do usuário (corrigido pós-Fase 6)
Backend é fonte da verdade do sector: GET /me (montado fora do /admin, só com authenticate) retorna req.user com sector: { id, name, isWarehouse } incluso. O authenticate inclui sector no select do Prisma e em req.user.

Front hidrata o user via getMe(), não via session.user do Better Auth (que não traz sector, pois é relação Prisma e o additionalFields só cobre colunas). Após signIn, o LoginForm chama getMe() e faz setUser(me). O AuthContext também chama getMe() no mount (única fonte de verdade), sem fetchSectorById e sem 2º useEffect.

Navegação pós-login condicional: MANAGER ou STAFF do Almoxarifado → /dashboard; demais STAFF → /requests.

User.sector é obrigatório no tipo front (sector: SectorRef, sem ?), mas guards usam user.sector?.isWarehouse defensivamente para não quebrar com estado legado/cache.

Imagem (já implementado na Fase 6)
UploadThing (free 2GB) + browser-image-compression no frontend. Product.imageUrl continua String?. Campo de colar URL permanece como fallback. Limpeza de órfã = pendência Fase 9.

Outras
/history = Movement + Transfer juntos (Fase 6.5).

R1 (/reports/requests) = auditoria pedidos. R2 (/reports/consumption) = consumo = remessas CONCLUIDO. Só Almoxarifado/MANAGER.

Notification (tabela) + Socket.io entram na Fase 8.

Usuários: só inativados (nunca deletados). MANAGER não se auto-rebaixa.

5. MODELOS PRISMA (principais)
   Sector: id, name(unique), description?, isWarehouse(bool), isActive, timestamps. Relações: users, movementsFrom/To, transfersFrom/To, purchaseRequests.

Transfer: fromSectorId, toSectorId, purchaseRequestId?, status, reason?, refusalReason?, cancelReason?, createdById, confirmedById?, refusedById?, cancelledById?, timestamps de cada ação. Relações + items, movements.

TransferItem: transferId(Cascade), productId(Restrict), quantity.

PurchaseRequest: sectorId, status, notes?, refusalReason?, finalizeNote?, createdById, finalizedById?, refusedById?, timestamps. Relações + items, transfers.

PurchaseRequestItem: requestId(Cascade), productId(Restrict), quantity.

User: + sectorId (obrigatório) + relação sector + várias relações de ações.

Movement: + fromSectorId?, toSectorId?, transferId?. quantity negativo em TRANSFERENCIA. 🔹 Também recebe quantity negativo em SAIDA gerada na confirmação de remessa. Sem purchaseRequestId no schema (não criar). Sem @@unique([transferId, type]) → 1 Transfer pode ter N Movements (TRANSFERENCIA na criação + SAIDA na confirmação).

Product: + requestItems, transferItems. quantity coluna.

6. ENDPOINTS (backend)
   Produtos
   POST /admin/products (Almoxarifado/MANAGER) — gera SKU + barcode + Movement ENTRADA inicial

GET /admin/products (filtros + paginação) / /:id / /sku/:sku / /barcode/:barcode

GET /admin/products/barcode/next (preview)

PATCH /admin/products/:id / DELETE /admin/products/:id (hard)

POST /admin/products/:id/movements (ENTRADA só Almox/MANAGER)

GET /admin/products/:id/movements / /history

Setores
GET /admin/sectors (STAFF+MANAGER) / POST (MANAGER, bloqueia isWarehouse dup) / PATCH (MANAGER, isWarehouse imutável) / DELETE (MANAGER, Restrict) / GET /options → {label,value,isWarehouse}[]

Transfers
POST /admin/transfers (Almox/MANAGER) — debita estoque, N Movements TRANSFERENCIA

GET /admin/transfers (filtrada por setor) / /:id

PATCH /:id/confirm / /refuse (destino; refuse com refusalReason obrigatório) / /cancel (Almox/MANAGER, cancelReason obrigatório)

🔹 PATCH /:id/confirm agora também cria N Movements SAIDA (para métricas).

Purchase Requests
POST /admin/purchase-requests (setor não-Almox/MANAGER)

GET /admin/purchase-requests (filtrada) / /:id / /catalog (produtos Almox, sem quantity, com isOutOfStock)

PATCH /:id/refuse / /finalize (trava + finalizeNote condicional) / /cancel

🔹 GET /:id retorna transfers com refusalReason incluso (requestDetailInclude).

Outros
GET /admin/movements (global paginada — base pra 6.5)

Categorias: GET/POST/PATCH/DELETE /admin/categories + /options → {label,value,prefix}[]

Users: GET/POST /admin/users, PATCH /:id/status|role|sector, GET /options

Dashboard: GET /admin/dashboard/overview|stock|activity|alerts

GET /admin/stock/summary, PATCH /admin/alerts/:id/resolve

🔹 GET /me (fora do /admin, só authenticate) → { user } com sector incluso. Montado em routes/index.ts como router.use("/me", meRouter). Prefixo final depende do app.use("/api", router) → GET /api/me.

7. FILTROS /admin/products
   search (unaccent), categoryId, minQuantity, maxQuantity, hasExpiryDate (tri-state), isExpiring/isLowStock/isExpired (só "true"), createdById, page, limit (max 100), sortBy (createdAt/updatedAt/name/quantity/expiryDate), sortOrder.

8. FILTROS /admin/dashboard/stock
   categoryId, location+locationExact, supplier+supplierExact, limit (por seção), sectorId (Fase 7).

9. FASES — STATUS
   Fase Status
   1 — URL fonte da verdade ✅
   2 — UI filtros ✅
   3 — CRUD categorias ✅
   4 — /stock ✅
   4.5 / 4.5.1 — polish + prefix/counters/normalize ✅
   5 + 4.6 — SKU/barcode/preço/média ✅
   6 — setores/pedidos/remessas + upload de imagem ✅ concluída
   🔹 6.1 — auth/sector + Movement SAIDA + motivos obrigatórios ✅ concluída (feita antes da 6.5)
   6.5 — /history + R1 + R2 🚧 PRÓXIMA
   7 — dashboard (filtros setor + KPIs) ⬜
   7.5 — /users (MANAGER) ⬜
   8 — /alerts + Socket.io + badge ⬜
   9 — polish ⬜
10. FRONTEND FASE 6.5 (próxima — pendente)
    Escopo:

/history — lista global de Movement + Transfer com filtros, paginação e detalhe ao clicar. Feita numa fase só (Movement + Transfer juntos). Base backend já existe (GET /admin/movements). Considerar que Movements SAIDA gerados na confirmação de remessa aparecem aqui como evento separado do TRANSFERENCIA de criação — decidir se a UI agrupa ou exibe ambos (recomendação: agrupar por transferId).

/reports/requests (R1) — auditoria de pedidos por setor (tabs por status, período mensal), comparativo pedido × enviado, imprimível via window.print(). Só Almoxarifado + MANAGER.

/reports/consumption (R2) — consumo por setor (= remessas CONCLUIDO), recomendações de compra, itens prioritários por frequência (≥80% dos meses e/ou alto volume → badge "Prioridade"). Visão global + por setor. Só Almoxarifado + MANAGER.

Backend novo: endpoints de agregação para R1/R2.

11. BUGS JÁ CORRIGIDOS (não repetir)
    categoryAlertMap TDZ no dashboardService

locationExact/supplierExact não repassados no controller

resolvedBy string → resolvedById FK (productService + dashboardService)

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

🔹 useRefuseTransfer quebrado em /movements: chamava refuseMutation.mutate(t.id) mas o hook exige { id, payload: { refusalReason } }. Corrigido com dialog de recusa obrigatório em MovementsPage (espelhando o TransferDetailsDialog).

🔹 refusalReason não exibido em RequestTransfersList: renderizava t.reason dentro do bloco t.refusalReason. Corrigido para t.refusalReason.

🔹 refusalReason ausente do payload de GET /admin/purchase-requests/:id: requestDetailInclude não selecionava refusalReason. Adicionado ao select e ao tipo PurchaseRequestTransferDetailRef.

🔹 Crash Cannot read properties of undefined (reading 'isWarehouse') no WarehouseOnlyRoute: session.user do Better Auth não tem sector (relação Prisma). Corrigido com /me no backend + getMe() no front + user.sector?.isWarehouse defensivo.

🔹 "Desconecta ao navegar" / refresh em /dashboard redirecionando: AuthContext hidratava o user sem sector e o /me não existia no backend (404 → getMe null → setUser(null) → redirect). Corrigido montando /me e removendo o 2º useEffect do AuthContext.

🔹 STAFF de setor comum indo para /dashboard: LoginForm fazia navigate("/dashboard") fixo. Corrigido para redirecionar conforme role/sector.isWarehouse.

12. COMANDOS
    Backend: npm run dev | npx prisma migrate dev --name X → generate → db seed | reset: npx prisma migrate reset --force | npx prisma studio | matar node: Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

Frontend: npm run dev | npm run build (validação real) | npx tsc --noEmit | npx shadcn@latest add X | buscar asChild: Select-String -Path "src\*\*\*.tsx" -Pattern "asChild"

Teste rápido /me: curl -i -X POST http://localhost:3000/api/auth/sign-in/email -H "Content-Type: application/json" -c cookies.txt -d '{"email":"...","password":"..."}' e depois curl -i http://localhost:3000/api/me -b cookies.txt (deve retornar user.sector).

13. PENDÊNCIAS (backlog)
    Imediato: Fase 6.5 → 7 → 7.5 → 8 → 9

🔹 Verificar/criar almoxarifado@gmail.com (login com "senha/email inválido" — conta provavelmente não existe no banco; almoxarife@estoque.com funciona).

🔹 Confirmar que User.id = session.user.id no Better Auth (o curl de sign-in retornou id tipo UhuYbb8...; se não bater com o User.id do Prisma, o authenticate busca null e /me retorna 401 — checar SELECT id, email FROM "User").

🔹 /account-suspended não existe no router (ProtectedRoute redireciona pra lá se isActive=false → hoje cai em Page404). Criar a página ou trocar o destino.

🔹 Router: mover ManagerRoutes pra dentro do ProtectedRoute (unificar auth/isActive) e opcionalmente mover WarehouseOnlyRoute pra fora do RootLayout (evita flash de layout antes do redirect).

🔹 SAIDA na confirmação de remessa: decidir se o /history agrupa TRANSFERENCIA (criação) + SAIDA (confirmação) por transferId para não duplicar visualmente. Garantir que recusa/cancelamento não tenham SAIDA órfão.

getActivityMetrics revisar (agora passa a contar SAIDA de transferência confirmada) | ProductPagination testar muitas páginas | filtros mobile | decidir página por categoria | Tooltip nativo→shadcn em "Deletar" | refatorar CategoriesPage (useState+2 dialogs→reducer) | truncamento /stock | DashboardPage usar service próprio | impressora térmica | QR Code (descartado) | webcam (descartado) | múltiplos códigos/produto | deletar imagem órfã UploadThing (Fase 9) | Neon Object Storage (futura) | transformação imagem backend | Supplier entidade | salePriceInCents | relatórios de gasto | PATCH /products/:id/average-cost | tsconfig paths sem baseUrl (Fase 9) | import.meta.dirname (Fase 9) | code-splitting React.lazy (~1.4MB/422KB gzip)

⚠️ Fase 9 (polish) — itens específicos a discutir com a IA quando chegar a hora:
Refatorar AuthContext (discussão sobre sectorId no Better Auth additionalFields required: true vs. /me como fonte da verdade). 🔹 Parcialmente resolvido na 6.1 (backend /me + front getMe); a Fase 9 deve decidir se remove o additionalFields com required: true ou mantém para signup.

14. PROTOCOLO IA
    Avisar contexto cedo ao notar 2+ sinais (repetir pergunta, esquecer arquivo, confundir decisão, resposta genérica, perder fio). Não esperar travar.

Entregar .md sempre como texto puro, sem bloco triple-backtick externo (o .md tem blocos internos — quebra parser). Começar em # Inventory Management e terminar no último parágrafo. Exceções (partes, comentário) só se pedido.

Fim de fase: usuário diz "Terminamos Fase X, atualiza .md" → marcar concluída, adicionar arquivos/decisões/pendências, atualizar próxima.

Migração: usuário anexa .md → IA atualiza e devolve texto puro → usuário salva → novo chat: "Continuando projeto inventory management. Anexei PROJECT-STATE.md. Quero [fase]."

15. ONDE PARAMOS
    Fase 6 100% concluída ✅ (backend + frontend + upload de imagem).

🔹 Fase 6.1 concluída ✅ — correções de auth/sector (/me + getMe + guards), Movement SAIDA na confirmação de remessa (para métricas), refusalReason obrigatório ponta a ponta (transferService, transferController, purchaseRequestService, TransferDetailsDialog, MovementsPage, RequestTransfersList), navegação pós-login condicional.

Próximo passo: Fase 6.5 (/history + R1 + R2).

Última atualização: 01/11/2026

Não bloqueadores: TS5101 (baseUrl) e \_\_dirname → Fase 9.

16. CHANGELOG v2.1 → v3
    🔹 Nova seção "Auth / perfil do usuário" nas decisões travadas (backend /me como fonte da verdade de sector; front sem fetchSectorById).

🔹 Nova decisão: confirmação de remessa cria Movement SAIDA (sem debitar estoque, sem StockHistory) para entrar nas métricas do dashboard.

🔹 refusalReason e cancelReason documentados como obrigatórios em toda a stack (schema já tinha; faltava no select de requestDetailInclude e no render do front).

🔹 Endpoint GET /me documentado na seção 6.

🔹 Movement da seção 5 atualizado (SAIDA com quantity negativo, sem purchaseRequestId, sem unique constraint).

🔹 Fase 6.1 adicionada na tabela de fases.

🔹 7 novos bugs na seção 11 (motivos obrigatórios, crash do guard, desconexão, redirect pós-login).

🔹 5 novas pendências na seção 13 (criar/verificar conta, checar User.id vs session.user.id, /account-suspended, reorganização do router, agrupamento no /history).

🔹 Seção 15 atualizada com a Fase 6.1.
