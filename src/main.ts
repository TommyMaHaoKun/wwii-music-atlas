import { createApp } from 'vue'
import './style.css'
import './research.css'
import App from './App.vue'
import { router } from './router'
import { vReveal } from './directives/reveal'

createApp(App).use(router).directive('reveal', vReveal).mount('#app')
