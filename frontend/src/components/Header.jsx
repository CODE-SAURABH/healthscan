import React from 'react'
import config from '../config'
import './Header.css'

function Header({ language, theme, onToggleLanguage, onToggleTheme }) {
    return (
        <header className="header">
            <div className="header-inner">
                {/* Logo */}
                <div className="logo-group">
                    <div className="logo-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                    </div>
                    <div className="logo-text">
                        <span className="logo-name">{config.APP_NAME}</span>
                        <span className="logo-tag">
                            {language === 'hi' ? 'AI रिपोर्ट विश्लेषक' : 'AI Report Analyzer'}
                        </span>
                    </div>
                </div>

                {/* Controls */}
                <div className="header-controls">
                    {/* Theme Toggle */}
                    <button
                        className="theme-toggle"
                        onClick={onToggleTheme}
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        id="theme-toggle-btn"
                    >
                        {theme === 'dark' ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="5" />
                                <line x1="12" y1="1" x2="12" y2="3" />
                                <line x1="12" y1="21" x2="12" y2="23" />
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                <line x1="1" y1="12" x2="3" y2="12" />
                                <line x1="21" y1="12" x2="23" y2="12" />
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                            </svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                        )}
                    </button>

                    {/* Language Toggle */}
                    <button
                        className="lang-toggle"
                        onClick={onToggleLanguage}
                        title={language === 'en' ? 'हिन्दी में देखें' : 'View in English'}
                        id="lang-toggle-btn"
                    >
                        <span className="lang-label">{language === 'en' ? 'हिं' : 'EN'}</span>
                        <span className="lang-text">{language === 'en' ? 'हिन्दी' : 'English'}</span>
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header
