// Type definitions for Deno runtime
declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
  };
  export function serve(handler: (request: Request) => Response | Promise<Response>): void;
}

// Declare modules for URL-based imports
declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(handler: (request: Request) => Response | Promise<Response>): void;
}

declare module "https://deno.land/x/xhr@0.1.0/mod.ts" {
  // XHR polyfill module
}
