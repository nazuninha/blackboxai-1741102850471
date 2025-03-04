const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const path = require('path');
const logger = require('../utils/logger');

class WhatsAppController {
    constructor() {
        this.connections = new Map();
        this.maxConnections = process.env.MAX_NUMBERS || 1;
    }

    async connectWhatsApp(number) {
        try {
            if (this.connections.size >= this.maxConnections) {
                throw new Error('Maximum number of connections reached');
            }

            const authFolder = path.join(__dirname, `../auth_info_${number}`);
            const { state, saveCreds } = await useMultiFileAuthState(authFolder);

            const sock = makeWASocket({
                printQRInTerminal: true,
                auth: state,
                logger: logger
            });

            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect } = update;

                if (connection === 'close') {
                    const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                    
                    if (shouldReconnect) {
                        await this.connectWhatsApp(number);
                    } else {
                        this.connections.delete(number);
                        logger.info(`Connection ${number} logged out`);
                    }
                } else if (connection === 'open') {
                    logger.info(`Connection ${number} opened successfully`);
                }
            });

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on('messages.upsert', async (m) => {
                const msg = m.messages[0];
                if (!msg.key.fromMe && m.type === 'notify') {
                    await this.handleIncomingMessage(sock, msg);
                }
            });

            this.connections.set(number, sock);
            return sock;

        } catch (error) {
            logger.error(`Error connecting WhatsApp: ${error.message}`);
            throw error;
        }
    }

    async handleIncomingMessage(sock, msg) {
        try {
            const messageContent = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
            if (!messageContent) return;

            // Example auto-response logic
            if (messageContent.toLowerCase() === 'menu') {
                await sock.sendMessage(msg.key.remoteJid, {
                    text: 'Welcome to our service! Choose an option:\n1. Support\n2. Products\n3. About Us'
                });
            }

        } catch (error) {
            logger.error(`Error handling message: ${error.message}`);
        }
    }

    async disconnectWhatsApp(number) {
        try {
            const sock = this.connections.get(number);
            if (sock) {
                await sock.logout();
                this.connections.delete(number);
                logger.info(`WhatsApp number ${number} disconnected successfully`);
                return true;
            }
            return false;
        } catch (error) {
            logger.error(`Error disconnecting WhatsApp: ${error.message}`);
            throw error;
        }
    }

    getConnections() {
        return Array.from(this.connections.keys());
    }

    isConnected(number) {
        return this.connections.has(number);
    }
}

module.exports = new WhatsAppController();