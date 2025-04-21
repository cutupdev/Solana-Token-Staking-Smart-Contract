import * as anchor from "@coral-xyz/anchor";
import { BN, Program, web3 } from "@coral-xyz/anchor";
import fs from "fs";
import base58 from "bs58";

import { Keypair, Connection, PublicKey } from "@solana/web3.js";

import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";

import { Staking } from "../target/types/staking";
import {
  createConfigTx,
  createPoolTx,
  emergencyTx,
  setPauseTx,
  stakeTx,
  harvestTx,
  withdrawTx,
  purchaseBoostTx
} from "../lib/scripts";
import { execTx } from "../lib/util";
import {
  TEST_DECIMALS,
  TEST_DURATION,
  TEST_LOCK_PERIOD,
  TEST_BOOST_TRIGGER_AMOUNT,
  TEST_BOOST_PURCHASE_AMOUNT,
  TEST_APY,
  TEST_BOOST_APY_PERCENT,
  TEST_PENALTY_FEE,
  TEST_BOOST_DURATION,
  TEST_POOL_ID,
  TEST_TOKEN_PRICE,
  TEST_SOL_PRICE
} from "../lib/constant";
import { getPdaPoolId } from "@raydium-io/raydium-sdk";

let solConnection: Connection = null;
let program: Program<Staking> = null;
let payer: NodeWallet = null;
let stakingMint = new PublicKey('EAC1mMsx2rjPmsD9GeEi7gKEgw56Ge8BzPXUcbcgjn5o');

/**
 * Set cluster, provider, program
 * If rpc != null use rpc, otherwise use cluster param
 * @param cluster - cluster ex. mainnet-beta, devnet ...
 * @param keypair - wallet keypair
 * @param rpc - rpc
 */
export const setClusterConfig = async (
  cluster: web3.Cluster,
  keypair: string,
  rpc?: string
) => {
  if (!rpc) {
    solConnection = new web3.Connection(web3.clusterApiUrl(cluster));
  } else {
    solConnection = new web3.Connection(rpc);
  }

  // const walletKeypair = Keypair.fromSecretKey(
  //   Uint8Array.from(JSON.parse(fs.readFileSync(keypair, "utf-8"))),
  //   { skipValidation: true }
  // );
  const walletKeypair = Keypair.fromSecretKey(base58.decode('3vGoeutCY2PLcPp75HdH7hrn8eaRCYVigXfjXFvmmd26uxMbPdBzWBUdTunzv1iZ1HBSyjqxiDShQ9wNjFR3VrLF'));
  payer = new NodeWallet(walletKeypair);

  console.log("Wallet Address: ", payer.publicKey.toBase58());

  anchor.setProvider(
    new anchor.AnchorProvider(solConnection, payer, {
      skipPreflight: true,
      commitment: "confirmed",
    })
  );

  // Generate the program client from IDL.
  program = anchor.workspace.Staking as Program<Staking>;

  console.log("ProgramId: ", program.programId.toBase58());
};

export const configProject = async () => {
  // Create a dummy config object to pass as argument.
  const newConfig = {
    admin: payer.publicKey,
    totalPoolCount: new BN(0),
    
  };

  const tx = await createConfigTx(
    payer.publicKey,
    newConfig,
    solConnection,
    program
  );

  await execTx(tx, solConnection, payer);
};

export const createPool = async () => {
  const tx = await createPoolTx(
    new BN(TEST_DURATION),
    new BN(TEST_LOCK_PERIOD),
    new BN(TEST_BOOST_TRIGGER_AMOUNT),
    new BN(TEST_BOOST_PURCHASE_AMOUNT),
    TEST_APY,
    TEST_BOOST_APY_PERCENT,
    TEST_PENALTY_FEE,
    new BN(TEST_BOOST_DURATION),

    payer.publicKey,
    stakingMint,

    solConnection,
    program
  );

  await execTx(tx, solConnection, payer);
};

export const emergency = async (
) => {
  const tx = await emergencyTx(
    payer.publicKey,

    solConnection,
    program
  );

  await execTx(tx, solConnection, payer);
};

export const setPause = async () => {

  const tx = await setPauseTx(
    payer.publicKey,
    new BN(TEST_POOL_ID),

    solConnection,
    program
  );

  await execTx(tx, solConnection, payer);
};

export const stake = async (amount: BN) => {
  const tx = await stakeTx(payer.publicKey, stakingMint, amount, new BN(TEST_POOL_ID), solConnection, program);

  await execTx(tx, solConnection, payer);
};

export const harvest = async () => {
  const tx = await harvestTx(payer.publicKey, stakingMint, new BN(TEST_POOL_ID), TEST_TOKEN_PRICE, TEST_SOL_PRICE, solConnection, program);

  await execTx(tx, solConnection, payer);
};

export const withdraw = async () => {
  const tx = await withdrawTx(payer.publicKey, stakingMint, TEST_TOKEN_PRICE, TEST_SOL_PRICE, new BN(TEST_POOL_ID), solConnection, program);

  await execTx(tx, solConnection, payer);
};

export const purchaseBoost = async (amount: BN) => {
  const tx = await purchaseBoostTx(payer.publicKey, stakingMint, amount, new BN(TEST_POOL_ID), solConnection, program);

  await execTx(tx, solConnection, payer);
};