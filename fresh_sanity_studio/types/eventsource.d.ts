declare module 'eventsource' {
  interface EventSourceInit {
    withCredentials?: boolean;
    headers?: { [key: string]: string };
  }

  class EventSource {
    constructor(url: string, eventSourceInitDict?: EventSourceInit);
    static readonly CONNECTING: number;
    static readonly OPEN: number;
    static readonly CLOSED: number;
    readonly readyState: number;
    readonly url: string;
    readonly withCredentials: boolean;
    onopen: (event: Event) => void;
    onmessage: (event: MessageEvent) => void;
    onerror: (event: Event) => void;
    addEventListener(type: string, listener: EventListener): void;
    removeEventListener(type: string, listener: EventListener): void;
    close(): void;
  }

  export = EventSource;
}

