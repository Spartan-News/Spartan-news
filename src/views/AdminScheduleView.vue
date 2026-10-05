<template>
  <div class="max-w-3xl mx-auto space-y-6 pb-28">

    <!-- Admin Sign In / Registration Card -->
    <div v-if="!user" class="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-md space-y-4">
      <div class="text-center space-y-1">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Admin Portal Login</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">Sign in with an authorized account to manage the game schedule and scores.</p>
      </div>

      <div v-if="authError" class="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold text-center">
        {{ authError }}
      </div>

      <div class="space-y-4">
        <!-- Google Sign-In Button -->
        <button 
          type="button" 
          @click="handleGoogleSignIn"
          class="w-full py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Sign In with Google
        </button>

        <div class="relative flex py-1 items-center">
          <div class="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          <span class="flex-shrink mx-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Or continue with email</span>
          <div class="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
        </div>

        <!-- Email/Password Form -->
        <form @submit.prevent="handleAuth" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">Email Address</label>
            <input v-model="authEmail" type="email" required placeholder="admin@shsnews.live" class="field" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">Password</label>
            <input v-model="authPassword" type="password" required placeholder="••••••••" class="field" />
          </div>
          <button type="submit" :disabled="authLoading" class="w-full py-2.5 bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs rounded-lg shadow transition disabled:opacity-50 cursor-pointer">
            {{ isSignUp ? 'Sign Up New Admin' : (authLoading ? 'Authenticating...' : 'Sign In') }}
          </button>
          
          <div class="text-center pt-1">
            <button 
              type="button" 
              @click="isSignUp = !isSignUp; authError = ''"
              class="text-xs text-slate-500 hover:text-blue-500 underline cursor-pointer"
            >
              {{ isSignUp ? 'Already have an account? Sign In' : 'Need to register an admin account? Sign Up' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Dashboard -->
    <div v-else class="space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-700 pb-4 gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">Schedule &amp; Scores</h1>
            <span v-if="isApproved" class="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-md border border-emerald-500/30">
              Approved
            </span>
            <span v-else class="px-2 py-0.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-md border border-amber-500/30">
              Pending
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Signed in as <span class="font-semibold text-slate-700 dark:text-slate-300">{{ user.email }}</span>
            &middot; <router-link to="/admin/polls" class="text-[#003366] dark:text-blue-400 hover:underline">Manage polls</router-link>
            <span v-if="isOwner"> &middot; <router-link to="/admin/users" class="text-purple-600 dark:text-purple-400 hover:underline">Manage users</router-link></span>
          </p>
        </div>
        <div class="flex items-center gap-3">
          <label class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <input type="checkbox" v-model="hideFinal" class="w-4 h-4" /> Hide finished
          </label>
          <button @click="handleSignOut" class="px-3 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer">Sign Out</button>
        </div>
      </div>

      <!-- Unapproved Account Warning -->
      <div v-if="!isApproved" class="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-700 dark:text-amber-300 text-xs font-semibold space-y-1">
        <p class="font-bold text-sm">Account Pending Approval</p>
        <p>Your account must be activated by the site owner before you can publish schedule updates or score changes.</p>
      </div>

      <p v-if="loadError" class="text-sm text-red-500 font-semibold bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg p-3">{{ loadError }}</p>
      <p v-if="source === 'defaults'" class="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-3">
        Showing the default schedule. Nothing is saved yet. Press <strong>Save changes</strong> to publish your list.
      </p>

      <!-- Game cards -->
      <div v-for="g in visibleGames" :key="g._key" class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 border-l-4 shadow-sm space-y-4"
        :class="g.status === 'live' ? 'border-l-red-500' : (g.status === 'final' ? 'border-l-emerald-500' : 'border-l-blue-500')">

        <div class="flex justify-between items-center gap-2 flex-wrap">
          <div class="inline-flex rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600">
            <button v-for="s in STATUSES" :key="s.value" type="button" @click="g.status = s.value" :disabled="!isApproved"
              class="px-3 py-1.5 text-xs font-bold transition disabled:opacity-50"
              :class="g.status === s.value ? s.active : 'bg-transparent text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'">
              {{ s.label }}
            </button>
          </div>
          <button v-if="isApproved" type="button" @click="removeGame(g)" class="text-xs font-semibold text-red-500 hover:text-red-400 px-2 py-1 cursor-pointer">Delete</button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label class="block"><span class="lbl">Date &amp; time</span><input v-model="g.date" type="datetime-local" :disabled="!isApproved" class="field" /></label>
          <label class="block"><span class="lbl">Opponent</span><input v-model="g.opponent" type="text" :disabled="!isApproved" placeholder="Coopersville" class="field" /></label>
          <label class="block"><span class="lbl">Sport</span><input v-model="g.sport" type="text" list="sports-list" :disabled="!isApproved" placeholder="Football" class="field" /></label>
          <label class="block"><span class="lbl">Level</span>
            <select v-model="g.level" :disabled="!isApproved" class="field">
              <option v-for="l in levelOptions(g)" :key="l" :value="l">{{ l }}</option>
            </select>
          </label>
          <label class="block"><span class="lbl">Gender</span>
            <select v-model="g.gender" :disabled="!isApproved" class="field">
              <option value="">None</option>
              <option value="Boys">Boys</option>
              <option value="Girls">Girls</option>
            </select>
          </label>
          <div>
            <span class="lbl">Home / Away</span>
            <div class="inline-flex w-full rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600">
              <button type="button" @click="g.home = true" :disabled="!isApproved" class="flex-1 px-3 py-2 text-xs font-bold transition disabled:opacity-50" :class="g.home !== false ? 'bg-[#003366] text-white' : 'text-slate-500 dark:text-slate-300'">Home</button>
              <button type="button" @click="g.home = false" :disabled="!isApproved" class="flex-1 px-3 py-2 text-xs font-bold transition disabled:opacity-50" :class="g.home === false ? 'bg-[#003366] text-white' : 'text-slate-500 dark:text-slate-300'">Away</button>
            </div>
          </div>
          <label class="block"><span class="lbl">Location</span><input v-model="g.location" type="text" :disabled="!isApproved" placeholder="Spartan Stadium" class="field" /></label>
          <label class="block"><span class="lbl">Live clock (optional)</span><input v-model="g.clock" type="text" :disabled="!isApproved" placeholder="Q3 4:12" class="field" /></label>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div v-for="side in SCORE_SIDES" :key="side.key">
            <span class="lbl">{{ side.label }}</span>
            <div class="flex gap-1.5">
              <button type="button" @click="bump(g, side.key, -1)" :disabled="!isApproved" class="step-btn disabled:opacity-50">&minus;</button>
              <input v-model.number="g[side.key]" type="number" min="0" inputmode="numeric" :disabled="!isApproved" class="field text-center text-xl font-bold" />
              <button type="button" @click="bump(g, side.key, 1)" :disabled="!isApproved" class="step-btn disabled:opacity-50">+</button>
            </div>
          </div>
        </div>
      </div>

      <p v-if="!visibleGames.length && !loadError" class="text-sm text-center text-slate-500 dark:text-slate-400">No games to show.</p>

      <button v-if="isApproved" type="button" @click="addGame" class="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
        + Add game
      </button>

      <datalist id="sports-list">
        <option v-for="sp in SPORTS" :key="sp" :value="sp" />
      </datalist>
    </div>

    <!-- Sticky save bar -->
    <div v-if="user && isApproved" class="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-700 px-4 py-3">
      <div class="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div class="min-w-0">
          <p class="text-xs font-semibold truncate" :class="statusClass">{{ statusText }}</p>
          <label class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <input type="checkbox" v-model="notify" class="w-4 h-4" />
            Send score alerts to subscribers (game starts, score changes, final)
          </label>
        </div>
        <button @click="save" :disabled="saving || !dirty" class="px-6 py-2.5 bg-[#003366] hover:bg-[#002244] text-white font-bold text-sm rounded-lg shadow transition disabled:opacity-50 cursor-pointer">
          {{ saving ? 'Saving...' : 'Save changes' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { supabase } from '../services/supabase';
import { WORKER_URL } from '../services/config.js';

const STATUSES = [
  { value: 'scheduled', label: 'Scheduled', active: 'bg-blue-600 text-white' },
  { value: 'live', label: 'Live', active: 'bg-red-600 text-white' },
  { value: 'final', label: 'Final', active: 'bg-emerald-600 text-white' },
];
const SCORE_SIDES = [
  { key: 'spartanScore', label: 'Spartans' },
  { key: 'opponentScore', label: 'Opponent' },
];
const LEVELS = ['Varsity', 'JV', 'Freshman', '7th/8th'];
const SPORTS = ['Football', 'Soccer', 'Volleyball', 'Basketball', 'Baseball', 'Softball', 'Cross Country', 'Wrestling', 'Track', 'Golf', 'Tennis', 'Swimming'];

// Auth & Permissions State
const user = ref(null);
const isApproved = ref(false);
const isOwner = ref(false);

const authEmail = ref('');
const authPassword = ref('');
const authLoading = ref(false);
const authError = ref('');
const isSignUp = ref(false);

// Schedule State
const games = ref([]);
const source = ref('');
const loadError = ref('');
const hideFinal = ref(false);
const notify = ref(true);
const saving = ref(false);
const dirty = ref(false);
const statusText = ref('');
const statusKind = ref('');
let suppressDirty = false;
let keyCounter = 0;

const statusClass = computed(() => ({
  'text-amber-600 dark:text-amber-400': statusKind.value === 'warn',
  'text-emerald-600 dark:text-emerald-400': statusKind.value === 'ok',
  'text-red-500': statusKind.value === 'err',
  'text-slate-500 dark:text-slate-400': !statusKind.value,
}));

const withKey = (g) => ({ ...g, _key: `k${keyCounter++}` });

const visibleGames = computed(() =>
  [...games.value]
    .filter((g) => !(hideFinal.value && g.status === 'final'))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
);

const levelOptions = (g) => (LEVELS.includes(g.level) || !g.level ? LEVELS : [...LEVELS, g.level]);

const setStatus = (text, kind = '') => {
  statusText.value = text;
  statusKind.value = kind;
};

watch(games, () => {
  if (suppressDirty) return;
  dirty.value = true;
  setStatus('Unsaved changes', 'warn');
}, { deep: true });

const applyGames = async (list) => {
  suppressDirty = true;
  games.value = list.map(withKey);
  await nextTick();
  suppressDirty = false;
  dirty.value = false;
};

// ---- Supabase Auth Profile Check -------------------------------------------
async function checkUserProfile(userId) {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('is_approved, is_owner')
      .eq('id', userId)
      .single();

    if (data) {
      isApproved.value = Boolean(data.is_approved);
      isOwner.value = Boolean(data.is_owner);
    }
  } catch (err) {
    console.error('Profile fetch error:', err);
  }
}

// ---- API ---------------------------------------------------------------------
const api = async (method, body) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(`${WORKER_URL}/admin/api/games`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) throw new Error('Your account is not approved to make changes.');
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
};

const load = async () => {
  loadError.value = '';
  try {
    const data = await api('GET');
    source.value = data.source;
    await applyGames(data.games || []);
    setStatus(data.source === 'kv' ? 'Loaded' : 'Showing defaults (not saved yet)');
  } catch (err) {
    loadError.value = err.message;
  }
};

const summarize = (sent) => {
  if (!sent) return '';
  const bits = [];
  if (sent.alerts) bits.push(`${sent.alerts} alert${sent.alerts === 1 ? '' : 's'} sent`);
  if (sent.liveActivities) bits.push('iPhone lock screens updated');
  if (sent.androidPins) bits.push(`${sent.androidPins} Android pin${sent.androidPins === 1 ? '' : 's'} updated`);
  if (sent.skipped) bits.push(sent.skipped);
  if (sent.errors && sent.errors.length) bits.push(`some pushes failed (${sent.errors[0]})`);
  return bits.length ? ' · ' + bits.join(', ') : '';
};

const save = async () => {
  if (!isApproved.value) return;
  saving.value = true;
  setStatus('Saving...');
  try {
    const payload = games.value.map(({ _key, ...g }) => g);
    const data = await api('PUT', { games: payload, notify: notify.value });
    source.value = data.source;
    await applyGames(data.games || []);
    setStatus(`Saved ${new Date().toLocaleTimeString()}${summarize(data.sent)}`, data.sent && data.sent.errors && data.sent.errors.length ? 'warn' : 'ok');
  } catch (err) {
    setStatus(err.message, 'err');
  } finally {
    saving.value = false;
  }
};

// ---- Editing helpers --------------------------------------------------------
const pad = (n) => String(n).padStart(2, '0');

const addGame = () => {
  if (!isApproved.value) return;
  const d = new Date();
  games.value.push(withKey({
    id: '', date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T18:00`,
    sport: 'Football', level: 'Varsity', gender: 'Boys', opponent: '', home: true, location: '',
    status: 'scheduled', spartanScore: 0, opponentScore: 0, clock: '',
  }));
};

const removeGame = (g) => {
  if (!isApproved.value) return;
  if (confirm('Delete this game?')) games.value = games.value.filter((x) => x._key !== g._key);
};

const bump = (g, key, delta) => {
  if (!isApproved.value) return;
  g[key] = Math.max(0, (Number(g[key]) || 0) + delta);
};

// ---- Supabase Authentication ------------------------------------------------
onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  user.value = session?.user || null;

  if (user.value) {
    await checkUserProfile(user.value.id);
    await load();
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    user.value = session?.user || null;
    if (user.value) {
      await checkUserProfile(user.value.id);
      await load();
    } else {
      games.value = [];
      isApproved.value = false;
      isOwner.value = false;
    }
  });

  window.addEventListener('beforeunload', warnUnsaved);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', warnUnsaved);
});

const warnUnsaved = (e) => {
  if (dirty.value) {
    e.preventDefault();
    e.returnValue = '';
  }
};

async function handleGoogleSignIn() {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/admin/schedule`
      }
    });
    if (error) throw error;
  } catch (err) {
    console.error('Google Sign-In Error:', err);
    authError.value = err.message || 'Failed to initialize Google authentication.';
  }
}

async function handleAuth() {
  authLoading.value = true;
  authError.value = '';

  try {
    if (isSignUp.value) {
      const { data, error } = await supabase.auth.signUp({
        email: authEmail.value,
        password: authPassword.value
      });
      if (error) throw error;
      
      if (data.user) {
        user.value = data.user;
        await checkUserProfile(data.user.id);
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail.value,
        password: authPassword.value
      });
      if (error) throw error;
      
      user.value = data.user;
      await checkUserProfile(data.user.id);
    }
  } catch (err) {
    console.error('Auth error:', err);
    authError.value = err.message || 'Authentication failed.';
  } finally {
    authLoading.value = false;
  }
}

async function handleSignOut() {
  await supabase.auth.signOut();
  user.value = null;
  isApproved.value = false;
  isOwner.value = false;
  games.value = [];
}
</script>

<style scoped>
.field {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(203 213 225);
  background: white;
  color: rgb(15 23 42);
  font-size: 0.875rem;
  outline: none;
}
.field:focus { box-shadow: 0 0 0 2px #003366; }
:global(.dark) .field { background: rgb(51 65 85); border-color: rgb(71 85 105); color: rgb(241 245 249); }
.lbl {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: rgb(100 116 139);
}
.step-btn {
  width: 2.75rem;
  flex-shrink: 0;
  border-radius: 0.5rem;
  border: 1px solid rgb(203 213 225);
  font-size: 1.25rem;
  font-weight: 700;
  color: rgb(51 65 85);
}
:global(.dark) .step-btn { border-color: rgb(71 85 105); color: rgb(226 232 240); }
.step-btn:active { background: rgb(226 232 240); }
</style>