/* eslint-disable @typescript-eslint/no-explicit-any */
// src/renderer/src/lib/debug.ts

type LogLevel = 'info' | 'warn' | 'error' | 'success';

class DebugLogger {
  private enabled: Record<string, boolean> = {
    MESSAGE: true,      // Message sending/receiving
    WEBSOCKET: true,    // WebSocket events
    CONVERSATION: false, // Conversation list updates
    STATUS: false,      // Status changes
    TYPING: false,      // Typing indicators
    RENDER: false,      // Component renders
  };

  private colors = {
    info: '#3b82f6',    // blue
    warn: '#f59e0b',    // orange
    error: '#ef4444',   // red
    success: '#10b981', // green
  };

  private icons = {
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
    success: '✅',
  };

  enable(category: string) {
    this.enabled[category] = true;
  }

  disable(category: string) {
    this.enabled[category] = false;
  }

  log(category: string, level: LogLevel, message: string, data?: any) {
    if (!this.enabled[category]) return;

    const icon = this.icons[level];
    const color = this.colors[level];
    const timestamp = new Date().toLocaleTimeString();

    console.log(
      `%c${icon} [${category}] ${timestamp} - ${message}`,
      `color: ${color}; font-weight: bold;`,
      data || ''
    );
  }

  group(category: string, title: string) {
    if (!this.enabled[category]) return;
    console.group(`🔍 [${category}] ${title}`);
  }

  groupEnd(category: string) {
    if (!this.enabled[category]) return;
    console.groupEnd();
  }

  // Shorthand methods
  message = {
    info: (msg: string, data?: any) => this.log('MESSAGE', 'info', msg, data),
    success: (msg: string, data?: any) => this.log('MESSAGE', 'success', msg, data),
    error: (msg: string, data?: any) => this.log('MESSAGE', 'error', msg, data),
  };

  ws = {
    info: (msg: string, data?: any) => this.log('WEBSOCKET', 'info', msg, data),
    success: (msg: string, data?: any) => this.log('WEBSOCKET', 'success', msg, data),
    error: (msg: string, data?: any) => this.log('WEBSOCKET', 'error', msg, data),
  };

  conv = {
    info: (msg: string, data?: any) => this.log('CONVERSATION', 'info', msg, data),
    success: (msg: string, data?: any) => this.log('CONVERSATION', 'success', msg, data),
  };
}

export const debug = new DebugLogger();

// Usage in console:
// debug.enable('CONVERSATION')  - to see conversation logs
// debug.disable('MESSAGE')      - to hide message logs
