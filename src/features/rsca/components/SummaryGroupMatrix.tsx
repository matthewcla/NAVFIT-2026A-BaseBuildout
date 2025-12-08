import type { ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../store/store';
import { updateTarget } from '../rscaSlice';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export const SummaryGroupMatrix: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { members, loading } = useSelector((state: RootState) => state.rsca);
    const memberList = Object.values(members);

    const handleTargetChange = (memberId: string, value: string) => {
        const numVal = parseFloat(value);
        if (!isNaN(numVal) && numVal >= 1 && numVal <= 5) {
            dispatch(updateTarget({ memberId, newTarget: numVal }));
        }
    };

    if (loading && memberList.length === 0) {
        return <div className="p-8 text-center text-gray-500">Loading scenario...</div>;
    }

    if (memberList.length === 0) {
        return <div className="p-8 text-center text-gray-500">No members in this summary group.</div>;
    }

    return (
        <div className="overflow-x-auto border rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Member</th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Prior Avg</th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Target Avg</th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Traits (Calculated)</th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">Trend</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {memberList.map((m) => {
                        const isPositive = m.priorAverageWithSenior === null || m.actualAverage > m.priorAverageWithSenior;
                        const isNegative = m.priorAverageWithSenior !== null && m.actualAverage < m.priorAverageWithSenior;

                        return (
                            <tr key={m.memberId} className={isNegative ? 'bg-red-50' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {m.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {m.priorAverageWithSenior?.toFixed(2) ?? 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="1.00"
                                        max="5.00"
                                        className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-2 py-1 border"
                                        value={m.targetAverage}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleTargetChange(m.memberId, e.target.value)}
                                    />
                                    <div className="text-xs text-gray-400 mt-1">
                                        Actual: {m.actualAverage.toFixed(2)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                    [{m.traits.professionalKnowledge},{m.traits.commandClimate},{m.traits.militaryBearing},{m.traits.character},{m.traits.teamwork},{m.traits.leadership},{m.traits.equalOpportunity}]
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    {m.priorAverageWithSenior === null ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            NEW
                                        </span>
                                    ) : isPositive ? (
                                        <ArrowUpRight className="w-5 h-5 text-green-500 mx-auto" />
                                    ) : isNegative ? (
                                        <ArrowDownRight className="w-5 h-5 text-red-500 mx-auto" />
                                    ) : (
                                        <Minus className="w-5 h-5 text-gray-400 mx-auto" />
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
