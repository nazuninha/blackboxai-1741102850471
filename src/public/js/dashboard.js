// Dashboard functionality
document.addEventListener('DOMContentLoaded', () => {
    // Toggle sidebar
    const toggleSidebar = document.getElementById('toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');

    if (toggleSidebar) {
        toggleSidebar.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        });
    }

    // Theme switcher
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });

        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    }

    // Initialize metrics charts
    initializeCharts();
});

function initializeCharts() {
    // Messages chart
    const messagesCtx = document.getElementById('messagesChart');
    if (messagesCtx) {
        new Chart(messagesCtx, {
            type: 'line',
            data: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                datasets: [{
                    label: 'Mensagens Enviadas',
                    data: [12, 19, 3, 5, 2, 3],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Mensagens por Hora'
                    }
                }
            }
        });
    }

    // Interactions chart
    const interactionsCtx = document.getElementById('interactionsChart');
    if (interactionsCtx) {
        new Chart(interactionsCtx, {
            type: 'bar',
            data: {
                labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'],
                datasets: [{
                    label: 'Interações',
                    data: [65, 59, 80, 81, 56, 55, 40],
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Interações Semanais'
                    }
                }
            }
        });
    }
}

// Notifications system
const notifications = {
    show: (message, type = 'info') => {
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
};

// Drag and drop functionality for widgets
function initializeDragAndDrop() {
    const widgets = document.querySelectorAll('.widget');
    const widgetContainer = document.querySelector('.widgets-container');

    widgets.forEach(widget => {
        widget.setAttribute('draggable', true);
        
        widget.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', widget.id);
            widget.classList.add('dragging');
        });

        widget.addEventListener('dragend', () => {
            widget.classList.remove('dragging');
        });
    });

    widgetContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggingWidget = document.querySelector('.dragging');
        const closestWidget = getClosestWidget(widgetContainer, e.clientY);
        
        if (closestWidget) {
            widgetContainer.insertBefore(draggingWidget, closestWidget);
        } else {
            widgetContainer.appendChild(draggingWidget);
        }
    });
}

function getClosestWidget(container, y) {
    const draggableElements = [...container.querySelectorAll('.widget:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}