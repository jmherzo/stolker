export const loadFromLocalStorage = () => {
  try{
    const stateFromStorage = localStorage.getItem('state');
    if(stateFromStorage === null){
      return undefined;
    }
    return JSON.parse(stateFromStorage);
  }
  catch(e){
    console.log("Error when loading state from storage", e);
    return undefined
  }
}

export const saveToLocalStorage = (state: any)=> {
  try{
    if(state){
      const stateFromStorage = JSON.stringify(state);
      localStorage.setItem('state', stateFromStorage);
    }
    else{
      localStorage.removeItem('state');
    }
  }
  catch(e){
    console.log("Error when saving in local storage", e);
  }
}