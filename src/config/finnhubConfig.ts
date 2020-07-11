import { API_KEY } from "../helpers/constants";

const finnhub = {
  webSocketURL() {
    return `wss://ws.finnhub.io?token=${API_KEY}`;
  },
  webSocketSend(type: string, symbol?: string) {
    return JSON.stringify({ type: type, symbol: symbol || '' });
  },
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Finnhub-Token": API_KEY,
  },
};

export default finnhub;
