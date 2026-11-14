import { useCallback, useEffect, useState } from 'react';
import { fetchMarketplaceSnapshot } from '../shared/api';
import type { MarketplaceSnapshot } from '../types';
import { ProviderPortal } from './ProviderPortal';

export default function ProviderApp() {
  const [data, setData] = useState<MarketplaceSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshMarketplace = useCallback(async () => {
    try {
      const snapshot = await fetchMarketplaceSnapshot();
      setData(snapshot);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Unable to reach MeghaGuide server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshMarketplace();
  }, [refreshMarketplace]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F8] p-6 sm:p-10">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-16 bg-white border border-[#E2E8E5] rounded-xl animate-pulse" />
          <div className="h-44 bg-white border border-[#E2E8E5] rounded-xl animate-pulse" />
          <div className="h-72 bg-white border border-[#E2E8E5] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (loadError || !data) {
    return (
      <div className="min-h-screen bg-[#F7F9F8] flex items-center justify-center p-6">
        <div className="bg-white border border-[#E2E8E5] rounded-xl p-10 max-w-md w-full text-center space-y-4">
          <h1 className="font-display text-xl font-semibold text-[#131D19]">MeghaGuide Partner</h1>
          <p className="text-sm text-[#991B1B]">{loadError || 'Unable to load provider workspace.'}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void refreshMarketplace();
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#14533C] rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <ProviderPortal data={data} onRefresh={refreshMarketplace} />;
}
