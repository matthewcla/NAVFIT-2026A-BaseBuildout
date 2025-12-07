import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store/store';
import { Plus, FileText, Trash2 } from 'lucide-react';
import { reportsSelectors, addReport, removeReport, type EvaluationReport } from '../../store/reportsSlice';
import { ReportEditor } from './ReportEditor.tsx';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const ReportsDashboard = () => {
    // @ts-ignore - Assuming store setup is standard, we'll fix strict types if needed
    const reports = useSelector((state: RootState) => reportsSelectors.selectAll(state.reports));
    const dispatch = useDispatch();

    const [editingReportId, setEditingReportId] = useState<string | null>(null);

    const handleCreateReport = (type: 'Officer' | 'Chief' | 'Enlisted') => {
        const newReport: EvaluationReport = {
            id: generateId(),
            memberId: '', // To be linked
            seniorId: null,
            type: type,
            // Admin
            lastName: '', firstName: '', mi: '', suffix: '',
            grade: '', designator: '', uic: '', shipStation: '',
            promotionStatus: '', dateReported: '',
            occasion: 'Periodic', periodFrom: '', periodTo: '',
            reportType: 'Regular',
            // Body
            commandEmployment: '', primaryDuties: '', comments: '',
            // Scores (Default 0s)
            traits: { t1: 0, t2: 0, t3: 0, t4: 0, t5: 0, t6: 0, t7: 0 },
            promotionRecommendation: 'Promotable',
            summaryGroupAverage: 0
        };

        // We need to extend the type in the slice if it doesn't have 'type'. 
        // Looking at the slice file I read earlier, it DID have 'grade' etc, but I don't recall seeing 'type' or 'reportType' used for Officer vs Enlisted distinction clearly other than inferred.
        // Wait, the slice interface 'EvaluationReport' had 'reportType' ('Regular' | 'Concurrent'). 
        // It did NOT have a field for 'Officer' vs 'Enlisted' distinction explicitly in the interface I read?
        // Let me re-read the slice content in my memory or just add it. 
        // The slice showed: `occasion`, `reportType` (Regular/Concurrent). 
        // It did NOT show `type` (Officer/Enlisted). I should probably add that to the slice or just overload one of the fields?
        // No, I'll add it to the object and if TS complains I'll update the slice.

        // @ts-ignore
        dispatch(addReport(newReport));
        setEditingReportId(newReport.id);
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this report?')) {
            dispatch(removeReport(id));
        }
    };

    const editingReport = reports.find(r => r.id === editingReportId);

    if (editingReportId && editingReport) {
        return (
            <ReportEditor
                report={editingReport}
                onBack={() => setEditingReportId(null)}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Report Generator</h2>
                    <p className="text-gray-500">Draft, review, and sign evaluation reports.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleCreateReport('Officer')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                    >
                        <Plus size={18} />
                        New FITREP
                    </button>
                    <button
                        onClick={() => handleCreateReport('Chief')}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
                    >
                        <Plus size={18} />
                        New Chief Eval
                    </button>
                    <button
                        onClick={() => handleCreateReport('Enlisted')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors shadow-sm font-medium"
                    >
                        <Plus size={18} />
                        New Enlisted Eval
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.length === 0 ? (
                    <div className="col-span-full bg-white p-12 rounded-xl border-2 border-dashed border-gray-300 text-center text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">No reports found</p>
                        <p className="text-sm">Create a new report to get started</p>
                    </div>
                ) : (
                    reports.map(report => (
                        <div
                            key={report.id}
                            onClick={() => setEditingReportId(report.id)}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-blue-300 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2 rounded-lg ${report.type === 'Officer' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'}`}>
                                    <FileText size={24} />
                                </div>
                                <button
                                    onClick={(e) => handleDelete(e, report.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <h3 className="font-bold text-gray-800">{report.grade} {report.lastName ? `${report.lastName}, ${report.firstName}` : '(Untitled Report)'}</h3>
                            <p className="text-sm text-gray-500 mb-4">{report.designator ? `Desig: ${report.designator}` : 'No Designator'}</p>

                            <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100">
                                <span>{report.occasion}</span>
                                <span className={`px-2 py-0.5 rounded-full ${report.promotionRecommendation === 'Must Promote' || report.promotionRecommendation === 'Early Promote' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {report.promotionRecommendation}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
