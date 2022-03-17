declare module '*.json';
declare module '*.css';

declare interface Window {
  initXiaobaiChat: (accessParam: AccessParam, customerHost: string) => void;
}
