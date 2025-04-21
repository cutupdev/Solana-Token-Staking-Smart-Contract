import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import BN from 'bn.js'
import { Staking } from "../target/types/staking";
import {
  ComputeBudgetProgram,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionConfirmationStrategy,
  Connection,
  sendAndConfirmTransaction
} from "@solana/web3.js";
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
  TEST_SOL_PRICE,
  USER_POOL
} from "./constant";
import * as assert from "assert";
import { createMint, getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID, createTransferInstruction, NATIVE_MINT } from "@solana/spl-token";
import { RPC_URL, SEED_CONFIG, SEED_STAKING_POOL } from "./constant";

describe("staking", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  provider.opts.commitment = 'confirmed';
  anchor.setProvider(provider);

  const program = anchor.workspace.Staking as Program<Staking>;

  const adminKp = Keypair.generate();
  const userKp = Keypair.generate();
  const user2Kp = Keypair.generate();
  const tokenKp = Keypair.generate();
  let stakingToken: PublicKey;

  console.log("admin: ", adminKp.publicKey.toBase58());
  console.log("user: ", userKp.publicKey.toBase58());
  console.log("user2: ", user2Kp.publicKey.toBase58());

  // const connection = provider.connection;
  const connection = new Connection(RPC_URL, 'confirmed');

  console.log("admin: ", adminKp.publicKey.toBase58());
  console.log("user: ", userKp.publicKey.toBase58());
  console.log("user2: ", user2Kp.publicKey.toBase58());

  before(async () => {

    console.log("airdrop SOL to admin");
    const airdropTx = await connection.requestAirdrop(
      adminKp.publicKey,
      5 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction({
      signature: airdropTx,
    } as TransactionConfirmationStrategy);

    console.log("airdrop SOL to user");
    const airdropTx2 = await connection.requestAirdrop(
      userKp.publicKey,
      5 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction({
      signature: airdropTx2,
    } as TransactionConfirmationStrategy);

    console.log("airdrop SOL to user2");
    const airdropTx3 = await connection.requestAirdrop(
      user2Kp.publicKey,
      5 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction({
      signature: airdropTx3,
    } as TransactionConfirmationStrategy);
  });

  it("mint staking token", async () => {
    console.log("staking token mint")
    const stakingTokenMint = await createMint(connection, userKp, userKp.publicKey, null, 9)
    stakingToken = stakingTokenMint

    const userStakingAta = getAssociatedTokenAddressSync(stakingTokenMint, userKp.publicKey)
    console.log("🚀 ~ it ~ userStakingAta:", userStakingAta)

    await getOrCreateAssociatedTokenAccount(connection, userKp, stakingTokenMint, userKp.publicKey)
    const sig = await mintTo(connection, userKp, stakingTokenMint, userStakingAta, userKp.publicKey, BigInt(10 ** 9) * BigInt(10 ** 9))
    console.log("mint amount minted", sig)

    // Quote token transfer to user2Kp
    const reciever = getAssociatedTokenAddressSync(stakingTokenMint, user2Kp.publicKey)
    console.log("🚀 ~ it ~ senderStakingAta:", reciever)

    await getOrCreateAssociatedTokenAccount(connection, user2Kp, stakingTokenMint, user2Kp.publicKey)
    const transaction = new Transaction().add(
      createTransferInstruction(
        userStakingAta,  // Sender's token account
        reciever, // Receiver's token account
        userKp.publicKey,      // Sender's public key (authority)
        5_000_000_000,          // amount
        [],
        TOKEN_PROGRAM_ID
      )
    );

    // Sign and send the transaction
    const signature = await connection.sendTransaction(transaction, [userKp]);
    // Wait for confirmation
    await connection.confirmTransaction(signature);
    console.log(`Transaction successful with signature: ${signature}`);
  })

  it("Is correctly configured", async () => {
    // Create a dummy config object to pass as argument.
    const newConfig = {
      admin: adminKp.publicKey,
      totalPoolCount: new BN(0),
    };

    // Send the transaction to configure the program.
    const tx = await program.methods
      .initialize(newConfig)
      .accounts({
        payer: adminKp.publicKey,
      })
      .signers([adminKp])
      .rpc();

    console.log("config tx signature:", tx);

    // get PDA for the config account using the seed "config".
    const [configPda, _] = PublicKey.findProgramAddressSync(
      [Buffer.from(SEED_CONFIG)],
      program.programId
    );

    // Log PDA details for debugging.
    console.log("config PDA:", configPda.toString());

    // Fetch the updated config account to validate the changes.
    const configAccount = await program.account.config.fetch(configPda);

    // Assertions to verify configuration
    assert.equal(
      configAccount.admin.toString(),
      adminKp.publicKey.toString()
    );
    assert.equal(configAccount.totalPoolCount, 0);
  });

  it("Is the staking pool created", async () => {
    console.log("token: ", tokenKp.publicKey.toBase58());
    // get PDA for the config account using the seed "config".
    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(SEED_CONFIG)],
      program.programId
    );
    const configAccount = await program.account.config.fetch(configPda);
    console.log(configAccount, '=====================')
    // Send the transaction to launch a token

    console.log("🚀 ~ it ~ stakingToken:", stakingToken.toBase58())
    console.log("🚀 ~ it ~ adminKp:", adminKp.publicKey.toBase58())
    const tx = await program.methods
      .createPool(
        new BN(TEST_DURATION),
        new BN(TEST_LOCK_PERIOD),
        new BN(TEST_BOOST_TRIGGER_AMOUNT),
        new BN(TEST_BOOST_PURCHASE_AMOUNT),
        TEST_APY,
        TEST_BOOST_APY_PERCENT,
        TEST_PENALTY_FEE,
        new BN(TEST_BOOST_DURATION),
      )
      .accounts({
        creator: adminKp.publicKey,
        rewardMint: NATIVE_MINT,
        stakingToken: stakingToken,
      })
      .signers([adminKp])
      .transaction();

    tx.feePayer = adminKp.publicKey
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
    console.log(await connection.simulateTransaction(tx))
    const sig = await sendAndConfirmTransaction(connection, tx, [adminKp])

    console.log("tx signature:", sig);


    const configAccountAfterCreation = await program.account.config.fetch(configPda);

    // Assertions to verify configuration
    console.log("config account created pool totla pool number, ", configAccountAfterCreation.totalPoolCount)
    // assert.equal(configAccountAfterCreation.totalPoolCount, 1);
    const [stakingPool1] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(SEED_STAKING_POOL),
        new BN(TEST_POOL_ID).toArrayLike(Buffer, 'le', 8),
      ],
      program.programId
    );
    const [stakingPool2] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(SEED_STAKING_POOL),
        new BN(TEST_POOL_ID).toBuffer('le', 8),
      ],
      program.programId
    );
    
    const stakingPoolInfo = await program.account.pool.fetch(stakingPool1)
    console.log("🚀 ~ it ~ stakingPool1:", stakingPool1.toBase58())
    console.log("🚀 ~ it ~ stakingPool2:", stakingPool2.toBase58())
    console.log("🚀 ~ it ~ stakingPoolInfo:", stakingPoolInfo)
  });

  // it("Is the emergency happened", async () => {
  //   console.log("token: ", tokenKp.publicKey.toBase58());
  //   // get PDA for the config account using the seed "config".
  //   const [configPda] = PublicKey.findProgramAddressSync(
  //     [Buffer.from(SEED_CONFIG)],
  //     program.programId
  //   );
  //   const configAccount = await program.account.config.fetch(configPda);
  //   console.log(configAccount, '=====================')
  //   // Send the transaction to launch a token

  //   console.log("🚀 ~ it ~ stakingToken:", stakingToken.toBase58())
  //   console.log("🚀 ~ it ~ adminKp:", adminKp.publicKey.toBase58())
  //   const tx = await program.methods
  //     .emergency()
  //     .accounts({
  //       payer: adminKp.publicKey
  //     })
  //     .signers([adminKp])
  //     .transaction();

  //   tx.feePayer = adminKp.publicKey
  //   tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
  //   console.log(await connection.simulateTransaction(tx))
  //   const sig = await sendAndConfirmTransaction(connection, tx, [adminKp])

  //   console.log("tx signature:", sig);

  //   const configAccountAfterEmergency = await program.account.config.fetch(configPda);

  //   // Assertions to verify configuration
  //   console.log("config account after emergency, ", configAccountAfterEmergency);
  // });

  // it("Is the setPaused happened", async () => {
  //   console.log("token: ", tokenKp.publicKey.toBase58());
  //   // get PDA for the config account using the seed "config".
  //   const [configPda] = PublicKey.findProgramAddressSync(
  //     [Buffer.from(SEED_CONFIG)],
  //     program.programId
  //   );
  //   const configAccount = await program.account.config.fetch(configPda);
  //   console.log(configAccount, '=====================')
  //   // Send the transaction to launch a token

  //   console.log("🚀 ~ it ~ adminKp:", adminKp.publicKey.toBase58())
  //   const tx = await program.methods
  //     .setPause(
  //       TEST_POOL_ID
  //     )
  //     .accounts({
  //       payer: adminKp.publicKey
  //     })
  //     .signers([adminKp])
  //     .transaction();

  //   tx.feePayer = adminKp.publicKey
  //   tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
  //   console.log(await connection.simulateTransaction(tx))
  //   const sig = await sendAndConfirmTransaction(connection, tx, [adminKp])

  //   console.log("tx signature:", sig);

  //   const configAccountAfterPause = await program.account.config.fetch(configPda);

  //   // Assertions to verify configuration
  //   console.log("config account after pause, ", configAccountAfterPause);

  //   // const [stakingPool] = PublicKey.findProgramAddressSync(
  //   //   [
  //   //     Buffer.from(SEED_STAKING_POOL),
  //   //     new BN(TEST_POOL_ID).toArrayLike(Buffer, 'le', 8)
  //   //   ],
  //   //   program.programId
  //   // );
  //   // const stakingPoolInfo = await program.account.pool.fetch(stakingPool)
  //   // console.log("🚀 ~ it ~ stakingPoolInfo:", stakingPoolInfo)
  // });

  it("Is the stake correctly", async () => {
    console.log("token: ", tokenKp.publicKey.toBase58());
    // get PDA for the config account using the seed "config".
    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(SEED_CONFIG)],
      program.programId
    );
    const configAccountBefore = await program.account.config.fetch(configPda);
    console.log(configAccountBefore, '=====================')
    // Send the transaction to launch a token

    console.log("🚀 ~ it ~ stakingToken:", stakingToken.toBase58())
    console.log("🚀 ~ it ~ adminKp:", adminKp.publicKey.toBase58())
    const tx = await program.methods
      .stake(
        new BN(TEST_POOL_ID),
        new BN(1000),
      )
      .accounts({
        user: userKp.publicKey,
        stakingToken: stakingToken,
      })
      .signers([userKp])
      .transaction();

    tx.feePayer = userKp.publicKey
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
    console.log(await connection.simulateTransaction(tx))
    const sig = await sendAndConfirmTransaction(connection, tx, [userKp])

    console.log("tx signature:", sig);

    const configAccountAfter = await program.account.config.fetch(configPda);
    console.log("🚀 ~ it ~ configAccountAfter:", configAccountAfter)

    const [stakingPool] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(SEED_STAKING_POOL),
        new BN(TEST_POOL_ID).toArrayLike(Buffer, 'le', 8)
      ],
      program.programId
    );
    const stakingPoolInfo = await program.account.pool.fetch(stakingPool)
    console.log("🚀 ~ it ~ stakingPoolInfo:", stakingPoolInfo)

    const [userPool] = PublicKey.findProgramAddressSync(
      [Buffer.from(USER_POOL), userKp.publicKey.toBuffer(), stakingPool.toBuffer()],
      program.programId
    )
    const userPoolInfo = await program.account.user.fetch(userPool)
    console.log("🚀 ~ it ~ userPoolInfo:", userPoolInfo)
  });

  it("Is the harvest correctly", async () => {
    // get PDA for the config account using the seed "config".
    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(SEED_CONFIG)],
      program.programId
    );
    const configAccountBefore = await program.account.config.fetch(configPda);
    console.log(configAccountBefore, '=====================')
    // Send the transaction to launch a token

    console.log("🚀 ~ it ~ stakingToken:", stakingToken.toBase58())
    console.log("🚀 ~ it ~ adminKp:", adminKp.publicKey.toBase58())
    const tx = await program.methods
      .harvest(
        new BN(TEST_POOL_ID),
        TEST_SOL_PRICE,
        TEST_TOKEN_PRICE,
      )
      .accounts({
        user: userKp.publicKey,
        stakingToken: stakingToken,
      })
      .signers([userKp])
      .transaction();

    tx.feePayer = userKp.publicKey
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
    console.log(await connection.simulateTransaction(tx))
    const sig = await sendAndConfirmTransaction(connection, tx, [userKp])

    console.log("tx signature:", sig);

    const configAccountAfter = await program.account.config.fetch(configPda);
    console.log("🚀 ~ it ~ configAccountAfter:", configAccountAfter)

    const [stakingPool] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(SEED_STAKING_POOL),
        new BN(0).toArrayLike(Buffer, 'le', 8)
      ],
      program.programId
    );
    const stakingPoolInfo = await program.account.pool.fetch(stakingPool)
    console.log("🚀 ~ it ~ stakingPoolInfo:", stakingPoolInfo)

    const [userPool] = PublicKey.findProgramAddressSync(
      [Buffer.from(USER_POOL), userKp.publicKey.toBuffer(), stakingPool.toBuffer()],
      program.programId
    )
    const userPoolInfo = await program.account.user.fetch(userPool)
    console.log("🚀 ~ it ~ userPoolInfo:", userPoolInfo)
  });

  it("Is the withdraw correctly", async () => {
    // get PDA for the config account using the seed "config".
    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(SEED_CONFIG)],
      program.programId
    );
    const configAccountBefore = await program.account.config.fetch(configPda);
    console.log(configAccountBefore, '=====================')
    // Send the transaction to launch a token

    console.log("🚀 ~ it ~ stakingToken:", stakingToken.toBase58())
    console.log("🚀 ~ it ~ adminKp:", adminKp.publicKey.toBase58())
    const tx = await program.methods
      .withdraw(
        new BN(TEST_POOL_ID),
        TEST_SOL_PRICE,
        TEST_TOKEN_PRICE,
      )
      .accounts({
        user: userKp.publicKey,
        stakingToken: stakingToken,
      })
      .signers([userKp])
      .transaction();

    tx.feePayer = userKp.publicKey
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
    console.log(await connection.simulateTransaction(tx))
    const sig = await sendAndConfirmTransaction(connection, tx, [userKp])

    console.log("tx signature:", sig);

    const configAccountAfter = await program.account.config.fetch(configPda);
    console.log("🚀 ~ it ~ configAccountAfter:", configAccountAfter)

    const [stakingPool] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(SEED_STAKING_POOL),
        new BN(0).toArrayLike(Buffer, 'le', 8)
      ],
      program.programId
    );
    const stakingPoolInfo = await program.account.pool.fetch(stakingPool)
    console.log("🚀 ~ it ~ stakingPoolInfo:", stakingPoolInfo)

    const [userPool] = PublicKey.findProgramAddressSync(
      [Buffer.from(USER_POOL), userKp.publicKey.toBuffer(), stakingPool.toBuffer()],
      program.programId
    )
    const userPoolInfo = await program.account.user.fetch(userPool)
    console.log("🚀 ~ it ~ userPoolInfo:", userPoolInfo)
  });

  it("Is the purchase boost correctly", async () => {
    // get PDA for the config account using the seed "config".
    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(SEED_CONFIG)],
      program.programId
    );
    const configAccountBefore = await program.account.config.fetch(configPda);
    console.log(configAccountBefore, '=====================')
    // Send the transaction to launch a token

    console.log("🚀 ~ it ~ stakingToken:", stakingToken.toBase58())
    console.log("🚀 ~ it ~ adminKp:", adminKp.publicKey.toBase58())
    const tx = await program.methods
      .purchaseBoost(
        new BN(TEST_POOL_ID),
        new BN(TEST_BOOST_PURCHASE_AMOUNT)
      )
      .accounts({
        user: userKp.publicKey,
        stakingToken: stakingToken,
      })
      .signers([userKp])
      .transaction();

    tx.feePayer = userKp.publicKey
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
    console.log(await connection.simulateTransaction(tx))
    const sig = await sendAndConfirmTransaction(connection, tx, [userKp])

    console.log("tx signature:", sig);

    const configAccountAfter = await program.account.config.fetch(configPda);
    console.log("🚀 ~ it ~ configAccountAfter:", configAccountAfter)

    const [stakingPool] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(SEED_STAKING_POOL),
        new BN(0).toArrayLike(Buffer, 'le', 8)
      ],
      program.programId
    );
    const stakingPoolInfo = await program.account.pool.fetch(stakingPool)
    console.log("🚀 ~ it ~ stakingPoolInfo:", stakingPoolInfo)

    const [userPool] = PublicKey.findProgramAddressSync(
      [Buffer.from(USER_POOL), userKp.publicKey.toBuffer(), stakingPool.toBuffer()],
      program.programId
    )
    const userPoolInfo = await program.account.user.fetch(userPool)
    console.log("🚀 ~ it ~ userPoolInfo:", userPoolInfo)
  });
});
