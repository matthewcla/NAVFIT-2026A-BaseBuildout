import React from 'react';
import { AlertCircle } from 'lucide-react';

interface InflationWarningProps {
    baselineRSCA: number;
    projectedRSCA: number;
    threshold?: number; // Defaults to 0.05 or similar business rule
}

export const InflationWarning: React.FC<InflationWarningProps> = ({
    baselineRSCA,
    projectedRSCA,
    threshold = 0.05
}) => {
    const delta = projectedRSCA - baselineRSCA;

    if (delta <= threshold) return null;

    return (
        <div className="flex items-start p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50" role="alert">
            <AlertCircle className="flex-shrink-0 inline w-5 h-5 me-3" />
            <div>
                <span className="font-medium">Inflation Alert!</span>
                <p>
                    This summary group increases your cumulative RSCA by <span className="font-bold">{delta.toFixed(2)}</span> points
                    (from {baselineRSCA.toFixed(2)} to {projectedRSCA.toFixed(2)}).
                    Consider reducing trait averages to maintain your trend.
                </p>
            </div>
        </div>
    );
};
