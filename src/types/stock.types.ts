// =============================
// Retorno de /admin/dashboard/stock
// =============================

/**
 * Produto em uma seção de alerta.
 * Shape uniforme entre as 4 seções (lowStock, expiringSoon, expired, outOfStock),
 * o que permite renderizar todas com um único componente.
 *
 * - `quantity`: sempre presente (0 em outOfStock)
 * - `minStock`: só relevante em lowStock, null nas outras
 * - `expiryDate`: só relevante em expiringSoon/expired, null nas outras
 *
 * ⚠️ No frontend, `expiryDate` é string ISO (não Date) — o JSON não desserializa Date.
 */
export interface StockAlertProduct {
  id: string;
  name: string;
  sku: string | null;
  imageUrl: string | null;
  priceInCents: number | null;
  quantity: number;
  minStock: number | null;
  expiryDate: string | null;
  location: string | null;
  supplier: string | null;
}

export interface StockMetricsResponse {
  summary: {
    totalProducts: number;
    totalUnits: number;
    averageStockPerProduct: number;
    productsWithStock: number;
    productsWithoutStock: number;
  };
  stockStatus: {
    healthy: number;
    low: number;
    outOfStock: number;
    overStock: number;
    noMinStockDefined: number;
  };
  expiryStatus: {
    expired: number;
    expiringSoon: number;
    valid: number;
    noExpiryDate: number;
  };
  distribution: {
    byCategory: {
      categoryId: string;
      categoryName: string;
      count: number;
      totalUnits: number;
    }[];
    byLocation: {
      location: string;
      count: number;
      totalUnits: number;
    }[];
    bySupplier: {
      supplier: string;
      count: number;
      totalUnits: number;
    }[];
  };
  details: {
    productsWithLowStock: StockAlertProduct[];
    productsExpiringSoon: StockAlertProduct[];
    productsExpired: StockAlertProduct[];
    productsOutOfStock: StockAlertProduct[];
  };
}

// =============================
// Filtros (URL como fonte da verdade)
// =============================

/**
 * Filtros de /stock. Só `categoryId`, `location` e `supplier` — os outros
 * campos do retorno (KPIs, gráficos) não são filtráveis pela UI.
 *
 * Diferente de ProductFilters, NÃO tem page/limit/sort — /stock não pagina.
 */
export type StockFilters = {
  categoryId?: string;
  location?: string;
  supplier?: string;
};

export const STOCK_DEFAULTS = {} as const satisfies StockFilters;
