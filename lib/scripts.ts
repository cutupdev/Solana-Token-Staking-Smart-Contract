import { BN, Program } from "@coral-xyz/anchor";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from "@solana/web3.js";
import fs from "fs"
import { Staking } from "../target/types/staking";
import {
  ammProgram,
  feeDestination,
  marketProgram,
  SEED_BONDING_CURVE,
  SEED_CONFIG,
} from "./constant";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { SETTLE_FUNDS_QUOTE_WALLET_INDEX } from "@project-serum/serum";

export const createConfigTx = async (
  admin: PublicKey,

  newConfig: any,

  connection: Connection,
  program: Program<Staking>
) => {
  const [configPda, _] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_CONFIG)],
    program.programId
  );

  console.log("configPda: ", configPda.toBase58());

  const tx = await program.methods
    .initialize(newConfig)
    .accounts({
      payer: admin,
    })
    .transaction();

  tx.feePayer = admin;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  return tx;
};

export const createPoolTx = async (
  duration: BN,
  lockPeriod: BN,
  boostTriggerAmount: BN,
  boostPurchaseAmount: BN,
  apy: number,
  boostApyPercent: number,
  penaltyFee: number,
  boostDuration: BN,

  user: PublicKey,
  stakingMint: PublicKey,

  connection: Connection,
  program: Program<Staking>
) => {

  const tokenKp = Keypair.generate();
  console.log('token public key ===> ', tokenKp.publicKey.toBase58());

  console.log('user ===> ', user, 'reward mint ===> ', NATIVE_MINT, 'staking token ===> ', stakingMint)

  // Send the transaction to create staking pool
  const tx = new Transaction()
    .add(ComputeBudgetProgram.setComputeUnitLimit({ units: 500_000 }))
    .add(
      await program.methods
      .createPool(
        duration,
        lockPeriod,
        boostTriggerAmount,
        boostPurchaseAmount,
        apy,
        boostApyPercent,
        penaltyFee,
        boostDuration,
      )
      .accounts({
        creator: user,
        rewardMint: NATIVE_MINT,
        stakingToken: stakingMint,
        // stakingToken: tokenKp.publicKey,
      })
      .transaction()
    );

  tx.feePayer = user;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  return tx;
};

export const emergencyTx = async (
  user: PublicKey,

  connection: Connection,
  program: Program<Staking>
) => {
  const [configPda, _] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_CONFIG)],
    program.programId
  );
  const configAccount = await program.account.config.fetch(configPda);
getAssociatedTokenAddress
  const tx = await program.methods
    .emergency()
    .accounts({
      payer: user
    })
    .transaction();

  tx.feePayer = user;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  return tx;
};

export const setPauseTx = async (
  user: PublicKey,
  poolId: BN,

  connection: Connection,
  program: Program<Staking>
) => {
  const [configPda, _] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_CONFIG)],
    program.programId
  );
  const configAccount = await program.account.config.fetch(configPda);

  const tx = await program.methods
    .setPause(poolId)
    .accounts({
      payer: user
    })
    .transaction();

  tx.feePayer = user;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  return tx;
};

export const stakeTx = async (
  payer: PublicKey,
  stakingToken: PublicKey,

  amount: BN,
  poolId: BN,

  connection: Connection,
  program: Program<Staking>
) => {
  const configPda = PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_CONFIG)],
    program.programId
  )[0];
  const configAccount = await program.account.config.fetch(configPda);

  const tx = await program.methods
    .stake(
      poolId,
      amount
    )
    .accounts({
      user: payer, 
      stakingToken,
    })
    .transaction();

  tx.feePayer = payer;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  return tx;
};

export const harvestTx = async (
  user: PublicKey,
  tokenMint: PublicKey,

  poolId: BN,
  tokenPrice: number,
  solPrice: number,

  connection: Connection,
  program: Program<Staking>
) => {
  const configPda = PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_CONFIG)],
    program.programId
  )[0];
  const configAccount = await program.account.config.fetch(configPda);

  const tx = await program.methods
    .harvest(
      poolId,
      solPrice,
      tokenPrice
    )
    .accounts({
      user: user,
      backendWallet: user,
      stakingToken: tokenMint,
    })
    .transaction();

  tx.feePayer = user;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  return tx;
};

export const withdrawTx = async (
  payer: PublicKey,
  stakingToken: PublicKey,

  tokenPrice: number,
  solPrice: number,
  poolId: BN,

  connection: Connection,
  program: Program<Staking>
) => {
  const configPda = PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_CONFIG)],
    program.programId
  )[0];
  const configAccount = await program.account.config.fetch(configPda);

  const tx = await program.methods
    .withdraw(
      poolId,
      solPrice,
      tokenPrice,
    )
    .accounts({
      user: payer,
      backendWallet: payer,
      stakingToken: stakingToken,
    })
    .transaction();

  tx.feePayer = payer;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  return tx;
};

export const purchaseBoostTx = async (
  payer: PublicKey,
  stakingToken: PublicKey,
  
  amount: BN,
  poolId: BN,

  connection: Connection,
  program: Program<Staking>
) => {
  const configPda = PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_CONFIG)],
    program.programId
  )[0];
  const configAccount = await program.account.config.fetch(configPda);

  const tx = await program.methods
    .purchaseBoost(
      poolId,
      amount
    )
    .accounts({
      user: payer,
      stakingToken: stakingToken
    })
    .transaction();

  tx.feePayer = payer;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  return tx;
};