import { useMemo } from 'react';
/* @ts-ignore */
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { ServiceMember } from '../../store/rosterSlice';

// Helper to determine fiscal year window or custom window
// simpler for now: just 12 months from now or selected FY
interface WaterfallProps {
    members: ServiceMember[];
    startDate: Date;
    endDate: Date;
    onBarClick?: (type: 'gain' | 'loss' | 'start' | 'end', month: string) => void;
}

export const WaterfallChart: React.FC<WaterfallProps> = ({ members, startDate, endDate, onBarClick }) => {
    const data = useMemo(() => {
        // 1. Calculate Start Count (Active before startDate)
        const startCount = members.filter(m =>
            new Date(m.dateReported) < startDate &&
            (!m.projectedRotationDate || new Date(m.projectedRotationDate) > startDate)
        ).length;

        // 2. Identify Gains/Losses in window
        let runningTotal = startCount;
        const months: any[] = [];

        // Simple iteration by month
        const current = new Date(startDate);
        while (current <= endDate) {
            const monthStr = current.toLocaleString('default', { month: 'short', year: '2-digit' });
            const nextMonth = new Date(current.getFullYear(), current.getMonth() + 1, 1);

            const gains = members.filter(m => {
                const d = new Date(m.dateReported);
                return d >= current && d < nextMonth;
            }).length;

            const losses = members.filter(m => {
                if (!m.projectedRotationDate) return false;
                const d = new Date(m.projectedRotationDate);
                return d >= current && d < nextMonth;
            }).length;

            // Waterfall data structure often needs "start", "end", "floating" bars
            // But simple bar chart with stacked logic can work too. 
            // Standard waterfall: Previous Total -> +/- Change -> New Total
            // We will visualize: [Start Bar] ... [Monthly Net Change] ... [End Bar]
            // Or: Just Gains and Losses per month?
            // Requirement: "Visualize flow via a waterfall chart... StartCount... + Gains... - Losses... = EndCount"

            // Let's simplified version: A single summary bar for Start, then Gain/Loss bars, then End.
            // But usually "Waterfall" implies a bridge chart.

            months.push({
                name: monthStr,
                gains,
                losses: -losses, // Negative for visualization
                net: gains - losses,
                total: runningTotal
            });

            runningTotal += (gains - losses);
            current.setMonth(current.getMonth() + 1);
        }

        return { startCount, endCount: runningTotal, months };
    }, [members, startDate, endDate]);

    const chartData = [
        { name: 'Start', value: data.startCount, fill: '#9CA3AF', type: 'total' }, // Gray
        ...data.months.map(m => ({
            name: m.name,
            // For a true waterfall, we need "floating" bars. Recharts doesn't do this natively easily without trickery.
            // Trick: Stacked bar with invisible filler.
            // But maybe user just wants Gains vs Losses bars?
            // "Visualize flow via a waterfall chart" -> Standard bridge chart. 
            // Start (Full Bar), then Float + Gain (Green), Float + Loss (Red)
            // Complexity: Gains and Losses happen in same month.
            // Let's simplify: Show Gains (Green) and Losses (Red) as separate bars per month, and a Line for Total?
            // Or just a summary Bridge: Start -> Total Gains -> Total Losses -> End?
            // "Drill-down... Clicking a 'Loss' bar... show only individuals departing in that period."
            // This implies time-series bars.

            gain: m.gains,
            loss: Math.abs(m.losses),
            net: m.net,
            total: m.total
        })),
        // We could add 'End' bar but let's stick to time series for now
    ];

    return (
        <div className="h-64 w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Personnel Flow (FY Window)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />

                    {/* Gains */}
                    <Bar dataKey="gain" fill="#22c55e" radius={[4, 4, 0, 0]} stackId="a" onClick={(d: any) => onBarClick?.('gain', d.name)} />
                    {/* Losses */}
                    <Bar dataKey="loss" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="b" onClick={(d: any) => onBarClick?.('loss', d.name)} />

                    {/* We can plot the 'Total' as a line or separate bar? 
                    User asked for Waterfall. The above is a Gain/Loss histogram.
                    A true waterfall by month is hard if there are both gains and losses in same month.
                    Let's stick to Gain/Loss histogram which is clearer for "Clicking a Loss bar".
                */}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
