use crate::errors::{ErrorCode, RemoveLiquidityError, SwapError};
use crate::events::LiquidityRemoved;
use crate::{
    AddLiquidity, InitializeMintContext, InitializePool, MintToken, SwapTokens, TransferToken,
    WithdrawLiquidity,
};
use anchor_lang::prelude::*;
use anchor_spl::associated_token::{create, Create};
use anchor_spl::token::{self, Burn, InitializeMint, MintTo, Transfer};


pub fn initialize_mint(ctx: Context<InitializeMintContext>, decimals: u8) -> Result<()> {
    token::initialize_mint(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            InitializeMint {
                mint: ctx.accounts.mint.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        ),
        decimals,
        &ctx.accounts.authority.key(),
        Some(&ctx.accounts.authority.key()),
    )?;
    Ok(())
}

pub fn mint_to(ctx: Context<MintToken>, amount: u64) -> Result<()> {
    // Validate mint account
    require!(
        !ctx.accounts.mint.to_account_info().data_is_empty(),
        ErrorCode::InvalidMintAccount
    );

    require!(
        ctx.accounts.mint.mint_authority.unwrap() == ctx.accounts.mint_authority.key(),
        ErrorCode::InvalidMintAuthority
    );

    if ctx.accounts.sender_ata.data_is_empty() {
        let cpi_account = Create {
            payer: ctx.accounts.mint_authority.to_account_info(),
            associated_token: ctx.accounts.sender_ata.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
        };

        let cpi_context = CpiContext::new(
            ctx.accounts.associated_token_program.to_account_info(),
            cpi_account,
        );
        create(cpi_context)?;
    }


    let cpi_accounts = MintTo {
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.sender_ata.to_account_info(),
        authority: ctx.accounts.mint_authority.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::mint_to(cpi_ctx, amount)?;
    Ok(())
}

pub fn transfer_token(ctx: Context<TransferToken>, amount: u64) -> Result<()> {
    // Validate mint account
    require!(
        !ctx.accounts.mint.to_account_info().data_is_empty(),
        ErrorCode::InvalidMintAccount
    );

    if ctx.accounts.recipient_ata.data_is_empty() {
        let cpi_accounts = Create {
            payer: ctx.accounts.sender_wallet.to_account_info(),
            associated_token: ctx.accounts.recipient_ata.to_account_info(),
            authority: ctx.accounts.recipient_wallet.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
        };

        let cpi_context = CpiContext::new(
            ctx.accounts.associated_token_program.to_account_info(),
            cpi_accounts,
        );
        create(cpi_context)?;
    }

    let cpi_accounts = Transfer {
        from: ctx.accounts.sender_ata.to_account_info(),
        to: ctx.accounts.recipient_ata.to_account_info(),
        authority: ctx.accounts.sender_wallet.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, amount)?;
    Ok(())
}

pub fn initialize_pool(ctx: Context<InitializePool>, decimals: u8, bump: u8) -> Result<()> {
    let cpi_accounts = InitializeMint {
        mint: ctx.accounts.lp_mint.to_account_info(),
        rent: ctx.accounts.rent.to_account_info(),
    };
    let cpi_context = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
    token::initialize_mint(
        cpi_context,
        decimals,
        &ctx.accounts.pool_authority.key(),
        None,
    )?;

    let pool = &mut ctx.accounts.pool;
    pool.token_a_mint = ctx.accounts.token_a_mint.key();
    pool.token_b_mint = ctx.accounts.token_b_mint.key();
    pool.token_a_account = ctx.accounts.token_a_account.key();
    pool.token_b_account = ctx.accounts.token_b_account.key();
    pool.lp_mint = ctx.accounts.lp_mint.key();
    pool.total_supply = 0;
    pool.bump = bump;

    Ok(())
}

pub fn add_liquidity(ctx: Context<AddLiquidity>, amount_a: u64, amount_b: u64) -> Result<()> {
   
    let lp_tokens_to_mint = if ctx.accounts.pool.total_supply == 0 {
        // Initial liquidity provision
        (amount_a as f64 * amount_b as f64).sqrt() as u64
    } else {
        // Get current reserves
        let reserve_a: u64 = ctx.accounts.token_a_account.amount;
        let reserve_b: u64 = ctx.accounts.token_b_account.amount;

        // Calculate required amounts to maintain ratio
        let required_amount_a: u64 = (amount_b as u128 * reserve_a as u128 / reserve_b as u128) as u64;
        let required_amount_b: u64 = (amount_a as u128 * reserve_b as u128 / reserve_a as u128) as u64;

        // Determine which token is the limiting factor
        if amount_a >= required_amount_a {
            // Token B is the limiting factor
            let actual_amount_a: u64 = required_amount_a;
            (actual_amount_a as f64 / reserve_a as f64 * ctx.accounts.pool.total_supply as f64) as u64
        } else {
            // Token A is the limiting factor
            let actual_amount_b = required_amount_b;
            (actual_amount_b as f64 / reserve_b as f64 * ctx.accounts.pool.total_supply as f64) as u64
        }
    };

    // Create LP token account if it doesn't exist
    if ctx.accounts.person_lp_account.data_is_empty() {
        let cpi_accounts = Create {
            payer: ctx.accounts.payer.to_account_info(),
            associated_token: ctx.accounts.person_lp_account.to_account_info(),
            authority: ctx.accounts.pool.to_account_info(),
            mint: ctx.accounts.lp_mint.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),
        };

        let cpi_context =
            CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        create(cpi_context)?;
    }

    // Mint LP tokens
    let cpi_mint_accounts = MintTo {
        mint: ctx.accounts.lp_mint.to_account_info(),
        to: ctx.accounts.person_lp_account.to_account_info(),
        authority: ctx.accounts.pool_authority.to_account_info(),
    };
    let cpi_context = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        cpi_mint_accounts,
    );
    token::mint_to(cpi_context, lp_tokens_to_mint)?;

    // Transfer token A
    let cpi_transfer1_accounts = Transfer {
        from: ctx.accounts.person_account_a.to_account_info(),
        to: ctx.accounts.token_a_account.to_account_info(),
        authority: ctx.accounts.payer.to_account_info(),
    };
    let cpi_transfer1_context = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        cpi_transfer1_accounts,
    );
    token::transfer(cpi_transfer1_context, amount_a)?;

    // Transfer token B - FIXED: Was using amount_a instead of amount_b
    let cpi_transfer2_accounts = Transfer {
        from: ctx.accounts.person_account_b.to_account_info(),
        to: ctx.accounts.token_b_account.to_account_info(),
        authority: ctx.accounts.payer.to_account_info(),
    };
    let cpi_transfer2_context = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        cpi_transfer2_accounts,
    );
    token::transfer(cpi_transfer2_context, amount_b)?; // FIXED: Changed from amount_a to amount_b

    // Update pool's total supply
    ctx.accounts.pool.total_supply += lp_tokens_to_mint; // Added: Update total supply

    Ok(())
}

