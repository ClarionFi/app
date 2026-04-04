import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const ONE_USDC = 1_000_000n;
const ONE_STX = 1_000_000n;

function contractPrincipal(address: string, name: string) {
  return Cl.contractPrincipal(address, name);
}

function setupPool(deployer: string) {
  const mockToken = contractPrincipal(deployer, "mock-ft");

  expect(
    simnet.callPublicFn(
      "clarion-oracle",
      "set-stx-price",
      [Cl.uint(2_000_000n)],
      deployer,
    ).result,
  ).toBeOk(Cl.uint(2_000_000n));

  expect(
    simnet.callPublicFn(
      "clarion-pool",
      "initialize",
      [mockToken],
      deployer,
    ).result,
  ).toBeOk(Cl.bool(true));

  return { mockToken };
}

describe("clarion-pool", () => {
  it("lets a lender supply and withdraw pool assets", () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const lender = accounts.get("wallet_1")!;
    const { mockToken } = setupPool(deployer);

    expect(
      simnet.callPublicFn(
        "mock-ft",
        "mint",
        [Cl.uint(2_000n * ONE_USDC), Cl.principal(lender)],
        deployer,
      ).result,
    ).toBeOk(Cl.bool(true));

    expect(
      simnet.callPublicFn(
        "clarion-pool",
        "supply",
        [mockToken, Cl.uint(1_000n * ONE_USDC)],
        lender,
      ).result,
    ).toBeOk(Cl.uint(1_000n * ONE_USDC));

    expect(
      simnet.callReadOnlyFn(
        "clarion-pool",
        "get-supplier-position",
        [Cl.principal(lender)],
        lender,
      ).result,
    ).toBeOk(
      Cl.tuple({
        shares: Cl.uint(1_000n * ONE_USDC),
        "asset-claim": Cl.uint(1_000n * ONE_USDC),
      }),
    );

    expect(
      simnet.callPublicFn(
        "clarion-pool",
        "withdraw",
        [mockToken, Cl.uint(400n * ONE_USDC)],
        lender,
      ).result,
    ).toBeOk(Cl.uint(400n * ONE_USDC));

    expect(
      simnet.callReadOnlyFn(
        "clarion-pool",
        "get-supplier-position",
        [Cl.principal(lender)],
        lender,
      ).result,
    ).toBeOk(
      Cl.tuple({
        shares: Cl.uint(600n * ONE_USDC),
        "asset-claim": Cl.uint(600n * ONE_USDC),
      }),
    );
  });

  it("supports collateralized borrow and repay", () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const lender = accounts.get("wallet_1")!;
    const borrower = accounts.get("wallet_2")!;
    const { mockToken } = setupPool(deployer);

    expect(
      simnet.callPublicFn(
        "mock-ft",
        "mint",
        [Cl.uint(5_000n * ONE_USDC), Cl.principal(lender)],
        deployer,
      ).result,
    ).toBeOk(Cl.bool(true));

    expect(
      simnet.callPublicFn(
        "mock-ft",
        "mint",
        [Cl.uint(1_000n * ONE_USDC), Cl.principal(borrower)],
        deployer,
      ).result,
    ).toBeOk(Cl.bool(true));

    expect(
      simnet.callPublicFn(
        "clarion-pool",
        "supply",
        [mockToken, Cl.uint(2_000n * ONE_USDC)],
        lender,
      ).result,
    ).toBeOk(Cl.uint(2_000n * ONE_USDC));

    expect(
      simnet.callPublicFn(
        "clarion-pool",
        "deposit-collateral",
        [Cl.uint(1_000n * ONE_STX)],
        borrower,
      ).result,
    ).toBeOk(Cl.uint(1_000n * ONE_STX));

    expect(
      simnet.callPublicFn(
        "clarion-pool",
        "borrow",
        [mockToken, Cl.uint(500n * ONE_USDC)],
        borrower,
      ).result,
    ).toBeOk(Cl.uint(501_500_000n));

    expect(
      simnet.callReadOnlyFn(
        "clarion-pool",
        "get-borrower-position",
        [Cl.principal(borrower)],
        borrower,
      ).result,
    ).toBeOk(
      Cl.tuple({
        collateral: Cl.uint(1_000n * ONE_STX),
        debt: Cl.uint(501_500_000n),
        "borrow-limit": Cl.uint(1_400n * ONE_USDC),
        "liquidation-limit": Cl.uint(1_600n * ONE_USDC),
        "health-factor": Cl.uint(3_190_428n),
      }),
    );

    expect(
      simnet.callPublicFn(
        "clarion-pool",
        "repay",
        [mockToken, Cl.uint(200n * ONE_USDC)],
        borrower,
      ).result,
    ).toBeOk(Cl.uint(301_500_000n));

    expect(
      simnet.callPublicFn(
        "clarion-pool",
        "withdraw-collateral",
        [Cl.uint(200n * ONE_STX)],
        borrower,
      ).result,
    ).toBeOk(Cl.uint(800n * ONE_STX));
  });

  it("allows third-party liquidation after the oracle price drops", () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const lender = accounts.get("wallet_1")!;
    const borrower = accounts.get("wallet_2")!;
    const liquidator = accounts.get("wallet_3")!;
    const { mockToken } = setupPool(deployer);

    expect(
      simnet.callPublicFn(
        "mock-ft",
        "mint",
        [Cl.uint(5_000n * ONE_USDC), Cl.principal(lender)],
        deployer,
      ).result,
    ).toBeOk(Cl.bool(true));

    expect(
      simnet.callPublicFn(
        "mock-ft",
        "mint",
        [Cl.uint(1_000n * ONE_USDC), Cl.principal(liquidator)],
        deployer,
      ).result,
    ).toBeOk(Cl.bool(true));

    expect(
      simnet.callPublicFn(
        "clarion-pool",
        "supply",
        [mockToken, Cl.uint(2_000n * ONE_USDC)],
        lender,
      ).result,
    ).toBeOk(Cl.uint(2_000n * ONE_USDC));

    expect(
      simnet.callPublicFn(
        "clarion-pool",
        "deposit-collateral",
        [Cl.uint(1_000n * ONE_STX)],
        borrower,
      ).result,
    ).toBeOk(Cl.uint(1_000n * ONE_STX));

    expect(
      simnet.callPublicFn(
        "clarion-pool",
        "borrow",
        [mockToken, Cl.uint(600n * ONE_USDC)],
        borrower,
      ).result,
    ).toBeOk(Cl.uint(601_800_000n));

    expect(
      simnet.callPublicFn(
        "clarion-oracle",
        "set-stx-price",
        [Cl.uint(500_000n)],
        deployer,
      ).result,
    ).toBeOk(Cl.uint(500_000n));

    expect(
      simnet.callPublicFn(
        "clarion-pool",
        "liquidate",
        [mockToken, Cl.principal(borrower), Cl.uint(400n * ONE_USDC)],
        liquidator,
      ).result,
    ).toBeOk(
      Cl.tuple({
        repaid: Cl.uint(300_900_000n),
        seized: Cl.uint(631_890_000n),
        "remaining-debt": Cl.uint(300_900_000n),
      }),
    );

    expect(
      simnet.callReadOnlyFn(
        "clarion-pool",
        "get-borrower-position",
        [Cl.principal(borrower)],
        borrower,
      ).result,
    ).toBeOk(
      Cl.tuple({
        collateral: Cl.uint(368_110_000n),
        debt: Cl.uint(300_900_000n),
        "borrow-limit": Cl.uint(128_838_500n),
        "liquidation-limit": Cl.uint(147_244_000n),
        "health-factor": Cl.uint(489_348n),
      }),
    );
  });

  it("prevents withdrawing collateral that would make the position unsafe", () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const lender = accounts.get("wallet_1")!;
    const borrower = accounts.get("wallet_2")!;
    const { mockToken } = setupPool(deployer);

    // Provide initial liquidity correctly
    simnet.callPublicFn("mock-ft", "mint", [Cl.uint(5_000n * ONE_USDC), Cl.principal(lender)], deployer);
    simnet.callPublicFn("clarion-pool", "supply", [mockToken, Cl.uint(2_000n * ONE_USDC)], lender);

    // Borrower collateral deposit
    simnet.callPublicFn("clarion-pool", "deposit-collateral", [Cl.uint(1_000n * ONE_STX)], borrower);
    
    // Borrower borrows a significant amount
    simnet.callPublicFn("clarion-pool", "borrow", [mockToken, Cl.uint(800n * ONE_USDC)], borrower);

    // Borrower attempts to withdraw nearly all collateral, which should immediately throw err-position-unsafe (u309)
    expect(
      simnet.callPublicFn(
        "clarion-pool",
        "withdraw-collateral",
        [Cl.uint(900n * ONE_STX)],
        borrower,
      ).result,
    ).toBeErr(Cl.uint(309));
  });
});
