import React, { useEffect, useState } from 'react';
import { storage, initDB } from '../storage/db';
import type { EvaluationReport } from '../store/reportsSlice';

export const Phase1VerifierV2: React.FC = () => {
    const [status, setStatus] = useState<string>('Initializing...');
    const [results, setResults] = useState<string[]>([]);

    useEffect(() => {
        const runVerification = async () => {
            try {
                // 1. Reset DB for test
                const db = await initDB();
                await db.clear('reports');
                setStatus('DB Cleared. Starting tests...');

                const log = (msg: string) => setResults(prev => [...prev, msg]);

                // 2. Create a Full Fidelity Report
                const report1: EvaluationReport = {
                    id: 'report-v2-001',
                    memberId: 'member-001',
                    reportingSeniorId: 'senior-001',
                    formType: 'Officer',
                    rank: 'LT',
                    lastName: 'Skywalker',
                    firstName: 'Luke',
                    mi: 'S',
                    suffix: '',
                    designator: '1310',
                    uic: '55555',
                    shipStation: 'ROGUE SQUADRON',
                    promotionStatus: 'Regular',
                    dateReported: '2025-01-01',
                    occasion: 'Periodic',
                    startDate: '2025-01-01',
                    endDate: '2025-12-31',
                    type: 'Regular',
                    physicalReadiness: 'P',
                    billetSubcategory: 'NA',
                    commandEmployment: 'Destroyed Death Star',
                    primaryDuties: {
                        scope: 'Commander, Rogue Squadron',
                        titles: ['Flight Leader', 'X-Wing Pilot']
                    },
                    dateCounseled: '2025-06-01',
                    counselorName: 'Yoda',
                    comments: 'Strong with the Force.',
                    traits: {
                        professionalKnowledge: 5.0,
                        commandClimate: 4.0,
                        militaryBearing: 3.0,
                        character: 5.0,
                        teamwork: 5.0,
                        leadership: 5.0,
                        equalOpportunity: 4.0
                    },
                    promotionRecommendation: 'Early Promote',
                    summaryGroupAverage: 4.50,
                    dateSignedSenior: null,
                    dateSignedMember: null
                };

                await storage.saveReport(report1);
                log('✅ Report 1 saved with full fidelity fields.');

                // 3. Create a prior report (older date)
                const reportOld: EvaluationReport = {
                    ...report1,
                    id: 'report-v2-old',
                    endDate: '2024-12-31',
                    traits: { ...report1.traits, professionalKnowledge: 3.0 }
                };
                await storage.saveReport(reportOld);
                log('✅ Prior Report saved (2024).');

                // 4. Test Retrieval via getPriorReport
                // Verify it returns report1 as "Prior" relative to a theoretical NEW report being drafted?
                // Wait, getPriorReport logic: sort by date desc, returns most recent.
                // If I ask for prior report for this member/senior, it should return report1 (2025) as the most recent one.
                const retrieved = await storage.getPriorReport('member-001', 'senior-001');

                if (retrieved && retrieved.id === 'report-v2-001') {
                    log('✅ getPriorReport returned the correct most recent report (2025).');
                } else {
                    log(`❌ getPriorReport failed. Expected 2025, got ${retrieved?.endDate}`);
                }

                // 5. Verify Complex Data Persistence
                if (retrieved?.primaryDuties.scope === 'Commander, Rogue Squadron') {
                    log('✅ Primary Duties Object preserved.');
                } else {
                    log('❌ Primary Duties Object lost or malformed.');
                }

                if (retrieved?.traits.professionalKnowledge === 5.0) {
                    log('✅ New Trait Keys preserved.');
                } else {
                    log('❌ Trait Keys lost.');
                }

                setStatus('Verification Complete');

            } catch (e: any) {
                setStatus('Error: ' + e.message);
                console.error(e);
            }
        };

        runVerification();
    }, []);

    return (
        <div style={{ padding: 20, fontFamily: 'monospace' }}>
            <h1>Phase 1 Data Model Verifier V2</h1>
            <h3>Status: {status}</h3>
            <ul>
                {results.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
        </div>
    );
};
