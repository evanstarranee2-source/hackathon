import { useMemo, useState } from 'react';
import { Car, CheckCircle2, Compass, Star } from 'lucide-react';
import type { Hub, ProviderProfile, ProviderRole, RequestType } from '../types';

interface ProvidersDirectoryViewProps {
  providers: ProviderProfile[];
  onInviteQuote: (destination: string, requestType: RequestType, origin: string) => void;
}

const ROLES: ('All' | ProviderRole)[] = ['All', 'Driver & Guide', 'Driver', 'Guide'];
const HUBS: ('All' | Hub)[] = ['All', 'Shillong', 'Sohra', 'Dawki', 'Jowai', 'Tura'];

export function ProvidersDirectoryView({ providers, onInviteQuote }: ProvidersDirectoryViewProps) {
  const [selectedRole, setSelectedRole] = useState<'All' | ProviderRole>('All');
  const [selectedHub, setSelectedHub] = useState<'All' | Hub>('All');

  const filteredProviders = useMemo(() => {
    return providers.filter((p) => {
      const matchesRole = selectedRole === 'All' || p.role === selectedRole;
      const matchesHub = selectedHub === 'All' || p.baseHub === selectedHub;
      return matchesRole && matchesHub;
    });
  }, [providers, selectedRole, selectedHub]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#E2E8E5] pb-5">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[#131D19]">
            Local Drivers &amp; Guides
          </h1>
          <p className="text-sm text-[#52635D] mt-1">
            Hill-road drivers, living-root-bridge trek guides, and bilingual specialists based across Meghalaya’s five hubs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#EDF2EF] rounded-lg overflow-x-auto">
            {ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedRole === role
                    ? 'bg-white text-[#14533C] shadow-xs'
                    : 'text-[#52635D] hover:text-[#131D19]'
                }`}
              >
                {role === 'All' ? 'All Roles' : role}
              </button>
            ))}
          </div>

          <select
            value={selectedHub}
            onChange={(e) => setSelectedHub(e.target.value as 'All' | Hub)}
            aria-label="Filter providers by base hub"
            className="px-3 py-2 text-xs font-medium bg-white border border-[#D4DDD8] rounded-lg focus:outline-none focus:border-[#14533C]"
          >
            {HUBS.map((hub) => (
              <option key={hub} value={hub}>
                {hub === 'All' ? 'All Base Hubs' : `Base: ${hub}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredProviders.length === 0 ? (
        <div className="border border-[#E2E8E5] bg-white rounded-xl p-10 text-center space-y-3">
          <p className="text-sm text-[#52635D]">No local providers match that role and hub combination.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedRole('All');
              setSelectedHub('All');
            }}
            className="px-4 py-2 text-xs font-semibold text-[#14533C] border border-[#14533C]/30 rounded-lg hover:bg-[#14533C]/5"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProviders.map((prov) => (
            <article
              key={prov.id}
              className="bg-white border border-[#E2E8E5] rounded-xl p-6 flex flex-col justify-between gap-5"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#52635D]">
                      <span>{prov.role}</span>
                      <span aria-hidden="true">·</span>
                      <span>Base: {prov.baseHub}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{prov.yearsExperience} yrs exp</span>
                    </div>
                    <h2 className="font-display text-xl font-semibold text-[#131D19] mt-1">
                      {prov.name}
                    </h2>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="inline-flex items-center gap-1 text-sm font-mono font-semibold text-[#131D19] tabular-nums">
                      <Star className="w-3.5 h-3.5 fill-[#B45309] text-[#B45309]" />
                      {prov.rating.toFixed(1)}
                    </div>
                    <div className="text-xs font-mono tabular-nums text-[#52635D]">
                      {prov.completedTrips} trips
                    </div>
                  </div>
                </div>

                <p className="text-sm text-[#465650] leading-relaxed">{prov.bio}</p>

                <div className="pt-3 border-t border-[#E2E8E5] space-y-2 text-xs text-[#465650]">
                  <div className="flex items-center gap-2">
                    {prov.vehicle ? (
                      <>
                        <Car className="w-3.5 h-3.5 text-[#14533C] shrink-0" />
                        <span>{prov.vehicle}</span>
                      </>
                    ) : (
                      <>
                        <Compass className="w-3.5 h-3.5 text-[#14533C] shrink-0" />
                        <span>Certified Trail &amp; Cultural Guide</span>
                      </>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-[#131D19]">Languages:</span>{' '}
                    {prov.languages.join(', ')}
                  </div>
                  <div>
                    <span className="font-semibold text-[#131D19]">Routes:</span>{' '}
                    {prov.specialties.join(' · ')}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2E8E5] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-[#131D19] tabular-nums">
                    ~₹{prov.dailyRateEstimateInr.toLocaleString('en-IN')}/day
                  </span>
                  {prov.verifiedLocal && (
                    <span className="inline-flex items-center gap-1 text-xs text-[#14533C] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified Local
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onInviteQuote(
                      prov.specialties[0] || `${prov.baseHub} Circuit`,
                      prov.role === 'Driver'
                        ? 'Ride'
                        : prov.role === 'Guide'
                          ? 'Guide'
                          : 'Ride & Guide',
                      prov.baseHub
                    )
                  }
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#14533C] hover:bg-[#0E3F2D] rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Request Quote
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
