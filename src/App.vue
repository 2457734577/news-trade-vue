<template>
  <div id="app">
    <template v-if="isAuthPage">
      <router-view />
    </template>
    
    <template v-else-if="authStore.isAdmin">
      <AdminSidebar :collapsed="sidebarCollapsed" @toggle="toggleSidebar" />
      <div class="main-wrapper" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <AdminNavbar @toggle-sidebar="toggleSidebar" />
        <main class="main-content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </main>
      </div>
    </template>
    
    <template v-else>
      <UserSidebar :collapsed="sidebarCollapsed" @toggle="toggleSidebar" />
      <div class="main-wrapper" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <UserNavbar @toggle-sidebar="toggleSidebar" />
        <main class="main-content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </main>
      </div>
    </template>
    
    <SupportButton v-if="authStore.isLoggedIn && !authStore.isAdmin" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AdminNavbar from '@/components/admin/AdminNavbar.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import UserNavbar from '@/components/user/UserNavbar.vue'
import UserSidebar from '@/components/user/UserSidebar.vue'
import SupportButton from '@/components/support/SupportButton.vue'

const route = useRoute()
const authStore = useAuthStore()

const sidebarCollapsed = ref(false)

const isAuthPage = computed(() => {
  const authPages = ['/login', '/register', '/admin/login']
  return authPages.includes(route.path)
})

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  localStorage.setItem('sidebarCollapsed', sidebarCollapsed.value)
}
</script>

<style>
#app {
  min-height: 100vh;
}

.main-wrapper {
  margin-left: var(--sidebar-width);
  min-height: 100vh;
  transition: margin-left var(--transition-normal);
}

.main-wrapper.sidebar-collapsed {
  margin-left: var(--sidebar-collapsed-width);
}

.main-content {
  padding: 1.5rem;
  padding-top: calc(var(--navbar-height) + 1.5rem);
  min-height: calc(100vh - var(--navbar-height));
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .main-wrapper {
    margin-left: 0;
  }
  
  .main-wrapper.sidebar-collapsed {
    margin-left: 0;
  }
  
  .main-content {
    padding: 1rem;
    padding-top: calc(var(--navbar-height) + 1rem);
  }
}
</style>