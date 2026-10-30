Inventory Management — Estado do Projeto
Última atualização: 28/10/2026 (4ª atualização — backend da Fase 6 concluído)
Última fase concluída: Fase 5 + 4.6 (frontend — /products/new + /products/:id + JsBarcode + modal + impressão) ✅
Fase em andamento: Fase 6 (setores + pedidos + remessas) 🚧 — backend 100% concluído, frontend pendente
Próxima etapa: frontend da Fase 6 — /movements + /requests
Redesenho de 28/10/2026: o modelo multi-setores com StockBySector foi abandonado. O Almoxarifado é o ponto 0 único — só ele tem estoque (Product.quantity volta a ser coluna). Os outros setores só pedem (PurchaseRequest) e confirmam recebimento (Transfer).
Módulo de pedidos (PurchaseRequest) entra na Fase 6.
Relatórios R1 (auditoria de pedidos) e R2 (consumo mensal) ficam pra Fase 6.5, junto com /history.
Upload de imagem de produto (UploadThing + compressão) fica pra Fase 6.75.

1. Stack
   Backend
   Node.js + Express

TypeScript

Prisma ORM (v7) — generator prisma-client com output em src/generated/prisma

PostgreSQL (NeonDB)

Better Auth (autenticação)

tsx (dev runner)

Estrutura: controllers/, services/, routes/, middlewares/, types/, lib/, utils/, prisma/

Frontend
Vite + React

TypeScript

React Router v7 (react-router-dom no routes.tsx; import { useSearchParams } from "react-router" nos hooks — os dois funcionam)

TanStack Query v5 (placeholderData: keepPreviousData)

shadcn/ui + Tailwind

Base UI (não Radix) — componentes como Select/Button podem não ter asChild; usar buttonVariants + <Link> ou render prop

shadcn novo (pós-2025): form.tsx antigo (com Form/FormField/FormItem) não existe mais. Usar react-hook-form direto com Controller + primitivos Field/FieldLabel/FieldError/FieldDescription/FieldGroup de @/components/ui/field (e InputGroup/InputGroupTextarea pra textareas com contador)

Axios (services/api.ts com interceptor de auth)

Recharts (via chart.tsx do shadcn)

jsbarcode (Code 128, só barras)

sonner (toasts) — montado no RootLayout

react-hook-form + zod + @hookform/resolvers (forms novos)

browser-image-compression (Fase 6.75 — compressão de imagem no frontend)

uploadthing + @uploadthing/react (Fase 6.75 — storage de imagem)

Socket.io (Fase 8) — servidor (socket.io) + client (socket.io-client); autenticação via JWT; salas user:{id} e sector:{id}

Estrutura: pages/, components/, hooks/, lib/, services/, types/, contexts/, styles/

Caminhos
Backend: D:\Development\ats\estoque\backend

Frontend: D:\Development\ats\estoque\frontend

Convenções
Arquivos em lib/: kebab-case com hífen (product-query-params.ts, filter-metadata.ts, format-date.ts, api-error.ts)

Arquivos em utils/: kebab-case com hífen (generate-prefix.ts, validation.ts, currency.ts, request.ts)

Arquivos de hooks: camelCase (useProductQueryParams.ts, useProduct.ts, useProductMutations.ts)

Componentes: PascalCase (TableProducts.tsx, ProductForm.tsx)

Componentes shadcn em kebab-case (chart.tsx, field.tsx, input-group.tsx) — não alterar

Comentários: // 🔹 em código novo, // 🔴 em código legado/quebrado

Imports: usar @/ como alias pra src/ (frontend) e caminhos relativos com .js (backend, ESM)

Envelope do backend: { success, data } — service do frontend sempre desembrulha antes de retornar

Envelope paginado: { success, data: { items, total, page, limit, totalPages } } — services que não paginam extraem só o array

Service do frontend retorna o PAYLOAD, nunca o envelope — tipo de envelope é local ao service (GetXxxApiResponse)

Erros tipados: usar getApiErrorMessage(err) e getApiErrorCode(err) de lib/api-error.ts em vez de err: any (ESLint no-explicit-any)

Nomenclatura UI ↔ schema (Fase 6):

Transfer = Remessa

TransferItem = Item da remessa

PurchaseRequest = Pedido

PurchaseRequestItem = Item do pedido

Movement = Movimentação (de estoque — NUNCA "pedido")

Sector = Setor

User = Usuário

