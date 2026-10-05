<template>
  <div class="users-container max-w-5xl mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
      <div>
        <h1 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-wide">
          Admin Access Management
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review, approve, or revoke admin privileges for registered Spartan News accounts.
        </p>
      </div>

      <router-link 
        to="/admin/polls" 
        class="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition"
      >
        ← Back to Polls
      </router-link>
    </div>

    <!-- Alert Message -->
    <div v-if="statusMessage.text" :class="[
      'mb-6 p-4 rounded-xl border text-sm font-semibold flex justify-between items-center',
      statusMessage.isError 
        ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400' 
        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
    ]">
      <span>{{ statusMessage.text }}</span>
      <button @click="statusMessage.text = ''" class="text-xs opacity-70 hover:opacity-100">Dismiss</button>
    </div>

    <!-- Non-Owner Access Guard -->
    <div v-if="!isOwner" class="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white">Access Restricted</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">
        Only the primary site owner can approve or manage admin privileges.
      </p>
    </div>

    <!-- User Table -->
    <div v-else-if="isLoading" class="space-y-4">
      <div v-for="n in 3" :key="n" class="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse h-20"></div>
    </div>

    <div v-else class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <th class="p-4">User Email</th>
            <th class="p-4">Role</th>
            <th class="p-4">Status</th>
            <th class="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
          <tr v-for="profile in profiles" :key="profile.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
            <td class="p-4 font-semibold text-slate-900 dark:text-white">
              {{ profile.email }}
            </td>
            <td class="p-4">
              <span v-if="profile.is_owner" class="px-2.5 py-0.5 bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-md border border-purple-500/30">
                Owner
              </span>
              <span v-else class="px-2.5 py-0.5 bg-slate-500/20 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-md">
                Admin
              </span>
            </td>
            <td class="p-4">
              <span :class="[
                'px-2.5 py-0.5 text-xs font-bold rounded-md border',
                profile.is_approved 
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
              ]">
                {{ profile.is_approved ? 'Approved' : 'Pending Approval' }}
              </span>
            </td>
            <td class="p-4 text-right">
              <button 
                v-if="!profile.is_owner"
                @click="toggleApproval(profile)"
                :class="[
                  'px-3 py-1.5 rounded-xl text-xs font-bold transition-colors',
                  profile.is_approved 
                    ? 'bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white border border-red-500/20' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                ]"
              >
                {{ profile.is_approved ? 'Revoke Access' : 'Approve Account' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../services/supabase'

const profiles = ref([])
const isLoading = ref(true)
const isOwner = ref(false)
const statusMessage = ref({ text: '', isError: false })

onMounted(async () => {
  await checkOwnerAndFetch()
})

async function checkOwnerAndFetch() {
  isLoading.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Verify if logged-in user is marked as owner
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('is_owner')
      .eq('id', user.id)
      .single()

    isOwner.value = Boolean(currentProfile?.is_owner)

    if (isOwner.value) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      profiles.value = data || []
    }
  } catch (err) {
    console.error('Fetch Users Error:', err)
    showMessage('Failed to fetch admin accounts.', true)
  } finally {
    isLoading.value = false
  }
}

async function toggleApproval(profile) {
  try {
    const updatedStatus = !profile.is_approved

    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: updatedStatus })
      .eq('id', profile.id)

    if (error) throw error

    profile.is_approved = updatedStatus
    showMessage(`Updated ${profile.email} status to ${updatedStatus ? 'Approved' : 'Pending'}.`)
  } catch (err) {
    console.error('Update Error:', err)
    showMessage('Failed to update approval status.', true)
  }
}

function showMessage(msg, isError = false) {
  statusMessage.value = { text: msg, isError }
}
</script>