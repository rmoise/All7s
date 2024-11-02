declare module 'howler' {
  export class Howl {
    constructor(options: any);
    play(): void;
    pause(): void;
    stop(): void;
    seek(seek?: number): number;
    playing(): boolean;
    once(event: string, listener: () => void): void;
    unload(): void;
    // Add other methods and properties as needed

    // Extend the class to include _src if you are sure it exists
    _src?: string[];
  }
}
