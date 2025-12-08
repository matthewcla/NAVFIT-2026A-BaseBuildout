import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { initScenario, commitScenario } from './rscaSlice';
import { SummaryGroupMatrix } from './components/SummaryGroupMatrix';
import { RSCATrendChart } from './components/RSCATrendChart';
import { InflationWarning } from './components/InflationWarning';
import { storage } from '../../storage/db';
import { Save, RefreshCw } from 'lucide-react';

export const RSCADashboard: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {
        seniorName,
        baselineRSCA,
        projectedRSCA,
        successMessage,
        loading,
        error
    } = useSelector((state: RootState) => state.rsca);

    // Mock Initialization for Demo/Dev
    useEffect(() => {
        const bootstrap = async () => {
            // Ensure data exists first (Phase 1 legacy helper)
            const senior = await storage.ensureDefaultSenior();

            // Just grab all members for the demo scenario
            const roster = await storage.getAllRoster();
            // If no roster, maybe seed one? Or assume existing. 
            // Let's grab IDs.
            const memberIds = roster.map(m => m.id);

            if (memberIds.length === 0) {
                // Fallback if no roster
            }

            dispatch(initScenario({
                seniorId: senior.id,
                memberIds: memberIds
            }));
        };

        // Only init if not already loaded? Or force refresh?
        // For dev hot reload safety, maybe check? 
        // But let's just run it for now.
        bootstrap();

        return () => {
            // Cleanup on unmount? 
            // dispatch(clearScenario()); 
            // Maybe not, we might want to keep state if navigating away?
        };
    }, [dispatch]);

    const handleCommit = () => {
        if (confirm('Are you sure you want to sign and commit this summary group? This action cannot be undone.')) {
            dispatch(commitScenario());
        }
    };

    if (successMessage) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-12 text-center bg-green-50 rounded-lg border border-green-200 m-8">
                <div className="text-3xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-green-800 mb-2">Scenario Committed!</h2>
                <p className="text-green-700 mb-6">{successMessage}</p>
                <div className="text-sm text-green-600 mb-4">
                    New Senior RSCA: <span className="font-bold">{projectedRSCA.toFixed(2)}</span>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                    Start New Scenario
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 p-6 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">RSCA Optimizer</h1>
                    <p className="text-sm text-gray-500">Reporting Senior: <span className="font-medium text-gray-700">{seniorName || 'Loading...'}</span></p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reset
                    </button>
                    <button
                        onClick={handleCommit}
                        disabled={loading || error !== null}
                        className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm 
                            ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}
                        `}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Processing...' : 'Commit Scenario'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">

                {/* Left Panel: Grid */}
                <div className="flex-1 bg-white rounded-lg shadow-sm border p-4 overflow-y-auto">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Evaluation Group</h2>
                    <SummaryGroupMatrix />
                </div>

                {/* Right Panel: Analytics */}
                <div className="w-full lg:w-96 flex flex-col gap-6">

                    {/* Warning Card */}
                    <InflationWarning
                        baselineRSCA={baselineRSCA}
                        projectedRSCA={projectedRSCA}
                    />

                    {/* Chart Card */}
                    <RSCATrendChart
                        baselineRSCA={baselineRSCA}
                        projectedRSCA={projectedRSCA}
                    />

                    {/* Stats Card */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Session Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs text-gray-400">Baseline</div>
                                <div className="text-xl font-bold text-gray-900">{baselineRSCA.toFixed(2)}</div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-400">Projected</div>
                                <div className={`text-xl font-bold ${projectedRSCA > baselineRSCA ? 'text-amber-600' : 'text-green-600'}`}>
                                    {projectedRSCA.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