pub fn swap_tokens(ctx: Context<SwapTokens>, amount_in: u64) -> Result<()> {
    let reserve_a = ctx.accounts.token_a_account.amount;
    let reserve_b = ctx.accounts.token_b_account.amount;

    let (amount_out, is_a_to_b) =
        if ctx.accounts.source_token_account.mint == ctx.accounts.token_a_account.mint {
            // we always check the source token account mint and compare to out token A account mint, if it's not A then its token B.
            let amount_out = calculate_token_out(amount_in, reserve_a, reserve_b);
            (amount_out?, true)
        } else {
            let amount_out = calculate_token_out(amount_in, reserve_b, reserve_a);
            (amount_out?, false)
        };

    let cpi_accounts = Transfer {
        from: ctx.accounts.source_token_account.to_account_info(),
        to: if is_a_to_b {
            ctx.accounts.token_a_account.to_account_info()
        } else {
            ctx.accounts.token_b_account.to_account_info()
        },
        authority: ctx.accounts.user.to_account_info(),
    };
    let cpi_context = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
    token::transfer(cpi_context, amount_in)?;

    let pool_bump = ctx.accounts.pool.bump;
    let user_key = ctx.accounts.user.key();
    let seeds = &[b"pool".as_ref(), user_key.as_ref(), &[pool_bump]];
    let signer = &[&seeds[..]];

    let transfer_out_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: if is_a_to_b {
                ctx.accounts.token_b_account.to_account_info()
            } else {
                ctx.accounts.token_a_account.to_account_info()
            },
            to: ctx.accounts.destination_token_account.to_account_info(),
            authority: ctx.accounts.pool.to_account_info(),
        },
        signer,
    );
    token::transfer(transfer_out_ctx, amount_out)?;

    fn calculate_token_out(amount_in: u64, reserve_a: u64, reserve_b: u64) -> Result<u64> {
        if amount_in <= 0 {
            return Err(SwapError::ZeroAmount.into());
        }

        if reserve_a == 0 && reserve_b == 0 {
            return Err(SwapError::InsufficientLiquidity.into());
        }

        let fee_to_be_deducted = amount_in as f64 * 0.003;
        let deducted_amount_in = amount_in as f64 - fee_to_be_deducted;

        let numerator = reserve_b as f64 * deducted_amount_in;
        let denominator = reserve_a as f64 + deducted_amount_in;

        let amount_out = (numerator / denominator) as u64;

        require!(amount_out > 0, SwapError::ZeroAmount);
        require!(amount_out <= reserve_b, SwapError::InsufficientLiquidity);

        Ok(amount_out)
    }
    Ok(())
}