2. Decisões arquiteturais travadas
   Decisão Valor
   Categorias Enum ProductCategory → relação CustomCategory (migração concluída)
   Categorias obrigatórias Opção C — sistema pode ficar com zero categorias
   Fallback "Outros" ❌ Não existe — sem isDefault
   Delete de categoria onDelete: Restrict — bloqueia se tiver produtos
   Permissões de categoria Modelo 3 — STAFF cria/edita/deleta só as que criou; MANAGER mexe em todas
   CustomCategory.createdById Obrigatório, onDelete: Restrict — categoria sempre tem dono
   CustomCategory.prefix Obrigatório, @unique, 3-4 letras maiúsculas — usado pra gerar SKU (BEB-001). Regra na seção 2.1
   CategoryCounter 1:1 com CustomCategory, lastNumber Int @default(0). Incremento em transação atômica
   ProductCounter Singleton (id = "singleton"), lastNumber Int @default(1000000). Incremento em transação atômica (barcode)
   Rotas de categoria (write) isStaff (STAFF + MANAGER) — checagem dono/MANAGER no service
   SKU Obrigatório, gerado automaticamente pelo backend — formato PREFIX-NNN (BEB-001). Implementado na rodada de produto (backend)
   Prefixo da categoria CustomCategory.prefix — 3-4 letras maiúsculas, @unique. Regra completa na seção 2.1
   Contador do SKU CategoryCounter.lastNumber — por categoria. Incremento em transação atômica
   Barcode Obrigatório, numérico sequencial global — 1000001, 1000002, ... Implementado na rodada de produto (backend)
   Contador do barcode ProductCounter singleton — global. Incremento em transação atômica
   Formato do código de barras Code 128 (uso interno). Nunca EAN-13/GTIN/UPC (legalidade GS1)
   EAN-13 proibido ❌ Sempre. GS1 detém monopólio no Brasil — uso indevido é violação legal
   Alocação do barcode Lazy — frontend faz preview via GET .../next; backend aloca de verdade no POST /products
   Preview vs real Preview (GET .../next) só calcula; real (POST /products) é alocado em transação
   Concorrência de barcode Silenciosa — segundo usuário vê o número real, sem aviso de mudança
   Frontend envia barcode no POST? Não — backend sempre aloca. Preview do frontend é descartado
   Botão "Gerar código de barras" Lazy — só aloca preview quando clicado. Evita queimar números
   Impressão de etiqueta Só após o produto criado (pós-POST retornar sucesso). Nunca com preview
   Fluxo de cadastro /products/new (rota própria) → formulário → modal pós-criação com 3 opções
   Modal pós-criação [Imprimir etiqueta] [Ver produto] [Fechar] — 3 intenções distintas
   "Fechar" no modal Volta pra /products (lista). Não vai pro detalhe
   "Ver produto" no modal Vai pra /products/:id
   "Imprimir etiqueta" no modal Abre dialog de impressão → após imprimir/fechar → vai pra /products/:id
   Reimpressão de etiqueta Em /products/:id, botão sempre disponível
   Fase 5 — linha de alerta Nome do produto vira <Link> pra /products/:id (Opção C) — implementado
   Fase 5 — botão "Voltar" Sempre navigate(-1) (histórico do navegador) — preserva filtros da página anterior. Fallback: /products (via window.history.length > 1)
   Lib de barcode JsBarcode (só barras). Sem QR Code por ora. Pode mudar pra bwip-js no futuro
   Impressão de etiqueta window.print() + CSS de impressão (src/styles/print.css). Fallback PDF futuro
   Layout da etiqueta 60×40mm centralizada em A4 (pronta pra térmica futura)
   normalizeText utils/validation.ts — trim + colapso de espaços internos. Mantém acento e caixa. Usado em name de categoria e produto
   generatePrefix src/utils/generate-prefix.ts — usa normalizeText + NFD + strip acento + uppercase + filtra [A-Z0-9 ]. Regra na seção 2.1
   Preço Armazenado em centavos (priceInCents: Int?)
   Product.priceInCents Último preço de compra (cache). Atualizado em toda ENTRADA com preço > 0. NÃO é histórico — histórico fica em Movement.unitPriceInCents
   Product.avgPriceInCents Média ponderada móvel do custo em estoque. Atualizada só em ENTRADA com preço > 0. Regras na seção 2.3
   Movement.unitPriceInCents Preço unitário daquela movimentação. Só em ENTRADA. Histórico de compras
   Movement.supplier Fornecedor daquela entrada. Só em ENTRADA. Histórico de compras
   priceInCents no backend Opcional (Int?). Backend não valida presença. Frontend da instância (prefeitura) exige no formulário (UX)
   Permissão de criar produto com preço Fase 6: STAFF do Almoxarifado ou MANAGER
   Cores dos gráficos Paleta TS em lib/chart-colors.ts — função getChartColor(index) (light/dark)
   Filtros de URL URL como fonte da verdade — hook lê/escreve
   Paginação Clássica com page numbers + elipse
   Page > totalPages Frontend redireciona pra totalPages via useEffect (implementado)
   Selects (categoria/usuário/setor) Escolha singular (uma por vez) — não multi-select
   Booleanos isLowStock / isExpiring / isExpired — toggle liga/desliga (vira undefined ao desligar)
   hasExpiryDate Tri-state — [Todos][Com validade][Sem validade] (segmented control)
   Range de quantidade Duas caixas type="number" com no-spinner, validação min <= max
   Search (debounce) Escreve com replace: true — não polui histórico com cada tecla
   Filtros (clicks) Escrevem com replace: false — usuário pode "voltar" um filtro
   setLimit Escreve com replace: true — é preferência, não navegação
   Selects com sentinela **all** pra "todos" — Base UI não aceita value=""
   /options de categoria GET /admin/categories/options → { label, value, prefix }[]
   /options de usuário GET /admin/users/options → { label, value, isActive }[]
   /options de usuário (auth) STAFF + MANAGER (só exige authenticate, não isManager)
   /options de usuário (filtro) Só usuários que criaram ≥ 1 produto (inclui desativados)
   /options de setor (Fase 6) GET /admin/sectors/options → { label, value, isWarehouse }[] (STAFF + MANAGER)
   UserSelect Agrupa Ativos / Desativados com <SelectGroup> + <SelectLabel>
   Controllers Todos em controllers/admin/ — inclusive userController (refatorado)
   imageUrl em produto Enviado no createProduct/updateProduct (com .trim() || null)
   Botões condicionais (categoria) isManager || isCreator — menu ⋯ some se o usuário não pode modificar
   Badge "Criado por você" Verde, só pro STAFF criador (isCreator && !isManager)
   Deletar categoria Item desabilitado quando \_count.products > 0 (tooltip nativo via title=)
   Modal único de categoria CategoryFormDialog cria e edita — controlado por category: Category | null
   Cache de options de categoria removeQueries (não só invalidateQueries) após writes — useCategories.ts usa staleTime: 5min
   Envelope no frontend Service retorna payload (nunca envelope). Tipo de envelope é local ao service
   /stock — filtros categoryId, location, supplier na URL (URL como fonte da verdade)
   /stock — limit Fixo em 10 no backend, sem UI. Sem paginação
   /stock — gráficos Clicáveis — clique aplica filtro na URL (Fase 4.5)
   /stock — match exato Input de texto = contains; clique de gráfico = equals (via locationExact/supplierExact)
   /stock — filtros ortogonais Clicar num gráfico não limpa filtros dos outros gráficos
   /stock — destaque visual Item filtrado fica opaco (1); os outros caem pra 0.35. Só pra clique (Exact=true)
   /stock — links "Ver todos" Todos os 4 (Estoque baixo, Vencendo, Vencidos, Sem estoque)
   StockAlertProduct Tipo único pros 4 arrays de details (shape uniforme: 10 campos)
   productsExpired Adicionado ao getStockMetrics (backend) + tipo StockAlertProduct
   asChild (Base UI) Não usar. Trocar por buttonVariants + <Link> ou render prop
   maxQuantity=0 = "sem estoque" Sem filtro dedicado isOutOfStock — maxQuantity=0 cobre (Opção A travada)
   /products — isExpired Filtro existe (backend + frontend); sem toggle UI por ora (só via link de /stock)
   /products — isExpired=false Backend ignora (=== "true" apenas) — contrato consistente com isExpiring/isLowStock
   Helpers de query params Compartilhados em lib/query-params-helpers.ts — getString, getNumber, getBoolean, getBooleanTrueOnly, clamp
   Helpers específicos de produto getSortBy/getSortOrder ficam em product-query-params.ts (dependem de tipos de produto)
   getString sem trim no retorno Comportamento intencional — só valida vazio, preserva valor cru
   ProductCategorySelect Select do form de produto — sem sentinela **all**, escolha obrigatória. Separado do CategorySelect de filtro
   ProductForm — modo create/edit Reusa o mesmo componente. sku/barcode/avgPriceInCents read-only em edit; quantity editável com aviso de AJUSTE manual
   ProductForm — reset de state Sem useEffect + form.reset. Usar key={product.id} no ponto de uso (regra react-hooks/set-state-in-effect)
   CreateMovementDialog — botões Dois pontos de abertura: header de /products/:id e aba Movimentações (UX)
   CreateMovementDialog — campos type, quantity, reason + unitPriceInCents/supplier só em ENTRADA
   CreateMovementDialog — bipagem NÃO tem campo de bipagem em /products/:id. A bipagem vive em /movements (Fase 6), no CreateTransferDialog.
   CreateMovementDialog — ENTRADA (Fase 6) Só STAFF do Almoxarifado ou MANAGER dá ENTRADA. SAIDA/AJUSTE qualquer setor faz no próprio estoque (que é o do Almoxarifado).
   Deletar produto DeleteProductDialog avisa que histórico + movimentações serão apagados (hard delete no backend)
   Toaster <Toaster richColors position="top-right" /> montado no RootLayout. Toasts de sucesso/erro em todos os mutations
   useAuth import { useAuth } from "@/contexts/AuthContext" → { user } com user.role (STAFF/MANAGER), user.id, user.sectorId e user.sector (Fase 6)
   Permissão de editar produto canEdit = isManager || isCreator — menu ⋯ controla Editar/Deletar. STAFF só edita/deleta o que criou
   tsconfig.json — baseUrl DEPRECATED no TS 6/7 — erro TS5101 não é bloqueador. Migrar pra paths sem baseUrl na Fase 9 (opcional)
   Tipos de erro no frontend err: unknown + getApiErrorMessage/getApiErrorCode de lib/api-error.ts. Nunca err: any
   Product.quantity (Fase 6) Permanece coluna (Int @default(0)) — representa o estoque do Almoxarifado. StockBySector NÃO existe.
   Almoxarifado = ponto 0 Único setor com estoque. Os outros setores só pedem (PurchaseRequest) e confirmam recebimento (Transfer).
   Sector.isWarehouse (Fase 6) Boolean, exatamente 1 setor true no sistema (Almoxarifado). Imutável após criação. Não pode ser deletado.
   User.sectorId (Fase 6) Obrigatório desde a Fase 6 (banco dropado e recriado; seed cria setores primeiro).
   /requests e /movements (Fase 6) Ambas filtram por setor do user desde já. Filtros por setor no dashboard (/stock, /dashboard) e /users entram na Fase 7 e 7.5.
   TransferStatus (Fase 6) Enum final: PENDENTE | CONCLUIDO | CANCELADO | RECUSADO (era REJEITADO; trocado por RECUSADO).
   Transfer (Fase 6) Fluxo completo — criar (PENDENTE) → confirmar (CONCLUIDO) / recusar (RECUSADO) / cancelar (CANCELADO), com devolução de estoque ao Almoxarifado.
   Transfer = remessa com N produtos Não é 1 produto. Transfer (header) + TransferItem (N produtos). /movements lista remessas, não Movement avulso.
   Transfer — 1:N com PurchaseRequest N remessas por pedido. O pedido vira ATENDIDO só quando o Almoxarifado finaliza manualmente, com a trava: nenhuma remessa vinculada pode estar PENDENTE.
   Transfer — criação Só STAFF do Almoxarifado ou MANAGER. fromSectorId forçado no backend = Almoxarifado (não confia no payload). Debita Product.quantity.
   Transfer — confirmação Quem confirma é o destino (cozinha). Ao confirmar, Transfer.status = CONCLUIDO e Movement.status = CONCLUIDO. Nada muda no estoque (já saiu na criação).
   Transfer — recusa Quem recusa é o destino (cozinha). Devolve estoque ao Almoxarifado (Product.quantity += qtd). Movement.status = CANCELADO. Pedido vinculado não fecha. Rota: PATCH /transfers/:id/refuse.
   Transfer — cancelamento Só enquanto PENDENTE, por qualquer STAFF do Almoxarifado (setor fromSectorId) ou MANAGER. Exige cancelReason obrigatório. Devolve estoque. Movement.status = CANCELADO. Rota: PATCH /transfers/:id/cancel.
   Transfer — depois de CONCLUIDO/RECUSADO Ninguém cancela (estado final). Se precisar desfazer, o Almoxarifado faz movimentação manual de ENTRADA ou cria nova remessa.
   Transfer — Movement.quantity Em TRANSFERENCIA, Movement.quantity é negativo (saída do Almoxarifado), consistente com SAIDA. Relatórios R2 somam Math.abs().
   PurchaseRequest (Fase 6) Novo módulo. Setor comum cria pedido com itens cadastrados + notes (textarea livre). Almoxarifado atende via N Transfer, recusa com motivo, ou ignora.
   PurchaseRequest — status PENDENTE → EM_ATENDIMENTO (1+ Transfer criada) → ATENDIDO (finalizado manualmente, com trava) / RECUSADO (Almoxarifado, motivo obrigatório) / CANCELADO (setor criador).
   PurchaseRequest — item extra NÃO existe PurchaseRequestItem com productId: null. Itens não cadastrados vão no notes (textarea) do header. O Almoxarifado lê e adiciona produto manualmente na remessa.
   PurchaseRequest — recusa Final (não reabre). refusalReason obrigatório. A cozinha cria pedido novo se ainda precisar. Rota: PATCH /purchase-requests/:id/refuse.
   PurchaseRequest — cancelamento Só setor criador (ou MANAGER). Diferente de RECUSADO (que é do Almoxarifado). Encerra na hora → CANCELADO. Rota: PATCH /purchase-requests/:id/cancel.
   PurchaseRequest — finalização Manual (Almoxarifado clica "Finalizar"). Regra X: nenhuma Transfer vinculada pode estar PENDENTE. CONCLUIDO/RECUSADO/CANCELADO não bloqueiam.
   PurchaseRequest — finalizeNote Novo campo String?. Obrigatório no payload do finalize somente quando existir Transfer vinculada com status RECUSADO ou CANCELADO, OU quando a soma enviada (Transfers CONCLUIDO) for menor que a soma pedida (PurchaseRequestItem.quantity). Opcional no caminho feliz (todas CONCLUIDO e entrega completa).
   PurchaseRequest — visibilidade Setor comum vê só os do próprio setor. Almoxarifado vê todos. MANAGER vê todos.
   PurchaseRequest — catálogo GET /admin/purchase-requests/catalog → produtos do Almoxarifado sem quantity, com isOutOfStock (baseado no estoque do Almoxarifado). Permite pedir esgotado.
   Seed de setores (Fase 6) Almoxarifado (isWarehouse: true), Cozinha, Escola.
   Seed de usuários (Fase 6) MANAGER master (no Almoxarifado), STAFF do Almoxarifado, STAFF da Cozinha, STAFF da Escola.
   Seed de dados (Fase 6) 1 PurchaseRequest PENDENTE da Cozinha + 1 Transfer do Almoxarifado pra Cozinha (independentes, sem vínculo).
   /movements (Fase 6) Página de ação — bipagem + CreateTransferDialog + lista de Transfer. Diferente de /history (consulta).
   /requests (Fase 6) Página de pedidos — lista em tabs por status + CreatePurchaseRequestDialog + detalhe + ações.
   /movements — botão "Nova remessa" Só Almoxarifado/MANAGER. STAFF de outro setor não vê.
   /movements — lista de Transfer Filtrada por setor do user. Almoxarifado vê todas; outros setores veem só as endereçadas a eles. MANAGER vê todas.
   /requests — lista Filtrada por setor do user. Almoxarifado vê todas; outros setores veem só as do seu setor.
   /movements e /requests — filtros na URL URL como fonte da verdade. transfer-query-params.ts e purchase-request-query-params.ts + hooks useTransferQueryParams/usePurchaseRequestQueryParams. Tab de status em /requests também vai pra URL (?status=...).
   Bipagem no CreateTransferDialog Enter (leitor físico + digitação manual). Sem debounce automático.
   /requests vs /movements Telas separadas. Botão "criar remessa para esse pedido" leva de uma pra outra com vínculo. Dois caminhos coexistem (atalho + caminho normal).
   UX RequestDetailsDialog Barra de status resumida no topo: PENDENTE "Aguardando o Almoxarifado" / EM_ATENDIMENTO "X remessa(s) — Y confirmada(s), Z pendente(s), W recusada(s)" / ATENDIDO "Atendido em dd/mm/aaaa" / RECUSADO "Recusado: {refusalReason}" / CANCELADO "Cancelado pelo setor em dd/mm/aaaa".
   Notification (Fase 8) Tabela + endpoint GET /admin/notifications criados na Fase 8, junto com Socket.io (sino de notificações).
   /history (Fase 6.5) Página de consulta — lista global de Movement + Transfer com filtros, paginação e detalhe ao clicar. Feita numa fase só (Movement + Transfer juntos).
   R1 — /reports/requests (Fase 6.5) Auditoria de pedidos por setor (tabs por status, período mensal), comparativo pedido × enviado, imprimível via window.print(). Só Almoxarifado + MANAGER.
   R2 — /reports/consumption (Fase 6.5) Consumo por setor (= remessas CONCLUIDO), recomendações de compra, itens prioritários por frequência. Visão global + por setor. Só Almoxarifado + MANAGER.
   R2 — "consumo" O que o setor recebeu (remessa CONCLUIDO). O que a cozinha recebeu, ela vai usar.
   R2 — "prioridade" Itens com alta frequência (≥80% dos meses) e/ou alto volume. Badge "Prioridade".
   Upload de imagem (Fase 6.75) UploadThing (plano gratuito 2 GB). Compressão no frontend com browser-image-compression antes do upload. Product.imageUrl continua String? — nada muda no schema.
   Neon Object Storage (alternativa) Documentado como alternativa (5 GB, integrado ao Neon, em beta, exige config S3). Não implementar agora.
   Campo de colar URL de imagem (Fase 6.75) Continua existindo no ProductForm como fallback. Upload e URL escrevem no mesmo imageUrl.
   Imagem só em produto Categorias, setores, usuários, pedidos e remessas não têm imagem.
   Limpeza de imagem órfã (Fase 6.75) Não fazer na Fase 6.75. Documentar como pendência (Fase 9 ou futura).
   Socket.io (Fase 8) socket.io (servidor) + socket.io-client (frontend). Auth via JWT. Salas user:{id} e sector:{id}.
   Socket.io — eventos (Fase 8) stock:alert:created/resolved, transfer:confirmed/refused, purchase-request:created/refused.
   "Vencendo em 7 dias" vs "30 dias" (Fase 8) Calculado no frontend (StockAlertProduct.expiryDate já existe; frontend filtra por <7, <30). Sem mudança no backend.
   /alerts (Fase 8) Consome GET /admin/dashboard/alerts (já existe) + PATCH /admin/alerts/:id/resolve (já existe) + GET /admin/alerts/count (novo, pro badge).
   Usuários não são deletados (Fase 7.5) Só inativados (manter histórico). MANAGER não pode se auto-rebaixar. /users sem paginação (volume baixo).
   2.1 Regra de geração de prefix (travada em 21/10/2026)
   Normalização: normalizeText (trim + colapso de espaços) + NFD + remove acento + uppercase + filtra [A-Z0-9 ] + trim.

