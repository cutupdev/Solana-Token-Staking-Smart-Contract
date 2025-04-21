use anchor_lang::{system_program, prelude::*};
use anchor_spl::{
    associated_token::{self, AssociatedToken},
    token::{self, Mint, Token, TokenAccount},
};
use crate::{
    constants::{CONFIG, SEED_STAKING_POOL, USER_POOL}, errors::StakingError, events::PurchaseEvent, errors::ValueInvalid, state::{Config, Pool, User},
    utils::token_transfer_user
};

#[derive(Accounts)]
#[instruction(pool_id: u64)]
pub struct PurchaseBoost<'info> {
    #[account(mut)]
    user: Signer<'info>,

    #[account(
        mut,
        seeds = [USER_POOL.as_bytes(), &user.key().to_bytes(), &staking_pool.key().to_bytes()],
        bump,
    )]
    user_pool: Box<Account<'info, User>>,

    #[account(
        seeds = [CONFIG.as_bytes()],
        bump,
    )]
    global_config: Box<Account<'info, Config>>,

    #[account(
        mut,
        seeds = [SEED_STAKING_POOL.as_bytes(), pool_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub staking_pool: Box<Account<'info, Pool>>,

    /// CHECK: ATA for the staking token account
    #[account(
        mut,
        seeds = [
            staking_pool.key().as_ref(),
            spl_token::id().as_ref(),
            staking_token.key().as_ref(),
        ],
        bump,
        seeds::program = anchor_spl::associated_token::ID
    )]
    staking_token_account: AccountInfo<'info>,

    // User staking token account
    /// CHECK: should be same with the address with staking token mint
    #[account(
        mut,
        associated_token::mint = staking_token,
        associated_token::authority = user
    )]
    pub user_staking_ata: Box<Account<'info, TokenAccount>>,

    // User staking token mint
    /// CHECK: should be same with the address with staking token mint
    #[account(mut)]
    pub staking_token: Box<Account<'info, Mint>>,

    #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>,

    #[account(address = token::ID)]
    pub token_program: Program<'info, Token>,

    #[account(address = associated_token::ID)]
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> PurchaseBoost<'info> { 
pub fn process(
    &mut self, 
    pool_id: u64,
    amount: u64,
) -> Result<u64> {
    

    Ok(amount)
}

}