import { createContext } from "@lit/context";
export const filterContext = createContext({
  exclude: "",
});

export interface Filters {
  exclude: string;
}
