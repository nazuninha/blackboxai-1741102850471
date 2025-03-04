// Configurações globais do Chart.js
Chart.defaults.font.family = 'Inter, sans-serif';
Chart.defaults.color = '#6c757d';
Chart.defaults.responsive = true;
Chart.defaults.maintainAspectRatio = false;

// Função para inicializar todos os gráficos
function initializeCharts() {
    initializeMessagesChart();
    initializeChatsChart();
    initializeMenusChart();
    initializeResponseTimeChart();
}

// Gráfico de Mensagens Enviadas
function initializeMessagesChart() {
    const ctx = document.getElementById('messagesChart').getContext('2d');
    const messagesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: 24}, (_, i) => `${i}:00`),
            datasets: [{
                label: 'Mensagens Enviadas',
                data: generateRandomData(24),
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Mensagens Enviadas (24h)',
                    padding: 20
                },
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'x',
                    },
                    pan: {
                        enabled: true,
                        mode: 'x',
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Gráfico de Chats Interagidos
function initializeChatsChart() {
    const ctx = document.getElementById('chatsChart').getContext('2d');
    const chatsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
            datasets: [{
                label: 'Chats Ativos',
                data: generateRandomData(7),
                backgroundColor: 'rgba(46, 204, 113, 0.5)',
                borderColor: '#2ecc71',
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Chats Ativos por Dia',
                    padding: 20
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Gráfico de Menus Ativos
function initializeMenusChart() {
    const ctx = document.getElementById('menusChart').getContext('2d');
    const menusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Menus Principais', 'Submenus'],
            datasets: [{
                data: [5, 7],
                backgroundColor: [
                    'rgba(52, 152, 219, 0.5)',
                    'rgba(155, 89, 182, 0.5)'
                ],
                borderColor: [
                    '#3498db',
                    '#9b59b6'
                ],
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Distribuição de Menus',
                    padding: 20
                }
            }
        }
    });
}

// Gráfico de Tempo de Resposta
function initializeResponseTimeChart() {
    const ctx = document.getElementById('responseTimeChart').getContext('2d');
    const responseTimeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: 7}, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                return d.toLocaleDateString('pt-BR');
            }),
            datasets: [{
                label: 'Tempo Médio (segundos)',
                data: generateRandomData(7, 1, 5),
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Tempo Médio de Resposta',
                    padding: 20
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Função auxiliar para gerar dados aleatórios
function generateRandomData(length, min = 10, max = 100) {
    return Array.from({length}, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

// Sistema de Notificações
const notifications = {
    container: document.getElementById('notifications-container'),
    history: [],
    maxHistory: 50,

    show(message, type = 'info') {
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date()
        };

        // Adicionar à história
        this.history.unshift(notification);
        if (this.history.length > this.maxHistory) {
            this.history.pop();
        }

        // Criar elemento de notificação
        const element = document.createElement('div');
        element.className = `notification ${type}`;
        element.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${this.getIconForType(type)}"></i>
            </div>
            <div class="notification-content">
                <p>${message}</p>
                <small>${notification.timestamp.toLocaleTimeString()}</small>
            </div>
            <button class="notification-close">&times;</button>
        `;

        // Adicionar ao container
        this.container.appendChild(element);

        // Configurar auto-remoção
        setTimeout(() => {
            element.classList.add('fade-out');
            setTimeout(() => element.remove(), 300);
        }, 5000);

        // Configurar botão de fechar
        element.querySelector('.notification-close').addEventListener('click', () => {
            element.classList.add('fade-out');
            setTimeout(() => element.remove(), 300);
        });
    },

    getIconForType(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-times-circle';
            case 'warning': return 'fa-exclamation-circle';
            default: return 'fa-info-circle';
        }
    },

    showHistory() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Histórico de Notificações</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${this.history.map(n => `
                        <div class="notification-history-item ${n.type}">
                            <i class="fas ${this.getIconForType(n.type)}"></i>
                            <div class="notification-history-content">
                                <p>${n.message}</p>
                                <small>${n.timestamp.toLocaleString()}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);

        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        });
    }
};

// Inicializar gráficos quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    
    // Exemplo de notificações
    setTimeout(() => {
        notifications.show('Novo número conectado com sucesso!', 'success');
    }, 2000);
    
    setTimeout(() => {
        notifications.show('Erro ao enviar mensagem para +5511999999999', 'error');
    }, 4000);
});

// Atualizar dados em tempo real
setInterval(() => {
    // Simular atualização de dados
    document.querySelectorAll('.widget-value').forEach(element => {
        const currentValue = parseInt(element.textContent.replace(/[^0-9]/g, ''));
        const newValue = currentValue + Math.floor(Math.random() * 10) - 5;
        element.textContent = newValue.toLocaleString();
    });
}, 5000);