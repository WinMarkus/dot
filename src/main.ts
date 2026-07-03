import { createApp } from 'vue';
import App from './App.vue';
import { installInspectorOriginTracking } from './inspector-origin';
import './styles.css';
import './delete-markers.css';
import './mobile-command-bar.css';
import './mobile-prompt-safe.css';
import './delete-transition.css';
import './seed-dot-motion.css';
import './bubble-shape.css';
import './closed-open-bubbles.css';
import './artifact-open-guard.css';
import './artifact-open-guard';
import './inspector-genie.css';
import './nested-bubbles.css';

installInspectorOriginTracking();
createApp(App).mount('#app');