1 palavra: 3 primeiras letras. Padding X se < 3 chars (Ar → ARX).

2+ palavras: 3 primeiras da 1ª palavra + 1ª letra da 2ª palavra (Bebidas Alcoólicas → BEBA).

Colisão (ordem de criação define quem fica com a base):

1ª tentativa: 4ª letra da 1ª palavra, se existir (Chaves colide com CHA → CHAV).

2ª tentativa em diante: sufixo numérico (BEBA1, BEBA2, ...).

Prefixo é imutável após criação. Editar nome da categoria não muda prefix nem counter.

Exemplos:

Bebidas → BEB

Bebidas Alcoólicas → BEBA (com BEB já existente)

Chá → CHA

Chaves (com CHA já existente) → CHAV

Água → AGU

123 Teste → 123T

2.2 Regras de createProduct + Movement de entrada inicial (travadas em 21/10/2026)
createProduct cria Product + Movement de ENTRADA inicial em transação (Forma B).

Só cria o Movement se quantity > 0.

Movement.unitPriceInCents = data.priceInCents (se informado), Movement.supplier = data.supplier (se informado).

Movement.reason = "Entrada inicial (criação do produto)".

Movement.status = CONCLUIDO.

StockHistory inicial vincula ao Movement (movementId).

Não dispara checkStockAlerts de novo (o createProduct já chama uma vez no fim).

Motivo: sem o Movement de entrada inicial, o dashboard mostra o Almoxarifado só fazendo SAÍDA.

Product.avgPriceInCents = data.priceInCents na criação (primeira entrada; média = preço da primeira entrada). Se priceInCents for null, avgPriceInCents fica null.

Fase 6: createProduct não muda (o estoque é do Almoxarifado, Product.quantity continua). Só o createdById precisa ser do Almoxarifado (validação de permissão).

2.3 Regras de média de preço (avgPriceInCents) — travadas em 21/10/2026
Product.priceInCents = último preço de compra (cache). Atualizado em toda ENTRADA com preço > 0.

Product.avgPriceInCents = média ponderada móvel do custo em estoque.

createMovement de ENTRADA recalcula avgPriceInCents se e somente se unitPriceInCents > 0:
novaMedia = (estoqueAtual _ mediaAtual + qtdEntrada _ precoEntrada) / (estoqueAtual + qtdEntrada)

Opção C (travada em 21/10/2026): unitPriceInCents = 0 também não sobrescreve Product.priceInCents (cache). O Movement registra unitPriceInCents: 0 (histórico), mas o cache priceInCents/supplier só atualiza com unitPriceInCents > 0.

estoqueAtual = Product.quantity antes da entrada.

mediaAtual = product.avgPriceInCents (se null, trata como precoEntrada).

