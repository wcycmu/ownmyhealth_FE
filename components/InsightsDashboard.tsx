import React from 'react';
import type { InsightsData } from '../types';
import Card from './Card';

interface InsightsDashboardProps {
  insights: InsightsData;
}

const formatMetricName = (name: string) => {
  return name.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
};

export const InsightsDashboard: React.FC<InsightsDashboardProps> = ({ insights }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      <Card title="Metric Summaries">
        <div className="space-y-4">
          {Object.entries(insights.summary).map(([metric, data]) => (
            <div key={metric} className="p-3 bg-slate-50 rounded-lg">
              <h3 className="font-bold text-slate-700">{formatMetricName(metric)}</h3>
              <div className="grid grid-cols-3 gap-2 mt-1 text-sm text-center">
                <div className="bg-white p-2 rounded">
                  <p className="text-xs text-slate-500">Min</p>
                  <p className="font-semibold text-slate-800">{data.min.toFixed(2)}</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-xs text-slate-500">Mean</p>
                  <p className="font-semibold text-sky-600">{data.mean.toFixed(2)}</p>
                </div>
                <div className="bg-white p-2 rounded">
                  <p className="text-xs text-slate-500">Max</p>
                  <p className="font-semibold text-slate-800">{data.max.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Insight Summary">
        <ul className="space-y-2">
          {Object.entries(insights.correlations).map(([pair, value]) => (
            <li key={pair} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-slate-600">{formatMetricName(pair).replace(' vs ', ' vs ')}</span>
              <span className={`font-bold text-sm px-2 py-1 rounded-full ${Math.abs(value) > 0.5 ? 'bg-sky-200 text-sky-800' : 'bg-slate-200 text-slate-800'}`}>
                {value.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};
