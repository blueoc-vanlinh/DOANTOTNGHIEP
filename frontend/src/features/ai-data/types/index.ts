export interface AiDataCounts {
  products: number;
  inventory_records: number;
  stock_transactions: number;
  export_transactions: number;
  forecast_results: number;
  external_factors: number;
}

export interface ProductTrainingQuality {
  product_id: number;
  product_name: string;
  transaction_records: number;
  unique_training_days: number;
  total_export_quantity: number;
  external_factor_records: number;
  model_ready: "INSUFFICIENT_DATA" | "PROPHET_READY" | "LSTM_TRANSFORMER_READY";
  missing_for_deep_learning_days: number;
  missing_for_prophet_days: number;
}

export interface AiDataOverview {
  counts: AiDataCounts;
  export_history: {
    first_date: string | null;
    last_date: string | null;
  };
  quality_by_product: ProductTrainingQuality[];
  recommendation: string;
}

export interface ExternalFactor {
  id: number;
  factor_date: string;
  factor_type: string;
  name: string;
  value?: number | null;
  impact_score: number;
  product_id?: number | null;
  warehouse_id?: number | null;
  source?: string | null;
  note?: string | null;
}

export interface ExternalFactorInput {
  factor_date: string;
  factor_type: string;
  name: string;
  value?: number | null;
  impact_score: number;
  product_id?: number | null;
  warehouse_id?: number | null;
  source?: string | null;
  note?: string | null;
}

export interface DeepLearningDatasetRow {
  date: string;
  export_quantity: number;
  external_impact: number;
}

export interface DeepLearningDataset {
  quality: ProductTrainingQuality;
  target_models: string[];
  features: string[];
  rows: DeepLearningDatasetRow[];
}