pub fn withdraw_liquidity(
    ctx: Context<WithdrawLiquidity>,
    lp_tokens_to_redeem: u64,
    min_token_a: u64,
    min_token_b: u64,
) -> Result<()> {
    let total_lp_supply = ctx.accounts.pool.total_supply;
    if total_lp_supply <= 0 {
        return Err(RemoveLiquidityError::NoLiquidity.into());
    };
    if lp_tokens_to_redeem <= 0 {
        return Err(RemoveLiquidityError::InvalidAmount.into());
    };

    let reserve_a = ctx.accounts.pool_token_a_account.amount;
    let reserve_b = ctx.accounts.pool_token_b_account.amount;

    let token_a_amount = (reserve_a as u128)
        .checked_mul(lp_tokens_to_redeem as u128)
        .unwrap()
        .checked_div(total_lp_supply as u128)
        .unwrap() as u64;

    let token_b_amount = (reserve_b as u128)
        .checked_mul(lp_tokens_to_redeem as u128)
        .unwrap()
        .checked_div(total_lp_supply as u128)
        .unwrap() as u64;

    if token_a_amount < min_token_a {
        return Err(RemoveLiquidityError::SlippageExceeded.into());
    }
    if token_b_amount < min_token_b {
        return Err(RemoveLiquidityError::SlippageExceeded.into());
    }

    let cpi_accounts = Burn {
        from: ctx.accounts.user_lp_token_account.to_account_info(),
        mint: ctx.accounts.lp_mint.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };

    let cpi_context = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
    token::burn(cpi_context, lp_tokens_to_redeem)?;

    let pool_bump = ctx.accounts.pool.bump;
    let user_key = ctx.accounts.user.key();
    let seeds = &[b"pool".as_ref(), user_key.as_ref(), &[pool_bump]];
    let signer = &[&seeds[..]];

    let transfer_a_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.pool_token_a_account.to_account_info(),
            to: ctx.accounts.user_token_a_account.to_account_info(),
            authority: ctx.accounts.pool.to_account_info(),
        },
        signer,
    );
    token::transfer(transfer_a_ctx, token_a_amount)?;

    let transfer_b_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.pool_token_b_account.to_account_info(),
            to: ctx.accounts.user_token_b_account.to_account_info(),
            authority: ctx.accounts.pool.to_account_info(),
        },
        signer,
    );
    token::transfer(transfer_b_ctx, token_b_amount)?;

    ctx.accounts.pool.total_supply = ctx
        .accounts
        .pool
        .total_supply
        .checked_sub(lp_tokens_to_redeem)
        .unwrap();

    emit!(LiquidityRemoved {
        user: ctx.accounts.user.key(),
        lp_amount: lp_tokens_to_redeem,
        token_a_amount,
        token_b_amount,
    });
    Ok(())
}
