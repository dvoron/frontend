import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import Home from "@/components/Home.vue";
import About from "@/components/About.vue";
import Contact from "@/components/Contact.vue";
import {createPinia} from "pinia";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {path: '/', component: Home},
        {path: '/home', component: Home},
        {path: '/about', component: About},
        {path: '/contact', component: Contact},
        {path: '/:pathMatch(.*)*', redirect: '/home'}
    ]
})

const app = createApp(App)
app.use(router)
app.use(createPinia())
app.mount('#app')
