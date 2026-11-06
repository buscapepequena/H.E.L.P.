"use client";

import { createContext, useContext } from "react";
import { PanelContextValue } from "@/types/panel";

export const PanelContext = createContext<PanelContextValue | null>(null);

export const usePanel = (): PanelContextValue => {
  const value = useContext(PanelContext);
  if (!value) throw new Error("usePanel must be used inside HelpPanel");
  return value;
};
