
import {
    AddressLookupTableAccount,
    TransactionInstruction,
    VersionedTransaction,
    Transaction,
    PublicKey,
    Connection,
    SystemProgram,
    SYSVAR_RENT_PUBKEY
} from "@solana/web3.js";

import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";

export const getAssociatedTokenAccount = (
    ownerPubkey: PublicKey,
    mintPk: PublicKey
): PublicKey => {
    let associatedTokenAccountPubkey = (PublicKey.findProgramAddressSync(
        [
            ownerPubkey.toBytes(),
            TOKEN_PROGRAM_ID.toBytes(),
            mintPk.toBytes(), // mint address
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
    ))[0];

    return associatedTokenAccountPubkey;
}

export const execTx = async (
    transaction: Transaction,
    connection: Connection,
    payer: NodeWallet,
    commitment: "confirmed" | "finalized" = 'confirmed'
) => {
    try {
        //  Sign the transaction with payer wallet
        const signedTx = await payer.signTransaction(transaction);

        // Serialize, send and confirm the transaction
        const rawTransaction = signedTx.serialize()

        console.log(await connection.simulateTransaction(signedTx));

        // return;
        const txid = await connection.sendRawTransaction(rawTransaction, {
            skipPreflight: true,
            maxRetries: 2,
            preflightCommitment: "processed"
        });
        console.log(`https://solscan.io/tx/${txid}?cluster=custom&customUrl=${connection.rpcEndpoint}`);

        const confirmed = await connection.confirmTransaction(txid, commitment);

        console.log("err ", confirmed.value.err)
    } catch (e) {
        console.log(e);
    }
}

export const createAssociatedTokenAccountInstruction = (
    associatedTokenAddress: PublicKey,
    payer: PublicKey,
    walletAddress: PublicKey,
    splTokenMintAddress: PublicKey
) => {
    const keys = [
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
        { pubkey: walletAddress, isSigner: false, isWritable: false },
        { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
        {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        {
            pubkey: SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
        },
    ];
    return new TransactionInstruction({
        keys,
        programId: ASSOCIATED_TOKEN_PROGRAM_ID,
        data: Buffer.from([]),
    });
};

export const getATokenAccountsNeedCreate = async (
    connection: Connection,
    walletAddress: PublicKey,
    owner: PublicKey,
    nfts: PublicKey[],
) => {
    const instructions = []; const destinationAccounts = [];
    for (const mint of nfts) {
        const destinationPubkey = getAssociatedTokenAccount(owner, mint);
        let response = await connection.getAccountInfo(destinationPubkey);
        if (!response) {
            const createATAIx = createAssociatedTokenAccountInstruction(
                destinationPubkey,
                walletAddress,
                owner,
                mint,
            );
            instructions.push(createATAIx);
        }
        destinationAccounts.push(destinationPubkey);
        if (walletAddress != owner) {
            const userAccount = getAssociatedTokenAccount(walletAddress, mint);
            response = await connection.getAccountInfo(userAccount);
            if (!response) {
                const createATAIx = createAssociatedTokenAccountInstruction(
                    userAccount,
                    walletAddress,
                    walletAddress,
                    mint,
                );
                instructions.push(createATAIx);
            }
        }
    }
    return {
        instructions,
        destinationAccounts,
    };
};
