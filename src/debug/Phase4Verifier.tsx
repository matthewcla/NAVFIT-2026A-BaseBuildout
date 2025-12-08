import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { RSCADashboard } from '../features/rsca/RSCADashboard';

export const Phase4Verifier: React.FC = () => {
    // Force a re-mount logs if needed, but Dashboard handles its own data fetching.
    // We just wrap it.

    return (
        <div style={{ height: '100vh', width: '100vw' }}>
            <Provider store={store}>
                {/* 
                    Ideally we would reset the store or ensure fresh state, but 
                    Dashboard's useEffect calls initScenario which should handle it.
                 */}
                <RSCADashboard />
            </Provider>
        </div>
    );
};
