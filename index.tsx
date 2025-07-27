import { render } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { html } from 'htm/preact';

// Tell TypeScript that Chart.js is loaded globally
declare var Chart: any;

const API_BASE_URL = 'http://localhost:8000';

// A list of common Apple Health metrics.
const METRIC_OPTIONS = [
    'HeartHealth',
    'SleepHealth',
];

// --- Type Definitions ---

interface InsightStats {
    mean: number;
    min: number;
    max: number;
}

interface InsightsData {
    insights: {
        summary: {
            current_fitness_level: string;
            data_completeness: number;
            last_updated: string;
        };
        risk_assessment: {
            risk_score: number;
            risk_category: string;
            risk_color: string;
            risk_factors: string[];
            recommendations: string[];
            assessment_date: string;
        };
        personalized_insights: {
            insights: HeartHealthInsightItem[];
            generated_at: string;
        };
        training_recommendations: {
            recommendation: string;
            intensity: string;
            frequency: string;
            duration: string;
            zones_to_focus: string[];
        };
        ai_summary: string;
        ai_explanation: string;
    };
}

interface TimeSeriesPoint {
    timestamp: string;
    value: number;
}

interface TimeSeriesDecomposition {
    trend: number[];
    seasonal: number[];
    residual: number[];
}

interface TimeSeriesData {
    metric: string;
    timeseries: TimeSeriesPoint[];
    decomposition?: TimeSeriesDecomposition;
}

// Types for the reusable chart component
interface ChartDataset {
    label: string;
    data: (number | null)[];
    color: string;
    fill?: boolean;
    tension?: number;
    borderDash?: number[];
    pointRadius?: number;
}

interface TimeSeriesChartProps {
    title: string;
    labels: string[];
    datasets: ChartDataset[];
}


// --- Helper Components ---

const Spinner = () => html`
    <div class="flex justify-center items-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
`;

const Alert = ({ type, message }: { type: 'success' | 'error', message: string }) => {
    const baseClasses = 'p-4 rounded-md my-4 text-sm';
    const typeClasses = {
        success: 'bg-green-100 text-green-800',
        error: 'bg-red-100 text-red-800',
    };
    return html`
        <div class="${baseClasses} ${typeClasses[type]}" role="alert">
            <p class="font-medium">${type === 'success' ? 'Success' : 'Error'}</p>
            <p>${message}</p>
        </div>
    `;
};

// --- API Call Functions ---

async function uploadFile(file: File, setStatus: (status: string) => void, setError: (error: string | null) => void) {
    setStatus('uploading');
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to upload file. The server returned an error.' }));
            throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Upload successful:', result);
        setStatus('success');
    } catch (e: any) {
        console.error('Upload error:', e);
        setError(e.message);
        setStatus('error');
    }
}

// --- Main Components ---

const Header = () => html`
    <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 class="text-3xl font-bold tracking-tight text-gray-900">
                OwnMyHealth
            </h1>
        </div>
    </header>
`;

const Uploader = ({ onUploadSuccess }: { onUploadSuccess: () => void }) => {
    const [status, setStatus] = useState('idle'); // idle, uploading, success, error
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState('');

    const handleFileChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
            setFileName(file.name);
            uploadFile(file, setStatus, setError);
        }
    };
    
    useEffect(() => {
        if (status === 'success') {
            // Wait a moment for the user to see the success message before switching view
            setTimeout(() => onUploadSuccess(), 1500);
        }
    }, [status]);

    return html`
        <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-lg mx-auto text-center mt-10">
            <h2 class="text-2xl font-semibold mb-2">Visualize Your Health Data</h2>
            <p class="text-gray-600 mb-6">Select your Apple Health <code class="bg-gray-200 p-1 rounded text-sm">export.xml</code> file to begin.</p>
            
            <label class="inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors duration-300 shadow-sm">
                <span>Select File</span>
                <input type="file" class="hidden" accept=".xml,application/xml,text/xml" onChange=${handleFileChange} disabled=${status === 'uploading'} />
            </label>

            ${fileName && html`<p class="mt-4 text-gray-500">Selected: ${fileName}</p>`}
            
            ${status === 'uploading' && html`<${Spinner} />`}
            ${status === 'error' && error && html`<${Alert} type="error" message=${error} />`}
            ${status === 'success' && html`<${Alert} type="success" message="File uploaded successfully! Generating your dashboard..." />`}
        </div>
    `;
};

