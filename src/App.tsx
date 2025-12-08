import { useState } from 'react'
import { LayoutDashboard, Users, FileText } from 'lucide-react'
import { PersonnelDashboard } from './features/personnel/PersonnelDashboard';
import { ReportsDashboard } from './features/reports/ReportsDashboard';
import { RSCADashboard } from './features/rsca/RSCADashboard';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg font-bold text-sm tracking-wider">NAV</div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">FIT <span className="text-blue-600">2026A</span></h1>
          </div>
          <nav className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('roster')}
              className={`text-sm font-medium transition-colors ${activeTab === 'roster' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Roster
            </button>
            <button
              onClick={() => setActiveTab('optimization')}
              className={`text-sm font-medium transition-colors ${activeTab === 'optimization' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Optimization
            </button>
          </nav>
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
            CO
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-2">Welcome to NAVFIT 2026A Decision Support System</h2>
              <p className="text-gray-600">
                This platform replaces the legacy document-based system with a temporal object model and predictive analytics engine.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center hover:border-blue-300 transition-colors cursor-pointer" onClick={() => setActiveTab('roster')}>
                <div className="bg-blue-50 text-blue-600 p-3 rounded-full mb-4">
                  <Users size={24} />
                </div>
                <h3 className="font-bold text-gray-800">Personnel Management</h3>
                <p className="text-sm text-gray-500 mt-2">Manage gains, losses, and visualize roster flow.</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center hover:border-blue-300 transition-colors cursor-pointer" onClick={() => setActiveTab('reports')}>
                <div className="bg-green-50 text-green-600 p-3 rounded-full mb-4">
                  <FileText size={24} />
                </div>
                <h3 className="font-bold text-gray-800">Report Generator</h3>
                <p className="text-sm text-gray-500 mt-2">Draft, review, and sign evaluation reports.</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center hover:border-blue-300 transition-colors cursor-pointer" onClick={() => setActiveTab('optimization')}>
                <div className="bg-purple-50 text-purple-600 p-3 rounded-full mb-4">
                  <LayoutDashboard size={24} />
                </div>
                <h3 className="font-bold text-gray-800">RSCA Optimizer</h3>
                <p className="text-sm text-gray-500 mt-2">Analyze trends and run "What-If" scenarios.</p>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        {activeTab === 'roster' && <PersonnelDashboard />}

        {activeTab === 'reports' && <ReportsDashboard />}

        {activeTab === 'optimization' && <RSCADashboard />}
      </main>
    </div>
  )
}

export default App
