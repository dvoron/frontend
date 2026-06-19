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
        {path: '/:pathMatch(.*)*', redirect: '/home'}
    ]
})

const app = createApp(App)
const pinia = createPinia()
app.use(router)
app.use(pinia)
app.mount('#app')
