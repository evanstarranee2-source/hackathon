import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Hub, ProviderProfile, ProviderRole } from '../types';

interface RegisterProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (payload: {
    name: string;
    role: ProviderRole;
    baseHub: Hub;
    vehicle: string | null;
    languages: string[];
    specialties: string[];
    yearsExperience: number;
    dailyRateEstimateInr: number;
    bio: string;
  }) => Promise<ProviderProfile>;
  onSuccess: (created: ProviderProfile) => void;
}

const HUBS: Hub[] = ['Shillong', 'Sohra', 'Dawki', 'Jowai', 'Tura'];
const LANGUAGES = ['Khasi', 'Garo', 'Pnar', 'English', 'Hindi', 'Assamese'];

export function RegisterProviderModal({
  isOpen,
  onClose,
  onRegister,
  onSuccess,
}: RegisterProviderModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<ProviderRole>('Driver & Guide');
  const [baseHub, setBaseHub] = useState<Hub>('Shillong');
  const [vehicle, setVehicle] = useState('Toyota Innova (6-seater)');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['Khasi', 'English', 'Hindi']);
  const [specialtiesText, setSpecialtiesText] = useState('Sohra waterfalls, Dawki loop');
  const [yearsExperience, setYearsExperience] = useState(5);
  const [dailyRateEstimateInr, setDailyRateEstimateInr] = useState(3500);
  const [bio, setBio] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  function toggleLanguage(lang: string) {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? (prev.length > 1 ? prev.filter((l) => l !== lang) : prev) : [...prev, lang]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setSubmitting(true);
    try {
      const specialties = specialtiesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const created = await onRegister({
        name: name.trim(),
        role,
        baseHub,
        vehicle: role === 'Guide' ? null : vehicle.trim() || 'Sedan / SUV',
        languages: selectedLanguages,
        specialties: specialties.length > 0 ? specialties : [`${baseHub} local circuits`],
        yearsExperience,
        dailyRateEstimateInr,
        bio: bio.trim() || `Local ${role.toLowerCase()} operating from ${baseHub}.`,
      });
      setName('');
      setBio('');
      onSuccess(created);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to register provider profile.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-provider-title"
    >
      <div className="w-full max-w-2xl bg-white border border-[#E2E8E5] rounded-xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8E5]">
          <div>
            <h2 id="register-provider-title" className="font-display text-xl font-semibold text-[#131D19]">
              Register as a Local Provider
            </h2>
            <p className="text-sm text-[#52635D] mt-0.5">
              Create your driver or guide profile to start sending quotes to Meghalaya visitors.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close registration modal"
            className="p-2 text-[#52635D] hover:text-[#131D19] rounded-lg hover:bg-[#F2F5F3]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[#3A4A44] mb-2">Role</label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-[#F2F5F3] rounded-lg">
              {(['Driver & Guide', 'Driver', 'Guide'] as ProviderRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 px-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    role === r
                      ? 'bg-white text-[#14533C] shadow-xs'
                      : 'text-[#52635D] hover:text-[#131D19]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="prov-reg-name" className="block text-xs font-semibold text-[#3A4A44] mb-1.5">
                Full Name
              </label>
              <input
                id="prov-reg-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bah Wanbor Nongrum"
                className="w-full px-3.5 py-2.5 text-sm border border-[#D4DDD8] rounded-lg focus:outline-none focus:border-[#14533C]"
                required
              />
            </div>

            <div>
              <label htmlFor="prov-reg-hub" className="block text-xs font-semibold text-[#3A4A44] mb-1.5">
                Base Hub
              </label>
              <select
                id="prov-reg-hub"
                value={baseHub}
                onChange={(e) => setBaseHub(e.target.value as Hub)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D4DDD8] rounded-lg focus:outline-none focus:border-[#14533C]"
              >
                {HUBS.map((hub) => (
                  <option key={hub} value={hub}>
                    {hub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {role !== 'Guide' && (
              <div className="sm:col-span-1">
                <label htmlFor="prov-reg-vehicle" className="block text-xs font-semibold text-[#3A4A44] mb-1.5">
                  Vehicle Model
                </label>
                <input
                  id="prov-reg-vehicle"
                  type="text"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-[#D4DDD8] rounded-lg focus:outline-none focus:border-[#14533C]"
                />
              </div>
            )}

            <div>
              <label htmlFor="prov-reg-rate" className="block text-xs font-semibold text-[#3A4A44] mb-1.5">
                Daily Estimate (₹)
              </label>
              <input
                id="prov-reg-rate"
                type="number"
                min={800}
                step={100}
                value={dailyRateEstimateInr}
                onChange={(e) => setDailyRateEstimateInr(Number(e.target.value))}
                className="w-full px-3 py-2.5 text-sm font-mono tabular-nums border border-[#D4DDD8] rounded-lg focus:outline-none focus:border-[#14533C]"
              />
            </div>

            <div>
              <label htmlFor="prov-reg-years" className="block text-xs font-semibold text-[#3A4A44] mb-1.5">
                Years Experience
              </label>
              <input
                id="prov-reg-years"
                type="number"
                min={1}
                max={40}
                value={yearsExperience}
                onChange={(e) => setYearsExperience(Number(e.target.value))}
                className="w-full px-3 py-2.5 text-sm font-mono tabular-nums border border-[#D4DDD8] rounded-lg focus:outline-none focus:border-[#14533C]"
              />
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-[#3A4A44] mb-2">Languages Spoken</span>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => {
                const active = selectedLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      active
                        ? 'bg-[#EDF5F1] border-[#14533C] text-[#14533C]'
                        : 'bg-white border-[#D4DDD8] text-[#52635D] hover:text-[#131D19]'
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="prov-reg-specialties" className="block text-xs font-semibold text-[#3A4A44] mb-1.5">
              Route Specialties (comma-separated)
            </label>
            <input
              id="prov-reg-specialties"
              type="text"
              value={specialtiesText}
              onChange={(e) => setSpecialtiesText(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-[#D4DDD8] rounded-lg focus:outline-none focus:border-[#14533C]"
            />
          </div>

          <div>
            <label htmlFor="prov-reg-bio" className="block text-xs font-semibold text-[#3A4A44] mb-1.5">
              Short Bio
            </label>
            <textarea
              id="prov-reg-bio"
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share your hill driving experience, local trail certifications, or vehicle comfort..."
              className="w-full px-3.5 py-2.5 text-sm border border-[#D4DDD8] rounded-lg focus:outline-none focus:border-[#14533C]"
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-[#991B1B] bg-[#FEF2F2] border border-[#FECACA] rounded-lg">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E2E8E5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-[#52635D] hover:text-[#131D19]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#14533C] hover:bg-[#0E3F2D] rounded-lg disabled:opacity-60 whitespace-nowrap"
            >
              {submitting ? 'Registering...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
