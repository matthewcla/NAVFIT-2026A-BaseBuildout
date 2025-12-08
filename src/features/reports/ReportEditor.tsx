import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ChevronLeft, Save, Printer, Check } from 'lucide-react';
import { updateReport, type EvaluationReport, type PerformanceTraits } from '../../store/reportsSlice';

// Keys match Architecture.md 3.1
const TRAITS_OFFICER: { id: keyof PerformanceTraits, label: string }[] = [
    { id: 'professionalKnowledge', label: 'Professional Expertise' },
    { id: 'equalOpportunity', label: 'Equal Opportunity' },
    { id: 'militaryBearing', label: 'Military Bearing' },
    { id: 'character', label: 'Character' },
    { id: 'teamwork', label: 'Mission Accomplishment/Teamwork' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'commandClimate', label: 'Command Climate' } // Using commandClimate for the 7th trait? Wait, t1..t7.
    // 1610/2:
    // 33: Prof
    // 34: Equal Opp (Actually 34 is Command Climate on some forms? Need to be careful. Arch doc lists 34 as Command Climate)
    // Let's align with Arch Doc 3.1 order for inputs:
    // professionalKnowledge (33)
    // commandClimate (34)
    // militaryBearing (35)
    // character (36)
    // teamwork (37)
    // leadership (38)
    // equalOpportunity (39)
];

const TRAITS_ENLISTED: { id: keyof PerformanceTraits, label: string }[] = [
    { id: 'professionalKnowledge', label: 'Professional Knowledge' },
    { id: 'commandClimate', label: 'Quality of Work' }, // Mapping for Enlisted? Or stick to strict keys?
    // If Arch doc says "commandClimate" is block 34, then for Enlisted Block 34 is "Quality of Work"?
    // Using the same keys for database but different labels is fine.
    { id: 'equalOpportunity', label: 'Equal Opportunity' },
    { id: 'militaryBearing', label: 'Military Bearing' },
    { id: 'character', label: 'Character' },
    { id: 'teamwork', label: 'Teamwork' },
    { id: 'leadership', label: 'Leadership' }
];

const PROMOTION_RECS = [
    'NOB', 'Significant Problems', 'Progressing', 'Promotable', 'Must Promote', 'Early Promote'
];

interface ReportEditorProps {
    report: EvaluationReport;
    onBack: () => void;
}

