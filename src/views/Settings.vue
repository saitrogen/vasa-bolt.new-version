<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
    
    <div class="card p-4">
      <ExpenseCategoryManager />
    </div>
  </div>
</template>

<script setup lang="ts">
import ExpenseCategoryManager from '../components/ExpenseCategoryManager.vue';
</script> 