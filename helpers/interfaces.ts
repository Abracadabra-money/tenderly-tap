export interface FlashState {
  type: string;
  boldMessage: string;
  message: string;
}

export interface ChainConfig {
  [key: string]: any;
}

export interface FaucetProps {
  setFlashMessage: Function;
}
