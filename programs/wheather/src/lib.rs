use anchor_lang::prelude::*;

declare_id!("7VmU1amtib9FcdQxdmv1DxKQ1HS5jfufUujTJrvg6mU6");

#[program]
pub mod wheather {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
