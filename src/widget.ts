/**
 * Live Chat Support Widget
 * Embeddable widget for website customer support
 */

import { io, Socket } from 'socket.io-client';
import { injectStyles } from './styles';

interface WidgetConfig {
    apiUrl: string;
    username?: string;
    user?: {
        id?: string;
        external_id?: string;
        email?: string;
        name?: string;
        full_name?: string;
        metadata?: any;
    };
    position?: 'bottom-right' | 'bottom-left';
}

interface Category {
    id: string;
    title: string;
    description?: string;
    auto_answer?: string;
}

interface Message {
    id: string;
    thread_id: string;
    sender_type: 'customer' | 'agent' | 'system';
    content: string;
    media_url?: string;
    media_type?: string;
    created_at: string;
}

class SupportWidget {
    private config: WidgetConfig;
    private container: HTMLElement | null = null;
    private socket: Socket | null = null;
    private threadId: string | null = null;
    private wsToken: string | null = null;
    private categories: Category[] = [];
    private messages: Message[] = [];
    private currentView: 'button' | 'categories' | 'auto-answer' | 'chat' = 'button';
    private selectedCategory: Category | null = null;
    private isLoadingCategories: boolean = false;

    constructor() {
        this.config = {
            apiUrl: '',
            position: 'bottom-right'
        };
    }

    init(config: WidgetConfig) {
        this.config = { ...this.config, ...config };

        // Ensure guests have a unique ID (critical for privacy)
        // We also check if the provided ID is a known "bad" static ID that causes shared history
        const providedId = this.config.user?.id || this.config.user?.external_id;

        if (!providedId || this.isPlaceholderId(providedId)) {
            if (providedId) {
                console.warn(`[SupportWidget] Security Warning: '${providedId}' is a static ID and causes shared chat history. Switching to unique guest ID.`);
            }

            const guestId = this.getOrCreateGuestId();
            this.config.user = {
                ...this.config.user,
                id: guestId,
                // Only override name if it's likely a placeholder too
                name: (this.config.user?.name === 'Guest' || !this.config.user?.name) ? 'Guest' : this.config.user.name
            };
            console.log('Guest mode: assigned unique ID', guestId);
        }

        injectStyles();
        this.createWidget();
        this.fetchCategories();
    }

    private getOrCreateGuestId(): string {
        const storageKey = 'sw_guest_id';
        let guestId = localStorage.getItem(storageKey);

        if (!guestId) {
            // Generate a unique ID for this guest
            guestId = 'guest_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
            localStorage.setItem(storageKey, guestId);
        }

        return guestId;
    }

    private createWidget() {
        // Create container
        this.container = document.createElement('div');
        this.container.id = 'support-widget-container';
        this.container.className = `sw-container sw-${this.config.position}`;
        document.body.appendChild(this.container);

        this.renderButton();
    }

    private renderButton() {
        if (!this.container) return;
        this.currentView = 'button';

        this.container.innerHTML = `
      <button class="sw-fab" aria-label="Open chat">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
          <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
        </svg>
      </button>
    `;

        this.container.querySelector('.sw-fab')?.addEventListener('click', () => {
            this.renderCategories();
        });
    }

    private async fetchCategories() {
        this.isLoadingCategories = true;

        // If view is already categories (rare but possible), show loading
        if (this.currentView === 'categories') {
            this.renderCategories();
        }

        try {
            const response = await fetch(`${this.config.apiUrl}/api/v1/categories`);
            const data = await response.json();
            this.categories = data.categories || [];
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            this.isLoadingCategories = false;
            // If user is looking at categories list, update it now that data arrived
            if (this.currentView === 'categories') {
                this.renderCategories();
            }
        }
    }