const InsightsCard = () => {
    const [insights, setInsights] = useState<InsightsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInsights = async () => {
            setIsLoading(true);
            setError(null);
            try {
                await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay for better UX
                const response = await fetch(`${API_BASE_URL}/metrics/insights?metrics=HeartHealth`);
                if (!response.ok) throw new Error('Could not fetch insights. Is data loaded on the server?');
                const data: InsightsData = await response.json();
                setInsights(data);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInsights();
    }, []);

    return html`
        <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-semibold mb-4 text-gray-800">Insight Summary</h3>
            ${isLoading && html`<${Spinner} />`}
            ${error && html`<${Alert} type="error" message=${error} />`}
            ${insights && html`
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 class="font-bold mb-3 text-gray-600">Summary Statistics</h4>
                        <ul class="space-y-2">
                            ${Object.entries(insights.summary).map(([metric, stats]) => html`
                                <li class="bg-gray-50 p-3 rounded-md border border-gray-200">
                                    <span class="font-semibold text-gray-700">${metric.replace(/([A-Z])/g, ' $1').trim()}: </span>
                                    <span class="text-sm text-gray-600">
                                        Mean: ${stats.mean?.toFixed(2)}, 
                                        Min: ${stats.min?.toFixed(2)}, 
                                        Max: ${stats.max?.toFixed(2)}
                                    </span>
                                </li>
                            `)}
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-bold mb-3 text-gray-600">Correlations</h4>
                        <ul class="space-y-2">
                             ${Object.entries(insights.correlations).map(([corr, value]) => html`
                                <li class="bg-gray-50 p-3 rounded-md border border-gray-200">
                                    <span class="font-semibold text-gray-700 capitalize">${corr.replace(/_/g, ' ')}: </span>
                                    <span class="text-sm font-mono p-1 rounded ${value > 0.3 ? 'bg-green-100 text-green-800' : value < -0.3 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}">${value?.toFixed(2)}</span>
                                 </li>
                             `)}
                        </ul>
                    </div>
                </div>
            `}
        </div>
    `;
};

const TimeSeriesChart = ({ title, labels, datasets }: TimeSeriesChartProps) => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstance = useRef<any>(null);

    const colorToRgba = (color: string, alpha: number) => {
        if (!color) return 'rgba(0,0,0,0.1)';
        return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
    };

    useEffect(() => {
        if (!chartRef.current || !datasets || datasets.length === 0) return;

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        const chartJsDatasets = datasets.map(ds => ({
            label: ds.label,
            data: ds.data,
            borderColor: ds.color,
            backgroundColor: ds.fill ? colorToRgba(ds.color, 0.1) : 'transparent',
            fill: ds.fill || false,
            tension: ds.tension ?? 0.2,
            pointRadius: ds.pointRadius ?? 2,
            pointBackgroundColor: ds.color,
            borderDash: ds.borderDash || [],
        }));
        
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets: chartJsDatasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: datasets.length > 1, position: 'top' },
                    title: { 
                        display: true, 
                        text: title, 
                        font: { size: 16 },
                        padding: { bottom: 16 }
                    }
                },
                scales: {
                    x: { title: { display: true, text: 'Date' } },
                    y: { title: { display: true, text: 'Value' } }
                },
                interaction: {
                    intersect: false,
                    mode: 'index',
                },
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [title, labels, datasets]);

    return html`<div class="relative h-80"><canvas ref=${chartRef}></canvas></div>`;
};

