import { createContext, useContext } from "react";

export const NonceContext = createContext<string>("");

export const NonceProvider = NonceContext.Provider;

export const useNonce = () => {
  const context = useContext(NonceContext);
  return context || "";
};