    private renderCategories() {
        if (!this.container) return;
        this.currentView = 'categories';

        const content = this.isLoadingCategories
            ? `<div class="sw-body sw-loading">
                 <div class="sw-spinner"></div>
               </div>`
            : `<div class="sw-body">
                 <div class="sw-categories">
                   ${this.categories.length === 0
                ? '<div class="sw-empty-state">No topics available</div>'
                : this.categories.map(cat => `
                     <button class="sw-category-btn" data-id="${cat.id}">
                       <span class="sw-category-title">${cat.title}</span>
                       ${cat.description ? `<span class="sw-category-desc">${cat.description}</span>` : ''}
                     </button>
                   `).join('')}
                 </div>
               </div>`;

        this.container.innerHTML = `
      <div class="sw-panel">
        <div class="sw-header">
          <div class="sw-header-info">
             <h3>Support Center</h3>
             <span class="sw-agent-status">Select a help topic</span>
          </div>
          <button class="sw-close" aria-label="Close">&times;</button>
        </div>
        ${content}
      </div>
    `;

        this.container.querySelector('.sw-close')?.addEventListener('click', () => {
            this.renderButton();
        });

        if (!this.isLoadingCategories) {
            this.container.querySelectorAll('.sw-category-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = (e.currentTarget as HTMLElement).dataset.id;
                    const category = this.categories.find(c => c.id === id);
                    if (category) {
                        this.selectedCategory = category;
                        if (category.auto_answer) {
                            this.renderAutoAnswer(category);
                        } else {
                            this.startChat(category.id);
                        }
                    }
                });
            });
        }
    }

    private renderAutoAnswer(category: Category) {
        if (!this.container) return;
        this.currentView = 'auto-answer';

        this.container.innerHTML = `
      <div class="sw-panel">
        <div class="sw-header">
          <button class="sw-back" aria-label="Back">←</button>
          <h3>${category.title}</h3>
          <button class="sw-close" aria-label="Close">&times;</button>
        </div>
        <div class="sw-body sw-auto-answer">
          <div class="sw-auto-message">
            <div class="sw-message sw-message-system">
              ${category.auto_answer}
            </div>
          </div>
          <button class="sw-talk-btn">
            💬 Talk to an Agent
          </button>
        </div>
      </div>
    `;

        this.container.querySelector('.sw-close')?.addEventListener('click', () => {
            this.renderButton();
        });

        this.container.querySelector('.sw-back')?.addEventListener('click', () => {
            this.renderCategories();
        });

        this.container.querySelector('.sw-talk-btn')?.addEventListener('click', () => {
            this.startChat(category.id);
        });
    }

    private async startChat(categoryId: string) {
        if (!this.container) return;
        this.messages = []; // Clear previous messages


        // Show loading
        this.container.innerHTML = `
      <div class="sw-panel">
        <div class="sw-header">
          <h3>Connecting...</h3>
        </div>
        <div class="sw-body sw-loading">
          <div class="sw-spinner"></div>
          <p>Please wait...</p>
        </div>
      </div>
    `;

        try {
            const response = await fetch(`${this.config.apiUrl}/api/v1/chat/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: this.config.username || this.config.user?.name ||
                        (!this.isPlaceholderId(this.config.user?.id) ? this.config.user?.id : null) ||
                        'Guest',
                    site_origin: window.location.origin,
                    category_id: categoryId,
                    device_hash: this.getDeviceHash(),
                    user: this.config.user
                })
            });

            const data = await response.json();
            this.threadId = data.thread_id;
            this.wsToken = data.ws_token;

            // Connect WebSocket
            this.connectSocket();

            // Load existing history
            await this.loadHistory();

            // Add system message if no agents and no history
            if (data.agent_status === 'no_agents' && this.messages.length === 0) {
                this.messages.push({
                    id: 'system-1',
                    thread_id: this.threadId!,
                    sender_type: 'system',
                    content: data.message,
                    created_at: new Date().toISOString()
                });
            }

            this.renderChat();
        } catch (error) {
            console.error('Failed to start chat:', error);
            this.container.innerHTML = `
        <div class="sw-panel">
          <div class="sw-header">
            <h3>Error</h3>
            <button class="sw-close">&times;</button>
          </div>
          <div class="sw-body">
            <p>Failed to connect. Please try again.</p>
            <button class="sw-retry-btn">Retry</button>
          </div>
        </div>
      `;
            this.container.querySelector('.sw-close')?.addEventListener('click', () => this.renderButton());
            this.container.querySelector('.sw-retry-btn')?.addEventListener('click', () => this.startChat(categoryId));
        }
    }

    private async loadHistory() {
        if (!this.threadId || !this.wsToken) return;

        try {
            const response = await fetch(`${this.config.apiUrl}/api/v1/chat/${this.threadId}/messages`, {
                headers: {
                    'Authorization': `Bearer ${this.wsToken}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                if (data.messages && Array.isArray(data.messages)) {
                    // Filter out duplicate messages if any
                    const newMessages = data.messages.filter((msg: Message) =>
                        !this.messages.find(m => m.id === msg.id)
                    );
                    this.messages = [...newMessages, ...this.messages].sort((a, b) =>
                        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    );
                }
            }
        } catch (error) {
            console.error('Failed to load history:', error);
        }
    }

    private connectSocket() {
        this.socket = io(this.config.apiUrl, {
            auth: { token: this.wsToken }
        });

        this.socket.on('connect', () => {
            console.log('WebSocket connected');
            if (this.threadId) {
                this.socket?.emit('join:thread', this.threadId);
            }
        });

        this.socket.on('message:new', (message: Message) => {
            if (message.thread_id === this.threadId) {
                // Check if we have a matching optimistic message
                const tempIndex = this.messages.findIndex(m =>
                    m.id.startsWith('temp-') &&
                    m.content === message.content &&
                    m.sender_type === message.sender_type
                );

                if (tempIndex !== -1) {
                    // Replace optimistic message with real one
                    this.messages[tempIndex] = message;
                } else if (!this.messages.find(m => m.id === message.id)) {
                    // Only add if not already present (deduplication)
                    this.messages.push(message);
                }

                this.updateMessages();
            }
        });

        this.socket.on('agent:assigned', (data: { agent: { name: string } }) => {
            if (this.currentView === 'chat') {
                this.updateHeaderStatus(data.agent.name);
                this.showFakeTypingAndSeen();
            }
        });

        this.socket.on('chat:closed', () => {
            if (this.currentView === 'chat') {
                this.handleChatClosed();
            }
        });

        this.socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
        });
    }

    private renderChat() {
        if (!this.container) return;
        this.currentView = 'chat';

        const categoryTitle = this.selectedCategory?.title || 'Chat';

        this.container.innerHTML = `
      <div class="sw-panel sw-chat-panel">
        <div class="sw-header">
          <div class="sw-header-info">
             <h3>${categoryTitle}</h3>
             <span class="sw-agent-status sw-status-online">● Connected</span>
          </div>

          <button class="sw-close" aria-label="Close">&times;</button>
        </div>
        <div class="sw-messages" id="sw-messages">
          ${this.messages.map(m => this.renderMessage(m)).join('')}
        </div>
        <div class="sw-input-area">
          <input type="file" id="sw-file-input" accept="image/*,video/*" hidden />
          <button class="sw-attach-btn" aria-label="Attach file">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path fill-rule="evenodd" d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 119.52 9.52l3.45-3.451a.75.75 0 111.061 1.06l-3.45 3.451a1.125 1.125 0 001.587 1.595l3.454-3.553a3 3 0 000-4.242z" clip-rule="evenodd" />
            </svg>
          </button>
          <input type="text" id="sw-message-input" placeholder="Type your message..." />
          <button class="sw-send-btn" aria-label="Send">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
            </svg>
          </button>
        </div>
      </div>
    `;



        this.container.querySelector('.sw-close')?.addEventListener('click', () => {
            this.renderButton();
        });

        const input = this.container.querySelector('#sw-message-input') as HTMLInputElement;
        const sendBtn = this.container.querySelector('.sw-send-btn');
        const attachBtn = this.container.querySelector('.sw-attach-btn');
        const fileInput = this.container.querySelector('#sw-file-input') as HTMLInputElement;

        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                this.sendMessage(input.value.trim());
                input.value = '';
            }
        });

        sendBtn?.addEventListener('click', () => {
            if (input?.value.trim()) {
                this.sendMessage(input.value.trim());
                input.value = '';
            }
        });

        attachBtn?.addEventListener('click', () => {
            fileInput?.click();
        });

        fileInput?.addEventListener('change', () => {
            const file = fileInput.files?.[0];
            if (file) {
                this.uploadFile(file);
            }
        });

        this.scrollToBottom();
    }

    private renderMessage(message: Message): string {
        const isCustomer = message.sender_type === 'customer';
        const isSystem = message.sender_type === 'system';

        let content = message.content || '';

        if (message.media_url) {
            if (message.media_type === 'image') {
                content += `<img src="${message.media_url}" class="sw-media" alt="Image" />`;
            } else if (message.media_type === 'video') {
                content += `<video src="${message.media_url}" class="sw-media" controls></video>`;
            } else if (message.media_type === 'voice') {
                content += `<audio src="${message.media_url}" controls></audio>`;
            }
        }

        const isSeen = message.sender_type === 'customer' && (message as any).is_seen;
        const timeStr = this.formatTime(message.created_at);

        return `
      <div class="sw-message ${isCustomer ? 'sw-message-customer' : ''} ${isSystem ? 'sw-message-system' : ''}">
        ${content}
        <span class="sw-message-time">${timeStr}</span>
        ${isSeen ? '<span class="sw-seen-indicator">✓✓ Seen</span>' : ''}
      </div>
    `;
    }

    private updateMessages() {
        const container = document.getElementById('sw-messages');
        if (container) {
            let html = '';
            let lastDate = '';

            this.messages.forEach(m => {
                const date = new Date(m.created_at || Date.now());
                const dateStr = date.toDateString();

                if (dateStr !== lastDate) {
                    html += `<div class="sw-date-header">${this.formatDateHeader(date)}</div>`;
                    lastDate = dateStr;
                }
                html += this.renderMessage(m);
            });

            container.innerHTML = html;
            this.scrollToBottom();
        }
    }

    private formatTime(dateStr?: string): string {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    private formatDateHeader(date: Date): string {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
        }
    }

    private scrollToBottom() {
        const container = document.getElementById('sw-messages');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    private updateHeaderStatus(agentName: string) {
        const statusEl = this.container?.querySelector('.sw-agent-status');
        if (statusEl) {
            statusEl.textContent = `● ${agentName} connected`;
            statusEl.classList.add('sw-status-online');
        }
    }

    private showFakeTypingAndSeen() {
        // Mark last customer message as seen (fake)
        const lastCustomerMsgIndex = this.messages.map(m => m.sender_type).lastIndexOf('customer');
        if (lastCustomerMsgIndex !== -1) {
            (this.messages[lastCustomerMsgIndex] as any).is_seen = true;
            this.updateMessages();
        }

        // Show fake typing indicator
        const messagesContainer = document.getElementById('sw-messages');
        if (!messagesContainer) return;

        // Check if typing indicator already exists
        if (messagesContainer.querySelector('.sw-typing-indicator')) {
            return;
        }

        const typingId = 'typing-' + Date.now();
        const typingHtml = `
            <div id="${typingId}" class="sw-message sw-message-system sw-typing-indicator">
                <span>Agent is typing...</span>
            </div>
        `;
        messagesContainer.insertAdjacentHTML('beforeend', typingHtml);
        this.scrollToBottom();
    }

    private triggerFakeInteraction() {
        // 1. Mark as seen after 2 seconds
        setTimeout(() => {
            const lastCustomerMsgIndex = this.messages.map(m => m.sender_type).lastIndexOf('customer');
            if (lastCustomerMsgIndex !== -1) {
                const msg = this.messages[lastCustomerMsgIndex];
                if (!(msg as any).is_seen) {
                    (msg as any).is_seen = true;
                    this.updateMessages();
                }
            }

            // 2. Show typing indicator after "Seen"
            setTimeout(() => {
                this.showFakeTypingAndSeen();
            }, 1000); // 1 second after seen

        }, 2000); // 2 seconds after send
    }

    private async sendMessage(content: string) {
        if (!this.threadId) return;

        // Add optimistic message
        const tempMessage: Message = {
            id: 'temp-' + Date.now(),
            thread_id: this.threadId,
            sender_type: 'customer',
            content,
            created_at: new Date().toISOString()
        };
        this.messages.push(tempMessage);
        this.updateMessages();

        try {
            await fetch(`${this.config.apiUrl}/api/v1/chat/${this.threadId}/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });

            // Trigger fake interaction loop
            this.triggerFakeInteraction();
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    }

    private async uploadFile(file: File) {
        if (!this.threadId) return;

        // Add optimistic loading message
        const tempId = 'temp-' + Date.now();
        this.messages.push({
            id: tempId,
            thread_id: this.threadId,
            sender_type: 'system',
            content: `Uploading ${file.name}...`,
            created_at: new Date().toISOString()
        });
        this.scrollToBottom();
        this.updateMessages();

        const formData = new FormData();
        formData.append('file', file);
        formData.append('thread_id', this.threadId);

        try {
            const response = await fetch(`${this.config.apiUrl}/api/v1/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            // Remove loading message
            this.messages = this.messages.filter(m => m.id !== tempId);

            if (data.url) {
                await fetch(`${this.config.apiUrl}/api/v1/chat/${this.threadId}/message`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: '',
                        media_url: data.url,
                        media_type: data.media_type
                    })
                });

                // Trigger fake interaction loop
                this.triggerFakeInteraction();
            } else {
                // Handle upload failure from server
                this.messages.push({
                    id: 'err-' + Date.now(),
                    thread_id: this.threadId,
                    sender_type: 'system',
                    content: `Upload failed: ${data.error || 'Unknown error'}`,
                    created_at: new Date().toISOString()
                });
                this.updateMessages();
            }
        } catch (error) {
            console.error('Failed to upload file:', error);
            // Update loading message to error
            this.messages = this.messages.filter(m => m.id !== tempId);
            this.messages.push({
                id: 'err-' + Date.now(),
                thread_id: this.threadId,
                sender_type: 'system',
                content: `Upload failed: Network error`,
                created_at: new Date().toISOString()
            });
            this.updateMessages();
        }
    }

    private async closeChat() {
        if (!this.threadId) return;

        try {
            await fetch(`${this.config.apiUrl}/api/v1/chat/${this.threadId}/close`, {
                method: 'POST'
            });
            // Event listener will handle UI update
        } catch (error) {
            console.error('Failed to close chat:', error);
        }
    }

    private handleChatClosed() {
        const inputArea = this.container?.querySelector('.sw-input-area');
        if (inputArea) {
            inputArea.innerHTML = '<p class="sw-chat-ended">Chat ended</p>';
            (inputArea as HTMLElement).style.justifyContent = 'center';
            (inputArea as HTMLElement).style.color = '#64748B';
        }

        const statusEl = this.container?.querySelector('.sw-agent-status');
        if (statusEl) {
            statusEl.textContent = 'Chat ended';
            statusEl.classList.remove('sw-status-online');
        }

        // Add system message
        this.messages.push({
            id: 'system-close-' + Date.now(),
            thread_id: this.threadId!,
            sender_type: 'system',
            content: 'Chat ended',
            created_at: new Date().toISOString()
        });
        this.updateMessages();
    }

    private isPlaceholderId(id?: string): boolean {
        if (!id) return false;
        // Expanded blacklist based on common developer mistakes
        const badIds = [
            'guest', 'guest_user', 'guest_user_id', 'demo', 'test', 'user', 'user_id', 'undefined', 'null', 'default',
            'account', 'client', 'customer', 'visitor', 'visitor_id', 'admin', 'support', 'temp'
        ];
        const normalizedId = id.toLowerCase().trim();
        const isBad = badIds.includes(normalizedId) ||
            normalizedId.includes('placeholder') ||
            normalizedId.includes('demo_user') ||
            normalizedId === 'user_id_from_db';

        return isBad ||
            (id.length < 3) || // Reject very short IDs like '1', 'id'
            (id.toLowerCase() === this.config.user?.name?.toLowerCase()); // Reject if ID equals Name (lazy pattern)
    }

    private getDeviceHash(): string {
        const nav = navigator;
        const screen = window.screen;

        // Generate or retrieve a persistent random ID for this browser instance
        let deviceId = localStorage.getItem('sw_device_id');
        if (!deviceId) {
            deviceId = Math.random().toString(36).substring(2) + Date.now().toString(36);
            localStorage.setItem('sw_device_id', deviceId);
        }

        const str = [
            nav.userAgent,
            nav.language,
            screen.width,
            screen.height,
            new Date().getTimezoneOffset(),
            deviceId // This ensures uniqueness per browser profile/storage
        ].join('|');

        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }
}

// Create global instance
const widget = new SupportWidget();

// Expose to window
declare global {
    interface Window {
        SupportWidget: {
            init: (config: WidgetConfig) => void;
            config?: WidgetConfig;
        };
    }
}

console.log('Widget script loaded');

// Preserve existing config
const existing = window.SupportWidget || {};

window.SupportWidget = {
    ...existing,
    init: (config: WidgetConfig) => {
        console.log('Widget init called with:', config);
        widget.init(config);
    }
};

// Auto-init if config is already set
if (existing.config) {
    console.log('Auto-initializing widget...');
    widget.init(existing.config);
}

export { SupportWidget };
