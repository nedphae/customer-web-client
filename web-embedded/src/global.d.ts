declare module '*.json';
declare module '*.css';

type XBWebAPI = import('./App').XBWebAPI;

declare interface Window {
  initXiaobaiChat: (accessParam: AccessParam, styleDIY?: StyleDIY, customerHost?: string) => void;
  xbWebAPI: XBWebAPI;
}
