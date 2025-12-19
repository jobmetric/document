import React, {useState} from 'react';
import {useHistory} from '@docusaurus/router';
import styles from './styles.module.css';

interface DropdownItem {
  label: string;
  to: string;
  description?: string;
  icon?: string;
}

interface NavbarDropdownProps {
  label: string;
  items: DropdownItem[];
}

export default function NavbarDropdown({label, items}: NavbarDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const history = useHistory();

  const handleItemClick = (to: string) => {
    history.push(to);
    setIsOpen(false);
  };

  return (
    <div
      className={styles.dropdownContainer}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}>
      <button className={styles.dropdownButton}>
        {label}
        <svg
          className={styles.dropdownArrow}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M6 9L1 4H11L6 9Z"
            fill="currentColor"
            className={isOpen ? styles.arrowOpen : ''}
          />
        </svg>
      </button>
      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div className={styles.dropdownGrid}>
            {items.map((item, index) => (
              <div
                key={index}
                className={styles.dropdownCard}
                onClick={() => handleItemClick(item.to)}>
                {item.icon && (
                  <div className={styles.cardIcon}>{item.icon}</div>
                )}
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{item.label}</h3>
                  {item.description && (
                    <p className={styles.cardDescription}>{item.description}</p>
                  )}
                </div>
                <div className={styles.cardArrow}>→</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

