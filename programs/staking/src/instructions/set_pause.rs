use anchor_lang::prelude::*;
use crate::{
    constants::{CONFIG, SEED_STAKING_POOL, ADMIN_WALLET}, 
    errors::StakingError, 
    state::{Config, Pool},
    events::PauseEvent,
};
use std::str::FromStr;

#[derive(Accounts)]
#[instruction(pool_id: u64)]
pub struct SetPause<'info> {
    #[account(mut)]
    payer: Signer<'info>,

    #[account(
        seeds = [CONFIG.as_bytes()],
        bump,
    )]
    global_config: Box<Account<'info, Config>>,

    // staking pool pda
    #[account(
        mut,
        seeds = [SEED_STAKING_POOL.as_bytes(), pool_id.to_le_bytes().as_ref()],
        bump
    )]
    pub staking_pool: Box<Account<'info, Pool>>,
}

impl <'info> SetPause<'info> {
pub fn process(&mut self, pool_id: u64) -> Result<u8> {

    
        
        Ok(1)
    }
}
