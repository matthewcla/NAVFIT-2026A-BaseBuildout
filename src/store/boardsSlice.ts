import { createSlice } from '@reduxjs/toolkit';

export interface BoardEvent {
    id: string;
    name: string;
    conveningDate: string; // ISO Date
    eligibleGrades: string[];
    notes?: string;
}

import boardsData from '../data/StatutoryBoards.json';

const initialState = {
    boards: boardsData as BoardEvent[],
};

const boardsSlice = createSlice({
    name: 'boards',
    initialState,
    reducers: {},
});

export const selectAllBoards = (state: { boards: { boards: BoardEvent[] } }) => state.boards.boards;

export const selectBoardsForGrade = (state: { boards: { boards: BoardEvent[] } }, grade: string) => {
    return state.boards.boards.filter(b => b.eligibleGrades.includes(grade));
};

export default boardsSlice.reducer;
