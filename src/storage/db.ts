import { openDB, type DBSchema } from 'idb';
import type { ServiceMember } from '../store/rosterSlice';
import type { EvaluationReport } from '../store/reportsSlice';

interface NavFitDB extends DBSchema {
    roster: {
        key: string;
        value: ServiceMember;
    };
    reports: {
        key: string;
        value: EvaluationReport;
    };
}

const DB_NAME = 'navfit-dss-db';
const DB_VERSION = 1;

export async function initDB() {
    return openDB<NavFitDB>(DB_NAME, DB_VERSION, {
        upgrade(db: any) {
            if (!db.objectStoreNames.contains('roster')) {
                db.createObjectStore('roster', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('reports')) {
                db.createObjectStore('reports', { keyPath: 'id' });
            }
        },
    });
}

// Data Access Layer
export const storage = {
    async getAllRoster() {
        const db = await initDB();
        return db.getAll('roster');
    },
    async saveMember(member: ServiceMember) {
        const db = await initDB();
        return db.put('roster', member);
    },
    async deleteMember(id: string) {
        const db = await initDB();
        return db.delete('roster', id);
    },
    async getAllReports() {
        const db = await initDB();
        return db.getAll('reports');
    },
    async saveReport(report: EvaluationReport) {
        const db = await initDB();
        return db.put('reports', report);
    },
    async deleteReport(id: string) {
        const db = await initDB();
        return db.delete('reports', id);
    }
};
