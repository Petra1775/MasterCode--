// Paste your Supabase project values here, or populate them in your hosting environment.
// Keep the anon key public; never put a service-role key in browser code.
export const SUPABASE_URL = 'https://bfebssonsrirjwyjjfcb.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_bjLoEPShOFEKLgT1Qmncuw_iLMrmU-6';

let clientPromise;
export function getSupabase() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return Promise.resolve(null);
    if (!clientPromise) {
        clientPromise = import('https://esm.sh/@supabase/supabase-js@2')
            .then(({ createClient }) => createClient(SUPABASE_URL, SUPABASE_ANON_KEY))
            .catch((error) => {
                console.warn('Supabase could not be loaded; local saving remains available.', error);
                return null;
            });
    }
    return clientPromise;
}
