<template>
  <div class="admin-container max-w-5xl mx-auto px-4 py-8">
    <!-- Unauthenticated Login / Sign-Up Card -->
    <div v-if="!user" class="max-w-md mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
      <div class="text-center mb-6">
        <h1 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wide">
          Admin Login
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Sign in with an authorized account to manage Spartan News polls.
        </p>
      </div>

      <div v-if="authError" class="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold">
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
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Sign In with Google
        </button>

        <div class="relative flex py-2 items-center">
          <div class="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span class="flex-shrink mx-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Or continue with email</span>
          <div class="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        <!-- Email & Password Form -->
        <form @submit.prevent="handleAuth" class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Email Address
            </label>
            <input 
              v-model="authEmail"
              type="email" 
              placeholder="admin@shsnews.live"
              class="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Password
            </label>
            <input 
              v-model="authPassword"
              type="password" 
              placeholder="••••••••"
              class="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div class="flex gap-2 pt-2">
            <button 
              type="submit" 
              :disabled="authLoading"
              class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition-colors disabled:opacity-50 cursor-pointer"
            >
              {{ isSignUp ? 'Sign Up New Admin' : 'Sign In' }}
            </button>
          </div>

          <div class="text-center pt-2">
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

    <!-- Authenticated Admin Dashboard -->
    <div v-else>
      <!-- Dashboard Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-wide">
              Admin Poll Manager
            </h1>
            <span v-if="isApproved" class="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-md border border-emerald-500/30">
              Approved Admin
            </span>
            <span v-else class="px-2 py-0.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-md border border-amber-500/30">
              Pending Approval
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Logged in as <span class="text-blue-500 font-semibold">{{ user.email }}</span>
          </p>
        </div>

        <div class="flex items-center gap-3">
          <router-link 
            v-if="isOwner"
            to="/admin/users"
            class="px-4 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-600 dark:text-purple-300 font-bold text-xs rounded-xl hover:bg-purple-600/30 transition flex items-center gap-1.5"
          >
            <span>⚙️</span> Manage Users
          </router-link>

          <button 
            v-if="isApproved"
            @click="showCreateModal = true"
            class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg transition-colors flex items-center gap-2 text-sm cursor-pointer"
          >
            <span>+</span> Create New Poll
          </button>

          <button 
            @click="handleSignOut"
            class="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      <!-- Pending Approval Banner -->
      <div v-if="!isApproved" class="mb-8 p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-700 dark:text-amber-300 space-y-2">
        <h3 class="font-bold text-base flex items-center gap-2">
          <span>⚠️</span> Account Access Pending Approval
        </h3>
        <p class="text-xs leading-relaxed">
          Your admin account has been created, but must be approved by the site owner before you can create, toggle, or delete polls.
        </p>
      </div>

      <!-- Status Alerts -->
      <div v-if="statusMessage.text" :class="[
        'mb-6 p-4 rounded-xl border text-sm font-semibold flex justify-between items-center',
        statusMessage.isError 
          ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400' 
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
      ]">
        <span>{{ statusMessage.text }}</span>
        <button @click="statusMessage.text = ''" class="text-xs opacity-70 hover:opacity-100 cursor-pointer">Dismiss</button>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="isLoading" class="space-y-4">
        <div v-for="n in 3" :key="n" class="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse h-28"></div>
      </div>

      <!-- Managed Polls List -->
      <div v-else-if="polls.length > 0" class="space-y-4">
        <div 
          v-for="poll in polls" 
          :key="poll.id"
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-all flex flex-col md:flex-row justify-between md:items-center gap-6"
        >
          <div class="space-y-2 flex-1">
            <div class="flex items-center gap-3">
              <span :class="[
                'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider',
                poll.active 
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                  : 'bg-slate-500/20 text-slate-500 border border-slate-500/30'
              ]">
                {{ poll.active ? 'Active' : 'Inactive' }}
              </span>
              <span class="text-xs text-slate-400 font-mono">ID: {{ poll.id }}</span>
            </div>

            <h2 class="text-xl font-bold text-slate-900 dark:text-white">
              {{ poll.title }}
            </h2>

            <div class="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span v-for="(opt, idx) in poll.options" :key="idx" class="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                {{ opt.text }} ({{ opt.votes || 0 }})
              </span>
            </div>
          </div>

          <!-- Action Controls -->
          <div v-if="isApproved" class="flex items-center gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-slate-200 dark:border-slate-800 shrink-0">
            <button 
              @click="togglePollActive(poll)"
              :class="[
                'px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer',
                poll.active 
                  ? 'bg-amber-600/20 text-amber-600 dark:text-amber-400 hover:bg-amber-600/30 border border-amber-600/30' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
              ]"
            >
              {{ poll.active ? 'Deactivate' : 'Set Active' }}
            </button>

            <button 
              @click="deletePoll(poll.id)"
              class="px-3 py-2 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white rounded-xl text-xs font-bold transition-colors border border-red-600/20 cursor-pointer"
              title="Delete Poll"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
        <p class="text-slate-500 dark:text-slate-400">No polls created yet. Click "+ Create New Poll" to create your first poll.</p>
      </div>

      <!-- Create Poll Modal -->
      <div v-if="showCreateModal && isApproved" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
          <div class="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Create New Student Poll</h3>
            <button @click="showCreateModal = false" class="text-slate-400 hover:text-white text-xl cursor-pointer">✕</button>
          </div>

          <form @submit.prevent="createPoll" class="space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Poll Question / Title
              </label>
              <input 
                v-model="newPoll.title"
                type="text" 
                placeholder="e.g. What theme should Friday's game be?"
                class="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Poll Options
              </label>
              <div class="space-y-2">
                <div 
                  v-for="(option, index) in newPoll.options" 
                  :key="index"
                  class="flex items-center gap-2"
                >
                  <input 
                    v-model="newPoll.options[index]"
                    type="text" 
                    :placeholder="`Option ${index + 1}`"
                    class="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                  <button 
                    v-if="newPoll.options.length > 2"
                    type="button" 
                    @click="removeOption(index)"
                    class="p-2 text-red-500 hover:text-red-400 text-sm font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <button 
                type="button" 
                @click="addOption"
                class="mt-3 text-xs font-bold text-blue-500 hover:underline cursor-pointer"
              >
                + Add Option
              </button>
            </div>

            <div class="flex items-center gap-2 pt-2">
              <input 
                v-model="newPoll.setActive"
                type="checkbox" 
                id="setActive"
                class="rounded text-blue-600 focus:ring-0 cursor-pointer"
              />
              <label for="setActive" class="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Set as active poll immediately
              </label>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button 
                type="button"
                @click="showCreateModal = false"
                class="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow transition-colors cursor-pointer"
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
import { ref, onMounted } from 'vue'
import { supabase } from '../services/supabase'

