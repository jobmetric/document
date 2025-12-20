import React from 'react';
import ReactDOM from 'react-dom/client';
import CustomFooter from '@site/src/components/CustomFooter';

export default function () {
  const replaceFooter = () => {
    const footerElement = document.querySelector('footer.footer');
    if (footerElement && !footerElement.hasAttribute('data-custom-footer')) {
      footerElement.setAttribute('data-custom-footer', 'true');
      const container = document.createElement('div');
      footerElement.innerHTML = '';
      footerElement.appendChild(container);
      
      const root = ReactDOM.createRoot(container);
      root.render(<CustomFooter />);
    }
  };

  if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', replaceFooter);
    } else {
      replaceFooter();
    }

    const observer = new MutationObserver(() => {
      replaceFooter();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}

