import { configureStore } from '@reduxjs/toolkit';
import rosterReducer from './rosterSlice.ts';
import reportsReducer from './reportsSlice.ts';
import boardsReducer from './boardsSlice.ts';

export const store = configureStore({
    reducer: {
        roster: rosterReducer,
        reports: reportsReducer,
        boards: boardsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
