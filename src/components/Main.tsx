import React from "react";

// Config
import finnhub from "../config/finnhubConfig";
import { loadFromLocalStorage, saveToLocalStorage } from "../config/storage";
import requests from "../requests/stocks";

// Types
import { ISymbol } from "../types/ISymbol";
import { ICompanySymbol } from "../types/ICompanySymbol";

// Components
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

// Internal Components
import Search from "./Search";
import Graph from "./Graph";

interface IMainState {
  companyProfiles?: { [symbol: string]: ICompanySymbol };
  companySymbols: string[];
  isRepeated: boolean;
  isInvalid: boolean;
  isLoading: boolean;
  symbolToSearch: string;
}

class Main extends React.Component<any, IMainState> {
  readonly state: IMainState;
  private exchanges: ISymbol[];
  private socket: WebSocket;
  private symbolToAddIndex: number;

  constructor(props: any) {
    super(props);
    this.exchanges = [];
    this.socket = new WebSocket(finnhub.webSocketURL());
    this.symbolToAddIndex = -1;
    this.state = {
      companySymbols: [],
      isRepeated: false,
      isInvalid: false,
      isLoading: false,
      symbolToSearch: "",
    };
  }

  showLoader = () => {
    this.setState({
      isLoading: true,
    });
  };

  hideLoader = () => {
    this.setState({
      isLoading: false,
    });
  };

  onChangeSearchField = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      symbolToSearch: event.target.value,
      isInvalid: false,
      isRepeated: false,
    });
  };

  onAddStock = () => {
    const { symbolToSearch, companySymbols } = this.state;

    if (symbolToSearch) {
      const isRepeated: boolean = companySymbols.some(
        (symbol: string) => symbol === symbolToSearch,
      );
      if (isRepeated) {
        this.setState({
          isRepeated: true,
        });
      } else {
        const symbolToAdd: string = symbolToSearch.toUpperCase();
        this.symbolToAddIndex = this.exchanges.findIndex(
          (exchange) => exchange.symbol === symbolToAdd,
        );
        if (this.symbolToAddIndex > -1) {
          this.showLoader();
          requests.getPriceBySymbol(symbolToAdd, this.resolveGetPriceBySymbol);
        } else {
          this.setState({
            isInvalid: true,
          });
        }
      }
    }
  };

  onAddPrice = (event: any) => {
    const { companyProfiles } = this.state;
    if (companyProfiles && companyProfiles[event.s]) {
      companyProfiles[event.s].price = event.p;
      this.setState({
        companyProfiles,
      });
    }
  };

  onDeleteSymbol = (event: React.MouseEvent<HTMLButtonElement>) => {
    const symbol: string | undefined = event.currentTarget.dataset.id;
    const { companySymbols, companyProfiles } = this.state;
    if (companyProfiles && symbol) {
      delete companyProfiles[symbol];
    }
    this.setState(
      {
        companySymbols: companySymbols.filter((c) => c !== symbol),
        companyProfiles,
      },
      () => {
        this.socket.send(finnhub.webSocketSend("unsubscribe", symbol));
        saveToLocalStorage(this.state);
      },
    );
  };

  resolveGetSymbolsByExchange = (result: any) => {
    try {
      if (result) {
        const exchanges: ISymbol[] | undefined = result;
        if (exchanges) {
          this.exchanges = exchanges;
        }
        this.hideLoader();
      }
    } catch (e) {
      this.hideLoader();
      console.log(this.resolveGetSymbolsByExchange.name, e);
    }
  };

  resolveGetPriceBySymbol = (result: any) => {
    try {
      if (result && this.symbolToAddIndex > -1) {
        const price: string = result.c || 0;
        const { companySymbols, companyProfiles } = this.state;
        const symbolToAdd: ISymbol = {
          ...this.exchanges[this.symbolToAddIndex],
        };
        if (
          symbolToAdd.symbol.length > 4 &&
          symbolToAdd.symbol.slice(symbolToAdd.symbol.length - 4) ===
            "USDT"
        ) {
          symbolToAdd.symbol = `BINANCE:${symbolToAdd.symbol}`;
        }
        this.setState(
          {
            companySymbols: [...companySymbols, symbolToAdd.symbol],
            companyProfiles: {
              ...companyProfiles,
              [symbolToAdd.symbol]: { ...symbolToAdd, price: price},
            },
            symbolToSearch: "",
          },
          () => {
            this.socket.send(
              finnhub.webSocketSend("subscribe", symbolToAdd?.symbol),
            );
            saveToLocalStorage(this.state);
          },
        );
        this.hideLoader();
      }
    } catch (e) {
      this.hideLoader();
      console.log(this.resolveGetPriceBySymbol.name, e);
    }
  };

  componentDidMount() {
    // #region localStorage
    const localState: IMainState | undefined = loadFromLocalStorage();
    if (localState) {
      this.setState(localState);
    }
    //#endregion localStorage

    //#region Websocket
    this.socket.onopen = () => {
      console.log("Websocket connected");
      localState?.companySymbols?.forEach((symbol) => {
        this.socket.send(finnhub.webSocketSend("subscribe", symbol));
      });
    };

    this.socket.onmessage = (event: MessageEvent) => {
      const result = JSON.parse(event.data);
      if (result.type === "trade" && result.data.length > 0) {
        this.onAddPrice(result.data[0]);
      }
    };

    this.socket.onclose = () => {
      console.log("Websocket disconnected");
    };

    this.socket.onerror = (e: any) => {
      console.error("WebSocket error", e.message);
      this.socket.close();
    };
    //#endregion WebSocket

    this.showLoader();
    requests.getSymbolsByExchange("US", this.resolveGetSymbolsByExchange);
  }

  render() {
    const {
      symbolToSearch,
      companySymbols,
      companyProfiles,
      isRepeated,
      isLoading,
      isInvalid,
    } = this.state;
    return (
      <Grid container spacing={2}>
        <Grid item sm={12}>
          <Typography variant="h3">Stolker</Typography>
          <Typography gutterBottom>
            The best way to track your stocks from US exchange
          </Typography>
        </Grid>
        <Grid item sm={12} md={5}>
          <Search
            isInvalid={isInvalid}
            isRepeated={isRepeated}
            isLoading={isLoading}
            companyProfiles={companyProfiles}
            companySymbols={companySymbols}
            symbolToSearch={symbolToSearch}
            onChangeSearchField={this.onChangeSearchField}
            onDelete={this.onDeleteSymbol}
            onAdd={this.onAddStock}
          />
        </Grid>
        <Grid item xs={12} md={7}>
          <Graph/>
        </Grid>
      </Grid>
    );
  }
}

export default Main;