export const ReportEditor: React.FC<ReportEditorProps> = ({ report, onBack }) => {
    const dispatch = useDispatch();
    // Deep copy to detach from Redux state for editing
    const [formData, setFormData] = useState<EvaluationReport>(JSON.parse(JSON.stringify(report)));
    const [isSaved, setIsSaved] = useState(false);
    const [showPrintView, setShowPrintView] = useState(false);

    // Auto-save buffer
    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(updateReport({ id: formData.id, changes: formData }));
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        }, 1000);
        return () => clearTimeout(timer);
    }, [formData, dispatch]);

    const handleChange = (field: keyof EvaluationReport, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleTraitChange = (key: keyof PerformanceTraits, value: string) => {
        const num = parseFloat(value);
        setFormData(prev => ({
            ...prev,
            traits: { ...prev.traits, [key]: isNaN(num) ? 0 : num }
        }));
    };

    const calculateAverage = () => {
        let sum = 0;
        let count = 0;
        Object.values(formData.traits).forEach(val => {
            if (val > 0) {
                sum += val;
                count++;
            }
        });
        return count === 0 ? '0.00' : (sum / count).toFixed(2);
    };

    const traitLabels = formData.formType === 'Officer' ? TRAITS_OFFICER : TRAITS_ENLISTED;

    if (showPrintView) {
        return (
            <div className="bg-white min-h-screen p-8 print-container">
                <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center no-print">
                    <button
                        onClick={() => setShowPrintView(false)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <ChevronLeft size={20} />
                        Back to Edit
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Printer size={18} />
                        Print / Save PDF
                    </button>
                </div>

                <div className="border-2 border-black p-1 font-mono text-sm">
                    <div className="grid grid-cols-12 border border-black text-center">
                        <div className="col-span-12 font-bold p-2 bg-gray-100 border-b border-black">
                            NAVFIT 2026A PERFORMANCE REPORT - {formData.formType}
                        </div>

                        {/* Block 1 */}
                        <div className="col-span-6 p-1 border-r border-b border-black text-left">
                            <span className="text-xs block text-gray-500">1. Name</span>
                            <div className="font-bold">{formData.lastName || ''}, {formData.firstName || ''}</div>
                        </div>
                        <div className="col-span-3 p-1 border-r border-b border-black text-left">
                            <span className="text-xs block text-gray-500">2. Grade</span>
                            <div className="font-bold">{formData.rank}</div>
                        </div>
                        <div className="col-span-3 p-1 border-b border-black text-left">
                            <span className="text-xs block text-gray-500">3. Desig</span>
                            <div className="font-bold">{formData.designator}</div>
                        </div>

                        {/* Traits */}
                        <div className="col-span-12 p-2 bg-gray-100 border-b border-black font-bold">
                            TRAITS AND PERFORMANCE
                        </div>

                        {traitLabels.map((trait, idx) => (
                            <React.Fragment key={trait.id}>
                                <div className="col-span-10 p-1 border-r border-b border-black text-left flex items-center">
                                    <span className="text-xs font-bold mr-2">{idx + 1}.</span> {trait.label}
                                </div>
                                <div className="col-span-2 p-1 border-b border-black text-center font-bold flex items-center justify-center">
                                    {formData.traits[trait.id] || 'NOB'}
                                </div>
                            </React.Fragment>
                        ))}

                        <div className="col-span-10 p-1 border-r border-b border-black text-right font-bold pr-4">
                            TRAIT AVERAGE
                        </div>
                        <div className="col-span-2 p-1 border-b border-black text-center font-bold text-lg">
                            {calculateAverage()}
                        </div>

                        <div className="col-span-12 p-2 text-left min-h-[200px] border-b border-black whitespace-pre-wrap">
                            <span className="text-xs block text-gray-500 mb-2">Comments on Performance</span>
                            {formData.comments}
                        </div>

                        <div className="col-span-12 p-2 text-center bg-gray-100">
                            RECOMMENDATION: {formData.promotionRecommendation.toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 md:top-16 z-30 bg-gray-50 py-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-white rounded-full transition-colors text-gray-600"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            Edit {formData.formType} Evaluation
                        </h2>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            {isSaved ? (
                                <span className="flex items-center gap-1 text-green-600">
                                    <Check size={14} /> Saved
                                </span>
                            ) : (
                                <span>Unsaved changes...</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowPrintView(true)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
                    >
                        <Printer size={18} />
                        Print Preview
                    </button>
                    <button
                        onClick={() => {
                            dispatch(updateReport({ id: formData.id, changes: formData }));
                            setIsSaved(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
                    >
                        <Save size={18} />
                        Save
                    </button>
                </div>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Admin Data Card */}
                <div className="md:col-span-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Administrative Data</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Last Name</label>
                            <input
                                className="w-full border rounded p-2 mt-1"
                                value={formData.lastName || ''}
                                onChange={e => handleChange('lastName', e.target.value)}
                                placeholder="Doe"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">First Name</label>
                            <input
                                className="w-full border rounded p-2 mt-1"
                                value={formData.firstName || ''}
                                onChange={e => handleChange('firstName', e.target.value)}
                                placeholder="John"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Rank/Grade</label>
                            <input
                                className="w-full border rounded p-2 mt-1"
                                value={formData.rank}
                                onChange={e => handleChange('rank', e.target.value)}
                                placeholder="LT"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Designator</label>
                            <input
                                className="w-full border rounded p-2 mt-1"
                                value={formData.designator}
                                onChange={e => handleChange('designator', e.target.value)}
                                placeholder="1110"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Date Reported</label>
                            <input
                                type="date"
                                className="w-full border rounded p-2 mt-1"
                                value={formData.dateReported}
                                onChange={e => handleChange('dateReported', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Occasion</label>
                            <select
                                className="w-full border rounded p-2 mt-1 bg-white"
                                value={formData.occasion}
                                onChange={e => handleChange('occasion', e.target.value)}
                            >
                                <option>Periodic</option>
                                <option>Detachment</option>
                                <option>Promotion</option>
                                <option>Special</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Traits Card */}
                <div className="md:col-span-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800">Performance Traits</h3>
                        <div className="text-sm bg-blue-50 text-blue-800 px-3 py-1 rounded-full font-bold">
                            Avg: {calculateAverage()}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {traitLabels.map((trait, i) => (
                            <div key={trait.id} className="grid grid-cols-12 gap-4 items-center hover:bg-gray-50 p-2 rounded transition-colors">
                                <div className="col-span-4 md:col-span-3 font-medium text-sm text-gray-700">
                                    {i + 1}. {trait.label}
                                </div>
                                <div className="col-span-6 md:col-span-8">
                                    <input
                                        type="range"
                                        min="0" max="5" step="0.1"
                                        value={formData.traits[trait.id] || 0}
                                        onChange={e => handleTraitChange(trait.id, e.target.value)}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                                <div className="col-span-2 md:col-span-1 text-right font-bold text-blue-600">
                                    {formData.traits[trait.id] ? formData.traits[trait.id] : 'NOB'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Text Areas */}
                <div className="md:col-span-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Comments</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Command Employment / Achievements</label>
                            <textarea
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.commandEmployment}
                                onChange={e => handleChange('commandEmployment', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Primary Duties</label>
                            <label className="text-xs text-gray-400 block mb-1">Scope</label>
                            <textarea
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm h-16 focus:ring-2 focus:ring-blue-500 outline-none mb-2"
                                value={formData.primaryDuties.scope}
                                onChange={e => setFormData(prev => ({ ...prev, primaryDuties: { ...prev.primaryDuties, scope: e.target.value } }))}
                            />
                            <label className="text-xs text-gray-400 block mb-1">Titles (One per line)</label>
                            <textarea
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.primaryDuties.titles.join('\n')}
                                onChange={e => setFormData(prev => ({ ...prev, primaryDuties: { ...prev.primaryDuties, titles: e.target.value.split('\n') } }))}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Performance Comments</label>
                            <textarea
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm h-64 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                value={formData.comments}
                                onChange={e => handleChange('comments', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                <div className="md:col-span-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">Recommendations</h3>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                        {PROMOTION_RECS.map(rec => (
                            <div
                                key={rec}
                                onClick={() => handleChange('promotionRecommendation', rec as any)}
                                className={`
                                    cursor-pointer p-3 rounded-lg border text-center text-xs font-bold transition-all
                                    ${formData.promotionRecommendation === rec
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'}
                                `}
                            >
                                {rec}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};
