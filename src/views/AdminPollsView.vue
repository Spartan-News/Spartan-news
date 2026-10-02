<template>
  <div class="max-w-4xl mx-auto space-y-8">
    
    <!-- Admin Login Form (Unauthenticated) -->
    <div v-if="!user" class="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-md space-y-4">
      <div class="text-center space-y-1">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Admin Portal Login</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Sign in with your staff account to manage Spartan polls.
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
            Email Address
          </label>
          <input 
            v-model="email" 
            type="email" 
            required 
            placeholder="admin@spartaschools.org"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-[#003366]"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase mb-1">
            Password
          </label>
          <input 
            v-model="password" 
            type="password" 
            required 
            placeholder="••••••••"
            class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-[#003366]"
          />
        </div>

        <button 
          type="submit" 
          :disabled="isLoggingIn"
          class="w-full py-2.5 bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs rounded-lg shadow transition disabled:opacity-50"
        >
          {{ isLoggingIn ? 'Authenticating...' : 'Sign In' }}
        </button>

        <p v-if="authError" class="text-xs text-red-500 font-semibold text-center mt-2">
          {{ authError }}
        </p>
      </form>
    </div>

    <!-- Authenticated Admin Dashboard -->
    <div v-else class="space-y-8">
      
      <!-- Top Action Bar -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-700 pb-4 gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
            Admin Poll Manager
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Authenticated as: <span class="font-semibold text-slate-700 dark:text-slate-300">{{ user.email }}</span>
          </p>
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <button 
            @click="showCreateModal = true"
            class="flex-1 sm:flex-initial px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs rounded-lg shadow flex items-center justify-center gap-1.5 transition"
          >
            <Plus class="w-4 h-4" /> Create Poll
          </button>
          <button 
            @click="handleLogout"
            class="px-3 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold rounded-lg transition"
          >
            Sign Out
          </button>
        </div>
      </div>

      <!-- Existing Polls List -->
      <div class="space-y-4">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ListFilter class="w-5 h-5 text-[#003366] dark:text-blue-400" /> All Managed Polls
        </h2>

        <div v-if="polls.length === 0" class="bg-white dark:bg-slate-800 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-700 shadow-sm text-slate-500 dark:text-slate-400 text-sm">
          No polls found in Firestore. Click <strong>Create Poll</strong> to add your first question!
        </div>

        <div v-else class="grid gap-4">
          <div 
            v-for="poll in polls" 
            :key="poll.id"
            class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span 
                  :class="poll.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'"
                  class="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full"
                >
                  {{ poll.isActive ? 'Active Now' : 'Inactive' }}
                </span>
                <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Type: {{ poll.type === 'google_form' ? 'Google Form' : 'Native Web Poll' }}
                </span>
              </div>

              <h3 class="font-bold text-slate-900 dark:text-slate-100 text-base">
                {{ poll.question }}
              </h3>

              <p v-if="poll.type === 'google_form'" class="text-xs text-blue-600 dark:text-blue-400 truncate max-w-md">
                🔗 {{ poll.googleFormUrl }}
              </p>
              
              <p v-else class="text-xs text-slate-500 dark:text-slate-400">
                Options: {{ poll.options ? poll.options.map(o => o.label).join(', ') : 'None' }}
              </p>
            </div>

            <div class="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-700">
              <button 
                @click="toggleActive(poll)"
                class="px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                {{ poll.isActive ? 'Deactivate' : 'Set Active' }}
              </button>
              <button 
                @click="deletePoll(poll.id)"
                class="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition"
                title="Delete Poll"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Poll Modal -->
      <div v-if="showCreateModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full p-6 space-y-6">
          <div class="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Create New Poll</h3>
            <button @click="showCreateModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="createPoll" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Poll Question / Title
              </label>
              <input 
                v-model="newPoll.question" 
                type="text" 
                required 
                placeholder="e.g., What Spirit Theme should we do for Friday?"
                class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-[#003366]"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Poll Type
              </label>
              <select 
                v-model="newPoll.type" 
                class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm outline-none"
              >
                <option value="native">Native Web Poll (Vote Directly)</option>
                <option value="google_form">Google Form / External Link</option>
              </select>
            </div>

            <!-- External Link Field -->
            <div v-if="newPoll.type === 'google_form'">
              <label class="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Google Form Link
              </label>
              <input 
                v-model="newPoll.googleFormUrl" 
                type="url" 
                required 
                placeholder="https://docs.google.com/forms/d/e/..."
                class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-[#003366]"
              />
            </div>

            <!-- Native Poll Options Field -->
            <div v-else class="space-y-2">
              <label class="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
                Poll Options
              </label>
              <div v-for="(opt, idx) in newPoll.options" :key="idx" class="flex items-center gap-2">
                <input 
                  v-model="newPoll.options[idx]" 
                  type="text" 
                  required 
                  :placeholder="`Option ${idx + 1}`"
                  class="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-xs outline-none"
                />
                <button 
                  type="button" 
                  @click="removeOption(idx)" 
                  v-if="newPoll.options.length > 2"
                  class="text-red-500 hover:text-red-700"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
              <button 
                type="button" 
                @click="addOption" 
                class="text-xs text-[#003366] dark:text-blue-400 font-bold hover:underline"
              >
                + Add Option
              </button>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button 
                type="button" 
                @click="showCreateModal = false"
                class="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="px-4 py-2 text-xs font-bold bg-[#003366] text-white rounded-lg shadow hover:bg-[#002244]"
              >
                Save Poll
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Plus, ListFilter, Trash2, X } from 'lucide-vue-next';
import { db, auth } from '../services/firebase.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';

// Allowed admin email addresses
const ALLOWED_ADMINS = [
  'peytongordon@shsnews.live',
  'principal@spartaschools.org',
  'broadcast@spartaschools.org'
];

const user = ref(null);
const email = ref('');
const password = ref('');
const isLoggingIn = ref(false);
const authError = ref('');

const showCreateModal = ref(false);
const polls = ref([]);
let unsubscribePolls = null;

const newPoll = ref({
  question: '',
  type: 'native',
  googleFormUrl: '',
  options: ['', '']
});

onMounted(() => {
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser;
    if (currentUser) {
      listenToPolls();
    } else if (unsubscribePolls) {
      unsubscribePolls();
    }
  });
});

const handleLogin = async () => {
  isLoggingIn.value = true;
  authError.value = '';

  const cleanEmail = email.value.toLowerCase().trim();

  if (!ALLOWED_ADMINS.includes(cleanEmail)) {
    authError.value = 'Access denied. Email not on admin allowlist.';
    isLoggingIn.value = false;
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, cleanEmail, password.value);
  } catch (err) {
    console.error('Firebase Auth Error Code:', err.code);
    console.error('Firebase Auth Error Message:', err.message);

    // Provide detailed error messaging
    if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
      authError.value = 'Incorrect password.';
    } else if (err.code === 'auth/user-not-found') {
      authError.value = 'No account found with this email in Firebase.';
    } else if (err.code === 'auth/operation-not-allowed') {
      authError.value = 'Email/Password sign-in is disabled in Firebase Console.';
    } else {
      authError.value = `Login failed: ${err.code}`;
    }
  } finally {
    isLoggingIn.value = false;
  }
};

