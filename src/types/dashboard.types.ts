export interface ProductQuantityItem {
  id: string;
  name: string;
  sku: string | null;
  quantity: number;
  imageUrl?: string | null;
  priceInCents?: number | null;
}

export interface CategoryDistributionItem {
  categoryId: string;
  categoryName: string;
  count: number;
}

export interface DailyMovementItem {
  date: string;
  entries: number;
  exits: number;
}

export interface DashboardOverviewData {
  summary: {
    totalProducts: number;
    totalUnits: number;
    totalMovements: number;
    movementsPeriod: string;
  };
  alerts: {
    lowStock: number;
    outOfStock: number;
    expired: number;
    expiringSoon: number;
    activeAlerts: number;
  };
  ratios: {
    stockOccupancyRate: number;
    activeProducts: number;
    activeProductsPercentage: number;
  };
  topItems: {
    lowestQuantityProducts: ProductQuantityItem[];
    highestQuantityProducts: ProductQuantityItem[];
    categoryDistribution: CategoryDistributionItem[];
  };
  trends: {
    dailyMovements: DailyMovementItem[];
  };
}

export interface DashboardOverviewResponse {
  success: boolean;
  data: DashboardOverviewData;
}