// Auth & Access State
const user = ref(null)
const isApproved = ref(false)
const isOwner = ref(false)

const authEmail = ref('')
const authPassword = ref('')
const authLoading = ref(false)
const authError = ref('')
const isSignUp = ref(false)

// Dashboard State
const polls = ref([])
const isLoading = ref(true)
const showCreateModal = ref(false)
const statusMessage = ref({ text: '', isError: false })

const newPoll = ref({
  title: '',
  options: ['', ''],
  setActive: true
})

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  user.value = session?.user || null

  if (user.value) {
    await checkUserProfile(user.value.id)
    await fetchAllPolls()
  } else {
    isLoading.value = false
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    user.value = session?.user || null
    if (user.value) {
      await checkUserProfile(user.value.id)
      await fetchAllPolls()
    } else {
      polls.value = []
      isApproved.value = false
      isOwner.value = false
    }
  })
})

async function checkUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_approved, is_owner')
      .eq('id', userId)
      .single()

    if (error) throw error

    if (data) {
      isApproved.value = Boolean(data.is_approved)
      isOwner.value = Boolean(data.is_owner)
    }
  } catch (err) {
    console.error('Error fetching user profile:', err)
  }
}

async function handleGoogleSignIn() {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/admin/polls`
      }
    })
    if (error) throw error
  } catch (err) {
    console.error('Google Sign-In Error:', err)
    authError.value = err.message || 'Failed to initialize Google authentication.'
  }
}

async function handleAuth() {
  authLoading.value = true
  authError.value = ''

  try {
    if (isSignUp.value) {
      const { data, error } = await supabase.auth.signUp({
        email: authEmail.value,
        password: authPassword.value
      })
      if (error) throw error
      
      if (data.user) {
        user.value = data.user
        await checkUserProfile(data.user.id)
        showMessage('Account created successfully! Awaiting owner activation.')
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail.value,
        password: authPassword.value
      })
      if (error) throw error
      
      user.value = data.user
      await checkUserProfile(data.user.id)
    }
  } catch (err) {
    console.error('Auth error:', err)
    authError.value = err.message || 'Authentication failed.'
  } finally {
    authLoading.value = false
  }
}

async function handleSignOut() {
  await supabase.auth.signOut()
  user.value = null
  isApproved.value = false
  isOwner.value = false
  polls.value = []
}

async function fetchAllPolls() {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .order('id', { ascending: false })

    if (error) throw error
    polls.value = data || []
  } catch (err) {
    console.error('Fetch Error:', err)
    showMessage('Failed to load polls from Supabase.', true)
  } finally {
    isLoading.value = false
  }
}

function addOption() {
  newPoll.value.options.push('')
}

function removeOption(index) {
  newPoll.value.options.splice(index, 1)
}

async function createPoll() {
  if (!isApproved.value) {
    alert('Your account is awaiting owner activation before you can create polls.')
    return
  }

  try {
    const formattedOptions = newPoll.value.options
      .filter(opt => opt.trim() !== '')
      .map(opt => ({ text: opt.trim(), votes: 0 }))

    if (formattedOptions.length < 2) {
      alert('Please provide at least two poll options.')
      return
    }

    const { error } = await supabase
      .from('polls')
      .insert({
        title: newPoll.value.title.trim(),
        options: formattedOptions,
        active: newPoll.value.setActive,
        total_votes: 0
      })

    if (error) throw error

    showMessage('Poll created successfully!')
    showCreateModal.value = false
    
    newPoll.value = { title: '', options: ['', ''], setActive: true }
    await fetchAllPolls()
  } catch (err) {
    console.error('Create Poll Error:', err)
    showMessage('Failed to create poll. Check database permissions.', true)
  }
}

async function togglePollActive(poll) {
  if (!isApproved.value) return

  try {
    const { error } = await supabase
      .from('polls')
      .update({ active: !poll.active })
      .eq('id', poll.id)

    if (error) throw error

    poll.active = !poll.active
    showMessage(`Poll set to ${poll.active ? 'Active' : 'Inactive'}.`)
  } catch (err) {
    console.error('Update Error:', err)
    showMessage('Failed to update poll state.', true)
  }
}

async function deletePoll(pollId) {
  if (!isApproved.value) return
  if (!confirm('Are you sure you want to delete this poll?')) return

  try {
    const { error } = await supabase
      .from('polls')
      .delete()
      .eq('id', pollId)

    if (error) throw error

    polls.value = polls.value.filter(p => p.id !== pollId)
    showMessage('Poll deleted successfully.')
  } catch (err) {
    console.error('Delete Error:', err)
    showMessage('Failed to delete poll.', true)
  }
}

function showMessage(msg, isError = false) {
  statusMessage.value = { text: msg, isError }
}
</script>