Regra MYOB (padrão de mercado): ENTRADA com unitPriceInCents = null ou 0 NÃO recalcula a média. Mantém a média anterior. Quantidade aumenta, custo total não dilui. Isso evita que doações/entradas sem custo puxem a média pra baixo.

SAIDA / AJUSTE / TRANSFERENCIA NÃO alteram avgPriceInCents (só quantidade).

updateProduct.priceInCents NÃO altera avgPriceInCents. Se precisar de correção manual da média, endpoint específico na Fase 8+.

createMovement de ENTRADA atualiza Product.priceInCents (último preço) e Product.supplier (último fornecedor) — somente se unitPriceInCents/supplier forem informados.

TRANSFERENCIA herda unitPriceInCents de Product.avgPriceInCents no momento (não do último preço).

2.4 Regras de setores + pedidos + remessas (Fase 6 — decisões travadas em 28/10/2026)
Almoxarifado = ponto 0 único. Só ele tem estoque (Product.quantity). Os outros setores pedem e confirmam recebimento, mas não gerenciam estoque.

Sector.isWarehouse: boolean, exatamente 1 setor true no sistema. Imutável após criação. Não pode ser deletado. Validado no sectorService.

StockBySector: ❌ NÃO EXISTE. Product.quantity continua coluna (Int @default(0)).

StockAlert.sectorId: ❌ NÃO EXISTE. Alerta é por produto (global), como hoje.

User.sectorId: obrigatório. Banco dropado e recriado; seed cria setores antes.

Movement.fromSectorId / toSectorId / transferId: FK nullable. Só TRANSFERENCIA preenche fromSectorId (Almoxarifado) e toSectorId (destino). transferId vincula ao Transfer.

Fluxo de transferência (remessa):

Criar (POST /admin/transfers): só STAFF do Almoxarifado ou MANAGER. fromSectorId forçado no backend = Almoxarifado. Debita Product.quantity de cada item. Cria 1 Transfer (PENDENTE) + N TransferItem + N Movement de TRANSFERENCIA (PENDENTE, quantity negativo) + N StockHistory. Tudo em transação atômica. Depois do commit, dispara checkStockAlerts pra cada produto.

Confirmar (PATCH /transfers/:id/confirm): só STAFF do destino ou MANAGER. Transfer.status = CONCLUIDO; Movement.status = CONCLUIDO. Nada muda no estoque (já saiu).

Recusar (PATCH /transfers/:id/refuse): só STAFF do destino ou MANAGER. Transfer.status = RECUSADO; Movement.status = CANCELADO. Devolve estoque ao Almoxarifado (Product.quantity += qtd) + N StockHistory de devolução. Re-checa checkStockAlerts. Pedido vinculado não fecha.

Cancelar (PATCH /transfers/:id/cancel): só STAFF do Almoxarifado (qualquer um do setor) ou MANAGER, enquanto PENDENTE. cancelReason obrigatório (auditoria). Transfer.status = CANCELADO; Movement.status = CANCELADO. Devolve estoque + N StockHistory. Re-checa checkStockAlerts.

Depois de CONCLUIDO/RECUSADO: ninguém cancela (estado final). Se precisar desfazer, movimentação manual de ENTRADA ou nova remessa.

PurchaseRequest (pedido):

Criar (POST /admin/purchase-requests): STAFF do setor (não-Almoxarifado) ou MANAGER. Itens = produtos cadastrados, sem item estruturado pra não-cadastrado (vai no notes, textarea).

Status: PENDENTE → EM_ATENDIMENTO (1+ Transfer criada) → ATENDIDO (finalizado manualmente com trava) / RECUSADO (Almoxarifado, refusalReason obrigatório) / CANCELADO (setor criador).

Cancelar (PATCH /purchase-requests/:id/cancel): só setor criador ou MANAGER. Encerra na hora → CANCELADO.

Recusar (PATCH /purchase-requests/:id/refuse): só Almoxarifado (STAFF) ou MANAGER. refusalReason obrigatório. Final (não reabre). Fica no banco pra auditoria.

Finalizar (PATCH /purchase-requests/:id/finalize): só Almoxarifado (STAFF) ou MANAGER. Regra X: nenhuma Transfer vinculada pode estar PENDENTE. CONCLUIDO/RECUSADO/CANCELADO não bloqueiam. Se existir Transfer RECUSADO ou CANCELADO vinculada OU a soma enviada (Transfers CONCLUIDO) for menor que a soma pedida → finalizeNote obrigatório. Caminho feliz → finalizeNote opcional.

1:N com Transfer: N remessas por pedido. O pedido vira ATENDIDO só quando o Almoxarifado finaliza manualmente, com a trava.

Catálogo pra pedido (GET /admin/purchase-requests/catalog): produtos do Almoxarifado sem quantity, com isOutOfStock (baseado no estoque do Almoxarifado). Permite pedir esgotado.

Visibilidade:

/requests: setor comum vê só os do próprio setor; Almoxarifado e MANAGER veem todos.

/movements: setor comum vê só as Transfer endereçadas a ele; Almoxarifado e MANAGER veem todas.

Bipagem: vive em /movements (via CreateTransferDialog, Enter). Não existe em /products/:id.

Filtros de /movements e /requests: na URL (fonte da verdade). Tab de status em /requests também na URL.

Notification: tabela + GET /admin/notifications na Fase 8 (junto com Socket.io). Não criar agora.

Seed: Almoxarifado (isWarehouse: true, MANAGER master + STAFF), Cozinha (STAFF), Escola (STAFF). 1 PurchaseRequest PENDENTE + 1 Transfer de exemplo (independentes, sem vínculo).

Relatórios R1 e R2: Fase 6.5. Modelo de dados já fica pronto na Fase 6.

3. Modelos Prisma principais (estado após Fase 6 — já aplicado)
   Enums
   Role: STAFF, MANAGER

MovementType: ENTRADA, SAIDA, AJUSTE, TRANSFERENCIA

MovementStatus: PENDENTE, CONCLUIDO, CANCELADO

TransferStatus: PENDENTE, CONCLUIDO, CANCELADO, RECUSADO

PurchaseRequestStatus: PENDENTE, EM_ATENDIMENTO, ATENDIDO, RECUSADO, CANCELADO

Modelos
Sector — id, name (unique), description?, isWarehouse Boolean @default(false), isActive Boolean @default(true), createdAt, updatedAt. Relações: users, movementsFrom, movementsTo, transfersFrom, transfersTo, purchaseRequests.

Transfer — id, fromSectorId, toSectorId, purchaseRequestId?, status, reason?, cancelReason?, createdById, confirmedById?, refusedById?, cancelledById?, createdAt, updatedAt, confirmedAt?, refusedAt?, cancelledAt?. Relações: fromSector, toSector, purchaseRequest, createdBy, confirmedBy, refusedBy, cancelledBy, items, movements. Índices: fromSectorId, toSectorId, purchaseRequestId, status, createdAt.

TransferItem — id, transferId, productId, quantity. Relações: transfer (Cascade), product (Restrict).

PurchaseRequest — id, sectorId, status, notes?, refusalReason?, finalizeNote?, createdById, finalizedById?, refusedById?, createdAt, updatedAt, finalizedAt?, refusedAt?. Relações: sector, createdBy, finalizedBy, refusedBy, items, transfers. Índices: sectorId, status, createdAt.

PurchaseRequestItem — id, requestId, productId, quantity. Relações: request (Cascade), product (Restrict).

User — + sectorId String (obrigatório) + relação sector. Relações novas: createdTransfers, confirmedTransfers, refusedTransfers, cancelledTransfers, createdRequests, finalizedRequests, refusedRequests, resolvedAlerts.

Product — + relações requestItems, transferItems. quantity continua coluna (Int @default(0)).

Movement — + fromSectorId?, toSectorId?, transferId? + relações fromSector, toSector, transfer. quantity em TRANSFERENCIA é negativo.

StockAlert — resolvedById String? + relação resolvedBy User? @relation("AlertResolvedBy", ...) (antes era resolvedBy String? solto).

4. Endpoints ativos (atualizado pós-Fase 6 backend)
   Produtos

POST /admin/products — criar (STAFF do Almoxarifado + MANAGER). Gera SKU + aloca barcode + cria Movement de ENTRADA inicial.

GET /admin/products — listar com filtros + paginação.

GET /admin/products/:id — detalhe.

GET /admin/products/sku/:sku — por SKU.

GET /admin/products/barcode/next — preview do próximo barcode (não aloca).

GET /admin/products/barcode/:barcode — busca por barcode (habilita bipagem).

PATCH /admin/products/:id — atualizar.

DELETE /admin/products/:id — deletar (hard delete).

POST /admin/products/:id/movements — criar movimentação. ENTRADA só STAFF do Almoxarifado ou MANAGER. SAIDA/AJUSTE qualquer setor.

GET /admin/products/:id/movements — listar movimentações.

GET /admin/products/:id/history — histórico.

Setores (Fase 6 — novos)

GET /admin/sectors — listar (STAFF + MANAGER).

POST /admin/sectors — criar (MANAGER). Bloqueia isWarehouse: true duplicado.

