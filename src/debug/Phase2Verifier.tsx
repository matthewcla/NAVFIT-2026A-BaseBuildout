import React, { useEffect, useState } from 'react';
import { solveTraits, type SolverResult } from '../features/rsca/logic/traitSolver';
import { getRecommendedAverage } from '../features/rsca/logic/trendOptimizer';

export const Phase2Verifier: React.FC = () => {
    const [results, setResults] = useState<string[]>([]);
    const [status, setStatus] = useState('Running...');

    const log = (msg: string) => setResults(prev => [...prev, msg]);

    useEffect(() => {
        try {
            log('Starting Phase 2 Logic Verification (Architecture Compliance)...');

            // Test 1: Trend Optimizer - New Relationship
            const rec1 = getRecommendedAverage(null, 4.00);
            if (rec1 === 3.00) log('✅ Trend: New Relationship defaults to 3.00');
            else log(`❌ Trend: New Relationship failed (Got ${rec1})`);

            // Test 2: Trend Optimizer - Existing Relationship
            const rec2 = getRecommendedAverage(3.50, 4.00);
            if (rec2 === 3.51) log('✅ Trend: Existing Relationship +0.01');
            else log(`❌ Trend: Existing Relationship failed (Got ${rec2})`);

            // Test 3: Trait Solver - High Performance
            const target3 = 4.29;
            const nobVec3 = [false, false, false, false, false, false, false];
            const res3: SolverResult = solveTraits(target3, nobVec3);

            if (res3.actualAverage === 4.29) {
                log(`✅ Solver: Precise Match 4.29`);
            } else {
                log(`❌ Solver: Failed 4.29 (Got ${res3.actualAverage})`);
            }

            // Verify Keys
            if (res3.traits.professionalKnowledge !== undefined && res3.traits.equalOpportunity !== undefined) {
                log('✅ Solver: Returns correct PerformanceTraits keys');
            } else {
                log('❌ Solver: Missing named keys');
            }

            // Test 4: Floor Logic (Ensure no <3.0 if target >= 3.0)
            const target4 = 3.80;
            // 3.80 * 7 = 26.6 -> 27 pts.
            // 27 / 7 = 3.86 (rounding logic in solver might adjust target to actual allowable)
            // Wait, solver returns "actualAverage".
            // 3.80 is not exactly achievable with 7 traits? 
            // 26/7 = 3.71, 27/7 = 3.86.
            // Solver should pick nearest integer sum.
            const res4 = solveTraits(target4, nobVec3);
            log(`ℹ️ Solver: Target ${target4} -> Actual ${res4.actualAverage}`);

            const values = Object.values(res4.traits);
            const minVal = Math.min(...values);
            if (target4 >= 3.0 && minVal >= 3) {
                log('✅ Solver: Floor 3.0 respected');
            } else if (target4 >= 3.0 && minVal < 3) {
                log(`❌ Solver: Floor 3.0 violated (Min: ${minVal})`);
            }

            setStatus('Complete');

        } catch (e: any) {
            log('❌ Fatal Error: ' + e.message);
            setStatus('Error');
        }
    }, []);

    return (
        <div style={{ padding: 20, fontFamily: 'monospace' }}>
            <h1>Phase 2 Logic Verifier (Arch Compliant)</h1>
            <h3>Status: {status}</h3>
            <ul>
                {results.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
        </div>
    );
};
