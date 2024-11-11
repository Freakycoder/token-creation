import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, MINT_SIZE, createInitializeMintInstruction } from "@solana/spl-token";
import { expect } from "chai";
import { TokenCreation } from "../target/types/token_creation";
import { seed } from "@coral-xyz/anchor/dist/cjs/idl";

describe("TokenCreation Tests", async () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TokenCreation as Program<TokenCreation>;

  // Test wallets
  const user = Keypair.generate();
  const mintAccount = Keypair.generate();

  // Test tokens
  const tokenBMint = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"); // check any error
  const lpMint = Keypair.generate();
  const reciepient_wallet = new PublicKey("DwNHVjdwU1ivHgSEmaNncvsmCmqM4EPB6mEqNGBayPVY")

  // Pool accounts
  let poolPda: PublicKey;
  let poolBump: number;
  let poolAuthorityPda: PublicKey;
  let poolAuthorityBump: number;

  // Token accounts
  let userTokenAccount : PublicKey;
  let userTokenAAccount: PublicKey;
  let userTokenBAccount: PublicKey;
  let userLpTokenAccount: PublicKey;
  let poolTokenAAccount: PublicKey;
  let poolTokenBAccount: PublicKey;

  const DECIMALS = 6;

  before(async () => {
    // Airdrop SOL to user
    const signature = await provider.connection.requestAirdrop(
      user.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    const latestBlockHash = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: signature,
    });

    // Find PDAs
    [poolPda, poolBump] = await PublicKey.findProgramAddressSync(
      [Buffer.from("pool"), user.publicKey.toBuffer()],
      program.programId
    );

    [poolAuthorityPda, poolAuthorityBump] = await PublicKey.findProgramAddressSync(
      [Buffer.from("pool_authority")],
      program.programId
    );

    // Get associated token accounts

    userTokenAccount = await getAssociatedTokenAddress(
      mintAccount.publicKey,
      user.publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    userTokenAAccount = await getAssociatedTokenAddress(
      mintAccount.publicKey,
      user.publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    userTokenBAccount = await getAssociatedTokenAddress(
      tokenBMint,
      user.publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    userLpTokenAccount = await getAssociatedTokenAddress(
      lpMint.publicKey,
      user.publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    poolTokenAAccount = await getAssociatedTokenAddress(
      mintAccount.publicKey,
      poolPda,
      true,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    poolTokenBAccount = await getAssociatedTokenAddress(
      tokenBMint,
      poolPda,
      true,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
  });

  it("Initialize mint and transfer some tokens", async () => { // DONE TILL THE FIRST TEST
   const txSig =  await program.methods
      .initializeMint(DECIMALS)
      .accounts({
        mint: mintAccount.publicKey,
        authority: user.publicKey,
      })
      .signers([mintAccount, user])
      .rpc();

      console.log(`mint account ${mintAccount.publicKey} initialized`);
      console.log(` transaction signature for initialze mint : ${txSig}`)

    await program.methods
      .mintTo(new BN(1000 * 10 ** 9))
      .accounts({
        mint: mintAccount.publicKey,
        mintAuthority: user.publicKey,
        senderAta : userTokenAccount,
      })
      .signers([user])
      .rpc();

      let user_account_initial = provider.connection.getTokenAccountBalance(userTokenAccount);
      console.log(`amount present in userTokenAccount is : ${(await user_account_initial).value.amount}`)

    await program.methods.transferToken(new BN(1000*10**9))
    .accounts({
      senderAta : userTokenAccount,
      mint : mintAccount.publicKey,
      senderWallet:user.publicKey,
      recipientWallet:reciepient_wallet,
      recipientAta: userTokenAAccount,
    })
    .signers([user])
    .rpc();

    let user_account_final = provider.connection.getTokenAccountBalance(userTokenAccount);
    console.log(`Balance present in user account after transfer : ${(await user_account_final).value.amount}`);
    let ahmed_ata = provider.connection.getTokenAccountBalance(userTokenAAccount);
    console.log(`balance present in ahmed's ata is ${(await ahmed_ata).value.amount}`);
  });

  it("Initializes the pool", async () => {
    await program.methods
      .initializePool(DECIMALS, poolBump) // you dont have to send custom Struct PDA, just calculate its address and fetch the data directly 
      .accounts({
        tokenAMint: mintAccount.publicKey,
        tokenBMint: tokenBMint,
        tokenAAccount: poolTokenAAccount,
        tokenBAccount: poolTokenBAccount,
        lpMint: lpMint.publicKey,
        payer: user.publicKey,
      })
      .signers([user, lpMint, mintAccount])
      .rpc();

    const poolData = await program.account.pool.fetch(poolPda);
    expect(poolData.totalSupply.toNumber()).to.equal(0);
    expect(poolData.tokenAMint.toString()).to.equal(mintAccount.publicKey.toString());
    expect(poolData.tokenBMint.toString()).to.equal(tokenBMint.toString());
  });

  it("Adds initial liquidity", async () => {
    const amountA = new anchor.BN(100 * 10**9); 
    const amountB = new anchor.BN(1 * 10**9); 
    const initial_lp_tokens = await provider.connection.getTokenAccountBalance(userLpTokenAccount);
    console.log(`initial lp tokens : ${initial_lp_tokens.value.amount}`)

    await program.methods
      .addLiquidity(amountA, amountB) // here we are sending poolPda because the accounts struct require it for further operations, where as before we are creating it.
      .accounts({
        pool:poolPda,
        lpMint: lpMint.publicKey,
        tokenAAccount: poolTokenAAccount,
        tokenBAccount: poolTokenBAccount,
        personAccountA: userTokenAAccount,
        personAccountB: userTokenBAccount,
        personLpAccount: userLpTokenAccount,
        poolAuthority: poolAuthorityPda,
        payer: user.publicKey,
      })
      .signers([user])
      .rpc();

    const poolAccount = await program.account.pool.fetch(poolPda);
    expect(poolAccount.totalSupply.toNumber()).to.be.above(0);
    expect(initial_lp_tokens).to.greaterThan(0);
    console.log(`lp tokens after adding liquidity is : ${initial_lp_tokens.value.amount}`);
  });

  it("Performs a swap", async () => {
    const amountIn = new anchor.BN(10 * 10**9); // 10 tokens

    const initialBalance = await provider.connection.getTokenAccountBalance(userTokenBAccount);
    console.log(`the initial balance of token B is : ${initialBalance.value.amount}`);

    await program.methods
      .swapTokens(amountIn)
      .accounts({
        pool: poolPda,
        tokenAAccount: poolTokenAAccount,
        tokenBAccount: poolTokenBAccount,
        sourceTokenAccount: userTokenAAccount,
        destinationTokenAccount: userTokenBAccount,
        user: user.publicKey,
      })
      .signers([user])
      .rpc();

    const finalBalance = await provider.connection.getTokenAccountBalance(userTokenBAccount);
    console.log(`Balance after swapping of token B is : ${finalBalance.value.amount}`);
    expect(Number(finalBalance.value.amount)).to.be.above(Number(initialBalance.value.amount));
  });

  it("Withdraws liquidity", async () => {
    const lpBalance = await provider.connection.getTokenAccountBalance(userLpTokenAccount);
    const lpTokensToRedeem = new anchor.BN(lpBalance.value.amount);
    const minTokenA = new anchor.BN(0);
    const minTokenB = new anchor.BN(0);
    console.log(`initial lp tokens to redeem : ${lpBalance.value.amount} `);

    await program.methods
      .withdrawLiquidity(lpTokensToRedeem, minTokenA, minTokenB)
      .accounts({
        pool: poolPda,
        lpMint: lpMint.publicKey,
        poolTokenAAccount: poolTokenAAccount,
        poolTokenBAccount: poolTokenBAccount,
        userTokenAAccount: userTokenAAccount,
        userTokenBAccount: userTokenBAccount,
        userLpTokenAccount: userLpTokenAccount,
        user: user.publicKey,
      })
      .signers([user])
      .rpc();

    const finalLpBalance = await provider.connection.getTokenAccountBalance(userLpTokenAccount);
    expect(Number(finalLpBalance.value.amount)).to.equal(0);
    console.log(`lp tokens after all are redeemed : ${finalLpBalance.value.amount}`);
  });
});