import { type Dispatch, type SetStateAction, createContext, useContext } from "react";

export const AccordionContext = createContext<{
  value: string[];
  setValue: Dispatch<SetStateAction<string[]>>;
} | null>(null);

export function useAccordionContext() {
  return useContext(AccordionContext);
}
