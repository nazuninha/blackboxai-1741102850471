document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    loadSettings();
    setupEventListeners();
});

function initializeUI() {
    // Theme handling
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateThemeIcon();
        });

        // Set initial theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
        updateThemeIcon();
    }

    // Sidebar toggle
    const toggleSidebar = document.getElementById('toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    if (toggleSidebar && sidebar) {
        toggleSidebar.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            document.getElementById('main-content').classList.toggle('expanded');
        });
    }
}

function setupEventListeners() {
    // Delay type toggle
    const delayTypeInputs = document.querySelectorAll('input[name="delayType"]');
    const fixedDelayDiv = document.getElementById('fixed-delay');
    const randomDelayDiv = document.getElementById('random-delay');

    delayTypeInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            if (e.target.value === 'fixed') {
                fixedDelayDiv.style.display = 'block';
                randomDelayDiv.style.display = 'none';
            } else {
                fixedDelayDiv.style.display = 'none';
                randomDelayDiv.style.display = 'block';
            }
        });
    });

    // Menu trigger change
    const menuTrigger = document.querySelector('select[name="menuTrigger"]');
    const triggerConfig = document.getElementById('trigger-config');

    if (menuTrigger) {
        menuTrigger.addEventListener('change', (e) => {
            triggerConfig.style.display = 
                ['specific_message', 'contains'].includes(e.target.value) 
                    ? 'block' 
                    : 'none';
        });
    }

    // Away message toggle
    const awayMessageToggle = document.getElementById('enableAwayMessage');
    const awayMessageConfig = document.getElementById('away-message-config');

    if (awayMessageToggle) {
        awayMessageToggle.addEventListener('change', (e) => {
            awayMessageConfig.style.display = e.target.checked ? 'block' : 'none';
        });
    }

    // Form submission
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveSettings(new FormData(settingsForm));
        });
    }
}

async function loadSettings() {
    try {
        const response = await fetch('/bot/settings');
        const settings = await response.json();
        
        if (response.ok) {
            applySettings(settings);
        } else {
            showNotification('Erro ao carregar configurações', 'error');
        }
    } catch (error) {
        showNotification('Erro ao carregar configurações', 'error');
    }
}

function applySettings(settings) {
    // Status settings
    document.getElementById('showOnline').checked = settings.showOnline;
    document.getElementById('markRead').checked = settings.markRead;

    // Delay settings
    const delayType = document.querySelector(`input[name="delayType"][value="${settings.delayType}"]`);
    if (delayType) {
        delayType.checked = true;
        delayType.dispatchEvent(new Event('change'));
    }

    if (settings.delayType === 'fixed') {
        document.querySelector('input[name="fixedDelay"]').value = settings.fixedDelay;
    } else {
        document.querySelector('input[name="minDelay"]').value = settings.minDelay;
        document.querySelector('input[name="maxDelay"]').value = settings.maxDelay;
    }

    // Menu settings
    const menuTrigger = document.querySelector('select[name="menuTrigger"]');
    if (menuTrigger) {
        menuTrigger.value = settings.menuTrigger;
        menuTrigger.dispatchEvent(new Event('change'));
    }
    
    if (settings.triggerTerm) {
        document.querySelector('input[name="triggerTerm"]').value = settings.triggerTerm;
    }

    // Away message settings
    const awayMessageToggle = document.getElementById('enableAwayMessage');
    if (awayMessageToggle) {
        awayMessageToggle.checked = settings.enableAwayMessage;
        awayMessageToggle.dispatchEvent(new Event('change'));
    }

    if (settings.awayMessage) {
        document.querySelector('input[name="awayStart"]').value = settings.awayStart;
        document.querySelector('input[name="awayEnd"]').value = settings.awayEnd;
        document.querySelector('textarea[name="awayMessage"]').value = settings.awayMessage;
    }

    // Inactivity settings
    document.querySelector('input[name="inactivityTimeout"]').value = settings.inactivityTimeout;
}

async function saveSettings(formData) {
    try {
        const settings = Object.fromEntries(formData.entries());
        
        const response = await fetch('/bot/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings)
        });

        if (response.ok) {
            showNotification('Configurações salvas com sucesso!', 'success');
        } else {
            const error = await response.json();
            showNotification(error.message || 'Erro ao salvar configurações', 'error');
        }
    } catch (error) {
        showNotification('Erro ao salvar configurações', 'error');
    }
}

function showNotification(message, type = 'info') {
    const container = document.getElementById('notifications-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;

    container.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 5000);

    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    });
}

function updateThemeIcon() {
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        const isDark = document.body.classList.contains('dark-theme');
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}