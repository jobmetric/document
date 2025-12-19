import React, {useState, useRef} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

interface ProjectItem {
  label: string;
  docId: string;
  image?: string;
}

const projects: ProjectItem[] = [
  {label: 'Findr', docId: 'findr', image: 'img/docusaurus-social-card.jpg'},
  {label: 'Hero', docId: 'hero', image: 'img/docusaurus-social-card.jpg'},
  {label: 'Huma', docId: 'huma', image: 'img/docusaurus-social-card.jpg'},
  {label: 'Selora', docId: 'selora', image: 'img/docusaurus-social-card.jpg'},
  {label: 'Vibe', docId: 'vibe', image: 'img/docusaurus-social-card.jpg'},
  {label: 'Pax', docId: 'pax', image: 'img/docusaurus-social-card.jpg'},
];

export default function ProjectsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const baseUrl = useBaseUrl('/');

  const handleItemClick = (docId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    if (typeof window !== 'undefined') {
      const path = `/projects/${docId}`;
      
      const docusaurusRouter = (window as any).__docusaurus?.router;
      if (docusaurusRouter) {
        docusaurusRouter.navigate(path, {replace: false});
      } else {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new PopStateEvent('popstate', {state: {}}));
      }
    }
  };

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  return (
    <div
      className={styles.dropdownContainer}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <button className={styles.dropdownButton}>
        Projects
        <svg
          className={`${styles.dropdownArrow} ${isOpen ? styles.arrowOpen : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M6 9L1 4H11L6 9Z"
            fill="currentColor"
          />
        </svg>
      </button>
      {isOpen && (
        <div 
          className={styles.dropdownMenu}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}>
          <div className={styles.dropdownWrapper}>
            <ul className={styles.dropdownList}>
              {projects.map((project, index) => {
                const imageUrl = project.image ? useBaseUrl(project.image) : null;
                return (
                  <li key={index} className={styles.dropdownItem}>
                    <a
                      className={styles.dropdownLink}
                      href={`/projects/${project.docId}`}
                      onClick={(e) => handleItemClick(project.docId, e)}>
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={project.label}
                          className={styles.projectImage}
                        />
                      )}
                      <span className={styles.projectLabel}>{project.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

