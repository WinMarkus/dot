import { createApp } from 'vue';
import App from './App.vue';
import { installInspectorOriginTracking } from './inspector-origin';
import './app.css';
import './artifact-open-guard';

installInspectorOriginTracking();
createApp(App).mount('#app');
