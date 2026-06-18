'use client';
import { useEffect, useState } from 'react';
import { Download, Trash2, WifiOff, Wifi, Database, X } from 'lucide-react';
import { 
    getAllOfflineContent, 
    removeOffline, 
    clearAllOffline, 
    getStorageUsed,
    isOnline,
    addOfflineListeners,
    removeOfflineListeners
} from '@/utils/offlineStorage';

export default function OfflineManager() {
    const [online, setOnline] = useState(true);
    const [downloadedItems, setDownloadedItems] = useState<any[]>([]);
    const [storageUsed, setStorageUsed] = useState(0);
    const [showManager, setShowManager] = useState(false);

    useEffect(() => {
        setOnline(isOnline());
        loadDownloadedItems();
        
        const handleOnline = () => {
            setOnline(true);
            syncPendingResults();
        };
        const handleOffline = () => setOnline(false);
        
        addOfflineListeners(handleOnline, handleOffline);
        
        return () => removeOfflineListeners(handleOnline, handleOffline);
    }, []);

    const loadDownloadedItems = async () => {
        const items = await getAllOfflineContent();
        setDownloadedItems(items);
        const storage = await getStorageUsed();
        setStorageUsed(storage);
    };

    const syncPendingResults = async () => {
        const pending = localStorage.getItem('pending_activities');
        if (pending) {
            const activities = JSON.parse(pending);
            for (const activity of activities) {
                try {
                    await fetch('/api/activity/track', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(activity)
                    });
                } catch (error) {
                    console.error('Failed to sync:', error);
                }
            }
            localStorage.removeItem('pending_activities');
        }
        await loadDownloadedItems();
    };

    const deleteDownload = async (type: string, id: string) => {
        await removeOffline(type, id);
        await loadDownloadedItems();
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <>
            {/* Offline Indicator */}
            {!online && (
                <div className="fixed bottom-20 right-6 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
                    <WifiOff className="w-4 h-4" />
                    <span className="text-sm">Offline Mode - Using downloaded content</span>
                </div>
            )}

            {/* Download Manager Button */}
            <button
                onClick={() => setShowManager(true)}
                className="fixed bottom-6 right-6 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-all z-40"
                title="Offline Manager"
            >
                <Download className="w-5 h-5" />
                {downloadedItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {downloadedItems.length}
                    </span>
                )}
            </button>

            {/* Offline Manager Modal */}
            {showManager && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Database className="w-5 h-5 text-primary" />
                                Offline Manager
                            </h2>
                            <button onClick={() => setShowManager(false)} className="text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 border-b bg-gray-50 dark:bg-gray-900">
                            <div className="flex justify-between text-sm">
                                <span>Storage Used</span>
                                <span className="font-semibold">{formatSize(storageUsed)}</span>
                            </div>
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-primary rounded-full h-2 transition-all"
                                    style={{ width: `${Math.min((storageUsed / (50 * 1024 * 1024)) * 100, 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {online ? '🟢 Online' : '🔴 Offline'}
                            </p>
                        </div>

                        <div className="overflow-y-auto max-h-96 p-4 space-y-3">
                            <h3 className="font-semibold mb-2">Downloaded Content</h3>
                            
                            {downloadedItems.length === 0 && (
                                <p className="text-gray-500 text-center py-8">
                                    No downloaded content yet.
                                    <br />Download lessons to study offline!
                                </p>
                            )}

                            {downloadedItems.map((item) => (
                                <div key={`${item.type}-${item.id}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div>
                                        <p className="font-medium text-sm">{item.title}</p>
                                        <p className="text-xs text-gray-500">{item.type} • {formatSize(item.size)}</p>
                                    </div>
                                    <button
                                        onClick={() => deleteDownload(item.type, item.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {downloadedItems.length > 0 && (
                            <div className="p-4 border-t">
                                <button
                                    onClick={async () => {
                                        if (confirm('Delete all downloaded content?')) {
                                            await clearAllOffline();
                                            await loadDownloadedItems();
                                        }
                                    }}
                                    className="w-full text-red-600 text-sm py-2 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    Clear All Downloads
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}