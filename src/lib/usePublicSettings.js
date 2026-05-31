import { useQuery } from '@tanstack/react-query';
import api from './api';

/**
 * Live settings fetched from the backend (brand name, support phone/WhatsApp,
 * feature flags). Falls back to Vite env vars, then sensible defaults.
 * Cached for 5 minutes so we don't hammer the API.
 */
export function usePublicSettings() {
  const { data } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => (await api.get('/internet/public/settings')).data,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 0,
  });

  return {
    brandName: data?.brandName || import.meta.env.VITE_BRAND_NAME || 'Sumit Net',
    supportPhone: data?.supportPhone || import.meta.env.VITE_SUPPORT_PHONE || '',
    supportWhatsApp: data?.supportWhatsApp || import.meta.env.VITE_SUPPORT_WHATSAPP || '',
    enableSelfRecharge: !!data?.enableSelfRecharge,
    enableLeadCapture: data?.enableLeadCapture !== false,
    enableWhatsApp: !!data?.enableWhatsApp,
  };
}
