import { createContext, useContext } from 'react';

export type MarketingContextType = {
  lglApiKey: string;
};

export const MarketingContext = createContext<MarketingContextType>({
  lglApiKey: ''
});

export const useMarketingContext = () => useContext(MarketingContext);
