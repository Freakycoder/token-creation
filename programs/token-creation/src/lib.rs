use anchor_lang::prelude::*;
pub mod instructions;
pub mod errors;
pub mod events;
use anchor_spl::token::{self, Token,Mint, TokenAccount};

use anchor_spl::associated_token::AssociatedToken;


declare_id!("Hcviukm2UTkfmESXqjdC1NDMAou5kpSecSCav737NAbN");

#[program]
pub mod token_creation {
    use super::*;

    pub fn initialize_mint(ctx: Context<InitializeMintContext>, decimals: u8) -> Result<()> {
       Ok(())
    }

    pub fn mint_to(ctx: Context<MintToken>, amount: u64) -> Result<()> {
        instructions::mint_to(ctx, amount)
    }

    pub fn transfer_token(ctx: Context<TransferToken>, amount: u64) -> Result<()> {
        instructions::transfer_token(ctx, amount)
    }

    pub fn initialize_pool(ctx: Context<InitializePool>, decimals: u8, bump: u8) -> Result<()> {
        instructions::initialize_pool(ctx, decimals, bump)
    }

    pub fn add_liquidity(ctx: Context<AddLiquidity>, amount_a: u64, amount_b: u64) -> Result<()> {
        instructions::add_liquidity(ctx, amount_a, amount_b)
    }

    pub fn swap_tokens(ctx: Context<SwapTokens>, amount_in: u64) -> Result<()> {
        instructions::swap_tokens(ctx, amount_in)
    }

    pub fn withdraw_liquidity(
        ctx: Context<WithdrawLiquidity>,
        lp_tokens_to_redeem: u64,
        min_token_a: u64,
        min_token_b: u64,
    ) -> Result<()> {
        instructions::withdraw_liquidity(ctx, lp_tokens_to_redeem, min_token_a, min_token_b)
    }
}
#[derive(Accounts)]
pub struct Initialize{}


#[derive(Accounts)]
#[instruction(decimals: u8)]
pub struct InitializeMintContext<'info> {
    #[account(
        init,
        payer = authority,
        mint::decimals = decimals,         
        mint::authority = authority.key(),                   
    )]
    pub mint: Account<'info, token::Mint>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct TransferToken<'info> {
    #[account(
        mut,
        constraint = sender_ata.owner == sender_wallet.key(),
        constraint = sender_ata.mint == mint.key()
    )]
    pub sender_ata: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub sender_wallet: Signer<'info>,
    
    /// CHECK: This is the recipient's wallet, which doesn't need type safety
    pub recipient_wallet: AccountInfo<'info>,
    
    #[account(mut)]
    /// CHECK: This is the recipient's ata, we manually validate it.
    pub recipient_ata: AccountInfo<'info>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct MintToken<'info> {
    #[account(
        mut,
        constraint = mint.mint_authority.unwrap() == mint_authority.key()
    )]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    ///CHECK : we'll create a account manually if it doesn't exist.
    pub sender_ata: AccountInfo<'info>,
    #[account(mut)]
    pub mint_authority: Signer<'info>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializePool<'info>{
    #[account(mut)]
    pub token_a_mint: Account<'info, Mint>,
    #[account(mut)]
    pub token_b_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = payer,
        space = 82,
        owner = token::ID,
    )]
    pub lp_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = payer,
        seeds = [b"pool".as_ref(), payer.key().as_ref()],
        bump,
        space = 8 + Pool::LEN
    )]
    pub pool: Account<'info, Pool>,
    #[account( 
        init,
        payer = payer,
        space = 8 + 32,
        seeds = [b"pool_authority".as_ref()], 
        bump, 
    )]
    pub pool_authority: Account<'info, PoolAuthority>,
    
    #[account(
        init,
        payer = payer,
        token::mint = token_a_mint,
        token::authority = pool,
    )]
    pub token_a_account: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = payer,
        token::mint = token_b_mint,
        token::authority = pool,
    )]
    pub token_b_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddLiquidity<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    
    #[account(
        mut,
        constraint = token_a_account.key() == pool.token_a_account
    )]
    pub token_a_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = token_b_account.key() == pool.token_b_account
    )]
    pub token_b_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = person_account_a.mint == token_a_account.mint,
        constraint = person_account_a.owner == payer.key()
    )]
    pub person_account_a: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = person_account_b.mint == token_b_account.mint,
        constraint = person_account_b.owner == payer.key()
    )]
    pub person_account_b: Account<'info, TokenAccount>,
    
    #[account(mut)]
    /// CHECK : if the account doesn't exist we manually create it for the user
    pub person_lp_account: AccountInfo<'info>,
    
    pub pool_authority: Account<'info, PoolAuthority>,
    pub payer: Signer<'info>,
    pub lp_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct SwapTokens<'info>{
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    
    #[account(
        mut,
        constraint = token_a_account.key() == pool.token_a_account
    )]
    pub token_a_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = token_b_account.key() == pool.token_b_account
    )]
    pub token_b_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = source_token_account.owner == user.key()
    )]
    pub source_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = destination_token_account.owner == user.key()
    )]
    pub destination_token_account: Account<'info, TokenAccount>,
    
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct WithdrawLiquidity<'info>{
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    
    #[account(mut)]
    pub pool_authority: Account<'info, PoolAuthority>,
    
    #[account(
        mut,
        constraint = pool_token_a_account.key() == pool.token_a_account
    )]
    pub pool_token_a_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = pool_token_b_account.key() == pool.token_b_account
    )]
    pub pool_token_b_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = lp_mint.key() == pool.lp_mint
    )]
    pub lp_mint: Account<'info, Mint>,
    
    #[account(
        mut,
        constraint = user_token_a_account.owner == user.key(),
        constraint = user_token_a_account.mint == pool_token_a_account.mint
    )]
    pub user_token_a_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = user_token_b_account.owner == user.key(),
        constraint = user_token_b_account.mint == pool_token_b_account.mint
    )]
    pub user_token_b_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = user_lp_token_account.owner == user.key(),
        constraint = user_lp_token_account.mint == lp_mint.key()
    )]
    pub user_lp_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Debug, Copy, Default, PartialEq)]
#[account]
pub struct Pool {
    pub token_a_mint: Pubkey,
    pub token_b_mint: Pubkey,
    pub token_a_account: Pubkey,
    pub token_b_account: Pubkey,
    pub lp_mint: Pubkey,
    pub bump: u8,
    pub total_supply: u64,
}

impl Pool {
    pub const LEN: usize = 32 * 5 + 1 + 8;
}

#[derive(Debug, Copy, Default, PartialEq)]
#[account]
pub struct PoolAuthority {
    authority: Pubkey
}