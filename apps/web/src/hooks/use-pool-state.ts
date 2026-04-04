import { useState, useEffect, useCallback } from "react";
import { fetchCallReadOnlyFunction, cvToJSON } from "@stacks/transactions";
import { CONTRACTS, network } from "@/config/contracts";

export type PoolState = {
  initialized: boolean;
  paused: boolean;
  assetContract: string | null;
  totalShares: number;
  totalLiquidAssets: number;
  totalDebt: number;
  totalAssets: number;
  collateralFactorBps: number;
  liquidationThresholdBps: number;
  borrowFeeBps: number;
  borrowApy: number;
  supplyApy: number;
};

export function usePoolState() {
  const [poolState, setPoolState] = useState<PoolState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchState = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const [contractAddress, contractName] = CONTRACTS.clarionPool.split(".");
      
      const result = await fetchCallReadOnlyFunction({
        network,
        contractAddress,
        contractName,
        functionName: "get-pool-state",
        functionArgs: [],
        senderAddress: contractAddress, // safe read-only proxy
      });

      const jsonResult = cvToJSON(result);

      if (jsonResult && jsonResult.success) {
        const data = jsonResult.value.value;
        setPoolState({
          initialized: data.initialized.value,
          paused: data.paused.value,
          assetContract: data['asset-contract'].value ? data['asset-contract'].value.value : null,
          totalShares: Number(data['total-shares'].value),
          totalLiquidAssets: Number(data['total-liquid-assets'].value),
          totalDebt: Number(data['total-debt'].value),
          totalAssets: Number(data['total-assets'].value),
          collateralFactorBps: Number(data['collateral-factor-bps'].value),
          liquidationThresholdBps: Number(data['liquidation-threshold-bps'].value),
          borrowFeeBps: Number(data['borrow-fee-bps'].value),
          borrowApy: data['total-assets'].value > 0 
              ? (Number(data['total-debt'].value) / Number(data['total-assets'].value)) * 8.5 
              : 0,
          supplyApy: data['total-assets'].value > 0 
              ? (Number(data['total-debt'].value) / Number(data['total-assets'].value)) * 4.5 
              : 0,
        });
      }
    } catch (e) {
      console.error("Failed to fetch pool state:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 30_000);
    return () => clearInterval(interval);
  }, [fetchState]);

  return { poolState, isLoading, mutate: fetchState };
}
