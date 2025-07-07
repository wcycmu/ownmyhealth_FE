import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import { InsightsDashboard } from './components/InsightsDashboard';
import TimeSeriesAnalysis from './components/TimeSeriesAnalysis';
import Loader from './components/Loader';
import { getInsights } from './services/api';
import type { InsightsData, UploadResponse } from './types';

const App: React.FC = () => {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const fetchInsightsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const insightsData = await getInsights();
      setInsights(insightsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching insights.');
      // Keep user on the dashboard to see the error, don't set isDataLoaded to false.
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUploadSuccess = (data: UploadResponse) => {
    setUploadMessage(`${data.message} - ${data.records_loaded} records loaded.`);
    setIsDataLoaded(true);
    // New data uploaded, so clear old insights to trigger a refetch.
    if(insights) setInsights(null);
  };

  useEffect(() => {
    // Fetch insights only when data has been loaded and insights are not yet present.
    if (isDataLoaded && !insights) {
      fetchInsightsData();
    }
  }, [isDataLoaded, insights, fetchInsightsData]);
  
  useEffect(() => {
    // This effect now correctly handles the timer for the upload message.
    if (uploadMessage) {
      const timerId = setTimeout(() => {
        setUploadMessage(null);
      }, 5000);
      // The cleanup function will clear the timer.
      return () => clearTimeout(timerId);
    }
  }, [uploadMessage]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {uploadMessage && (
            <div className="fixed top-20 right-8 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-20 animate-fade-in-out" role="alert">
                <strong className="font-bold">Success! </strong>
                <span className="block sm:inline">{uploadMessage}</span>
            </div>
        )}

        {!isDataLoaded ? (
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        ) : (
          <>
            {isLoading && !insights && <Loader text="Loading Health Insights..." />}
            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md text-center mb-6" role="alert"><p className="font-bold">An error occurred</p><p>{error}</p></div>}
            {insights && (
              <div className="space-y-8 animate-fade-in">
                <InsightsDashboard insights={insights} />
                <TimeSeriesAnalysis />
              </div>
            )}
          </>
        )}
      </main>
      <footer className="text-center py-4 text-slate-500 text-sm">
        <p>OwnMyHealth &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default App;