PATCH /admin/sectors/:id — editar (MANAGER). isWarehouse é imutável (rejeita no controller se vier no payload).

DELETE /admin/sectors/:id — deletar (MANAGER, Restrict). Bloqueia se isWarehouse: true ou se tiver users/transfers/purchaseRequests.

GET /admin/sectors/options — { label, value, isWarehouse }[] (STAFF + MANAGER). Só ativos.

Transferências (Fase 6 — novos)

POST /admin/transfers — criar remessa (PENDENTE). Só STAFF do Almoxarifado ou MANAGER. fromSectorId forçado = Almoxarifado. Debita Product.quantity, cria N Movement de TRANSFERENCIA (quantity negativo). Aceita purchaseRequestId?.

GET /admin/transfers — listar (filtros: status, fromSectorId, toSectorId, purchaseRequestId, createdById, período, paginação). Filtrado por setor do user.

GET /admin/transfers/:id — detalhe (itens + timeline).

PATCH /admin/transfers/:id/confirm — confirmar (CONCLUIDO). Só STAFF do destino ou MANAGER.

PATCH /admin/transfers/:id/refuse — recusar (RECUSADO), devolve estoque. Só STAFF do destino ou MANAGER.

PATCH /admin/transfers/:id/cancel — cancelar (CANCELADO) enquanto PENDENTE, devolve estoque. Só STAFF do Almoxarifado ou MANAGER. cancelReason obrigatório.

Pedidos (Fase 6 — novos)

POST /admin/purchase-requests — criar pedido (PENDENTE). STAFF do setor (não-Almoxarifado) ou MANAGER. items + notes?.

GET /admin/purchase-requests — listar (filtros: sectorId, status, período, paginação). Filtrado por setor do user.

GET /admin/purchase-requests/:id — detalhe (itens + remessas vinculadas + timeline).

PATCH /admin/purchase-requests/:id/refuse — recusar (RECUSADO). Só Almoxarifado ou MANAGER. refusalReason obrigatório.

PATCH /admin/purchase-requests/:id/finalize — finalizar (ATENDIDO). Só Almoxarifado ou MANAGER. Trava: nenhuma Transfer PENDENTE. finalizeNote obrigatório se houver Transfer RECUSADO/CANCELADO ou entrega incompleta.

PATCH /admin/purchase-requests/:id/cancel — cancelar (CANCELADO). Só setor criador ou MANAGER.

GET /admin/purchase-requests/catalog — catálogo pro setor escolher. Produtos do Almoxarifado sem quantity, com isOutOfStock.

Movimentações globais (Fase 6 — novo)

GET /admin/movements — lista global paginada (filtros: type, status, createdById, productId, dateFrom, dateTo, search, page, limit, sortBy, sortOrder default createdAt desc). Preparatório pra /history da 6.5.

Categorias

GET /admin/categories — listar.

POST /admin/categories — criar.

PATCH /admin/categories/:id — editar.

DELETE /admin/categories/:id — deletar.

GET /admin/categories/options — { label, value, prefix }[].

Usuários

GET /admin/users — listar (MANAGER). Inclui sectorId + sector.

POST /admin/users — criar (MANAGER). Exige sectorId.

GET /admin/users/:id — detalhe (MANAGER).

PATCH /admin/users/:id/status — ativar/desativar (MANAGER).

PATCH /admin/users/:id/role — atualizar role (MANAGER).

PATCH /admin/users/:id/sector — atualizar setor (MANAGER).

DELETE /admin/users/:id — deletar (MANAGER). Frontend não usa.

GET /admin/users/options — { label, value, isActive }[] (STAFF + MANAGER).

Dashboard

GET /admin/dashboard/overview — home. Bug categoryAlertMap corrigido.

GET /admin/dashboard/stock — métricas de estoque. Repasse de locationExact/supplierExact corrigido.

GET /admin/dashboard/activity — atividades.

GET /admin/dashboard/alerts — alertas. Bug categoryAlertMap (TDZ) corrigido.

Outros

GET /admin/stock/summary

PATCH /admin/alerts/:id/resolve

5. Filtros suportados em /admin/products
   Param Tipo Notas
   search string Busca em nome/SKU/descrição — ignora acento e caixa (unaccent)
   categoryId cuid FK
   minQuantity number Range direto em Product.quantity
   maxQuantity number Range direto em Product.quantity
   hasExpiryDate tri-state "true" / "false" / ausente
   isExpiring boolean Só "true"
   isLowStock boolean Só "true" — quantity <= minStock
   isExpired boolean Só "true" — expiryDate < now
   createdById cuid FK pra User
   page number default 1
   limit number default 10, max 100
   sortBy enum createdAt / updatedAt / name / quantity / expiryDate
   sortOrder enum asc / desc
6. Filtros suportados em /admin/dashboard/stock
   Param Tipo Notas
   categoryId cuid FK. Nome do param é categoryId, não category
   location string contains + insensitive (default); equals quando locationExact=true
   locationExact boolean Só "true". Modificador
   supplier string idem location
   supplierExact boolean idem locationExact
   limit number default 10, aplicado por seção de details (não global)
   sectorId cuid Fase 7 — filtro por setor (dashboard)
7. Fases concluídas — resumo executivo
   Fase 1 — URL como fonte da verdade ✅
   Filtros e paginação de /products na URL. Arquivos: product-query-params.ts, useProductQueryParams.ts, ProductsPage.tsx, TableProducts.tsx, ProductPagination.tsx, product-status.ts, currency.ts, chart-colors.ts.

Fase 2 — UI dos filtros ✅
ProductFilters.tsx, SearchInput.tsx, BooleanToggle.tsx, TriStateToggle.tsx, CategorySelect.tsx, UserSelect.tsx, NumberRangeFilter.tsx, ActiveFiltersBadges.tsx, useDebounce.ts, useCategories.ts, useUsers.ts, filter-metadata.ts.

Fase 3 — CRUD de categorias ✅
CategoriesPage.tsx, TableCategories.tsx, CategoryFormDialog.tsx, DeleteCategoryDialog.tsx, useCategoriesList.ts, format-date.ts.

Fase 4 — Página /stock ✅
StockPage.tsx, StockSummaryCards.tsx, StockDistributionCharts.tsx, StockAlertSection.tsx, StockAlertsSections.tsx, StockFilters.tsx, stock-query-params.ts, useStockQueryParams.ts, stock.ts (service), useStockMetrics.ts.

Fase 4.5 — Polish de /stock ✅
StockDistributionCharts.tsx (cliques), query-params-helpers.ts (NOVO), stock-query-params.ts, product-query-params.ts, StockAlertsSections.tsx.

Fase 4.5.1 — Prefix de categoria + counters + normalize ✅ (21/10/2026)
Arquivos novos: src/utils/generate-prefix.ts, src/utils/validation.ts (normalizeText), src/types/category.types.ts.

Fase 5 + 4.6 (backend) — SKU + barcode + preço/média ✅ (21/10/2026)
Schema: Product.sku obrigatório; Product.barcode (@unique); Product.avgPriceInCents; Movement.unitPriceInCents + Movement.supplier.

Fase 5 + 4.6 (frontend) — /products/new + /products/:id + JsBarcode + modal + impressão ✅ (27/10/2026)
Arquivos novos (frontend): src/lib/api-error.ts, src/styles/print.css, src/hooks/useProduct.ts, src/hooks/useProductMutations.ts, src/hooks/useBarcodePreview.ts, src/hooks/useProductHistory.ts, src/hooks/useProductMovements.ts, src/components/products/ProductCategorySelect.tsx, src/components/products/Barcode.tsx, src/components/products/BarcodeField.tsx, src/components/products/ProductForm.tsx, src/components/products/ProductCreatedDialog.tsx, src/components/products/LabelPrintDialog.tsx, src/components/products/ProductDetailHeader.tsx, src/components/products/ProductDetailsTab.tsx, src/components/products/ProductMovementsTab.tsx, src/components/products/ProductHistoryTab.tsx, src/components/products/CreateMovementDialog.tsx, src/components/products/EditProductDialog.tsx, src/components/products/DeleteProductDialog.tsx, src/pages/ProductNewPage.tsx, src/pages/ProductDetailPage.tsx.

Fase 6 (backend) — Setores + Pedidos + Remessas ✅ (28/10/2026)

Schema novo: Sector, Transfer, TransferItem, PurchaseRequest, PurchaseRequestItem, enums TransferStatus e PurchaseRequestStatus, User.sectorId obrigatório, Movement.fromSectorId/toSectorId/transferId, StockAlert.resolvedById (relação FK).

Migração aplicada: fase6_sectors_transfers_purchase_requests.

Seed reescrito: 3 setores (Almoxarifado, Cozinha, Escola), 4 usuários (MANAGER + 3 STAFF, um por setor), 6 categorias, 10 produtos, 1 PurchaseRequest PENDENTE (Cozinha), 1 Transfer PENDENTE (Almoxarifado → Cozinha) com StockHistory vinculado.

Arquivos novos (backend):

src/services/admin/sectorService.ts — CRUD + validação isWarehouse único/imutável/não deletável + getAlmoxarifadoId() (cache em memória) + getSectorOptions

