import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

export interface TraitScores {
    [key: string]: number; // t1..t7
}

export interface EvaluationReport {
    id: string;
    memberId: string; // FK to Roster
    seniorId: string | null; // FK to Senior (if we track seniors separately)

    // Admin Data (Snapshot)
    grade: string;
    designator: string;
    uic: string;
    shipStation: string;
    promotionStatus: string;
    dateReported: string; // ISO Date

    // Occasion
    occasion: 'Periodic' | 'Detachment' | 'Promotion' | 'Special';
    periodFrom: string;
    periodTo: string;
    reportType: 'Regular' | 'Concurrent';

    // Body
    commandEmployment: string;
    primaryDuties: string;
    comments: string;

    // Scores
    traits: TraitScores;
    promotionRecommendation: 'NOB' | 'Significant Problems' | 'Progressing' | 'Promotable' | 'Must Promote' | 'Early Promote';

    summaryGroupAverage: number;
}

const reportsAdapter = createEntityAdapter<EvaluationReport>();

const reportsSlice = createSlice({
    name: 'reports',
    initialState: reportsAdapter.getInitialState(),
    reducers: {
        addReport: reportsAdapter.addOne,
        updateReport: reportsAdapter.updateOne,
        removeReport: reportsAdapter.removeOne,
        setAllReports: reportsAdapter.setAll,
    },
});

export const { addReport, updateReport, removeReport, setAllReports } = reportsSlice.actions;
export const reportsSelectors = reportsAdapter.getSelectors();
export default reportsSlice.reducer;
