// Theme toggle functionality
function initTheme() {
    // Create the theme toggle button
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.setAttribute('aria-label', 'Toggle dark mode');
    themeToggle.style.visibility = 'visible'; // Ensure visibility
    themeToggle.style.display = 'flex'; // Ensure proper display
    document.body.appendChild(themeToggle);

    // Make sure the button is on top of everything
    setTimeout(() => {
        themeToggle.style.opacity = '1';
    }, 100);

    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (systemPrefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Theme toggle click handler
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Update JSXGraph board colors if it exists
        if (typeof board !== 'undefined') {
            updateBoardColors(newTheme);
        }
    });
}

// Update JSXGraph board colors for dark mode
function updateBoardColors(theme) {
    const isDark = theme === 'dark';
    const gridColor = isDark ? 'rgba(255,255,255,0.2)' : '#cccccc';
    const axisColor = isDark ? 'rgba(255,255,255,0.7)' : '#666666';
    const curveColor = isDark ? '#FFFFFF' : '#0000ff';
    
    // Update board background with transition
    board.containerObj.style.transition = 'background-color 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    board.containerObj.style.backgroundColor = isDark ? '#000000' : '#FFFFFF';
    
    // Update axis colors with animation
    if (board.defaultAxes) {
        board.defaultAxes.x.setAttribute({
            strokeColor: axisColor,
            highlightStrokeColor: axisColor
        });
        board.defaultAxes.y.setAttribute({
            strokeColor: axisColor,
            highlightStrokeColor: axisColor
        });
    }
    
    // Update all objects with smooth transitions
    board.objects.forEach(obj => {
        if (obj.elType === 'grid') {
            obj.setAttribute({
                strokeColor: gridColor,
                highlightStrokeColor: gridColor
            });
        } else if (obj.elType === 'curve') {
            obj.setAttribute({
                strokeColor: curveColor,
                highlightStrokeColor: curveColor
            });
        } else if (obj.elType === 'point') {
            obj.setAttribute({
                fillColor: isDark ? '#FFFFFF' : '#0000ff',
                strokeColor: isDark ? '#000000' : '#0000ff',
                highlightFillColor: isDark ? '#FFFFFF' : '#0000ff',
                highlightStrokeColor: isDark ? '#000000' : '#0000ff'
            });
        }
    });
    
    // Trigger a smooth update
    requestAnimationFrame(() => {
        board.update();
    });
}

// Initialize theme when DOM is loaded
document.addEventListener('DOMContentLoaded', initTheme);