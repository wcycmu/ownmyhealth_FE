import React, { useState, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { TooltipProps } from 'recharts';
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { getTimeSeries } from '../services/api';
import type { TimeSeriesData, TimeSeriesPoint } from '../types';
import { AVAILABLE_METRICS } from '../constants';
import Loader from './Loader';
import Card from './Card';
import { ChartIcon } from './icons';

const TimeSeriesAnalysis: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<string>(AVAILABLE_METRICS[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [decompose, setDecompose] = useState(false);
  const [data, setData] = useState<TimeSeriesData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await getTimeSeries({
        metric: selectedMetric,
        start_date: startDate,
        end_date: endDate,
        decompose,
      });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMetric, startDate, endDate, decompose]);

  const formatXAxis = (tickItem: string) => {
    return new Date(tickItem).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 backdrop-blur-sm p-3 shadow-lg rounded-lg border border-slate-200">
          <p className="label font-bold text-slate-800">{`${new Date(label).toLocaleString()}`}</p>
          <p className="intro text-sky-600">{`${payload[0].name} : ${(payload[0].value as number).toFixed(2)}`}</p>
        </div>
      );
    }
    return null;
  };
  
  const createDecompositionData = (originalData: TimeSeriesPoint[], decompositionValues: number[] | undefined, name: string) => {
    if (!decompositionValues) return [];
    return originalData.map((d, i) => ({
      timestamp: d.timestamp,
      [name]: decompositionValues[i]
    }));
  };

  return (
    <Card title="Time Series Analysis" titleIcon={<ChartIcon className="h-6 w-6 mr-2 text-sky-500" />}>
      <div className="bg-slate-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-1">
            <label htmlFor="metric" className="block text-sm font-medium text-slate-700">Metric</label>
            <select
              id="metric"
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
            >
              {AVAILABLE_METRICS.map(m => <option key={m} value={m}>{m.replace(/([A-Z])/g, ' $1').trim()}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-slate-700">Start Date</label>
            <input type="date" id="start_date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full text-base border-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"/>
          </div>
          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-slate-700">End Date</label>
            <input type="date" id="end_date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full text-base border-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"/>
          </div>
          <div className="flex items-center justify-start pt-6">
            <input id="decompose" type="checkbox" checked={decompose} onChange={e => setDecompose(e.target.checked)} className="h-4 w-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500" />
            <label htmlFor="decompose" className="ml-2 block text-sm text-slate-900">Decompose</label>
          </div>
          <button
            onClick={handleFetchData}
            disabled={isLoading}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400"
          >
            {isLoading ? 'Loading...' : 'Analyze'}
          </button>
        </div>
      </div>

      <div className="mt-6">
        {isLoading && <Loader text="Fetching time series data..." />}
        {error && <p className="text-red-600 bg-red-100 p-3 rounded-lg text-center">{error}</p>}
        {data && (
          <div className="space-y-8">
            <div>
              <h4 className="text-lg font-semibold text-center text-slate-700 mb-4">{data.metric} Time Series</h4>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.timeseries} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="timestamp" tickFormatter={formatXAxis} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="value" name={data.metric} stroke="#0284c7" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {data.decomposition && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {(['trend', 'seasonal', 'residual'] as const).map(key => (
                  <div key={key}>
                     <h4 className="text-md font-semibold text-center text-slate-600 mb-2 capitalize">{key}</h4>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={createDecompositionData(data.timeseries, data.decomposition?.[key], key)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="timestamp" tickFormatter={formatXAxis} tick={{fontSize: 10}}/>
                          <YAxis tick={{fontSize: 10}}/>
                          <Tooltip content={<CustomTooltip />}/>
                          <Line type="monotone" dataKey={key} stroke="#475569" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </div>
    </Card>
  );
};

export default TimeSeriesAnalysis;