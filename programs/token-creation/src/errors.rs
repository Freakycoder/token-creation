use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid recipient associated token account")]
    InvalidRecipientAta,
    #[msg("Invalid sender associated token account")]
    InvalidSenderAta,
    #[msg("Invalid mint authority")]
    InvalidMintAuthority,
    #[msg("Invalid mint account")]
    InvalidMintAccount,
}
#[error_code]
pub enum SwapError {
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Insufficient liquidity in pool")]
    InsufficientLiquidity,
    #[msg("Slippage tolerance exceeded")]
    SlippageExceeded,
}

#[error_code]
pub enum RemoveLiquidityError {
    #[msg("Pool has no liquidity")]
    NoLiquidity,
    #[msg("Invalid LP token amount")]
    InvalidAmount,
    #[msg("Slippage tolerance exceeded")]
    SlippageExceeded,
}