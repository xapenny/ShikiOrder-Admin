<template>
  <div class="common-layout">
    <el-container>
      <el-header><navigation-bar /></el-header>
      <el-main><router-view /></el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import NavigationBar from '@/components/NavigationBar.vue'

</script>