src/services/admin/transferService.ts — create/confirm/refuse/cancel (transação atômica, fromSectorId forçado, checkStockAlerts em TRANSFERENCIA) + list + getById

src/services/admin/purchaseRequestService.ts — create/list/getById/refuse/finalize/cancel + getCatalog (finalizeNote condicional com regras 3a e 3b)

src/services/admin/movementService.ts — listMovements global (preparatório 6.5)

src/controllers/admin/sectorController.ts — inclui IMMUTABLE_FIELD do isWarehouse (Opção A)

src/controllers/admin/transferController.ts

src/controllers/admin/purchaseRequestController.ts

src/controllers/admin/movementController.ts

src/routes/admin/sectorRoutes.ts

src/routes/admin/transferRoutes.ts

src/routes/admin/purchaseRequestRoutes.ts

src/routes/admin/movementRoutes.ts

src/types/sector.types.ts

src/types/transfer.types.ts

src/types/purchaseRequest.types.ts

src/types/movement.types.ts

Arquivos alterados (backend):

prisma/schema.prisma — modelos novos + User.sectorId + Movement.fromSectorId/toSectorId/transferId + StockAlert.resolvedById (relação FK)

prisma/seed.ts — reescrito

src/services/admin/productService.ts — createMovement com 4 args (data, userId, userSectorId, userRole) + validação ENTRADA + import do sectorService; resolveAlert com resolvedById

src/services/admin/dashboardService.ts — bug categoryAlertMap (TDZ) corrigido + resolvedById

src/services/admin/userService.ts — createStaffUser com sectorId obrigatório + updateUserSector + sectorId no select de todos

src/controllers/admin/productController.ts — createMovement com sectorId/role + tratamento FORBIDDEN

src/controllers/admin/dashboardController.ts — repasse de locationExact/supplierExact em getStockMetrics

src/controllers/admin/userController.ts — createStaffUser com sectorId + updateUserSector

src/middlewares/auth.ts — sectorId no select + AuthenticatedUser

src/lib/auth.ts — sectorId em additionalFields (required: true)

src/routes/admin/userRoutes.ts — + PATCH /:id/sector

src/routes/index.ts — + 4 routers novos (sector, transfer, purchaseRequest, movement)

src/types/user.types.ts — sectorId em AuthenticatedUser, UserResponse, CreateStaffUserData, BetterAuthUser; + UpdateUserSectorData

src/types/product.types.ts — + fromSectorId/toSectorId/transferId em MovementResponse

Validações: npx tsc --noEmit limpo. Todos os 6 curls de teste retornaram 200 (/sectors, /sectors/options, /transfers, /purchase-requests, /purchase-requests/catalog, /movements). /dashboard/alerts retornando 200 (sem TDZ). /dashboard/stock retornando 200 com filtros funcionando.

8. Fases seguintes — roadmap (pós-28/10/2026)
   Ordem oficial: 6 → 6.5 → 6.75 → 7 → 7.5 → 8 → 9.

Fase 6 — Setores + Pedidos + Remessas (backend ✅ + frontend 🚧 PRÓXIMA)
Backend concluído. Frontend pendente (11 etapas):

Tipos: sectors.types.ts, transfers.types.ts, purchaseRequests.types.ts (novos); products.types.ts (alterar — + fromSectorId/toSectorId/transferId em MovementResponse); auth.types.ts (alterar — + sectorId/sector em User).

Services: sectors.ts, transfers.ts, purchaseRequests.ts, movements.ts (novos).

Hooks: useSectors, useTransfers, useTransfer, useTransferMutations, usePurchaseRequests, usePurchaseRequest, usePurchaseRequestMutations, useProductByBarcode (novos).

Rotas: /movements, /requests (em routes.tsx).

MovementsPage.tsx: campo "Bipar produto" (font-mono), lista de Transfer (filtrada por setor), botão "Nova remessa" (só Almoxarifado/MANAGER).

CreateTransferDialog.tsx: select de destino, bipagem (Enter) + quantidade por item, lista editável (sem duplicar produto), purchaseRequestId? pré-preenchido, aviso visual quando pedido > estoque.

TransferDetailsDialog.tsx: timeline + itens + confirmar/recusar (com motivo) / cancelar (com motivo).

RequestsPage.tsx: tabs por status (URL), lista de pedidos (filtrada por setor), botão "Novo pedido".

CreatePurchaseRequestDialog.tsx: catálogo + quantidade, textarea notes, POST.

RequestDetailsDialog.tsx: barra de status resumida + itens + remessas vinculadas + recusar (motivo) / finalizar (com trava e finalizeNote condicional) / cancelar / criar remessa.

Ajustes: CreateMovementDialog (ENTRADA só Almoxarifado/MANAGER), ProductDetailPage (texto de AJUSTE no setor), Sidebar (links /movements, /requests).

Arquivos novos (frontend, previstos):

src/types/sectors.types.ts

src/types/transfers.types.ts

src/types/purchaseRequests.types.ts

src/services/sectors.ts

src/services/transfers.ts

src/services/purchaseRequests.ts

src/services/movements.ts

src/hooks/useSectors.ts

src/hooks/useTransfers.ts

src/hooks/useTransfer.ts

src/hooks/useTransferMutations.ts

src/hooks/usePurchaseRequests.ts

src/hooks/usePurchaseRequest.ts

src/hooks/usePurchaseRequestMutations.ts

src/hooks/useProductByBarcode.ts

src/lib/transfer-query-params.ts

src/lib/purchase-request-query-params.ts

src/hooks/useTransferQueryParams.ts

src/hooks/usePurchaseRequestQueryParams.ts

src/pages/MovementsPage.tsx

src/pages/RequestsPage.tsx

src/components/transfers/CreateTransferDialog.tsx

src/components/transfers/TransferDetailsDialog.tsx

src/components/requests/CreatePurchaseRequestDialog.tsx

src/components/requests/RequestDetailsDialog.tsx

Arquivos alterados (frontend, previstos):

src/types/products.types.ts — + fromSectorId/toSectorId/transferId em MovementResponse

src/types/auth.types.ts — + sectorId/sector em User

src/contexts/AuthContext.tsx — (provavelmente não muda; já retorna sectorId via getSession)

src/routes.tsx — + /movements e /requests

src/components/layouts/Sidebar.tsx — + links

src/components/products/CreateMovementDialog.tsx — ENTRADA só Almoxarifado/MANAGER

src/pages/ProductDetailPage.tsx — texto de AJUSTE no setor

src/services/products.ts — (provavelmente só tipo, se MovementResponse ganhar campos)

Dependência nova (frontend): npx shadcn@latest add textarea (pro notes/refusalReason/cancelReason/finalizeNote).

Fase 6.5 — Histórico + Relatórios
/history — Movement + Transfer, filtros na URL, paginação, detalhe ao clicar.

/reports/requests (R1) — auditoria de pedidos por setor.

/reports/consumption (R2) — consumo por setor (= remessas CONCLUIDO).

Backend: endpoints de agregação pra R1/R2.

Fase 6.75 — Upload de imagem de produto (UploadThing + compressão no frontend)
UploadThing (plano gratuito 2 GB) + browser-image-compression.

Product.imageUrl continua String?. Campo de colar URL continua como fallback.

Arquivos novos: backend src/lib/uploadthing.ts, src/routes/uploadthing.ts; frontend src/lib/uploadthing.ts, src/components/products/ProductImageField.tsx.

Arquivos alterados: backend src/routes/index.ts + .env; frontend ProductForm.tsx + package.json.

Pendência: deletar imagem órfã no UploadThing (Fase 9 ou futura).

Fase 7 — Dashboard
Filtros por setor (modelo pronto na 6; agora aplicados no dashboard).

Links nos KPIs → /stock já filtrado.

Revisar getAlertsMetrics, getActivityMetrics, getOverview.

KPIs de alerta (consumir GET /admin/dashboard/alerts).

Confirmar layout responsivo.

Fase 7.5 — Página /users (só MANAGER)
Rota /users protegida por ManagerRoutes.

UsersPage.tsx com tabela: nome, email, role, setor, status, lastLogin, createdAt.

Botões: "Novo usuário" (dialog, exige setor), "Mudar role", "Mudar setor", "Ativar/Desativar".

Sem botão "Deletar" (só inativar).

Filtros: role, setor, status, search.

Sem paginação.

Fase 8 — /alerts + Socket.io + badge no header
Backend: GET /admin/alerts/count (novo), Notification (tabela) + GET /admin/notifications, Socket.io (auth JWT, salas user:{id} e sector:{id}).

Eventos: stock:alert:created/resolved, transfer:confirmed/refused, purchase-request:created/refused.

Frontend: /alerts, AlertsPage.tsx, sino de notificações no header com badge, SocketProvider no RootLayout, toast em tempo real.

Fase 9 — Polish geral
Ordenação clicável, breadcrumbs, skeletons, acessibilidade, empty states.

\_\_dirname → import.meta.dirname no vite.config.ts.

tsconfig.json → paths sem baseUrl (silencia TS5101).

