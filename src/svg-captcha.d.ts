declare module 'svg-captcha' {
  export interface ConfigObject {
    size?: number;
    ignoreChars?: string;
    noise?: number;
    color?: boolean;
    background?: string;
    width?: number;
    height?: number;
    fontSize?: number;
    charPreset?: string;
    mathMin?: number;
    mathMax?: number;
    mathOperator?: string;
  }

  export interface CaptchaObj {
    data: string;
    text: string;
  }

  export function create(options?: ConfigObject): CaptchaObj;
  export function createMathExpr(options?: ConfigObject): CaptchaObj;
  export function randomText(size?: number | ConfigObject): string;
  export const options: ConfigObject;
  export function loadFont(url: string): void;
}
