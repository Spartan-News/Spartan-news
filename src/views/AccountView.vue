<template>
  <div class="account-container max-w-3xl mx-auto px-4 py-8">
    <!-- Unauthenticated State -->
    <div v-if="!user && !isLoading" class="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
      <h1 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wide mb-2">
        Account Access Required
      </h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Please log in through the admin panel to view and manage your profile settings.
      </p>
      <router-link 
        to="/admin/polls" 
        class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition inline-block"
      >
        Go to Login Page →
      </router-link>
    </div>

    <!-- Loading Skeleton -->
    <div v-else-if="isLoading" class="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse space-y-6">
      <div class="flex items-center gap-4">
        <div class="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800"></div>
        <div class="space-y-2 flex-1">
          <div class="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
          <div class="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Authenticated Account Profile View -->
    <div v-else class="space-y-6">
      <header class="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-wide">
          Account Settings
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal profile details, display picture, linked social accounts, and security settings.
        </p>
      </header>

      <!-- Status Alert Message -->
      <div v-if="statusMessage.text" :class="[
        'p-4 rounded-xl border text-sm font-semibold flex justify-between items-center',
        statusMessage.isError 
          ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400' 
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
      ]">
        <span>{{ statusMessage.text }}</span>
        <button @click="statusMessage.text = ''" class="text-xs opacity-70 hover:opacity-100 cursor-pointer">Dismiss</button>
      </div>

      <!-- Profile Form Card -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
          Public Profile Information
        </h2>

        <!-- Avatar Upload Controls -->
        <div class="flex flex-col sm:flex-row items-center gap-6">
          <div class="relative group">
            <div class="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <img 
                v-if="profile.avatar_url" 
                :src="profile.avatar_url" 
                alt="Profile Avatar" 
                class="w-full h-full object-cover"
              />
              <span v-else class="text-2xl font-bold text-slate-400">
                {{ user.email ? user.email.charAt(0).toUpperCase() : 'U' }}
              </span>
            </div>

            <label class="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer text-xs font-bold">
              Change
              <input 
                type="file" 
                accept="image/*" 
                @change="uploadAvatar" 
                class="hidden" 
                :disabled="isUploading"
              />
            </label>
          </div>

          <div class="space-y-1 text-center sm:text-left">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">Profile Picture</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Upload a PNG, JPG, or WEBP image. Max recommended size 2MB.
            </p>
            <span v-if="isUploading" class="inline-block text-xs text-blue-500 font-bold animate-pulse">
              Uploading image to storage...
            </span>
          </div>
        </div>

        <form @submit.prevent="updateProfile" class="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Email Address
            </label>
            <input 
              :value="user.email" 
              type="email" 
              disabled 
              class="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Full Name / Display Name
            </label>
            <input 
              v-model="profile.full_name" 
              type="text" 
              placeholder="e.g. Peyton Gordon" 
              class="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div class="flex justify-end pt-2">
            <button 
              type="submit" 
              :disabled="isSaving"
              class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50 cursor-pointer"
            >
              {{ isSaving ? 'Saving Changes...' : 'Save Profile' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Linked Accounts Card -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
          Linked Accounts & SSO
        </h2>

        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">Google Account</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                {{ isGoogleLinked ? 'Connected and authorized for single sign-on.' : 'Link your Google account for one-click login.' }}
              </p>
            </div>
          </div>

          <div class="shrink-0">
            <span v-if="isGoogleLinked" class="px-3 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-lg flex items-center gap-1">
              ✓ Linked
            </span>
            <button 
              v-else 
              @click="linkGoogleAccount"
              :disabled="isLinkingGoogle"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50 cursor-pointer"
            >
              {{ isLinkingGoogle ? 'Connecting...' : 'Link Google' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Password Update Section -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
          Security Settings
        </h2>

        <form @submit.prevent="updatePassword" class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              New Password
            </label>
            <input 
              v-model="newPassword" 
              type="password" 
              placeholder="Enter new password" 
              class="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              required 
            />
          </div>

          <div class="flex justify-end pt-2">
            <button 
              type="submit" 
              :disabled="isUpdatingPassword"
              class="px-5 py-2.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition disabled:opacity-50 cursor-pointer"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../services/supabase'

const user = ref(null)
const isLoading = ref(true)
const isSaving = ref(false)
const isUploading = ref(false)
const isLinkingGoogle = ref(false)
const isGoogleLinked = ref(false)
const isUpdatingPassword = ref(false)
const newPassword = ref('')
const statusMessage = ref({ text: '', isError: false })

const profile = ref({
  full_name: '',
  avatar_url: ''
})

onMounted(async () => {
  await loadUserData()
})

async function loadUserData() {
  isLoading.value = true
  try {
    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user || null

    if (user.value) {
      // Check if Google identity is linked to user metadata
      isGoogleLinked.value = user.value.identities?.some(id => id.provider === 'google') || false

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.value.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        profile.value.full_name = data.full_name || ''
        profile.value.avatar_url = data.avatar_url || ''
      }
    }
  } catch (err) {
    console.error('Error loading account:', err)
  } finally {
    isLoading.value = false
  }
}

async function linkGoogleAccount() {
  isLinkingGoogle.value = true
  statusMessage.value = { text: '', isError: false }

  try {
    const { error } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/account`
      }
    })

    if (error) throw error
  } catch (err) {
    console.error('Link Google error:', err)
    showMessage(err.message || 'Failed to link Google account.', true)
  } finally {
    isLinkingGoogle.value = false
  }
}

async function uploadAvatar(event) {
  const file = event.target.files?.[0]
  if (!file || !user.value) return

  isUploading.value = true
  statusMessage.value = { text: '', isError: false }

  try {
    const fileExt = file.name.split('.').pop()
    const filePath = `${user.value.id}/avatar.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`
    profile.value.avatar_url = publicUrl

    await updateProfile()
    showMessage('Profile picture updated successfully!')
  } catch (err) {
    console.error('Avatar upload error:', err)
    showMessage('Failed to upload profile picture. Ensure the avatars bucket is public.', true)
  } finally {
    isUploading.value = false
  }
}

async function updateProfile() {
  if (!user.value) return
  isSaving.value = true

  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.value.full_name,
        avatar_url: profile.value.avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.value.id)

    if (error) throw error
    showMessage('Profile details saved successfully!')
  } catch (err) {
    console.error('Update profile error:', err)
    showMessage('Failed to save profile details.', true)
  } finally {
    isSaving.value = false
  }
}

async function updatePassword() {
  if (!newPassword.value || newPassword.value.length < 6) {
    showMessage('Password must be at least 6 characters long.', true)
    return
  }

  isUpdatingPassword.value = true
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword.value
    })

    if (error) throw error

    newPassword.value = ''
    showMessage('Password updated successfully!')
  } catch (err) {
    console.error('Password update error:', err)
    showMessage(err.message || 'Failed to update password.', true)
  } finally {
    isUpdatingPassword.value = false
  }
}

function showMessage(msg, isError = false) {
  statusMessage.value = { text: msg, isError }
}
</script>