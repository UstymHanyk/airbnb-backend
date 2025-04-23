declare module 'express-handlebars' {
  export interface ConfigOptions {
    defaultLayout?: string;
    extname?: string;
    layoutsDir?: string;
    partialsDir?: string | string[] | object | object[];
    helpers?: Record<string, Function>;
  }

  export function create(config?: ConfigOptions): exphbs;
  export function engine(config?: ConfigOptions): (path: string, options: object, callback: Function) => void;
  export const ExpressHandlebars: any;
} 