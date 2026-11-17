<script setup>
defineProps({
  idPrefix: { type: String, required: true },
  sports: { type: Array, default: () => [] },
  searchLabel: { type: String, default: 'Search videos' },
  searchHint: { type: String, default: 'Search titles, teams, sports, and descriptions.' },
});

defineEmits(['apply', 'clear']);
const query = defineModel('query', { default: '' });
const fromDate = defineModel('fromDate', { default: '' });
const toDate = defineModel('toDate', { default: '' });
const sport = defineModel('sport', { default: 'all' });
</script>

<template>
  <search class="mb-4 block" :aria-label="searchLabel">
    <details>
      <summary class="inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">
        Search and filters
      </summary>
      <form @submit.prevent="$emit('apply')" class="mt-3 rounded-xl border border-slate-700 bg-slate-900/70 p-4">
        <fieldset class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <legend class="mb-3 text-sm font-bold text-white">Filter results</legend>
          <div class="sm:col-span-2">
            <label :for="`${idPrefix}-query`" class="mb-1 block text-xs font-semibold text-slate-200">{{ searchLabel }}</label>
            <input
              :id="`${idPrefix}-query`"
              v-model="query"
              name="q"
              type="search"
              :aria-describedby="`${idPrefix}-hint`"
              class="min-h-11 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 text-sm text-white placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
              placeholder="Try a team name, sport, or title"
            />
            <p :id="`${idPrefix}-hint`" class="mt-1 text-xs text-slate-400">{{ searchHint }}</p>
          </div>
          <div v-if="sports.length">
            <label :for="`${idPrefix}-sport`" class="mb-1 block text-xs font-semibold text-slate-200">Sport</label>
            <select :id="`${idPrefix}-sport`" v-model="sport" name="sport" class="min-h-11 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">
              <option value="all">All sports</option>
              <option v-for="item in sports" :key="item" :value="item">{{ item }}</option>
            </select>
          </div>
          <div>
            <label :for="`${idPrefix}-from`" class="mb-1 block text-xs font-semibold text-slate-200">From date</label>
            <input :id="`${idPrefix}-from`" v-model="fromDate" :max="toDate || undefined" name="from" type="date" class="min-h-11 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300" />
          </div>
          <div>
            <label :for="`${idPrefix}-to`" class="mb-1 block text-xs font-semibold text-slate-200">To date</label>
            <input :id="`${idPrefix}-to`" v-model="toDate" :min="fromDate || undefined" name="to" type="date" class="min-h-11 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300" />
          </div>
        </fieldset>
        <div class="mt-3 flex flex-wrap gap-2">
          <button type="submit" class="min-h-11 rounded-lg bg-sparta-blue px-4 py-2 text-sm font-bold text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">Apply filters</button>
          <button type="button" @click="$emit('clear')" class="min-h-11 rounded-lg border border-slate-600 px-4 py-2 text-sm font-bold text-slate-100 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">Clear filters</button>
        </div>
      </form>
    </details>
  </search>
</template>
