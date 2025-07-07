export interface UploadResponse {
  status: string;
  records_loaded: number;
  message: string;
}

export interface MetricSummary {
  mean: number;
  min: number;
  max: number;
}

export interface SummaryData {
  [metric: string]: MetricSummary;
}

export interface CorrelationsData {
  [pair: string]: number;
}

export interface InsightsData {
  summary: SummaryData;
  correlations: CorrelationsData;
}

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
}

export interface DecompositionData {
  trend: number[];
  seasonal: number[];
  residual: number[];
}

export interface TimeSeriesData {
  metric: string;
  timeseries: TimeSeriesPoint[];
  decomposition: DecompositionData | null;
}