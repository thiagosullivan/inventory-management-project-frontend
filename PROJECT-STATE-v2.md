PROJECT-STATE.md (v2.1 — ultra-resumido)

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

PurchaseRequest (pedido): N transfers por pedido. Item não cadastrado → notes (textarea), NÃO PurchaseRequestItem com productId: null.

Finalizar pedido: manual, trava = nenhuma Transfer PENDENTE. finalizeNote obrigatório se houver Transfer RECUSADO/CANCELADO OU soma enviada < soma pedida.

Recusar pedido: Almoxarifado/MANAGER, refusalReason obrigatório, final (não reabre). Cancelar: setor criador/MANAGER.

Visibilidade: setor comum vê só o próprio; Almoxarifado/MANAGER veem tudo.

ENTRADA de produto: só STAFF do Almoxarifado ou MANAGER. SAIDA/AJUSTE: qualquer setor.

Bipagem: só em /movements via CreateTransferDialog (Enter, sem debounce). NÃO existe em /products/:id.

/movements = ação; /requests = pedidos; /history = consulta (Fase 6.5). Filtros na URL.

Imagem (já implementado na Fase 6)
UploadThing (free 2GB) + browser-image-compression no frontend. Product.imageUrl continua String?. Campo de colar URL permanece como fallback. Limpeza de órfã = pendência Fase 9.

Outras
/history = Movement + Transfer juntos (Fase 6.5).

R1 (/reports/requests) = auditoria pedidos. R2 (/reports/consumption) = consumo = remessas CONCLUIDO. Só Almoxarifado/MANAGER.

Notification (tabela) + Socket.io entram na Fase 8.

Usuários: só inativados (nunca deletados). MANAGER não se auto-rebaixa.

5. MODELOS PRISMA (principais)
   Sector: id, name(unique), description?, isWarehouse(bool), isActive, timestamps. Relações: users, movementsFrom/To, transfersFrom/To, purchaseRequests.

Transfer: fromSectorId, toSectorId, purchaseRequestId?, status, reason?, cancelReason?, createdById, confirmedById?, refusedById?, cancelledById?, timestamps de cada ação. Relações + items, movements.

TransferItem: transferId(Cascade), productId(Restrict), quantity.

PurchaseRequest: sectorId, status, notes?, refusalReason?, finalizeNote?, createdById, finalizedById?, refusedById?, timestamps. Relações + items, transfers.

PurchaseRequestItem: requestId(Cascade), productId(Restrict), quantity.

User: + sectorId (obrigatório) + relação sector + várias relações de ações.

Movement: + fromSectorId?, toSectorId?, transferId?. quantity negativo em TRANSFERENCIA.

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

PATCH /:id/confirm / /refuse (destino) / /cancel (Almox/MANAGER, cancelReason)

Purchase Requests
POST /admin/purchase-requests (setor não-Almox/MANAGER)

GET /admin/purchase-requests (filtrada) / /:id / /catalog (produtos Almox, sem quantity, com isOutOfStock)

PATCH /:id/refuse / /finalize (trava + finalizeNote condicional) / /cancel

Outros
GET /admin/movements (global paginada — base pra 6.5)

Categorias: GET/POST/PATCH/DELETE /admin/categories + /options → {label,value,prefix}[]

Users: GET/POST /admin/users, PATCH /:id/status|role|sector, GET /options

Dashboard: GET /admin/dashboard/overview|stock|activity|alerts

GET /admin/stock/summary, PATCH /admin/alerts/:id/resolve

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
   6 — setores/pedidos/remessas + upload de imagem ✅ concluída por completo
   6.5 — /history + R1 + R2 🚧 PRÓXIMA
   7 — dashboard (filtros setor + KPIs) ⬜
   7.5 — /users (MANAGER) ⬜
   8 — /alerts + Socket.io + badge ⬜
   9 — polish ⬜
10. FRONTEND FASE 6.5 (próxima — pendente)
    Escopo:

/history — lista global de Movement + Transfer com filtros, paginação e detalhe ao clicar. Feita numa fase só (Movement + Transfer juntos). Base backend já existe (GET /admin/movements).

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

12. COMANDOS
    Backend: npm run dev | npx prisma migrate dev --name X → generate → db seed | reset: npx prisma migrate reset --force | npx prisma studio | matar node: Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
    Frontend: npm run dev | npm run build (validação real) | npx tsc --noEmit | npx shadcn@latest add X | buscar asChild: Select-String -Path "src\*\*\*.tsx" -Pattern "asChild"

13. PENDÊNCIAS (backlog)
    Imediato: Fase 6.5 → 7 → 7.5 → 8 → 9

getActivityMetrics revisar | ProductPagination testar muitas páginas | filtros mobile | decidir página por categoria | Tooltip nativo→shadcn em "Deletar" | refatorar CategoriesPage (useState+2 dialogs→reducer) | truncamento /stock | DashboardPage usar service próprio | impressora térmica | QR Code (descartado) | webcam (descartado) | múltiplos códigos/produto | deletar imagem órfã UploadThing (Fase 9) | Neon Object Storage (futura) | transformação imagem backend | Supplier entidade | salePriceInCents | relatórios de gasto | PATCH /products/:id/average-cost | tsconfig paths sem baseUrl (Fase 9) | import.meta.dirname (Fase 9) | code-splitting React.lazy (~1.4MB/422KB gzip)

⚠️ Fase 9 (polish) — itens específicos a discutir com a IA quando chegar a hora:
Refatorar AuthContext: mudar a forma como o backend lida com sectorId no Better Auth (hoje additionalFields com required: true). Quando chegar na Fase 9, a IA deve abrir essa discussão/levantar as opções antes de implementar.

14. PROTOCOLO IA
    Avisar contexto cedo ao notar 2+ sinais (repetir pergunta, esquecer arquivo, confundir decisão, resposta genérica, perder fio). Não esperar travar.

Entregar .md sempre como texto puro, sem bloco triple-backtick externo (o .md tem blocos internos — quebra parser). Começar em # Inventory Management e terminar no último parágrafo. Exceções (partes, comentário) só se pedido.

Fim de fase: usuário diz "Terminamos Fase X, atualiza .md" → marcar concluída, adicionar arquivos/decisões/pendências, atualizar próxima.

Migração: usuário anexa .md → IA atualiza e devolve texto puro → usuário salva → novo chat: "Continuando projeto inventory management. Anexei PROJECT-STATE.md. Quero [fase]."

15. ONDE PARAMOS
    Fase 6 100% concluída ✅ (backend + frontend + upload de imagem)

Próximo passo: Fase 6.5 (/history + R1 + R2)

Última atualização: 31/10/2026

Não bloqueadores: TS5101 (baseUrl) e \_\_dirname → Fase 9
