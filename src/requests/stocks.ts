import request from "../helpers/request";

const stocksRequests = {
  getPriceBySymbol(stockSymbol: string, resolver: (result: any) => void) {
    request.get(
      `quote?symbol=${stockSymbol}`,
      this.getPriceBySymbol.name,
      resolver,
    );
  },
  getSymbolsByExchange(exchange: string, resolver: (result: any) => void){
    request.get(
      `stock/symbol?exchange=${exchange}`,
      this.getSymbolsByExchange.name,
      resolver,
    );
  }
};

export default stocksRequests;
