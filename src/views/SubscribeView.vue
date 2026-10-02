<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-700">
      
      <!-- Header Banner -->
      <div class="bg-[#003366] text-white p-6 text-center">
        <h1 class="text-2xl font-extrabold uppercase tracking-wide">Spartan News Alerts</h1>
        <p class="text-blue-200 text-sm mt-1">Stay updated with SHSNEWS.live</p>
      </div>

      <!-- Main Body -->
      <div class="p-6 space-y-6">
        
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-[#003366] mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100">Subscribe to Email Updates</h2>
          <p class="text-sm text-slate-600 dark:text-slate-400">
            Get today's Spartan News Daily updates and announcements delivered straight to your inbox!
          </p>
        </div>

        <!-- SendGrid Subscription Form -->
        <form @submit.prevent="handleSubscribe" class="space-y-4">
          <div>
            <label for="email" class="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input 
              id="email"
              v-model="email"
              type="email"
              required
              placeholder="student@spartaschools.org"
              class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none transition"
            />
          </div>

          <button 
            type="submit"
            :disabled="isLoading"
            class="w-full py-3 px-4 bg-[#003366] hover:bg-[#002244] text-white font-bold rounded-lg shadow transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{{ isLoading ? 'Subscribing...' : 'Subscribe via Email' }}</span>
          </button>
        </form>

        <!-- Status Message -->
        <div v-if="statusMessage" class="text-center pt-2">
          <p :class="isSuccess ? 'text-green-600 dark:text-green-400' : 'text-red-500'" class="text-sm font-semibold">
            {{ statusMessage }}
          </p>
        </div>

        <!-- Footer Navigation -->
        <div class="text-xs text-slate-500 dark:text-slate-400 text-center space-y-2 pt-2">
          <p>Powered by SendGrid</p>
          <router-link to="/" class="text-[#003366] dark:text-blue-400 hover:underline inline-block font-semibold">
            &larr; Back to Home News
          </router-link>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const isLoading = ref(false)
const statusMessage = ref('')
const isSuccess = ref(false)

const SENDGRID_FORM_URL = 'https://cdn.forms-content-1.sg-form.com/97b64896-bdf6-11f1-b17c-165825bc6156'

const handleSubscribe = async () => {
  if (!email.value) return

  isLoading.value = true
  statusMessage.value = ''

  try {
    await fetch(SENDGRID_FORM_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value
      })
    })

    isSuccess.value = true
    statusMessage.value = 'Success! You are now subscribed to Spartan News updates.'
    email.value = ''
  } catch (err) {
    console.error('SendGrid Submission Error:', err)
    isSuccess.value = false
    statusMessage.value = 'Failed to submit subscription. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>