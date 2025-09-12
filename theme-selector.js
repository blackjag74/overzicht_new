// Theme Selector Component
class ThemeSelector {
    constructor() {
        this.themes = {
            'modern-blue': {
                name: 'Modern Dark (Blue)',
                file: 'theme-modern-blue.css',
                description: 'Clean modern design with blue accents'
            },
            'elegant-purple': {
                name: 'Elegant Dark (Purple)',
                file: 'theme-elegant-purple.css',
                description: 'Sophisticated design with purple accents'
            },
            'professional-green': {
                name: 'Professional Dark (Green)',
                file: 'theme-professional-green.css',
                description: 'Business-focused design with green accents'
            }
        };
        
        this.currentTheme = localStorage.getItem('selectedTheme') || 'modern-blue';
        this.init();
    }
    
    init() {
        this.createThemeSelector();
        this.loadTheme(this.currentTheme);
        this.attachEventListeners();
    }
    
    createThemeSelector() {
        // Create theme selector container
        const selectorContainer = document.createElement('div');
        selectorContainer.className = 'theme-selector-container';
        selectorContainer.innerHTML = `
            <div class="theme-selector">
                <button class="theme-toggle-btn" id="themeToggleBtn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Theme</span>
                </button>
                <div class="theme-dropdown" id="themeDropdown">
                    <div class="theme-options">
                        ${Object.entries(this.themes).map(([key, theme]) => `
                            <div class="theme-option" data-theme="${key}">
                                <div class="theme-preview ${key}"></div>
                                <div class="theme-info">
                                    <div class="theme-name">${theme.name}</div>
                                    <div class="theme-description">${theme.description}</div>
                                </div>
                                <div class="theme-check ${this.currentTheme === key ? 'active' : ''}">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                    </svg>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        // Add to header or create a floating button
        const header = document.querySelector('.header');
        if (header) {
            header.appendChild(selectorContainer);
        } else {
            document.body.appendChild(selectorContainer);
            selectorContainer.style.position = 'fixed';
            selectorContainer.style.top = '20px';
            selectorContainer.style.right = '20px';
            selectorContainer.style.zIndex = '1000';
        }
    }
    
    attachEventListeners() {
        const toggleBtn = document.getElementById('themeToggleBtn');
        const dropdown = document.getElementById('themeDropdown');
        const options = document.querySelectorAll('.theme-option');
        
        // Toggle dropdown
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.theme-selector')) {
                dropdown.classList.remove('active');
            }
        });
        
        // Theme selection
        options.forEach(option => {
            option.addEventListener('click', () => {
                const themeKey = option.dataset.theme;
                this.selectTheme(themeKey);
                dropdown.classList.remove('active');
            });
        });
    }
    
    selectTheme(themeKey) {
        if (this.themes[themeKey]) {
            this.currentTheme = themeKey;
            localStorage.setItem('selectedTheme', themeKey);
            this.loadTheme(themeKey);
            this.updateUI();
        }
    }
    
    loadTheme(themeKey) {
        // Remove existing theme stylesheets
        const existingThemes = document.querySelectorAll('link[data-theme]');
        existingThemes.forEach(link => link.remove());
        
        // Load new theme
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = this.themes[themeKey].file;
        link.setAttribute('data-theme', themeKey);
        document.head.appendChild(link);
    }
    
    updateUI() {
        // Update active state in dropdown
        const checks = document.querySelectorAll('.theme-check');
        checks.forEach(check => check.classList.remove('active'));
        
        const activeOption = document.querySelector(`[data-theme="${this.currentTheme}"] .theme-check`);
        if (activeOption) {
            activeOption.classList.add('active');
        }
    }
}

// Initialize theme selector when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ThemeSelector();
    });
} else {
    new ThemeSelector();
}