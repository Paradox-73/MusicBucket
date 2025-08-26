import { create } from 'zustand';
import { CountryCultureData } from '../types/cultureClash';

interface CultureClashState {
  selectedCountry: string | null;
  globeSpinning: boolean;
  loadingCountryData: boolean;
  errorCountryData: string | null;
  countryData: { [key: string]: CountryCultureData };
  selectCountry: (countryName: string | null) => void;
  startSpin: () => void;
  stopSpin: () => void;
  fetchCountryData: (countryName: string) => Promise<void>;
}

export const useCultureClashStore = create<CultureClashState>((set, get) => ({
  selectedCountry: null,
  globeSpinning: false,
  loadingCountryData: false,
  errorCountryData: null,
  countryData: {},

  selectCountry: (countryName) => set({ selectedCountry: countryName }),
  startSpin: () => set({ globeSpinning: true }),
  stopSpin: () => set({ globeSpinning: false }),

  fetchCountryData: async (countryName: string) => {
    set({ loadingCountryData: true, errorCountryData: null });
    try {
      // For POC, we only have India data locally
      if (countryName === 'India') {
        const response = await fetch('/data/indiaMusicCulture.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch data for ${countryName}`);
        }
        const data: CountryCultureData = await response.json();
        set((state) => ({
          countryData: { ...state.countryData, [countryName]: data },
          loadingCountryData: false,
        }));
      } else {
        // Simulate fetching for other countries (will result in error for POC)
        throw new Error(`No data available for ${countryName} in POC.`);
      }
    } catch (error: any) {
      set({ errorCountryData: error.message, loadingCountryData: false });
    }
  },
}));
