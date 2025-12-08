import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

// Full-fidelity EvaluationReport matching NAVPERS 1610/2
export interface EvaluationReport {
    id: string;
    memberId: string; // Links to ServiceMember (Blocks 1-4)
    reportingSeniorId: string; // Links to ReportingSenior (Blocks 22-27)

    // Internal Metadata
    formType: 'Officer' | 'Chief' | 'Enlisted'; // UI distinction (not on form)

    // -- ADMIN SECTION (1-9) --
    lastName: string;
    firstName: string;
    mi: string;
    suffix: string;
    rank: string;         // Blk 2
    designator: string;   // Blk 3
    uic: string;          // Blk 6
    shipStation: string;  // Blk 7
    promotionStatus: 'Regular' | 'Frocked' | 'Selected' | 'Spot'; // Blk 8
    dateReported: string; // Blk 9 (ISO Date)

    // -- OCCASION (10-15) --
    occasion: 'Periodic' | 'Detachment' | 'Promotion' | 'Special'; // Blk 10-13
    startDate: string; // Blk 14
    endDate: string;   // Blk 15

    // -- TYPE & STATUS (17-21) --
    type: 'Regular' | 'Concurrent' | 'Special'; // Blk 17-19
    physicalReadiness: string; // Blk 20 (e.g., "P", "F", "MED")
    billetSubcategory: string; // Blk 21 (e.g., "NA", "INDIV AUG")

    // -- DUTIES (28-29) --
    commandEmployment: string; // Blk 28 (Command Achievements)
    primaryDuties: {
        scope: string; // The "Briefly state..." section
        titles: string[]; // List of collateral/primary duties
    }; // Blk 29

    // -- COUNSELING (30-32) --
    dateCounseled: string; // Blk 30
    counselorName: string; // Blk 31

    // -- PERFORMANCE TRAITS (33-39) --
    // Integers 1-5. 0 = NOB.
    traits: {
        professionalKnowledge: number; // Blk 33
        commandClimate: number;       // Blk 34
        militaryBearing: number;      // Blk 35
        character: number;            // Blk 36
        teamwork: number;             // Blk 37
        leadership: number;           // Blk 38
        equalOpportunity: number;     // Blk 39
    };

    // -- RECOMMENDATION (40-43) --
    comments: string; // Blk 41 (Max ~18 lines)
    promotionRecommendation: 'NOB' | 'Significant Problems' | 'Progressing' | 'Promotable' | 'Must Promote' | 'Early Promote'; // Blk 42
    summaryGroupAverage: number; // Blk 43 (Calculated snapshot)

    // -- SIGNATURES (45-46) --
    dateSignedSenior: string | null;
    dateSignedMember: string | null;
}

export interface TraitScores { [key: string]: number } // Legacy support if needed, or remove?
// Keeping mapped type alias if useful, or removing. 
// I'll make TraitScores match the new shape if possible or just rely on the inline type?
// The slice uses TraitScores in imports elsewhere? 
// rscaSlice imported TraitScores. I should export the new Traits type.

export type PerformanceTraits = EvaluationReport['traits'];

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
