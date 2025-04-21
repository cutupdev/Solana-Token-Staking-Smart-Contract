import { MAINNET_PROGRAM_ID, DEVNET_PROGRAM_ID } from "@raydium-io/raydium-sdk";
import { Cluster, PublicKey } from "@solana/web3.js";

export const SEED_CONFIG = "config";
export const SEED_STAKING_POOL = "staking_pool";
export const USER_POOL = "user_pool";

export const TEST_DURATION = 31_536_000;
export const TEST_LOCK_PERIOD = 2_592_000;
export const TEST_BOOST_TRIGGER_AMOUNT = 120_000;
export const TEST_BOOST_PURCHASE_AMOUNT = 10_000;
export const TEST_APY = 30;
export const TEST_BOOST_APY_PERCENT = 60;
export const TEST_PENALTY_FEE = 50;
export const TEST_BOOST_DURATION = 2_592_000;
export const TEST_DECIMALS = 6;
export const TEST_POOL_ID = 0;
export const TEST_TOKEN_PRICE = 10;
export const TEST_SOL_PRICE = 200;

// export const RPC_URL = "https://devnet.helius-rpc.com/?api-key=8827c745-52e2-4a9c-a5c5-f0da69716f4e";
export const RPC_URL = 'http://localhost:8899'
// export const 

const cluster: Cluster = "devnet";

export const raydiumProgramId =
  cluster.toString() == "mainnet-beta" ? MAINNET_PROGRAM_ID : DEVNET_PROGRAM_ID;

export const ammProgram =
  cluster.toString() == "mainnet-beta"
    ? new PublicKey("675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8") // mainnet-beta
    : new PublicKey("HWy1jotHpo6UqeQxx49dpYYdQB8wj9Qk9MdxwjLvDHB8"); // devnet

export const marketProgram =
  cluster.toString() == "mainnet-beta"
    ? new PublicKey("srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX") // mainnet-beta
    : new PublicKey("EoTcMgcDRTJVZDMZWBoU6rhYHZfkNTVEAfz3uUJRcYGj"); // devnet

export const feeDestination =
  cluster.toString() == "mainnet-beta"
    ? new PublicKey("7YttLkHDoNj9wyDur5pM1ejNaAvT9X4eqaYcHQqtj2G5") // Mainnet
    : new PublicKey("3XMrhbv989VxAMi3DErLV9eJht1pHppW5LbKxe9fkEFR"); // Devnet
