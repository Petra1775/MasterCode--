import { getSupabase } from './supabase.js';

const LOCAL_KEY = 'codemaster-plus-plus-progress-v1';
export const freshProgress = () => ({
    coins: 0, xp: 0, level: 1, completed: [], inventory: [],
    quizScores: [], codingSubmissions: [], kijang: false, gameComplete: false
});

export async function loadProgress() {
    const client = await getSupabase();
    if (client) {
        const { data: { user } } = await client.auth.getUser();
        if (user) {
            const { data, error } = await client.from('game_progress').select('progress').eq('user_id', user.id).maybeSingle();
            if (error) console.warn('Could not load cloud progress:', error.message);
            if (data?.progress) return { ...freshProgress(), ...data.progress };
        }
    }
    try { return { ...freshProgress(), ...JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}') }; }
    catch { return freshProgress(); }
}

export async function saveProgress(progress) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(progress));
    const client = await getSupabase();
    if (!client) return { savedLocally: true };
    const { data: { user } } = await client.auth.getUser();
    if (!user) return { savedLocally: true };
    const { error } = await client.from('game_progress').upsert({ user_id: user.id, progress, updated_at: new Date().toISOString() });
    if (error) console.warn('Cloud save failed; this device copy is safe:', error.message);
    return { savedLocally: true, savedToCloud: !error };
}

export async function signIn(email, password) {
    const client = await getSupabase();
    if (!client) throw new Error('Add your Supabase URL and anon key in src/supabase.js first.');
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
}

export async function signUp(email, password, fullName) {
    const client = await getSupabase();
    if (!client) throw new Error('Add your Supabase URL and anon key in src/supabase.js first.');
    const { data, error } = await client.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    if (error) throw error;
    return data.user;
}

export async function currentUser() {
    const client = await getSupabase();
    if (!client) return null;
    const { data } = await client.auth.getUser();
    return data.user || null;
}
