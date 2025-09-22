// pwa-app.js - Clase principal de la aplicación
class PWAApp {
    constructor() {
        this.deferredPrompt = null;
        this.isOnline = navigator.onLine;
        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.setupEventListeners();
        this.updateConnectionStatus();
        this.loadData();
        this.setupInstallPrompt();
    }

    // Registrar el Service Worker
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker registrado con éxito:', registration);
                    
                    // Verificar actualizaciones periódicamente
                    setInterval(() => {
                        registration.update();
                    }, 60 * 60 * 1000); // Cada hora

                    // Escuchar nuevas versiones
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        console.log('Nueva versión del Service Worker encontrada');
                        
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                this.showUpdateNotification();
                            }
                        });
                    });
                })
                .catch((error) => {
                    console.error('Error registrando el Service Worker:', error);
                });

            // Escuchar cuando un nuevo SW toma control
            let refreshing = false;
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (!refreshing) {
                    refreshing = true;
                    console.log('Nuevo Service Worker tomando control, recargando...');
                    window.location.reload();
                }
            });
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Eventos de conexión
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        // Botón de actualizar datos
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadData());
        }
        
        // Botón de instalar
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.addEventListener('click', () => this.installApp());
        }
    }

    // Configurar prompt de instalación
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        window.addEventListener('appinstalled', () => {
            console.log('App instalada');
            this.hideInstallButton();
            this.deferredPrompt = null;
            this.showNotification('App Instalada', 'La aplicación se ha instalado correctamente');
        });
    }

    // Mostrar botón de instalación
    showInstallButton() {
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.style.display = 'block';
        }
    }

    // Ocultar botón de instalación
    hideInstallButton() {
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    }

    // Instalar la app
    installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            
            this.deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('Usuario aceptó la instalación');
                } else {
                    console.log('Usuario rechazó la instalación');
                }
                this.deferredPrompt = null;
            });
        }
    }

    // Manejar estado online
    handleOnline() {
        this.isOnline = true;
        this.updateConnectionStatus();
        this.loadData();
        this.showNotification('Conexión restaurada', 'Ya estás en línea');
    }

    // Manejar estado offline
    handleOffline() {
        this.isOnline = false;
        this.updateConnectionStatus();
        this.showNotification('Sin conexión', 'Modo offline activado');
    }

    // Actualizar indicador de conexión
    updateConnectionStatus() {
        const statusElement = document.getElementById('connection-status');
        if (!statusElement) return;
        
        if (this.isOnline) {
            statusElement.textContent = 'En línea';
            statusElement.className = 'status-online';
        } else {
            statusElement.textContent = 'Offline';
            statusElement.className = 'status-offline';
        }
    }

    // Cargar datos (simulando API)
    async loadData() {
        const timeElement = document.getElementById('current-time');
        const dataElement = document.getElementById('random-data');

        if (!timeElement || !dataElement) return;

        // Mostrar hora actual (siempre disponible)
        timeElement.textContent = `Hora actual: ${new Date().toLocaleTimeString()}`;

        if (this.isOnline) {
            // Intentar cargar datos de la API
            try {
                dataElement.textContent = 'Cargando datos en línea...';
                dataElement.style.color = '#3498db';
                
                const randomData = await this.fetchRandomData();
                dataElement.textContent = `Datos en línea: ${randomData}`;
                dataElement.style.color = '#2ecc71';
            } catch (error) {
                dataElement.textContent = 'Error cargando datos en línea';
                dataElement.style.color = '#e74c3c';
            }
        } else {
            // Modo offline - usar datos cacheados o por defecto
            dataElement.textContent = 'Modo offline - Usando datos cacheados';
            dataElement.style.color = '#f39c12';
        }
    }

    // Simular fetch de datos
    async fetchRandomData() {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Datos simulados
        const randomItems = [
            'Dato importante 1', 
            'Información crítica', 
            'Actualización reciente', 
            'Novedades del sistema',
            'Última actualización cargada'
        ];
        return randomItems[Math.floor(Math.random() * randomItems.length)];
    }

    // Mostrar notificación
    showNotification(title, message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: '/icon-192.png',
                badge: '/icon-192.png'
            });
        }
    }

    // Mostrar notificación de actualización
    showUpdateNotification() {
        if (confirm('¡Hay una nueva versión disponible! ¿Quieres actualizar ahora?')) {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then((registration) => {
                    if (registration.active) {
                        registration.active.postMessage({ type: 'SKIP_WAITING' });
                    }
                });
            }
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Solicitar permisos de notificación
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            console.log('Permiso de notificación:', permission);
        });
    }
    
    // Inicializar la aplicación
    new PWAApp();
});

// Detectar si la app está instalada
window.addEventListener('load', () => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('La app se está ejecutando en modo instalado');
    }
});