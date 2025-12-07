import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { rosterSelectors } from '../../store/rosterSlice';
import { selectAllBoards } from '../../store/boardsSlice';
import { WaterfallChart } from './WaterfallChart';
import { Users, Filter, Calendar } from 'lucide-react';

const BoardsCard = () => {
    const boards = useSelector((state: RootState) => selectAllBoards(state));

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase mb-3">
                <Calendar size={16} /> Upcoming Boards
            </h3>
            <div className="space-y-3">
                {boards.map(board => (
                    <div key={board.id} className="text-sm p-2 bg-gray-50 rounded border border-gray-100">
                        <div className="font-bold text-gray-800">{board.name}</div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{board.conveningDate}</span>
                            <span>{board.eligibleGrades.join(', ')}</span>
                        </div>
                    </div>
                ))}
                {boards.length === 0 && <div className="text-xs text-gray-400 italic">No boards scheduled</div>}
            </div>
        </div>
    );
};

export const PersonnelDashboard = () => {
    const members = useSelector((state: RootState) => rosterSelectors.selectAll(state.roster));
    const [filter, setFilter] = useState<{ type: 'gain' | 'loss' | null, month: string | null }>({ type: null, month: null });

    // Mock Date Window
    const startDate = new Date(2025, 9, 1); // Oct 1, 2025
    const endDate = new Date(2026, 8, 30);   // Sep 30, 2026

    const handleChartClick = (type: string, month: string) => {
        // Parse type
        if (type === 'gain' || type === 'loss') {
            setFilter({ type: type as 'gain' | 'loss', month });
        }
    };

    const filteredMembers = members.filter((m: any) => {
        if (!filter.type || !filter.month) return true;

        // Match month logic (simple string matching for prototype)
        // Ideally use real Date logic
        const targetDate = filter.type === 'gain' ? new Date(m.dateReported) : new Date(m.projectedRotationDate);
        const monthStr = targetDate.toLocaleString('default', { month: 'short', year: '2-digit' });

        return monthStr === filter.month;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Personnel Management</h2>
                    <p className="text-gray-500">Track dynamic gains, losses, and roster strength.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                        <Filter size={16} /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                        <Users size={16} /> Add Member
                    </button>
                </div>
            </div>

            {/* Visualization Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <WaterfallChart
                        members={members}
                        startDate={startDate}
                        endDate={endDate}
                        onBarClick={handleChartClick}
                    />
                </div>
                {/* Stats Card */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center space-y-4">
                        <div className="text-center">
                            <div className="text-sm text-gray-500 font-medium uppercase">Current Onboard</div>
                            <div className="text-4xl font-bold text-gray-900">{members.length}</div>
                        </div>
                        <div className="border-t border-gray-100 pt-4 flex justify-between text-sm">
                            <span className="text-green-600 font-bold">Planned Gains: +{/* Calculated later */}0</span>
                            <span className="text-red-600 font-bold">Planned Losses: -{/* Calculated later */}0</span>
                        </div>
                    </div>

                    <BoardsCard />
                </div>
            </div>

            {/* Roster Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-700">Roster {filter.type ? `(${filter.type === 'gain' ? 'Gains' : 'Losses'} in ${filter.month})` : ''}</h3>
                    {filter.type && (
                        <button onClick={() => setFilter({ type: null, month: null })} className="text-xs text-red-600 hover:underline">
                            Clear Filter
                        </button>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-3 font-medium text-gray-500 uppercase tracking-wider">Dept/Div</th>
                                <th className="px-6 py-3 font-medium text-gray-500 uppercase tracking-wider">Reported</th>
                                <th className="px-6 py-3 font-medium text-gray-500 uppercase tracking-wider">PRD</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredMembers.length > 0 ? filteredMembers.map((m: any) => (
                                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{m.lastName}, {m.firstName}</td>
                                    <td className="px-6 py-4 text-gray-600">{m.rank}</td>
                                    <td className="px-6 py-4 text-gray-600">{m.department}/{m.division}</td>
                                    <td className="px-6 py-4 text-gray-600">{m.dateReported}</td>
                                    <td className="px-6 py-4 text-gray-600">{m.projectedRotationDate}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                                        No members found matching criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
