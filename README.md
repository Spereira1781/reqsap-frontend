# ReqSAP Intelligence — Especificação Técnica Base (Web + Mobile)

Este documento define a base de produto, arquitetura e engenharia para iniciar imediatamente o desenvolvimento de um sistema corporativo inteligente de leitura documental, conciliação fiscal/financeira e auditoria.

## 1) Arquitetura detalhada do sistema

### 1.1 Visão macro (arquitetura em camadas)

- **Canais**
  - Web Admin (React + Vite)
  - Mobile Operacional (React Native + Expo)
- **API e serviços**
  - API Gateway BFF (Node.js + Fastify ou NestJS)
  - Serviço de Autenticação e RBAC (JWT + refresh token)
  - Serviço de Upload/Storage (S3 compatível)
  - Serviço de OCR & Parser (fila assíncrona + workers)
  - Serviço de Conciliação (regras financeiras/fiscais)
  - Serviço de Relatórios (PDF/Excel)
  - Serviço de Auditoria (log imutável de ações e correções)
- **Dados e mensageria**
  - PostgreSQL (dados transacionais)
  - Redis (cache, locks e filas rápidas)
  - RabbitMQ ou SQS (orquestração de processamento assíncrono)
- **Observabilidade e segurança**
  - OpenTelemetry + Prometheus + Grafana
  - Sentry (erros)
  - WAF, rate limit, scanning de upload, criptografia em repouso/trânsito

### 1.2 Padrão de processamento documental

1. Upload gera registro `uploads` com status `RECEIVED`.
2. Arquivo sobe para bucket privado e recebe hash SHA-256.
3. Evento vai para fila de extração.
4. Worker identifica tipo (NF XML, NF PDF, boleto PDF/imagem, espelho).
5. OCR/parser extrai campos + confiança por campo.
6. Dados normalizados são persistidos (`invoices`, `invoice_items`, `bills`, `invoice_mirrors`).
7. Motor de conciliação executa regras e cria `reconciliations` + `reconciliation_differences`.
8. Dashboard atualiza métricas near-real-time.

### 1.3 Padrões arquiteturais recomendados

- **DDD leve por contexto**: Auth, Document Intake, Fiscal Extraction, Reconciliation, Reporting, Audit.
- **CQRS seletivo**: escrita transacional + leitura otimizada em views/materialized views.
- **Idempotência**: upload/processamento com chave idempotente por hash/fornecedor/período.
- **Event-driven**: mudança de status via eventos (`UPLOAD_PROCESSED`, `RECONCILIATION_FINISHED`).

---

## 2) Módulos do sistema

1. **Autenticação e Acesso**
   - Login, refresh token, RBAC por perfil (Admin, Fiscal, Auditor, Operador, Gestor).
2. **Upload e Gestão de Arquivos**
   - Upload múltiplo, validação de MIME, vírus scan, versionamento de arquivo.
3. **Leitura/Extração Inteligente**
   - XML parser prioritário (maior precisão), OCR para PDF/imagem.
4. **Validação e Edição Manual**
   - Grid editável, trilha de alteração por campo, workflow de aprovação.
5. **Categorização e Indexação**
   - Agrupamentos por produto, fornecedor, data, status e centro de custo.
6. **Conciliação Fiscal/Financeira**
   - Nota x boleto x espelho com regras parametrizáveis.
7. **Divergências e Correções**
   - Classificação de conflitos, sugestão de correção e reprocessamento.
8. **Dashboard Executivo/Operacional**
   - KPIs, alertas, tendências e filas de trabalho.
9. **Relatórios e Exportações**
   - PDF executivo e Excel editável com abas temáticas.
10. **Auditoria e Compliance**
    - Logs completos de ações, mudanças e decisões.

---

## 3) Fluxo do usuário (E2E)

1. Usuário autentica (JWT).
2. Seleciona empresa/unidade e período.
3. Faz upload em lote (PDF/XML/imagem/planilha).
4. Sistema processa assíncrono e exibe status por arquivo.
5. Usuário revisa extrações com baixa confiança.
6. Corrige campos, confirma e envia para conciliação.
7. Motor compara nota/boleto/espelho e gera resultado.
8. Divergências aparecem com causa-raiz e ação sugerida.
9. Usuário corrige/reprocessa quando necessário.
10. Gestor acompanha dashboard e emite relatório PDF/Excel.

---

## 4) Estrutura das telas (Web e Mobile)

### Web (React)

- **Login**
- **Dashboard** (cards, gráficos, alertas, tabela dinâmica)
- **Inbox de Uploads** (fila por status)
- **Detalhe do Documento** (preview + campos extraídos editáveis)
- **Conciliação** (comparativo lado a lado)
- **Divergências** (lista + causa-raiz + ação)
- **Relatórios** (filtros + geração + histórico)
- **Admin/RBAC** (usuários, perfis e permissões)
- **Auditoria** (timeline de alterações)

### Mobile (React Native)

- **Home operacional**
- **Pendências de validação**
- **Detalhe da divergência**
- **Aprovar/Rejeitar correção**
- **Consulta rápida de status de conciliação**

