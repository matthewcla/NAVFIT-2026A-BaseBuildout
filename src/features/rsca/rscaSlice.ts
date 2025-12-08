import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { storage, type ReportingSenior } from '../../storage/db';
import { getRecommendedAverage } from './logic/trendOptimizer';
import { solveTraits, type TraitConfiguration } from './logic/traitSolver';
import type { RootState } from '../../store/store';
import { addReport, type EvaluationReport, type TraitScores } from '../../store/reportsSlice';


// --- Types ---

export interface ScenarioMember {
    memberId: string;
    name: string;

    // History
    priorAverageWithSenior: number | null;

    // Plan
    recommendedAverage: number; // The floor
    targetAverage: number;      // The user's input

    // Solution
    traits: TraitConfiguration;
    isNOB: boolean[]; // [t1, t2, ..., t7]

    // Realized
    actualAverage: number;
}

export interface RSCAScene {
    seniorId: string | null;
    seniorName: string;
    baselineRSCA: number;

    members: Record<string, ScenarioMember>;

    projectedRSCA: number;

    loading: boolean;
    error: string | null;
    successMessage: string | null;
}

const initialState: RSCAScene = {
    seniorId: null,
    seniorName: '',
    baselineRSCA: 0,
    members: {},
    projectedRSCA: 0,
    loading: false,
    error: null,
    successMessage: null,
};

// --- Thunks ---

