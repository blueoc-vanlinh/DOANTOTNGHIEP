export interface AutoPoRecommendation {
  product_id: number;
  product_name: string;
  sku: string;
  warehouse_id: number;
  warehouse_name: string;
  available_stock: number;
  min_threshold: number;
  avg_daily_export: number;
  reorder_point: number;
  recommended_quantity: number;
  priority: "HIGH" | "MEDIUM";
}

export interface SlottingSuggestion {
  product_id: number;
  product_name: string;
  export_quantity: number;
  suggested_zone: "A" | "B" | "C";
  suggested_location: string;
}

export interface BarcodeLookup {
  product: {
    id: number;
    name: string;
    sku: string;
    barcode?: string | null;
    price: number;
  };
  inventory: {
    warehouse_id: number;
    warehouse_name: string;
    quantity: number;
    reserved_quantity: number;
    available_quantity: number;
  }[];
  scan_payload: {
    type: string;
    product_id: number;
    sku: string;
    barcode?: string | null;
  };
}
