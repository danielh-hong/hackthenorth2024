import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { MdLogout, MdDashboard, MdMenu, MdClose, MdWbSunny, MdNightlight } from 'react-icons/md';
import { ThemeContext } from './ColorTheme';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.navLeft}>
          <Link to="/" className={styles.brandLink}>
            <img src="/logo.png" alt="Logo" className={styles.logo} />
            <span className={styles.brandText}>FishyDash</span>
          </Link>
          <div className={`${styles.navLinks} ${isMenuOpen ? styles.active : ''}`}>
            <Link to="/dashboard" className={styles.navLink}>
              <MdDashboard className={styles.linkIcon} />
              <span className={styles.linkText}>Dashboard</span>
            </Link>
            {/* Add more nav links here */}
          </div>
        </div>
        <div className={styles.navRight}>
          <div className={styles.themeToggleWrapper}>
            <input
              type="checkbox"
              id="themeToggle"
              className={styles.themeToggleInput}
              checked={theme === 'dark'}
              onChange={toggleTheme}
            />
            <label htmlFor="themeToggle" className={styles.themeToggleLabel}>
              <MdWbSunny className={styles.sunIcon} />
              <MdNightlight className={styles.moonIcon} />
              <div className={styles.toggleHandler}>
                <div className={styles.craterId}></div>
                <div className={styles.craterId}></div>
              </div>
            </label>
          </div>
          <button className={styles.logoutButton} aria-label="Logout">
            <MdLogout className={styles.logoutIcon} />
            <span className={styles.logoutText}>Logout</span>
          </button>
          <button 
            className={styles.menuToggle} 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <MdClose /> : <MdMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;