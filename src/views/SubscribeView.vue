<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
    <!-- Card widened from max-w-md to max-w-2xl -->
    <div class="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
      
      <!-- Header Banner -->
      <div class="bg-[#003366] text-white p-6 text-center">
        <h1 class="text-2xl font-extrabold uppercase tracking-wide">Spartan News Alerts</h1>
        <p class="text-blue-200 text-sm mt-1">Stay updated with SHSNEWS.live</p>
      </div>

      <!-- Main Body -->
      <div class="p-4 sm:p-8">
        
        <!-- Embedded SendGrid Form with full width & taller height -->
        <iframe 
          src="https://cdn.forms-content-1.sg-form.com/97b64896-bdf6-11f1-b17c-165825bc6156"
          class="w-full h-[550px] border-0 rounded-lg bg-white"
          title="Spartan News Daily Email Subscription Form"
          loading="lazy"
        ></iframe>

        <!-- Footer Navigation -->
        <div class="text-xs text-slate-500 dark:text-slate-400 text-center space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700 mt-4">
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
// Pure iframe embed—no extra JS required
</script>