---

## 5) Modelagem do banco (PostgreSQL + Prisma)

### 5.1 Entidades principais

- `users`, `roles`, `user_roles`
- `suppliers`
- `uploads`
- `documents` (metadados do arquivo)
- `invoices`
- `invoice_items`
- `bills`
- `invoice_mirrors`
- `reconciliations`
- `reconciliation_differences`
- `correction_logs`
- `audit_logs`
- `reports`

### 5.2 Campos críticos por tabela (resumo)

- `invoices`: `supplier_id`, `invoice_number`, `issue_date`, `total_products`, `total_invoice`, `icms_total`, `source_upload_id`, `extraction_confidence`.
- `invoice_items`: `invoice_id`, `sku`, `description`, `quantity`, `unit_price`, `total_price`, `icms_value`.
- `bills`: `barcode`, `due_date`, `amount`, `payer_document`, `beneficiary`.
- `invoice_mirrors`: `reference_period`, `total_amount`, `item_count`, `raw_payload`.
- `reconciliations`: `invoice_group_key`, `bill_id`, `mirror_id`, `sum_invoices`, `sum_bill`, `sum_mirror`, `status`, `compliance_percent`.
- `reconciliation_differences`: `type`, `field_name`, `expected_value`, `actual_value`, `delta_value`, `document_origin`, `severity`, `suggested_action`.
- `correction_logs`: `entity`, `entity_id`, `field`, `old_value`, `new_value`, `changed_by`, `reason`.

### 5.3 Restrições e índices

- Unique: `(supplier_id, invoice_number, issue_date)` em `invoices`.
- Índices por `status`, `issue_date`, `supplier_id`, `created_at`.
- Particionamento por mês/ano para tabelas volumosas (`audit_logs`, `documents`, `reconciliation_differences`).

---

## 6) Endpoints principais da API (REST)

### Auth
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

### Usuários e perfis
- `GET /users`
- `POST /users`
- `PATCH /users/:id`
- `GET /roles`

### Upload/documentos
- `POST /uploads/presign`
- `POST /uploads/complete`
- `GET /uploads`
- `GET /documents/:id/download`

### Extração e validação
- `GET /invoices`
- `GET /invoices/:id`
- `PATCH /invoices/:id`
- `PATCH /invoice-items/:id`
- `POST /invoices/:id/confirm`

### Conciliação
- `POST /reconciliations/run`
- `GET /reconciliations`
- `GET /reconciliations/:id`
- `POST /reconciliations/:id/reprocess`

### Divergências
- `GET /differences`
- `GET /differences/:id`
- `POST /differences/:id/suggested-fix/apply`

### Relatórios
- `POST /reports/generate`
- `GET /reports`
- `GET /reports/:id/download`

### Auditoria
- `GET /audit-logs`

---

## 7) Regras de negócio (base executável)

1. Soma de notas vinculadas deve igualar valor do boleto (tolerância parametrizável, ex. `0.01`).
2. Soma de notas deve igualar valor do espelho.
3. Nota fiscal única por fornecedor + número + emissão.
4. Divergências tipificadas: `QTY_MISMATCH`, `UNIT_PRICE_MISMATCH`, `ITEM_TOTAL_MISMATCH`, `INVOICE_TOTAL_MISMATCH`, `ICMS_MISMATCH`, `MISSING_ITEM`, `DUPLICATE_ITEM`.
5. Campo extraído automaticamente pode ser sobrescrito, mas sempre com log.
6. Após edição confirmada, recálculo automático de totais e nova tentativa de conciliação.
7. Documento com confiança baixa (< limiar) entra em fila de validação humana.
8. Qualquer alteração relevante deve registrar `before/after`, usuário, timestamp e motivo.

---

## 8) Bibliotecas e ferramentas recomendadas

### Frontend Web
- React + Vite
- TypeScript
- TanStack Query
- TanStack Table
- React Hook Form + Zod
- Recharts/ECharts
- TailwindCSS + Radix UI

### Mobile
- React Native + Expo
- React Navigation
- Zustand ou Redux Toolkit
- Expo SecureStore (tokens)

### Backend
- Node.js + NestJS (ou Fastify modular)
- Prisma ORM
- BullMQ (Redis) para jobs
- class-validator / Zod
- jsonwebtoken + bcrypt
- Helmet + rate limiting

### Documentos/OCR
- XML: `xml2js`/`fast-xml-parser`
- PDF texto: `pdf-parse`
- OCR: Tesseract (on-prem) ou AWS Textract / Google Document AI
- Boleto: parser de linha digitável e código de barras

### Relatórios
- PDF: `pdf-lib` ou `puppeteer` (template HTML)
- Excel: `exceljs`

---

## 9) Estrutura inicial de pastas (monorepo)

