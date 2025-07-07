import { API_BASE_URL } from '../constants';
import type { InsightsData, TimeSeriesData, UploadResponse } from '../types';

export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Upload failed with status ' + response.status }));
    throw new Error(errorData.detail || errorData.message || 'File upload failed');
  }
  return response.json();
};

export const getInsights = async (): Promise<InsightsData> => {
  const response = await fetch(`${API_BASE_URL}/metrics/insights`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch insights' }));
    throw new Error(errorData.detail || errorData.message || 'Could not fetch insights. Is data loaded?');
  }
  return response.json();
};

interface GetTimeSeriesParams {
    metric: string;
    start_date?: string;
    end_date?: string;
    decompose?: boolean;
}

export const getTimeSeries = async (params: GetTimeSeriesParams): Promise<TimeSeriesData> => {
    const urlParams = new URLSearchParams();
    urlParams.append('metric', params.metric);
    if(params.start_date && params.start_date.trim() !== '') urlParams.append('start_date', params.start_date);
    if(params.end_date && params.end_date.trim() !== '') urlParams.append('end_date', params.end_date);
    if(params.decompose) urlParams.append('decompose', String(params.decompose));
  
    const response = await fetch(`${API_BASE_URL}/metrics/timeseries?${urlParams.toString()}`);
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch time series' }));
        throw new Error(errorData.detail || errorData.message || 'Could not fetch time series data.');
    }
    return response.json();
};