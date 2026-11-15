// src/types/reports.types.ts
import type { PurchaseRequestStatus } from "@/types/purchaseRequests.types";

// =============================
// Enums / uniões locais
// =============================

export type ReportRequestStatusFilter = Exclude<PurchaseRequestStatus, "TODOS">;

export type RequestReportSortBy = "createdAt" | "finalizedAt";

export type ReportSortOrder = "asc" | "desc";

// =============================
// Período comum
// =============================

export interface ReportPeriod {
  dateFrom: string;
  dateTo: string;
}

// =============================
// R1 — Auditoria de pedidos
// =============================

export interface RequestReportItem {
  productId: string;
  productName: string;
  productSku: string;
  requestedQty: number;
  sentQty: number;
  fulfillmentPct: number;
}

export interface RequestReportTotals {
  requestedQty: number;
  sentQty: number;
  fulfillmentPct: number;
}

export interface RequestReportRow {
  id: string;
  sectorId: string;
  sectorName: string;
  status: ReportRequestStatusFilter;
  createdAt: string;
  finalizedAt: string | null;
  createdById: string;
  createdByName: string | null;
  totals: RequestReportTotals;
  items: RequestReportItem[];
}

export interface RequestReportSummary {
  totalRequests: number;
  byStatus: Record<ReportRequestStatusFilter, number>;
  totalRequestedQty: number;
  totalSentQty: number;
  overallFulfillmentPct: number;
}

export interface RequestReportResponse {
  period: ReportPeriod;
  requests: RequestReportRow[];
  summary: RequestReportSummary;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RequestReportFilters {
  sectorId?: string;
  status?: ReportRequestStatusFilter;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: RequestReportSortBy;
  sortOrder?: ReportSortOrder;
  page?: number;
  limit?: number;
}

// =============================
// R2 — Consumo (global e setor)
// =============================

export interface ProductConsumption {
  productId: string;
  productName: string;
  productSku: string;
  productImageUrl: string | null;
  consumedQty: number;
  consumedValueInCents: number;
  monthsWithConsumption: number;
  monthsInRange: number;
  priority: boolean;
}

export interface ProductConsumptionMonthly {
  month: string; // YYYY-MM
  consumedQty: number;
  consumedValueInCents: number;
}

export interface ConsumptionSectorSummary {
  sectorId: string;
  sectorName: string;
  totalConsumedQty: number;
  totalConsumedValueInCents: number;
  productsCount: number;
  topProducts: ProductConsumption[];
}

export interface ConsumptionGlobalSummary {
  totalConsumedQty: number;
  totalConsumedValueInCents: number;
  totalSectors: number;
  totalProducts: number;
  monthsInRange: number;
  priorityProductsCount: number;
}

export interface ConsumptionReportResponse {
  period: ReportPeriod;
  summary: ConsumptionGlobalSummary;
  bySector: ConsumptionSectorSummary[];
  overallTopProducts: ProductConsumption[];
}

export interface ConsumptionReportFilters {
  dateFrom?: string;
  dateTo?: string;
  priorityThreshold?: number;
  limit?: number;
}

export interface ConsumptionSectorSummaryBlock {
  totalConsumedQty: number;
  totalConsumedValueInCents: number;
  productsCount: number;
  monthsInRange: number;
  priorityProductsCount: number;
}

export interface ConsumptionSectorProduct extends ProductConsumption {
  monthlyBreakdown: ProductConsumptionMonthly[];
}

export interface ConsumptionSectorReportResponse {
  sector: { id: string; name: string };
  period: ReportPeriod;
  summary: ConsumptionSectorSummaryBlock;
  products: ConsumptionSectorProduct[];
}

export interface ConsumptionSectorReportFilters {
  dateFrom?: string;
  dateTo?: string;
  priorityThreshold?: number;
  limit?: number;
}

// =============================
// R2b — Saídas manuais
// =============================

export interface ManualOutputMovement {
  id: string;
  createdAt: string;
  productId: string;
  productName: string;
  productSku: string;
  productImageUrl: string | null;
  quantity: number;
  reason: string | null;
  fromSectorId: string | null;
  fromSectorName: string | null;
  createdById: string;
  createdByName: string | null;
  unitPriceInCents: number | null;
  totalValueInCents: number;
}

export interface ManualOutputBySector {
  sectorId: string;
  sectorName: string;
  totalQty: number;
  totalValueInCents: number;
}

export interface ManualOutputSummary {
  totalMovements: number;
  totalQty: number;
  totalValueInCents: number;
  bySector: ManualOutputBySector[];
}

export interface ManualOutputReportResponse {
  period: ReportPeriod;
  movements: ManualOutputMovement[];
  summary: ManualOutputSummary;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ManualOutputReportFilters {
  dateFrom?: string;
  dateTo?: string;
  fromSectorId?: string;
  page?: number;
  limit?: number;
}