```txt
reqsap/
  apps/
    web/                  # React
    mobile/               # React Native
    api/                  # Node.js (Nest/Fastify)
    worker/               # OCR/parser/conciliação jobs
  packages/
    ui/                   # design system compartilhado
    core/                 # regras de negócio e tipos
    config/               # eslint, tsconfig, prettier
    sdk/                  # client de API para web/mobile
  infra/
    docker/
    terraform/
    k8s/
  docs/
    adr/
    api/
    product/
```

---

## 10) Exemplo de dashboard moderno (composição)

- **Topo (cards KPI):** notas, boletos, total NF, total boleto, conciliado, divergente, conformidade.
- **Centro-esquerda:** funil de status (pendente/processado/conciliado/divergente/corrigido).
- **Centro-direita:** alertas de inconsistência.
- **Abaixo:** tabela de divergências com filtros avançados e ações rápidas.
- **Lateral:** widget de upload rápido + saúde do motor OCR + últimas ações de auditoria.

---

## 11) Estratégia de leitura PDF/XML/imagem

### 11.1 Estratégia por tipo

- **XML de NF-e (preferencial):** parsing estruturado direto (alta precisão).
- **PDF textual:** extração de texto + regex semântica + normalização.
- **Imagem/PDF escaneado:** OCR + pós-processamento com dicionário fiscal.

### 11.2 Pipeline de qualidade

1. Detectar tipo do arquivo.
2. Rodar parser principal.
3. Calcular confiança por campo.
4. Aplicar validações fiscais (ex. soma itens = total).
5. Se confiança baixa/inconsistência: direcionar para revisão manual.
6. Persistir payload bruto + versão normalizada + mapa de origem dos campos.

### 11.3 Melhoria contínua

- Feedback loop das correções humanas para recalibrar regras/modelos.
- Dataset anonimizado para tuning de OCR/classificação.

---

## 12) Estratégia de geração de PDF e Excel

### PDF
- Template executivo com capa, KPIs, tabela resumida, divergências e trilha de correções.
- Assinatura digital opcional e hash de integridade.

### Excel editável
- Abas:
  - `Resumo_Executivo`
  - `Notas_Detalhadas`
  - `Comparativo_Conciliação`
  - `Divergências`
  - `Histórico_Correções`
- Formatação condicional (divergência em destaque), filtros e fórmulas já prontas.

---

## 13) Plano de versionamento e escalabilidade

### Versionamento
- GitFlow simplificado ou trunk-based com feature flags.
- SemVer para API (`v1`, `v2`) e versionamento de contratos OpenAPI.
- Migrações controladas via Prisma Migrate com rollback testado.

### Escalabilidade
- Escala horizontal de API e workers.
- Fila desacoplando ingestão e processamento.
- Cache Redis para consultas de dashboard.
- Read replicas PostgreSQL para cargas analíticas.
- Particionamento e arquivamento de dados históricos.

---

## 14) Protótipo conceitual do sistema

### Jornada visual

- **Tema:** SaaS corporativo premium (dark mode, acentos vibrantes, foco em legibilidade).
- **Componentes-chave:** cards com microanimações, tabela editável, painel lateral de ação rápida.
- **Padrão de interação:** “Detectar → Revisar → Conciliar → Corrigir → Reportar”.

### Estados principais

- `PENDENTE`
- `PROCESSANDO`
- `AGUARDANDO_VALIDACAO`
- `CONCILIADO`
- `DIVERGENTE`
- `CORRIGIDO`

---

## 15) Roadmap por fases (execução real)

### Fase 0 — Fundação (2 semanas)
- Monorepo, CI/CD, autenticação, RBAC, observabilidade base.

### Fase 1 — Upload + Parsing núcleo (3 a 4 semanas)
- Upload múltiplo, storage seguro, parser XML/PDF inicial, fila de processamento.

### Fase 2 — Edição + Conciliação (4 semanas)
- UI editável, regras de conciliação, divergências e reprocessamento.

### Fase 3 — Dashboard + Relatórios (3 semanas)
- KPIs, filtros avançados, export PDF/Excel.

### Fase 4 — Mobile operacional (3 semanas)
- Aprovação/correção, alertas e consulta de status.

### Fase 5 — Otimização e compliance (contínuo)
- Hardening de segurança, tuning de OCR, SLA/SLO, auditoria avançada.

---

## Backlog técnico inicial (primeiros tickets sugeridos)

1. Criar schema Prisma + migração inicial.
2. Implementar autenticação JWT + refresh + RBAC.
3. Implementar upload com URL pré-assinada.
4. Criar worker OCR/parser com fila.
5. Criar endpoint de conciliação com regras iniciais.
6. Construir tela web de validação manual.
7. Construir dashboard com métricas essenciais.
8. Implementar exportações PDF/Excel.
9. Implantar trilha de auditoria.
10. Definir testes E2E dos fluxos críticos.

---

## Critérios de pronto (DoD)

- Fluxo E2E funcionando: upload → extração → edição → conciliação → relatório.
- Logs de auditoria completos e pesquisáveis.
- Cobertura mínima de testes para regras críticas de conciliação.
- SLO inicial definido (latência de processamento e disponibilidade).
- Segurança validada (OWASP top risks aplicáveis).