Code-splitting com React.lazy() (bundle atual: ~1.4 MB / ~422 KB gzip).

Tooltip no "Deletar" desabilitado (categorias).

Indicador de truncamento nas seções de /stock.

Refatorar CategoriesPage (useState + 2 dialogs → reducer/state).

Refatorar DashboardPage pra usar service próprio em todos os endpoints.

PDF no backend pros relatórios (se necessário).

9. Pendências conhecidas (backlog)
   ☐ Fase 6 — frontend (/movements + /requests) — PRÓXIMA

☐ Fase 6.5 — /history + R1 + R2

☐ Fase 6.75 — Upload de imagem de produto (UploadThing + compressão)

☐ Fase 7 — dashboard (filtros por setor + KPIs de alerta)

☐ Fase 7.5 — /users (só MANAGER)

☐ Fase 8 — /alerts + Socket.io + badge

☐ Fase 9 — polish geral

☐ getActivityMetrics — revisar (confirmar após Fase 6 frontend)

☐ ProductPagination — testar com muitas páginas

☐ Layout final da barra de filtros — testar responsividade mobile

☐ Decidir se haverá página específica por categoria

☐ Substituir title= nativo por Tooltip no item "Deletar" (categorias)

☐ Refatorar useState + 2 dialogs em CategoriesPage

☐ Indicador de truncamento nas seções de /stock (Fase 9)

☐ Refatorar DashboardPage pra usar service próprio em todos os endpoints

☐ Impressão de etiqueta com impressora térmica — hoje sem impressora física

☐ QR Code — descartado por ora

☐ Leitura por webcam — descartada por ora (só leitor físico)

☐ Múltiplos códigos por produto (ex: fardo + unidade) — hoje é 1 barcode por produto

☐ Deletar imagem órfã no UploadThing quando imageUrl muda ou produto é deletado (Fase 9 ou futura)

☐ Migrar pra Neon Object Storage se quiser consolidar no mesmo provedor do banco (futura)

☐ Transformação de imagem no backend (redimensionar/cortar) — futura, se necessário

☐ Fase futura: Supplier como entidade (CNPJ, contato)

☐ Fase futura: Product.salePriceInCents (preço de venda)

☐ Fase futura: relatórios de gasto

☐ Fase futura: PATCH /admin/products/:id/average-cost

☐ Fase 9: migrar tsconfig.json pra paths sem baseUrl

☐ Fase 9: trocar \_\_dirname por import.meta.dirname no vite.config.ts

10. Bugs pré-existentes corrigidos
    Fases 1-2

imageUrl: p.id no getStockMetrics — corrigido

imageUrl: p.id no getOverview — corrigido

flex-wrap no ChartTooltipContent — corrigido

CategoryDonutChart com cor undefined — corrigido

Badge amarelo faltando — corrigido (variant warning)

page=99 mostrando vazio — corrigido (redirect)

where.category no listProducts — corrigido pra where.categoryId

SelectValue mostrando ID em vez de label — corrigido com selectedOption

SelectValue mostrando all — corrigido com fallback

Search não ignorava acento — corrigido com unaccent

imageUrl não salvava em produto — corrigido no createProduct/updateProduct

Fase 3

Seed quebrado pós-migration — prisma generate agora é rodado após mudar schema

Categorias sem createdById — resolvido com migration + seed reordenado

Import de tipos sem type em AuthContext.tsx e Page404.tsx — corrigido (verbatimModuleSyntax)

DashboardOverviewResponse tipado como envelope mas service retornava payload — corrigido

category vs categoryId no /stock — filtro ignorava quando chamado com category

<Cell> descontinuado no Recharts — substituído por fill no dado + chartConfig dinâmico

asChild no Base UI — substituído por buttonVariants + <Link>

Fase 4.5

getAlertsMetrics tratando category como string após migração da Fase 3 — corrigido (chave virou categoryId, output virou { categoryId, categoryName, ... })

Fase 4.5.1

catId sumiu do seed após substituição da seção de categorias — restaurado

Seed não atualizava imageUrl em produtos existentes (porque if (!existing) create pulava) — trocado por upsert

Fase 5 + 4.6 (backend)

Rotas /products/sku/:sku e /products/barcode/:barcode sendo capturadas por /products/:id — corrigido reordenando

ProductCounter vazio (schema recém-migrado sem seed) — upsert no createProduct protege

CategoryCounter.lastNumber desalinhado com SKUs hardcoded do seed — ajuste no fim do seed

Fase 5 + 4.6 (frontend)

CategoryFormDialog com setState síncrono no useEffect (react-hooks/set-state-in-effect) — corrigido com key={formKey} no DialogContent + componente interno

useProductMutations com err: any (ESLint no-explicit-any) — corrigido com err: unknown + getApiErrorMessage

ProductForm com field.value possibly undefined no InputGroupText — corrigido simplificando o schema (z.string() em vez de .optional().or(z.literal("")))

ProductCreatedDialog com onInteractOutside (não existe no Base UI) — removido

Fase 6 (backend)

Bug categoryAlertMap (TDZ) em dashboardService.getAlertsMetrics — corrigido (forEach movido pra depois da declaração + averageResolutionTimeHours calculado de verdade)

dashboardController.getStockMetrics não repassava locationExact/supplierExact — corrigido (2 linhas no service call)

productService.resolveAlert passava resolvedBy: userId (string) — corrigido pra resolvedById: userId (FK)

dashboardService.getAlertsMetrics lia a.resolvedBy (string) — corrigido pra a.resolvedById (FK)

movement.types.ts importava de ../../generated/prisma/enums (2 níveis) — corrigido pra ../generated/prisma/enums (1 nível)

sectorService.updateSector lia data.isWarehouse (que não existe em UpdateSectorData) — corrigido (checagem movida pro controller como Opção A)

SignUpEmail falhava porque User.sectorId é NOT NULL e additionalFields não passava — corrigido (sectorId obrigatório em additionalFields + seed passa sectorId no signUpEmail)

productController.createMovement chamava productService.createMovement com 2 args (agora 4) — corrigido

11. Comandos úteis
    Backend

Dev: npm run dev

Prisma — fluxo correto após editar schema.prisma:

npx prisma migrate dev --name <nome>

npx prisma generate

npx prisma db seed

Reset completo (dropa tudo + migration + seed): npx prisma migrate reset --force

Só dropar dados, manter schema:

npx prisma db execute --file .\truncate.sql

npx prisma db seed

Prisma Studio: npx prisma studio

Matar servidor (Windows): Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

Frontend

Dev: npm run dev

Type-check + build (validação real): npm run build

Só type-check (rápido): npx tsc --noEmit

shadcn: npx shadcn@latest add <componente>

Procurar asChild no projeto (Base UI não suporta): Select-String -Path "src\*\*\*.tsx" -Pattern "asChild"

Rodar script TS avulso

cd <backend>

npx tsx ..\frontend\src\<caminho-do-script>.ts

12. Como continuar em um novo chat
    Cola este documento no início do novo chat.

Diz: "Estou continuando o projeto. Aqui está o estado atual. Quero implementar o frontend da Fase 6."

Manda os arquivos relevantes do frontend.

Segue o roadmap.

Para a rodada do frontend da Fase 6, anexar:

Este .md

Frontend (arquivos existentes que serão alterados ou usados como referência):

src/contexts/AuthContext.tsx

src/routes.tsx

src/components/layouts/Sidebar.tsx

src/types/auth.types.ts

src/types/products.types.ts

src/services/api.ts

src/services/products.ts

src/hooks/useProductMutations.ts

src/lib/api-error.ts

src/lib/query-params-helpers.ts

src/components/products/CreateMovementDialog.tsx

src/pages/ProductDetailPage.tsx

Backend (referência de contratos):

src/types/sector.types.ts

src/types/transfer.types.ts

src/types/purchaseRequest.types.ts

src/types/movement.types.ts

src/controllers/admin/sectorController.ts

src/controllers/admin/transferController.ts

src/controllers/admin/purchaseRequestController.ts

src/controllers/admin/movementController.ts

src/routes/admin/sectorRoutes.ts

src/routes/admin/transferRoutes.ts

src/routes/admin/purchaseRequestRoutes.ts

src/routes/admin/movementRoutes.ts

13. Convenções de código
    URL como fonte da verdade (quando faz sentido)

Serializadores tipados — parse e build separados

Hooks encapsulam comportamento

keepPreviousData em queries paginadas e filtradas

Componentes puros — recebem dados via prop, não fazem fetch

Backend valida antes do Prisma

Erros com code — { success: false, message, code }

Controllers separados — controllers/admin/<entity>Controller.ts

Routers separados quando auth difere

Checagem de permissão no service

Service do frontend sempre desembrulha { success, data }

Service do frontend retorna payload, nunca envelope

Componentes genéricos quando shape é idêntica

Gráficos usam fill no dado + chartConfig dinâmico

Base UI pode não ter asChild — usar buttonVariants + <Link> ou render prop

Helpers de query params compartilhados em lib/query-params-helpers.ts

Modificadores de filtro não contam como filtro ativo

Modificadores só são serializados se o filtro base existir

