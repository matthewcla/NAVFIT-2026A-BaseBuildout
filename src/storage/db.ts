import { openDB, type DBSchema } from 'idb';
import type { ServiceMember } from '../store/rosterSlice';
import type { EvaluationReport } from '../store/reportsSlice';

export interface ReportingSenior {
    id: string; // UUID
    rank: string;
    lastName: string;
    firstName: string;

    // Cumulative Math Props (Source of Truth for RSCA)
    cumulativeTotalScore: number; // Sum of all individual trait averages ever submitted
    cumulativeReportsCount: number; // Total number of reports submitted
    currentRSCA: number; // Derived: cumulativeTotalScore / cumulativeReportsCount
}

interface NavFitDB extends DBSchema {
    roster: {
        key: string;
        value: ServiceMember;
    };
    reports: {
        key: string;
        value: EvaluationReport;
        indexes: { 'by_reporting_senior': string };
    };
    reporting_seniors: {
        key: string;
        value: ReportingSenior;
    };
}

const DB_NAME = 'navfit-dss-db';
const DB_VERSION = 2; // Incremented for Phase 1

export async function initDB() {
    return openDB<NavFitDB>(DB_NAME, DB_VERSION, {
        upgrade(db: any, oldVersion, newVersion, transaction) {
            if (!db.objectStoreNames.contains('roster')) {
                db.createObjectStore('roster', { keyPath: 'id' });
            }

            // Reports store
            if (!db.objectStoreNames.contains('reports')) {
                const reportsStore = db.createObjectStore('reports', { keyPath: 'id' });
                reportsStore.createIndex('by_reporting_senior', 'reportingSeniorId', { unique: false });
            } else {
                // Version 1 -> 2 upgrade path
                const reportsStore = transaction.objectStore('reports');
                if (!reportsStore.indexNames.contains('by_reporting_senior')) {
                    reportsStore.createIndex('by_reporting_senior', 'reportingSeniorId', { unique: false });
                }
            }

            // Reporting Seniors store
            if (!db.objectStoreNames.contains('reporting_seniors')) {
                db.createObjectStore('reporting_seniors', { keyPath: 'id' });
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
    },

    // --- Phase 1: Reporting Senior & History Extensions ---

    async getAllSeniors() {
        const db = await initDB();
        return db.getAll('reporting_seniors');
    },
    async saveSenior(senior: ReportingSenior) {
        const db = await initDB();
        return db.put('reporting_seniors', senior);
    },
    async ensureDefaultSenior() {
        const db = await initDB();
        const seniors = await db.getAll('reporting_seniors');
        if (seniors.length === 0) {
            const defaultSenior: ReportingSenior = {
                id: 'default-senior-001',
                rank: 'CAPT',
                lastName: 'Kirk',
                firstName: 'James',
                cumulativeTotalScore: 0,
                cumulativeReportsCount: 0,
                currentRSCA: 0
            };
            await db.put('reporting_seniors', defaultSenior);
            console.log('Seeded default Reporting Senior');
            return defaultSenior;
        }
        return seniors[0];
    },
    async getPriorReport(memberId: string, seniorId: string): Promise<EvaluationReport | undefined> {
        const db = await initDB();
        // Use the index to get all reports by this senior
        const reportsBySenior = await db.getAllFromIndex('reports', 'by_reporting_senior', seniorId);

        // Filter by memberId and sort by date (descending) to find the most recent
        const memberReports = reportsBySenior
            .filter(r => r.memberId === memberId)
            .sort((a, b) => new Date(b.periodTo).getTime() - new Date(a.periodTo).getTime());

        return memberReports.length > 0 ? memberReports[0] : undefined;
    }
};
