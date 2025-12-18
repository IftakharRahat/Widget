/**
 * Widget Styles - Injected into the page
 */

/**
 * Widget Styles - Injected into the page
 */

export function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

    :root {
      --sw-primary: #6366f1;
      --sw-primary-dark: #4f46e5;
      --sw-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      --sw-bg: #ffffff;
      --sw-bg-secondary: #f8fafc;
      --sw-text: #0f172a;
      --sw-text-secondary: #64748b;
      --sw-border: #e2e8f0;
      --sw-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1);
      --sw-font: 'Inter', system-ui, -apple-system, sans-serif;
    }

    /* Reset & Container */
    .sw-container * {
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
    }

    .sw-container {
      position: fixed;
      z-index: 999999;
      font-family: var(--sw-font);
      font-size: 14px;
      line-height: 1.5;
      color: var(--sw-text);
    }
    
    .sw-bottom-right { bottom: 24px; right: 24px; }
    .sw-bottom-left { bottom: 24px; left: 24px; }
    
    /* Floating Action Button */
    .sw-fab {
      width: 64px;
      height: 64px;
      border-radius: 24px;
      background: var(--sw-gradient);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }
    
    .sw-fab:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 12px 28px rgba(99, 102, 241, 0.5);
    }
    
    .sw-fab:active {
      transform: scale(0.95);
    }
    
    .sw-fab svg {
      width: 32px;
      height: 32px;
      color: white;
      transition: transform 0.3s ease;
    }

    .sw-fab:hover svg {
      transform: rotate(-10deg);
    }
    
    /* Panel */
    .sw-panel {
      width: 380px;
      height: 600px;
      max-height: calc(100vh - 100px);
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      border-radius: 24px;
      box-shadow: var(--sw-shadow), 0 0 0 1px rgba(0,0,0,0.03);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: sw-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: bottom right;
    }

    @keyframes sw-slide-up {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    
    /* Header */
    .sw-header {
      background: var(--sw-gradient);
      color: white;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      position: relative;
    }

    .sw-header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 20px;
      background: linear-gradient(to top, rgba(0,0,0,0.05), transparent);
      pointer-events: none;
    }
    
    .sw-header-info h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: -0.02em;
    }

    .sw-agent-status {
      font-size: 12px;
      opacity: 0.9;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 4px;
    }

    .sw-status-online {
      color: #bbf7d0;
    }
    
    .sw-close, .sw-back {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    
    .sw-close:hover, .sw-back:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: scale(1.05);
    }
    
    /* Body */
    .sw-body {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: #cbd5e1 transparent;
    }

    .sw-body::-webkit-scrollbar {
      width: 6px;
    }
    
    .sw-body::-webkit-scrollbar-thumb {
      background-color: #cbd5e1;
      border-radius: 3px;
    }
    
    .sw-subtitle {
      color: var(--sw-text-secondary);
      margin: 0 0 20px 0;
      font-size: 15px;
      font-weight: 500;
    }
    
    /* Categories */
    .sw-empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--sw-text-secondary);
      font-size: 15px;
    }
    
    .sw-categories {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .sw-category-btn {
      background: white;
      border: 1px solid var(--sw-border);
      border-radius: 16px;
      padding: 16px;
      text-align: left;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      gap: 4px;
      position: relative;
    }
    
    .sw-category-btn:hover {
      border-color: var(--sw-primary);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
      transform: translateY(-1px);
    }

    .sw-category-btn::after {
      content: '→';
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      opacity: 0;
      color: var(--sw-primary);
      transition: all 0.2s;
    }

    .sw-category-btn:hover::after {
      opacity: 1;
      transform: translateY(-50%) translateX(4px);
    }
    
    .sw-category-title {
      font-weight: 600;
      color: var(--sw-text);
      font-size: 15px;
    }
    
    .sw-category-desc {
      font-size: 13px;
      color: var(--sw-text-secondary);
      line-height: 1.4;
      padding-right: 20px;
    }
    
    /* Messages */
    .sw-messages {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: var(--sw-bg-secondary);
    }
    
    .sw-message {
      max-width: 85%;
      padding: 14px 18px;
      border-radius: 20px;
      font-size: 15px;
      line-height: 1.5;
      position: relative;
      animation: sw-msg-in 0.3s ease-out;
    }

    @keyframes sw-msg-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .sw-message-customer {
      background: var(--sw-primary);
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
    }
    
    .sw-message:not(.sw-message-customer):not(.sw-message-system) {
      background: white;
      color: var(--sw-text);
      align-self: flex-start;
      border-bottom-left-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .sw-message-system {
      align-self: center;
      background: rgba(99, 102, 241, 0.1);
      color: var(--sw-primary-dark);
      font-size: 13px;
      font-weight: 500;
      border-radius: 20px;
      padding: 8px 16px;
      max-width: 90%;
      text-align: center;
    }
    
    .sw-media {
      max-width: 100%;
      border-radius: 12px;
      margin-top: 8px;
      border: 1px solid rgba(0,0,0,0.1);
    }
    
    /* Input Area */
    .sw-input-area {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px;
      background: white;
      border-top: 1px solid var(--sw-border);
    }

    /* Date & Time */
    .sw-date-header {
      text-align: center;
      font-size: 12px;
      color: var(--sw-text-secondary);
      margin: 16px 0 8px 0;
      font-weight: 500;
      opacity: 0.8;
    }

    .sw-message-time {
      font-size: 10px;
      opacity: 0.7;
      margin-top: 4px;
      text-align: right;
      display: block;
    }

    .sw-message-customer .sw-message-time {
        color: rgba(255, 255, 255, 0.9);
    }

    
    .sw-input-area input[type="text"] {
      flex: 1;
      border: 1px solid var(--sw-border);
      border-radius: 24px;
      padding: 12px 20px;
      font-size: 15px;
      outline: none;
      transition: all 0.2s;
      background: var(--sw-bg-secondary);
      font-family: var(--sw-font);
      color: var(--sw-text);
    }

    .sw-input-area input[type="text"]::placeholder {
      color: var(--sw-text-secondary);
      opacity: 0.7;
    }
    
    .sw-input-area input[type="text"]:focus {
      border-color: var(--sw-primary);
      background: white;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
    }
    
    .sw-attach-btn, .sw-send-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    
    .sw-attach-btn {
      background: transparent;
      color: var(--sw-text-secondary);
    }
    
    .sw-attach-btn:hover {
      background: var(--sw-bg-secondary);
      color: var(--sw-primary);
    }
    
    .sw-send-btn {
      background: var(--sw-primary);
      color: white;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
    
    .sw-send-btn:hover {
      transform: scale(1.05);
      background: var(--sw-primary-dark);
    }

    /* Auto Answer */
    .sw-auto-answer {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .sw-talk-btn {
        width: 100%;
        padding: 16px;
        background: var(--sw-gradient);
        color: white;
        border: none;
        border-radius: 16px;
        font-weight: 600;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
    }

    .sw-talk-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5);
    }

    /* Loading */
    .sw-loading {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding-bottom: 60px;
    }

    .sw-spinner {
        width: 48px;
        height: 48px;
        border: 4px solid var(--sw-bg-secondary);
        border-top-color: var(--sw-primary);
        border-radius: 50%;
        animation: sw-spin 0.8s linear infinite;
        margin-bottom: 24px;
    }

    @keyframes sw-spin { to { transform: rotate(360deg); } }

    /* Mobile */
    @media (max-width: 480px) {
      .sw-panel {
        width: 100%;
        height: 100%;
        max-height: 100vh;
        border-radius: 0;
        position: fixed;
        bottom: 0;
        right: 0;
      }
      
      .sw-container {
        right: 0;
        bottom: 0;
        z-index: 2147483647; /* Max z-index */
      }

      .sw-fab {
        width: 56px;
        height: 56px;
        margin: 0 20px 20px 0;
      }
    }
  `;
  document.head.appendChild(style);
}
