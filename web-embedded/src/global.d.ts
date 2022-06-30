declare module '*.json';
declare module '*.css';

declare interface Window {
  initXiaobaiChat: (accessParam: AccessParam, styleDIY?: StyleDIY, customerHost?: string) => void;
}
