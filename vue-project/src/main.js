import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import Home from "@/components/Home.vue";
import About from "@/components/About.vue";
import Contact from "@/components/Contact.vue";
import {createPinia} from "pinia";
import LogIn from "@/components/LogIn.vue";
import Register from "@/components/Register.vue";
import Profile from "@/components/Profile.vue";
import {useAuthStore} from "@/stores/auth.js";
import Forum from "@/components/Forum.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {path: '/', component: Home},
        {path: '/home', name: "home", component: Home, children: [
            {
            path: 'login', name: "login", component: LogIn
            },
            {
            path: 'register', name: "register", component: Register
            }
            ]},
        {path: '/about', name: "about",  component: About},
        {path: '/contact', name: "contact", component: Contact},
        {path: '/profile', name: "profile", component: Profile,
            meta: {
            requiresAuth: true,
            }
            },
        {path: '/forum', name: "forum", component: Forum},
        {path: '/:pathMatch(.*)*', redirect: '/home'}
    ]
})

const app = createApp(App)
const pinia = createPinia()
app.use(router)
app.use(pinia)
app.mount('#app')
router.beforeEach((to) => {
    const auth = useAuthStore()

    if (to.meta.requiresAuth && !auth.isLoggedIn) {
        return {
            name: 'login'
        }
    }

    return true
})

export default router
