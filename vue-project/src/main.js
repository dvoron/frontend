import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import Home from "@/views/Home.vue";
import About from "@/views/About.vue";
import Contact from "@/views/Contact.vue";
import {createPinia} from "pinia";
import LogIn from "@/views/LogIn.vue";
import Register from "@/views/Register.vue";
import Profile from "@/views/Profile.vue";
import {useAuthStore} from "@/stores/auth.js";
import Forum from "@/views/Forum.vue";

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
app.use(pinia)

const auth = useAuthStore()
await auth.tryRefresh()

app.use(router)
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
