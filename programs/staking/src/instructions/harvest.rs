use crate::{
    constants::{GLOBAL, SEED_STAKING_POOL, USER_POOL, CONFIG},
    errors::*,
    events::HarvestEvent,
    state::{Pool, User, UserAccount, Config},
    utils::sol_transfer_with_signer,
};
use anchor_lang::{prelude::*, system_program};
use anchor_spl::token::Mint;

#[derive(Accounts)]
#[instruction(pool_id: u64)]
pub struct Harvest<'info> {
    #[account(mut)]
    user: Signer<'info>,

    // #[account(mut)]
    // backend_wallet: Signer<'info>,

    #[account(
        seeds = [CONFIG.as_bytes()],
        bump,
    )]
    global_config: Box<Account<'info, Config>>,

    #[account(
        mut,
        seeds = [USER_POOL.as_bytes(), &user.key().to_bytes(), &staking_pool.key().to_bytes()],
        bump,
    )]
    user_pool: Box<Account<'info, User>>,

    /// CHECK: global vault pda which stores SOL
    #[account(
        mut,
        seeds = [GLOBAL.as_bytes()],
        bump,
    )]
    pub global_vault: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [SEED_STAKING_POOL.as_bytes(), pool_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub staking_pool: Box<Account<'info, Pool>>,

    // User staking token mint
    /// CHECK: should be same with the address with staking token mint
    #[account(mut)]
    pub staking_token: Box<Account<'info, Mint>>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,
}

impl<'info> Harvest<'info> {
    pub fn process(
        &mut self,
        pool_id: u64,
        sol_price: f64,
        token_price: f64,
        global_vault_bump: u8,
    ) -> Result<()> {
        

        Ok(())
    }
}
