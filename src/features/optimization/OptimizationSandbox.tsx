import { useState } from "react";
import { RscaBurnDownChart } from "./RscaBurnDownChart";
import { Sliders, AlertTriangle } from "lucide-react";

export const OptimizationSandbox = () => {
    // Mock State
    const [currentRsca, setCurrentRsca] = useState(3.65);
    const [reportCount, setReportCount] = useState(42);
    const [targetMax, setTargetMax] = useState(3.80);

    // Mock Scenario: 5 upcoming reports
    const [scenarios, setScenarios] = useState([
        { id: 1, name: "LT Smith", grade: "O-3", projectedAvg: 4.0 },
        { id: 2, name: "LT Jones", grade: "O-3", projectedAvg: 3.8 },
        { id: 3, name: "LT Doe", grade: "O-3", projectedAvg: 3.5 },
        { id: 4, name: "LT White", grade: "O-3", projectedAvg: 3.0 }, // Simple maintain
        { id: 5, name: "LT Black", grade: "O-3", projectedAvg: 4.2 }, // Breakout
    ]);

    const handleUpdate = (id: number, val: number) => {
        setScenarios(scenarios.map((s) => (s.id === id ? { ...s, projectedAvg: val } : s)));
    };

    const projectedData = scenarios.map((s) => ({ date: "TBD", projectedAvg: s.projectedAvg }));

    // Calculate final
    const finalSum = (currentRsca * reportCount) + scenarios.reduce((acc, s) => acc + s.projectedAvg, 0);
    const finalCount = reportCount + scenarios.length;
    const finalRsca = finalSum / finalCount;
    const isOverLimit = finalRsca > targetMax;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controls */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="flex items-center gap-2 font-bold text-gray-800 mb-4">
                        <Sliders size={20} className="text-blue-600" /> Parameters
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Current Cumulative Average</label>
                            <input
                                type="number"
                                step="0.01"
                                value={currentRsca}
                                onChange={(e) => setCurrentRsca(parseFloat(e.target.value))}
                                className="w-full border border-gray-300 rounded p-2 font-mono text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Number of Reports</label>
                            <input
                                type="number"
                                step="1"
                                value={reportCount}
                                onChange={(e) => setReportCount(parseInt(e.target.value))}
                                className="w-full border border-gray-300 rounded p-2 font-mono text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target RSCA Ceiling</label>
                            <input
                                type="number"
                                step="0.01"
                                value={targetMax}
                                onChange={(e) => setTargetMax(parseFloat(e.target.value))}
                                className="w-full border border-gray-300 rounded p-2 font-mono text-sm"
                            />
                        </div>
                    </div>

                    <div className={`mt-6 p-4 rounded-lg border ${isOverLimit ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                        <div className="text-xs font-bold uppercase text-gray-500 mb-1">Projected RSCA</div>
                        <div className={`text-3xl font-bold ${isOverLimit ? 'text-red-700' : 'text-green-700'}`}>
                            {finalRsca.toFixed(3)}
                        </div>
                        {isOverLimit && (
                            <div className="flex items-start gap-2 mt-2 text-xs text-red-600">
                                <AlertTriangle size={14} className="mt-0.5" />
                                <span>Warning: Constraint violation. You must deflate other reports to afford this batch.</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Vis & Scenarios */}
            <div className="lg:col-span-2 space-y-6">
                <RscaBurnDownChart
                    currentRsca={currentRsca}
                    reportCount={reportCount}
                    projectedReports={projectedData}
                    maxRsca={targetMax}
                />

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-4">Batch Optimization</h3>
                    <div className="space-y-4">
                        {scenarios.map(s => (
                            <div key={s.id} className="flex items-center gap-4">
                                <div className="w-32">
                                    <div className="font-medium text-sm text-gray-900">{s.name}</div>
                                    <div className="text-xs text-gray-500">{s.grade}</div>
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="range" min="2.0" max="5.0" step="0.01"
                                        value={s.projectedAvg}
                                        onChange={(e) => handleUpdate(s.id, parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>
                                <div className="w-16 text-right font-mono font-bold text-blue-600">{s.projectedAvg.toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
