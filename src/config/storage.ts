import { IMainState } from "../components/Main";

export const loadFromLocalStorage = () => {
  try {
    const stateFromStorage = localStorage.getItem("state");
    if (stateFromStorage === null) {
      return undefined;
    }
    return JSON.parse(stateFromStorage);
  } catch (e) {
    console.log("Error when loading state from storage", e);
    return undefined;
  }
};

export const saveToLocalStorage = (
  companyProfiles: any,
  companySymbol: string[],
) => {
  try {
    if (companySymbol.length >0) {
      const stateReceived: IMainState = {
        companySymbols: companySymbol,
        companyProfiles: companyProfiles,
        selectedSymbol: undefined,
        isRepeated: false,
        isInvalid: false,
        isLoading: false,
        symbolToSearch: "",
      };
      const stateFromStorage = JSON.stringify(stateReceived);
      localStorage.setItem("state", stateFromStorage);
    } else {
      localStorage.removeItem("state");
    }
  } catch (e) {
    console.log("Error in attempt of saving in local storage", e);
  }
};
