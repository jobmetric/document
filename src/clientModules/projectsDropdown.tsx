import React from 'react';
import ReactDOM from 'react-dom/client';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import ProjectsDropdown from '../components/ProjectsDropdown';

if (ExecutionEnvironment.canUseDOM) {
  let rootInstance: ReactDOM.Root | null = null;

  function initProjectsDropdown() {
    const container = document.getElementById('projects-dropdown-container');
    if (container && !container.hasAttribute('data-initialized')) {
      container.setAttribute('data-initialized', 'true');
      try {
        if (rootInstance) {
          rootInstance.unmount();
        }
        rootInstance = ReactDOM.createRoot(container);
        rootInstance.render(
          <React.StrictMode>
            <ProjectsDropdown />
          </React.StrictMode>
        );
      } catch (error) {
        console.error('Error rendering ProjectsDropdown:', error);
        container.removeAttribute('data-initialized');
      }
    }
  }

  function startObserving() {
    initProjectsDropdown();
    
    const observer = new MutationObserver(() => {
      initProjectsDropdown();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const checkIntervals = [0, 50, 100, 200, 500, 1000, 2000];
    checkIntervals.forEach((delay) => {
      setTimeout(initProjectsDropdown, delay);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserving);
  } else {
    startObserving();
  }

  window.addEventListener('load', () => {
    setTimeout(initProjectsDropdown, 50);
  });

  if (typeof window !== 'undefined' && window.history) {
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(initProjectsDropdown, 100);
    };
  }
}
