import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer, Cell } from 'recharts';

interface RSCATrendChartProps {
    baselineRSCA: number;
    projectedRSCA: number;
}

export const RSCATrendChart: React.FC<RSCATrendChartProps> = ({ baselineRSCA, projectedRSCA }) => {

    const data = [
        {
            name: 'Cumulative RSCA',
            Baseline: baselineRSCA,
            Projected: projectedRSCA,
        }
    ];

    const isInflation = projectedRSCA > baselineRSCA;

    return (
        <div className="h-64 w-full bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Projected RSCA Impact</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 5.0]} stroke="#9CA3AF" />
                    <YAxis type="category" dataKey="name" hide />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Legend />

                    <Bar dataKey="Baseline" fill="#9CA3AF" radius={[0, 4, 4, 0]} barSize={20} name="Current Baseline" />
                    <Bar dataKey="Projected" radius={[0, 4, 4, 0]} barSize={20} name="Projected (After Batch)">
                        <Cell fill={isInflation ? '#F59E0B' : '#10B981'} />
                    </Bar>

                    {/* Reference Lines for Context */}
                    <ReferenceLine x={baselineRSCA} stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Baseline', fill: '#EF4444', fontSize: 10 }} />
                </BarChart>
            </ResponsiveContainer>
            <div className="mt-2 text-xs text-center text-gray-500">
                {isInflation
                    ? `⚠️ Increasing cumulative average by +${(projectedRSCA - baselineRSCA).toFixed(3)}`
                    : `✅ Maintaining or improving cumulative average.`
                }
            </div>
        </div>
    );
};