const handleLogout = () => signOut(auth);

const listenToPolls = () => {
  unsubscribePolls = onSnapshot(collection(db, 'polls'), (snapshot) => {
    polls.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  });
};

const addOption = () => newPoll.value.options.push('');
const removeOption = (idx) => newPoll.value.options.splice(idx, 1);

const createPoll = async () => {
  const formattedOptions = newPoll.value.type === 'native' 
    ? newPoll.value.options.filter(opt => opt.trim() !== '').map(opt => ({ label: opt, votes: 0 }))
    : [];

  await addDoc(collection(db, 'polls'), {
    question: newPoll.value.question,
    type: newPoll.value.type,
    googleFormUrl: newPoll.value.googleFormUrl || '',
    isActive: false,
    options: formattedOptions,
    createdAt: new Date()
  });

  showCreateModal.value = false;
  newPoll.value = { question: '', type: 'native', googleFormUrl: '', options: ['', ''] };
};

const toggleActive = async (targetPoll) => {
  const batch = writeBatch(db);
  
  // Deactivate all existing polls
  const snapshot = await getDocs(collection(db, 'polls'));
  snapshot.forEach((d) => {
    batch.update(doc(db, 'polls', d.id), { isActive: false });
  });

  // Toggle active state for the selected poll
  if (!targetPoll.isActive) {
    batch.update(doc(db, 'polls', targetPoll.id), { isActive: true });
  }

  await batch.commit();
};

const deletePoll = async (id) => {
  if (confirm('Are you sure you want to delete this poll?')) {
    await deleteDoc(doc(db, 'polls', id));
  }
};

onUnmounted(() => {
  if (unsubscribePolls) unsubscribePolls();
});
</script>