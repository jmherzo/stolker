import finnhub from "../config/finnhubConfig";

const onResolveRequest = (
  response: Response,
  functionName: string,
  resolver: any,
): void => {
  if (!response.ok) {
    console.log(functionName, response);
  } else if (resolver) {
    response
      .json()
      .then(resolver)
      .catch((e) => console.log("Error in json promise", e));
  }
};

const request = {
  get(endpoint: string, functionName: string, resolver: any): void {
    try {
      fetch(`${endpoint}`, {
        method: "GET",
        headers: finnhub.headers,
        credentials: 'same-origin'
      })
        .then((response) => onResolveRequest(response, functionName, resolver))
        .catch((e) => console.log(functionName, e));
    } catch (e) {
      console.log(functionName, e);
    }
  },
};

export default request;
