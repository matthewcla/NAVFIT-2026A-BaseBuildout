import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initScenario, updateTarget, commitScenario } from '../features/rsca/rscaSlice';
import type { AppDispatch, RootState } from '../store/store';
import { initDB, storage } from '../storage/db';

export const Phase3VerifierV2: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const rscaState = useSelector((state: RootState) => state.rsca);
    const [logs, setLogs] = useState<string[]>([]);
    const [step, setStep] = useState(0);

    const log = (msg: string) => setLogs(prev => [...prev, msg]);

    useEffect(() => {
        const runTests = async () => {
            if (step === 0) {
                // Setup Data
                log('Step 0: Seeding DB...');
                const db = await initDB();
                await db.clear('reporting_seniors');
                await db.clear('roster');
                await db.clear('reports');

                await db.put('reporting_seniors', {
                    id: 'senior-p3', lastName: 'Vader', firstName: 'Darth', rank: 'CAPT',
                    cumulativeTotalScore: 0, cumulativeReportsCount: 0, currentRSCA: 4.00,
                    // lastUpdated: new Date() // Not in type definition check
                });
                await db.put('roster', {
                    id: 'member-p3', lastName: 'Trooper', firstName: 'TK-421', middleInitial: '',
                    rank: 'E5', department: 'Deck', division: '1st', uic: '00000',
                    dateReported: new Date().toISOString(), projectedRotationDate: new Date().toISOString()
                });
                log('✅ DB Seeded.');
                setStep(1);
            }
        };
        runTests();
    }, [step]);

    // Step 1: Init Scenario
    useEffect(() => {
        if (step === 1) {
            log('Step 1: Init Scenario...');
            dispatch(initScenario({ seniorId: 'senior-p3', memberIds: ['member-p3'] }))
                .unwrap()
                .then(() => {
                    log('✅ perform initScenario success.');
                    setStep(2);
                })
                .catch(err => log(`❌ initScenario failed: ${err}`));
        }
    }, [step, dispatch]);

    // Step 2: Check Init State & Update Target
    useEffect(() => {
        if (step === 2 && !rscaState.loading && rscaState.members['member-p3']) {
            const member = rscaState.members['member-p3'];
            if (member.recommendedAverage > 0) {
                log(`✅ Member initialized. Recommended: ${member.recommendedAverage}`);

                log('Step 2: Updating Target to 4.50...');
                dispatch(updateTarget({ memberId: 'member-p3', newTarget: 4.50 }));
                setStep(3);
            } else {
                log('❌ Member initialization failed.');
            }
        }
    }, [step, rscaState.loading, rscaState.members, dispatch]);

    // Step 3: Verify Update & Commit
    useEffect(() => {
        if (step === 3) {
            const member = rscaState.members['member-p3'];
            // Give redux a tick to update
            if (member && member.targetAverage === 4.50) {
                log(`✅ State Updated: Target ${member.targetAverage}, Actual ${member.actualAverage}`);

                log('Step 3: Committing Scenario...');
                dispatch(commitScenario())
                    .unwrap()
                    .then(() => {
                        log('✅ perform commitScenario success.');
                        setStep(4);
                    })
                    .catch(e => log(`❌ Commit failed: ${e}`));
            }
        }
    }, [step, rscaState.members, dispatch]);

    // Step 4: Verify Persistence
    useEffect(() => {
        if (step === 4 && rscaState.successMessage) {
            log('Step 4: Verifying Persistence...');
            const verify = async () => {
                const seniors = await storage.getAllSeniors();
                const senior = seniors.find(s => s.id === 'senior-p3');

                if (senior && senior.cumulativeReportsCount === 1) {
                    log(`✅ Senior Updated: Count ${senior.cumulativeReportsCount}, RSCA ${senior.currentRSCA}`);
                } else {
                    log(`❌ Senior Update Failed: Count ${senior?.cumulativeReportsCount}`);
                }

                // const reports = await storage.getReportsBySenior('senior-p3'); // Method might not exist on storage interface directly? Check db.ts
                // Workaround: Get all reports and filter
                const allReports = await storage.getAllReports();
                const reports = allReports.filter(r => r.reportingSeniorId === 'senior-p3');

                if (reports.length === 1 && reports[0].memberId === 'member-p3') {
                    log(`✅ Report Saved: ID ${reports[0].id}`);
                    if (reports[0].traits.professionalKnowledge > 0) {
                        log('✅ Report has Traits.');
                        log('🎉 ALL PHASE 3 TESTS PASSED');
                    } else {
                        log('❌ Report missing Traits.');
                    }
                } else {
                    log(`❌ Report not found or mismatch. Found: ${reports.length} reports.`);
                    if (reports.length > 0) log(`First report memberId: ${reports[0].memberId}`);
                }
            };
            verify();
            setStep(5);
        }
    }, [step, rscaState.successMessage]);

    return (
        <div style={{ padding: 20, fontFamily: 'monospace' }}>
            <h1>Phase 3 State Manager Verifier</h1>
            <h3>Status: {step === 5 ? 'Done' : 'Running Step ' + step}</h3>
            <ul>
                {logs.map((l, i) => <li key={i}>{l}</li>)}
            </ul>
        </div>
    );
};
