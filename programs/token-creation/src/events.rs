use anchor_lang::prelude::*;

#[event]
pub struct LiquidityRemoved {
    pub user: Pubkey,
    pub lp_amount: u64,
    pub token_a_amount: u64,
    pub token_b_amount: u64,
}