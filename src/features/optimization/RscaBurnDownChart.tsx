import React, { useMemo } from 'react';
/* @ts-ignore */
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, Area } from 'recharts';

interface RscaBurnDownProps {
    currentRsca: number;
    reportCount: number;
    projectedReports: { date: string, projectedAvg: number }[];
    maxRsca: number;
}

export const RscaBurnDownChart: React.FC<RscaBurnDownProps> = ({ currentRsca, reportCount, projectedReports, maxRsca }) => {
    const data = useMemo(() => {
        let runningSum = currentRsca * reportCount;
        let runningCount = reportCount;

        // Initial point
        const points = [{
            name: 'Current',
            rsca: parseFloat(currentRsca.toFixed(3)),
            delta: 0
        }];

        projectedReports.forEach((r, idx) => {
            runningSum += r.projectedAvg;
            runningCount += 1;
            const newRsca = runningSum / runningCount;

            points.push({
                name: `Rpt ${idx + 1}`, // In real app, use date
                rsca: parseFloat(newRsca.toFixed(3)),
                delta: newRsca - currentRsca
            });
        });

        return points;
    }, [currentRsca, reportCount, projectedReports]);

    return (
        <div className="h-64 w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">RSCA Trend Analysis</h3>
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis domain={['auto', 'auto']} fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                    <ReferenceLine y={maxRsca} label="Projected Ceiling" stroke="#ef4444" strokeDasharray="3 3" />

                    <Line type="monotone" dataKey="rsca" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Cumulative Average" />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};
