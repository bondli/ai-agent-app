interface window {
  electron: Record<string, any>;
}

declare global {
  interface Window {
    electron?: any
  }
}