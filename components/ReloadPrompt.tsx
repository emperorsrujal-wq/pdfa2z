import * as React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from './Button';

export const ReloadPrompt: React.FC = () => {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(_r) {
            // Service worker registered
        },
        onRegisterError(_error) {
            // Service worker registration error
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    if (!offlineReady && !needRefresh) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-bounce-in">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl p-6 max-w-sm flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                        <RefreshCw size={24} className={needRefresh ? 'animate-spin' : ''} />
                    </div>
                    <button onClick={close} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400">
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">
                        {offlineReady ? 'App Ready Offline' : 'Update Available'}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {offlineReady ? 'PDFA2Z is now ready to work without an internet connection.' : 'A new version is available. Refresh to get the latest features!'}
                    </p>
                </div>

                {needRefresh && (
                    <Button onClick={() => updateServiceWorker(true)} className="w-full">
                        Refresh Now
                    </Button>
                )}
            </div>
        </div>
    );
};
