
/**
 * Interface for environment specific global variables.
 * These are pre-configured in the execution context.
 */
declare global {
  /**
   * Interface for the AI Studio Billing integration.
   */
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  /**
   * Augmenting the Window interface.
   */
  interface Window {
    /**
     * AI Studio Billing integration.
     * Available in the Google AI Studio execution environment.
     */
    aistudio?: AIStudio;

    /**
     * Environment process object for API key access.
     * This is used to access process.env.API_KEY injected during build or runtime.
     */
    process: {
      env: {
        API_KEY?: string;
        [key: string]: any;
      };
      [key: string]: any;
    };
  }
}

export { };

declare module 'pdfjs-dist/legacy/build/pdf' {
  export * from 'pdfjs-dist';
}

declare module 'pdfjs-dist/build/pdf' {
  export * from 'pdfjs-dist';
}