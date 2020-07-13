import React from "react";

// Config
import finnhub from "../config/finnhubConfig";
import { loadFromLocalStorage, saveToLocalStorage } from "../config/storage";
import requests from "../requests/stocks";

// Types
import { ISymbol } from "../types/ISymbol";
import { ICompanySymbol } from "../types/ICompanySymbol";
import { IDataset } from "../types/IDataset";

// Components
import Grid from "@material-ui/core/Grid";

// Internal Components
import Search from "./Search";
import Graph from "./Graph";
import Header from "./Header";

export interface IMainState {
  companyProfiles?: { [symbol: string]: ICompanySymbol };
  companySymbols: string[];
  selectedSymbol?: IDataset;
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

  onSelectSymbol = (event: React.MouseEvent<HTMLButtonElement>) => {
    const symbolName: string | undefined = event.currentTarget.dataset.id;
    const { companyProfiles } = this.state;
    if (companyProfiles && symbolName) {
      const symbolPrice = companyProfiles[symbolName].price;
      this.setState({
        selectedSymbol: {
          symbol: symbolName,
          data: [{ price: symbolPrice, time: Date.now() }],
        },
      });
    }
  };

  onDeselectSymbol = () => {
    this.setState({
      selectedSymbol: undefined,
    });
  };

  onAddRealTimePrice = (event: any) => {
    const { companyProfiles } = this.state;
    if (companyProfiles && event.s && companyProfiles[event.s]) {
      companyProfiles[event.s].price = event.p || 0;
      this.onAddRealTimePriceToSelected(event.p || 0, event.s);
      this.setState(() => ({
        companyProfiles,
      }));
    }
  };

  onAddRealTimePriceToSelected = (price: number, symbol: string) => {
    const { selectedSymbol } = this.state;
    if (selectedSymbol && selectedSymbol.symbol === symbol) {
      selectedSymbol.data = [
        ...selectedSymbol?.data,
        {
          time: Date.now(),
          price: price,
        },
      ];
    }
    this.setState({
      selectedSymbol,
    });
  };

  onDeleteSymbol = (event: React.MouseEvent<HTMLButtonElement>) => {
    const symbol: string | undefined = event.currentTarget.dataset.id;
    const { companySymbols, companyProfiles } = this.state;
    if (companyProfiles && symbol) {
      const newCompanyProfiles = { ...companyProfiles };
      delete newCompanyProfiles[symbol];
      this.setState(
        {
          companySymbols: companySymbols.filter((c) => c !== symbol),
          companyProfiles: newCompanyProfiles,
        },
        () => {
          this.socket.send(finnhub.webSocketSend("unsubscribe", symbol));
          this.saveToStorage();
        },
      );
    }
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
        const { companySymbols, companyProfiles } = this.state;
        const price: number = result.c || 0;

        // Obtains the symbol from US exchange data
        const symbolToAdd: ISymbol = {
          ...this.exchanges[this.symbolToAddIndex],
        };

        // If symbol is cryptoCurrency
        if (
          symbolToAdd.symbol.length > 4 &&
          symbolToAdd.symbol.slice(symbolToAdd.symbol.length - 4) === "USDT"
        ) {
          symbolToAdd.symbol = `BINANCE:${symbolToAdd.symbol}`;
        }
        this.setState(
          {
            companySymbols: [...companySymbols, symbolToAdd.symbol],
            companyProfiles: {
              ...companyProfiles,
              [symbolToAdd.symbol]: {
                ...symbolToAdd,
                price: price,
              },
            },
            symbolToSearch: "",
            isInvalid: false,
            isRepeated: false,
          },
          () => {
            this.socket.send(
              finnhub.webSocketSend("subscribe", symbolToAdd?.symbol),
            );
            this.saveToStorage();
          },
        );
        this.hideLoader();
      }
    } catch (e) {
      this.hideLoader();
      console.log(this.resolveGetPriceBySymbol.name, e);
    }
  };

  saveToStorage = () => {
    saveToLocalStorage(this.state.companyProfiles, this.state.companySymbols);
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
        this.onAddRealTimePrice(result.data[0]);
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
      selectedSymbol,
    } = this.state;
    return (
      <Grid container spacing={3}>
        <Grid item sm={12} md={5}>
          <Grid container>
            <Grid item xs={12}>
             <Header/>
            </Grid>
            <Grid item xs={12}>
              <Search
                isInvalid={isInvalid}
                isRepeated={isRepeated}
                isLoading={isLoading}
                companyProfiles={companyProfiles}
                companySymbols={companySymbols}
                symbolToSearch={symbolToSearch}
                selectedSymbol={selectedSymbol}
                onSelectSymbol={this.onSelectSymbol}
                onDeselectSymbol={this.onDeselectSymbol}
                onChangeSearchField={this.onChangeSearchField}
                onDelete={this.onDeleteSymbol}
                onAdd={this.onAddStock}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item sm={12} md={7}>
          <Graph selectedSymbol={selectedSymbol} />
        </Grid>
      </Grid>
    );
  }
}

export default Main;