const TimeSeriesCard = () => {
    const [metric, setMetric] = useState(METRIC_OPTIONS[0]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [decompose, setDecompose] = useState(false);
    
    const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setTimeSeriesData(null);

        const params = new URLSearchParams({ metric });
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        if (decompose) params.append('decompose', String(decompose));

        try {
            const response = await fetch(`${API_BASE_URL}/metrics/timeseries?${params.toString()}`);
            if (!response.ok) throw new Error('Could not fetch time series data.');
            const data: TimeSeriesData = await response.json();
            setTimeSeriesData(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return html`
        <div class="bg-white p-6 rounded-lg shadow-md mt-8">
            <h3 class="text-xl font-semibold mb-4 text-gray-800">Time Series Analysis</h3>
            <form onSubmit=${handleSubmit} class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end mb-6 p-4 bg-gray-50 rounded-lg border">
                <div class="flex flex-col">
                    <label for="metric" class="text-sm font-medium text-gray-700 mb-1">Metric</label>
                    <select id="metric" value=${metric} onChange=${(e: Event) => setMetric((e.target as HTMLSelectElement).value)} class="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                        ${METRIC_OPTIONS.map(opt => html`<option value=${opt}>${opt.replace(/([A-Z])/g, ' $1').trim()}</option>`)}
                    </select>
                </div>
                <div class="flex flex-col">
                    <label for="start_date" class="text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input type="date" id="start_date" value=${startDate} onChange=${(e: Event) => setStartDate((e.target as HTMLInputElement).value)} class="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div class="flex flex-col">
                    <label for="end_date" class="text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input type="date" id="end_date" value=${endDate} onChange=${(e: Event) => setEndDate((e.target as HTMLInputElement).value)} class="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div class="flex items-center justify-start h-10">
                    <input type="checkbox" id="decompose" checked=${decompose} onChange=${(e: Event) => setDecompose((e.target as HTMLInputElement).checked)} class="h-4 w-4 text-blue-600 border-gray-300 rounded mr-2 focus:ring-blue-500" />
                    <label for="decompose" class="text-sm font-medium text-gray-700">Decompose</label>
                </div>
                <button type="submit" disabled=${isLoading} class="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed h-10 shadow-sm w-full">
                    ${isLoading ? 'Fetching...' : 'Fetch Data'}
                </button>
            </form>

            ${isLoading && html`<${Spinner} />`}
            ${error && html`<${Alert} type="error" message=${error} />`}
            ${!isLoading && !error && !timeSeriesData && html`<div class="text-center py-10 text-gray-500">Select a metric and click "Fetch Data" to see a chart.</div>`}
            
            ${timeSeriesData && (() => {
                const labels = timeSeriesData.timeseries.map(d => new Date(d.timestamp).toLocaleDateString());
                const originalMetricDataset: ChartDataset = {
                    label: timeSeriesData.metric.replace(/([A-Z])/g, ' $1').trim(),
                    data: timeSeriesData.timeseries.map(d => d.value),
                    color: 'rgb(59, 130, 246)',
                    fill: true,
                };

                if (timeSeriesData.decomposition) {
                    return html`
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                            <div class="bg-gray-50/75 p-4 rounded-lg border border-gray-200">
                                <${TimeSeriesChart}
                                    title="${originalMetricDataset.label} (Original)"
                                    labels=${labels}
                                    datasets=${[originalMetricDataset]}
                                />
                            </div>
                            <div class="bg-gray-50/75 p-4 rounded-lg border border-gray-200">
                                <${TimeSeriesChart}
                                    title="Trend"
                                    labels=${labels}
                                    datasets=${[{
                                        label: 'Trend',
                                        data: timeSeriesData.decomposition.trend,
                                        color: 'rgb(16, 185, 129)',
                                        pointRadius: 0,
                                    }]}
                                />
                            </div>
                            <div class="bg-gray-50/75 p-4 rounded-lg border border-gray-200">
                                <${TimeSeriesChart}
                                    title="Seasonality"
                                    labels=${labels}
                                    datasets=${[{
                                        label: 'Seasonal',
                                        data: timeSeriesData.decomposition.seasonal,
                                        color: 'rgb(245, 158, 11)',
                                        pointRadius: 0,
                                    }]}
                                />
                            </div>
                            <div class="bg-gray-50/75 p-4 rounded-lg border border-gray-200">
                                <${TimeSeriesChart}
                                    title="Residuals"
                                    labels=${labels}
                                    datasets=${[{
                                        label: 'Residual',
                                        data: timeSeriesData.decomposition.residual,
                                        color: 'rgb(107, 114, 128)',
                                        pointRadius: 0,
                                    }]}
                                />
                            </div>
                        </div>
                    `;
                } else {
                    return html`
                        <div class="mt-4">
                             <${TimeSeriesChart}
                                title="Time Series for ${originalMetricDataset.label}"
                                labels=${labels}
                                datasets=${[originalMetricDataset]}
                            />
                        </div>
                    `;
                }
            })()}
        </div>
    `;
};


const App = () => {
    const [isFileUploaded, setIsFileUploaded] = useState(false);

    return html`
        <div class="min-h-screen bg-gray-50">
            <${Header} />
            <main>
                <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div class="px-4 py-6 sm:px-0">
                        ${!isFileUploaded ? html`
                            <${Uploader} onUploadSuccess=${() => setIsFileUploaded(true)} />
                        ` : html`
                            <div class="animate-fade-in">
                                <${InsightsCard} />
                                <${TimeSeriesCard} />
                            </div>
                        `}
                    </div>
                </div>
            </main>
            <style>
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-in-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            </style>
        </div>
    `;
};

render(html`<${App} />`, document.getElementById('app'));
