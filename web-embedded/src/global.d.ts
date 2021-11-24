declare module '*.json';
declare module '*.css';

declare interface Window {
  initChat: (accessParam: AccessParam) => void;
}