export const initScenario = createAsyncThunk(
    'rsca/initScenario',
    async ({ seniorId, memberIds }: { seniorId: string, memberIds: string[] }, { rejectWithValue }) => {
        try {
            // 1. Fetch Senior
            const seniors = await storage.getAllSeniors();
            const senior = seniors.find(s => s.id === seniorId);
            if (!senior) throw new Error('Reporting Senior not found');

            // 2. Build Members
            const memberMap: Record<string, ScenarioMember> = {};
            const roster = await storage.getAllRoster();

            for (const mid of memberIds) {
                const rosterMember = roster.find(m => m.id === mid);
                if (!rosterMember) continue;

                const priorReport = await storage.getPriorReport(mid, seniorId);
                const priorAvg = priorReport ? priorReport.summaryGroupAverage : null;

                const recommended = getRecommendedAverage(priorAvg, senior.currentRSCA);
                const initialTarget = recommended; // Default to recommended

                const nobVector = [false, false, false, false, false, false, false];
                const solveResult = solveTraits(initialTarget, nobVector);

                memberMap[mid] = {
                    memberId: mid,
                    name: `${rosterMember.lastName}, ${rosterMember.firstName}`,
                    priorAverageWithSenior: priorAvg,
                    recommendedAverage: recommended,
                    targetAverage: initialTarget,
                    traits: solveResult.traits,
                    isNOB: nobVector,
                    actualAverage: solveResult.actualAverage
                };
            }

            return {
                senior,
                members: memberMap
            };
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

export const commitScenario = createAsyncThunk(
    'rsca/commitScenario',
    async (_, { getState, dispatch, rejectWithValue }) => {
        const state = getState() as RootState;
        const { seniorId, members } = state.rsca;

        if (!seniorId) return rejectWithValue('No active scenario');

        try {
            // 1. Fetch Senior to get fresh stats (concurrency safety - simplistic)
            const seniors = await storage.getAllSeniors();
            const senior = seniors.find(s => s.id === seniorId);
            if (!senior) throw new Error('Senior missing');

            let newTotalScore = senior.cumulativeTotalScore;
            let newReportCount = senior.cumulativeReportsCount;

            const memberValues = Object.values(members);

            // 2. Save Reports
            for (const m of memberValues) {
                // Generate a report ID
                const reportId = crypto.randomUUID();

                // Map traits to old TraitScores format (t1..t7)
                const legacyTraits: TraitScores = {
                    t1: m.traits.t1,
                    t2: m.traits.t2,
                    t3: m.traits.t3,
                    t4: m.traits.t4,
                    t5: m.traits.t5,
                    t6: m.traits.t6,
                    t7: m.traits.t7,
                };

                const report: EvaluationReport = {
                    id: reportId,
                    memberId: m.memberId,
                    reportingSeniorId: seniorId,
                    type: 'Enlisted', // Default for now, ideally comes from Roster
                    lastName: m.name.split(',')[0],
                    firstName: m.name.split(',')[1]?.trim() || '',
                    mi: '',
                    suffix: '',
                    grade: 'E5', // Placeholder, needs roster data
                    designator: '',
                    uic: '00000',
                    shipStation: 'US NAVY',
                    promotionStatus: 'Promotable',
                    dateReported: new Date().toISOString(),
                    occasion: 'Periodic',
                    periodFrom: new Date().toISOString(),
                    periodTo: new Date().toISOString(),
                    reportType: 'Regular',
                    commandEmployment: 'N/A',
                    primaryDuties: 'N/A',
                    comments: 'Generated by RSCA Optimizer',
                    traits: legacyTraits,
                    promotionRecommendation: 'Promotable',
                    summaryGroupAverage: m.actualAverage
                };

                await storage.saveReport(report);

                // Update Redux Reports State
                dispatch(addReport(report));

                // Accumulate Stats
                newTotalScore += m.actualAverage;
                newReportCount += 1;
            }

            // 3. Update Senior
            const currentRSCA = newReportCount > 0
                ? Number((newTotalScore / newReportCount).toFixed(2))
                : 0;

            const updatedSenior: ReportingSenior = {
                ...senior,
                cumulativeTotalScore: newTotalScore,
                cumulativeReportsCount: newReportCount,
                currentRSCA
            };

            await storage.saveSenior(updatedSenior);

            return updatedSenior;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

// --- Slice ---

const rscaSlice = createSlice({
    name: 'rsca',
    initialState,
    reducers: {
        updateTarget: (state, action: PayloadAction<{ memberId: string, newTarget: number }>) => {
            const { memberId, newTarget } = action.payload;
            const member = state.members[memberId];
            if (!member) return;

            // Run Solver
            const result = solveTraits(newTarget, member.isNOB);

            // Update State
            member.targetAverage = newTarget;
            member.traits = result.traits;
            member.actualAverage = result.actualAverage;

            // Update Projected Group RSCA
            recalculateProjectedRSCA(state);
        },
        toggleNOB: (_state, _action: PayloadAction<{ memberId: string, traitKey: keyof TraitConfiguration }>) => {
            // To implement later if UI allows toggling specific NOBs
            // For now, logic assumes we pass the whole vector or indices
        },
        clearScenario: (_state) => {
            return initialState;
        }
    },
    extraReducers: (builder) => {
        // Init
        builder.addCase(initScenario.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(initScenario.fulfilled, (state, action) => {
            state.loading = false;
            state.seniorId = action.payload.senior.id;
            state.seniorName = `${action.payload.senior.lastName}, ${action.payload.senior.firstName}`;
            state.baselineRSCA = action.payload.senior.currentRSCA;
            state.members = action.payload.members;
            recalculateProjectedRSCA(state);
        });
        builder.addCase(initScenario.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Commit
        builder.addCase(commitScenario.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(commitScenario.fulfilled, (state, action) => {
            state.loading = false;
            state.successMessage = "Scenario committed successfully!";
            // We could clear state or keep it for review.
            // Let's keep it but update baseline.
            state.baselineRSCA = action.payload.currentRSCA;
            state.members = {}; // Clear members as they are now processed? Or keep?
            // Clearing members makes sense as "Transaction Done".
            state.projectedRSCA = action.payload.currentRSCA;
        });
        builder.addCase(commitScenario.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
    }
});

// Helper
function recalculateProjectedRSCA(state: RSCAScene) {
    // Current Senior Stats
    // Implementation Plan didn't specify exact formula for Projected RSCA mixing history + active batch.
    // Projected RSCA = (OldTotal + Sum(NewAverages)) / (OldCount + Count(NewMembers))

    // We don't have the raw counts in state directly, only baselineRSCA. 
    // We need cumulative counts from the senior object.
    // Issue: state.seniorId only stores ID. We need the counts.
    // Solution: Let's store cumulative counts in the state or fetch them?
    // Optimization: Add `cumulativeHelper` fields to state or just approximate?
    // Accurate way: `initScenario` should store the raw stats in state.

    // For now, let's just average the CURRENT batch as a proxy or if we want the GLOBAL projected:
    // We need the senior's history. 
    // Let's assume for Visualization purposes, we just show the Batch Average vs Baseline.
    // IF we want "Future Semantic RSCA", we need the weights.
    // For MVP Phase 3, let's compute the BATCH Average.

    const members = Object.values(state.members);
    if (members.length === 0) {
        state.projectedRSCA = state.baselineRSCA;
        return;
    }

    const batchSum = members.reduce((sum, m) => sum + m.actualAverage, 0);
    state.projectedRSCA = Number((batchSum / members.length).toFixed(2));
}

export const { updateTarget, clearScenario } = rscaSlice.actions;
export default rscaSlice.reducer;
