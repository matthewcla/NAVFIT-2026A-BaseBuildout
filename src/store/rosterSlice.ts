import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

export interface ServiceMember {
    id: string;
    lastName: string;
    firstName: string;
    middleInitial: string;
    rank: string;
    department: string;
    division: string;
    dateReported: string; // ISO Date "YYYY-MM-DD"
    projectedRotationDate: string; // ISO Date "YYYY-MM-DD"
    uic: string;
}

const rosterAdapter = createEntityAdapter<ServiceMember>();

const rosterSlice = createSlice({
    name: 'roster',
    initialState: rosterAdapter.getInitialState(),
    reducers: {
        addMember: rosterAdapter.addOne,
        updateMember: rosterAdapter.updateOne,
        removeMember: rosterAdapter.removeOne,
        setAllMembers: rosterAdapter.setAll,
    },
});

export const { addMember, updateMember, removeMember, setAllMembers } = rosterSlice.actions;
export const rosterSelectors = rosterAdapter.getSelectors();
export default rosterSlice.reducer;
