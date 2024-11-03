declare module '@fortawesome/fontawesome-svg-core' {
  export const config: {
    autoAddCss: boolean;
  };

  export const library: {
    add: (...icons: any[]) => void;
  };
}

declare module '@fortawesome/fontawesome-svg-core/styles.css'; 