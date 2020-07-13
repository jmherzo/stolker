export interface IDataset {
  symbol: string;
  data: IData[];
}

export interface IData {
  time: number;
  price: number;
} 