Alocação lazy de recursos

Transação atômica pra contadores

Concorrência silenciosa

Impressão só com dado real

Normalização de texto em duas camadas (normalizeText + generatePrefix)

Prefix e counter são imutáveis após criação

SKU é imutável após criação

Rotas específicas antes de param genérico

Product.priceInCents = cache; avgPriceInCents = média; Movement.unitPriceInCents = histórico

Regra MYOB: entrada com preço null/0 não recalcula a média

Erros tipados no frontend: err: unknown + getApiErrorMessage

RHF + Zod: z.string() (não .optional().or(z.literal("")))

shadcn novo: Controller + Field/FieldLabel/FieldError/FieldDescription

Componente com state inicializado de prop → key={...}

Contexto de UX: se já está na página do produto, não buscar outro produto

Fase 6: Product.quantity é coluna (estoque do Almoxarifado). NÃO ler quantity via SUM — não existe StockBySector.

Fase 6: Sector.isWarehouse boolean, exatamente 1 true, imutável, não deletável.

Fase 6: Transfer criado em transação atômica — debita Product.quantity, cria N Movement de TRANSFERENCIA (quantity negativo), tudo ou nada. fromSectorId forçado = Almoxarifado.

Fase 6: Quem confirma/recusa Transfer é o destino. Quem cria é o Almoxarifado. Quem cancela é qualquer STAFF do Almoxarifado ou MANAGER (com cancelReason).

Fase 6: PurchaseRequest com N Transfer. Pedido vira ATENDIDO manualmente, com trava (nenhuma Transfer PENDENTE). finalizeNote obrigatório se houver Transfer RECUSADO/CANCELADO ou entrega incompleta.

Fase 6: Item não cadastrado no pedido vai no notes (textarea), não em PurchaseRequestItem com productId null.

Fase 6: bipagem vive em /movements (CreateTransferDialog, Enter), não em /products/:id.

Fase 6: /movements = ação; /requests = pedidos; /history = consulta (6.5). Filtros de /movements e /requests na URL.

Fase 6: ENTRADA de produto só Almoxarifado ou MANAGER.

Fase 6: TransferStatus = PENDENTE | CONCLUIDO | CANCELADO | RECUSADO.

Fase 6: Transfer.cancel exige cancelReason obrigatório (auditoria).

Fase 6.75: UploadThing + browser-image-compression. Product.imageUrl continua String?. Campo de colar URL continua como fallback.

Fase 6: generate-prefix.ts fica em src/utils/ (não lib/).

14. Observações finais
    Documentar decisões é parte do processo

Não implementar features prematuras — só quando a necessidade aparecer

Atualizar este documento ao fim de cada fase

Banco de dados atual é provisório — pode dropar a qualquer momento

Seed é idempotente

O projeto é genérico: serve pra prefeitura (sem venda, com preço de compra) e pra mecânica (com venda no futuro, salePriceInCents na Fase 8+)

15. Protocolo de trabalho com a IA
    Aviso de contexto

O usuário quer ser avisado quando o chat estiver se aproximando do limite de contexto, para poder migrar para um novo chat no melhor momento possível (idealmente entre fases, não no meio de uma).

Sinais que a IA deve observar em si mesma:

Repetir perguntas que o usuário já respondeu antes

Esquecer arquivos que já foram enviados na conversa

Confundir decisões arquiteturais

Respostas mais genéricas — deixar de citar nomes exatos

Esquecer convenções do projeto

Perder o fio do que foi feito recentemente

Quando observar 2 ou mais sinais, avisar explicitamente:

⚠️ Aviso de contexto: estou começando a perceber [sinal específico]. Acho que estamos chegando perto do limite. Recomendo:

Você me manda seu PROJECT-STATE.md atual

Eu atualizo com o que fizemos desde a última versão

Você salva a versão nova

A gente inicia um chat novo com o documento anexado

Importante: a IA não deve esperar o chat "travar de vez" para avisar. É melhor avisar cedo demais do que tarde demais.

Fluxo de migração

Usuário envia o .md atual (anexa)

IA lê e atualiza com tudo que mudou desde a última versão

IA devolve o .md completo atualizado como texto

Usuário copia e salva por cima do antigo

Usuário abre um chat novo e cola: "Continuando projeto de inventory management. Anexei o PROJECT-STATE.md com o estado atual. Quero implementar o frontend da Fase 6."

Usuário anexa o .md + arquivos relevantes da fase

Trabalho continua de onde parou

Atualização do .md ao fim de cada fase

Quando o usuário disser "Terminamos a Fase X, atualiza o .md":

IA lê o .md atual

Marca a fase como concluída

Adiciona arquivos criados, decisões novas, pendências

Atualiza a "próxima fase"

Devolve o .md completo

Formato de entrega do .md atualizado

Sempre que o usuário pedir "atualiza o .md", "me manda o .md", "me manda a parte X do .md" ou qualquer variação:

NÃO envolver o conteúdo do .md num bloco de código markdown externo (triple-backticks). O .md já contém blocos de código internos (powershell, prisma, ts, etc.) que usam triple-backticks. Se a IA envolver o .md inteiro num bloco externo, o parser quebra na primeira ocorrência de triple-backtick interno, e o restante do documento vira texto solto / quebra a formatação.

Entregar o conteúdo do .md como texto puro, começando direto no # Inventory Management — Estado do Projeto e terminando no último parágrafo. Sem introdução ("aqui está o documento"), sem bloco externo.

O usuário copia o texto puro e cola por cima do .md local.

Exceções permitidas (mas só se o usuário pedir explicitamente):

Pedir uma versão dividida em partes (Parte 1, Parte 2) — aí cada parte vira uma mensagem separada, também sem bloco externo.

Pedir explicação/comentário sobre as mudanças — aí pode ter texto antes ou depois do conteúdo do .md, nunca no meio.

Nunca reformatar o conteúdo por dentro.

Nunca quebrar o .md em vários blocos de markdown misturados com texto explicativo.

Motivo: o usuário copia o conteúdo direto e substitui o .md local. Bloco externo quebra a formatação quando o .md tem blocos internos.

16. Onde paramos
    Fase atual: Fase 6 (setores + pedidos + remessas) 🚧 — backend 100% concluído, frontend pendente.

Último arquivo trabalhado: PROJECT-STATE.md (atualizado em 28/10/2026 — 4ª atualização, backend da Fase 6 concluído).

Próximo passo: começar o frontend da Fase 6 (11 etapas). Começar pela Etapa 1 (tipos).

Últimas decisões travadas (28/10/2026):

Almoxarifado = ponto 0 único. Sem StockBySector. Product.quantity volta a ser coluna.

Sector.isWarehouse Boolean, exatamente 1 true, imutável, não deletável.

User.sectorId obrigatório. SignUpEmail precisa receber sectorId (additionalFields required: true).

TransferStatus = PENDENTE | CONCLUIDO | CANCELADO | RECUSADO (era REJEITADO).

Transfer.cancel exige cancelReason obrigatório (auditoria).

Movement.quantity em TRANSFERENCIA é negativo.

Quem cancela Transfer: qualquer STAFF do Almoxarifado ou MANAGER (não só o criador físico).

PurchaseRequest vira ATENDIDO manualmente (Almoxarifado clica "Finalizar").

Trava de finalização: nenhuma Transfer PENDENTE.

finalizeNote obrigatório se houver Transfer RECUSADO/CANCELADO OU entrega incompleta (soma enviada < soma pedida).

Cancelamento de pedido: só setor criador ou MANAGER.

Recusa de pedido: só Almoxarifado ou MANAGER, com refusalReason obrigatório. Final.

/requests e /movements separadas. Ambas filtradas por setor do user. Filtros na URL. Tab de status em /requests na URL.

Bipagem em /movements via CreateTransferDialog, por Enter.

ENTRADA de produto só Almoxarifado/MANAGER.

checkStockAlerts dispara em TRANSFERENCIA (createTransfer, refuseTransfer, cancelTransfer).

R1 (auditoria de pedidos) e R2 (consumo mensal) ficam pra Fase 6.5.

Upload de imagem (UploadThing + compressão) fica pra Fase 6.75.

generate-prefix.ts em src/utils/ (não lib/).

middlewares/auth.ts tem sectorId no select + AuthenticatedUser.

lib/auth.ts tem sectorId em additionalFields (required: true).

Bugs corrigidos na Fase 6: categoryAlertMap (TDZ), locationExact/supplierExact no controller, resolvedBy/resolvedById no productService/dashboardService.

Pendências imediatas:

Fase 6 — frontend (/movements + /requests) — PRÓXIMA

Fase 6.5 (/history + R1 + R2) — depois do frontend da 6

Fase 6.75 (UploadThing + compressão) — depois da 6.5

Fase 7 (dashboard) — depois da 6.75

Fase 7.5 (/users) — depois da 7

Fase 8 (/alerts + Socket.io) — depois da 7.5

Fase 9 (polish) — por último

tsconfig.json com TS5101 — não bloqueador; migrar na Fase 9

vite.config.ts com \_\_dirname — warning do Vite 8; migrar na Fase 9

Fim do documento. ✅
