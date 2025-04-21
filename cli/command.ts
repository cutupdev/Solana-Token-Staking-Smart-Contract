import { program } from 'commander';
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, TransactionConfirmationStrategy } from '@solana/web3.js';
import { setClusterConfig, configProject, createPool, emergency, setPause, stake, harvest, withdraw, purchaseBoost } from './scripts';
import * as anchor from '@coral-xyz/anchor';
import { setTimeout } from 'timers/promises';
import { BN } from 'bn.js';
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
  TEST_POOL_ID
} from "../lib/constant";

program.version('0.0.1');

programCommand('airdrop').action(async (directory, cmd) => {
  const { env, keypair, rpc } = cmd.opts();

  await setClusterConfig(env, keypair, rpc);

  const { connection, publicKey } = anchor.getProvider();

  while (true) {
    console.log('wallet balance', (await connection.getBalance(publicKey)) / LAMPORTS_PER_SOL, 'SOL');
    try {
      const wallet = Keypair.generate();
      const airdropTx = await connection.requestAirdrop(wallet.publicKey, 5 * LAMPORTS_PER_SOL);
      await connection.confirmTransaction(
        {
          signature: airdropTx
          // abortSignal: AbortSignal.timeout(30000)
        } as TransactionConfirmationStrategy,
        'finalized'
      );

      const balance = await connection.getBalance(wallet.publicKey);

      console.log("wallet public key ===> ", wallet.publicKey);

      if (balance > 0) {
        console.log('new balance', wallet.publicKey.toBase58(), balance / LAMPORTS_PER_SOL, 'SOL');
        const transaction = new anchor.web3.Transaction().add(SystemProgram.transfer({ fromPubkey: wallet.publicKey, toPubkey: publicKey, lamports: Math.round(balance * 0.95) }));
        // Sign transaction, broadcast, and confirm
        const signature = await anchor.web3.sendAndConfirmTransaction(connection, transaction, [wallet], { commitment: 'processed' });
        console.log('signature', signature);
      }
    } catch (ex) {
      console.error(ex);
      await setTimeout(1000);
    }
  }
});

programCommand('config').action(async (directory, cmd) => {
  const { env, keypair, rpc } = cmd.opts();

  await setClusterConfig(env, keypair, rpc);

  await configProject();
});

programCommand('create').action(async (directory, cmd) => {
  const { env, keypair, rpc } = cmd.opts();

  await setClusterConfig(env, keypair, rpc);

  await createPool();
});

programCommand('emergency')
  .action(async (directory, cmd) => {
    const { env, keypair, rpc } = cmd.opts();

    await setClusterConfig(env, keypair, rpc);

    await emergency();
  });

programCommand('pause')
  .action(async (directory, cmd) => {
    const { env, keypair, rpc } = cmd.opts();

    await setClusterConfig(env, keypair, rpc);

    await setPause();
  });

programCommand('stake')
  .option('-a, --amount <number>', 'staking amount')
  .action(async (directory, cmd) => {
    const { env, keypair, rpc, amount } = cmd.opts();

    await setClusterConfig(env, keypair, rpc);

    if (amount === undefined) {
      console.log('Error for invalid token amount');
      return;
    }

    await stake(new BN(amount));
  });

programCommand('harvest')
  .action(async (directory, cmd) => {
    const { env, keypair, rpc } = cmd.opts();

    await setClusterConfig(env, keypair, rpc);

    await harvest();
  });

programCommand('withdraw')
  .action(async (directory, cmd) => {
    const { env, keypair, rpc } = cmd.opts();

    await setClusterConfig(env, keypair, rpc);

    await withdraw();
  });

programCommand('purchase')
  .option('-a, --amount <number>', 'token amount')
  .action(async (directory, cmd) => {
    const { env, keypair, rpc, amount } = cmd.opts();

    await setClusterConfig(env, keypair, rpc);

    if (amount === undefined) {
      console.log('Error token amount');
      return;
    }

    await purchaseBoost(new BN(amount));
  });

function programCommand(name: string) {
  return program
    .command(name)
    .option(
      //  mainnet-beta, testnet, devnet
      '-e, --env <string>',
      'Solana cluster env name',
      'devnet'
    )
    // .option('-r, --rpc <string>', 'Solana cluster RPC name', 'http://localhost:8899')
    .option('-r, --rpc <string>', 'Solana cluster RPC name', 'https://devnet.helius-rpc.com/?api-key=3b5315ac-170e-4e0e-a60e-4ff5b444fbcf')
    .option('-k, --keypair <string>', 'Solana wallet Keypair Path', './id.json');
}

program.parse(process.argv);

/*

yarn script config
yarn script create
yarn script emergency
yarn script pause
yarn script stake -a 100000
yarn script harvest 
yarn script withdraw
yarn script purchase -a 10000

*/