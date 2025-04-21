use crate::{
    constants::{CONFIG, GLOBAL, SEED_STAKING_POOL},
    errors::StakingError,
    events::CreateEvent,
    state::{Config, Pool},
};
use anchor_lang::{prelude::*, solana_program::sysvar::SysvarId, system_program};
use anchor_spl::{
    associated_token::{self, AssociatedToken},
    metadata::{self, Metadata},
    token::{self, Mint, Token, TokenAccount},
};

#[derive(Accounts)]
pub struct Create<'info> {
    #[account(mut)]
    creator: Signer<'info>,

    #[account(
        mut,
        seeds = [CONFIG.as_bytes()],
        bump,
    )]
    pub global_config: Box<Account<'info, Config>>,

    #[account(
        init,
        space = Pool::DATA_SIZE,
        seeds = [
            SEED_STAKING_POOL.as_bytes(), 
            global_config.total_pool_count.to_le_bytes().as_ref(),
            ],
        bump,
        payer = creator
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
    // staking_token_account: Box<Account<'info, TokenAccount>>,

    // User staking token mint
    /// CHECK: should be same with the address with staking token mint
    #[account(mut)]
    pub staking_token: Box<Account<'info, Mint>>,

    #[account(
        address = spl_token::native_mint::ID
    )]
    native_mint: Box<Account<'info, Mint>>,

    // Reward token mint
    pub reward_mint: Box<Account<'info, Mint>>,

    #[account(address = system_program::ID)]
    system_program: Program<'info, System>,

    #[account(address = Rent::id())]
    rent: Sysvar<'info, Rent>,

    #[account(address = token::ID)]
    token_program: Program<'info, Token>,

    #[account(address = associated_token::ID)]
    associated_token_program: Program<'info, AssociatedToken>,

    #[account(address = metadata::ID)]
    mpl_token_metadata_program: Program<'info, Metadata>,
}

impl<'info> Create<'info> {
    pub fn process(
        &mut self,
        duration: u64,
        lock_period: u64,
        boost_trigger_amount: u64,
        boost_purchase_amount: u64,
        apy: u16,
        boost_apy_percent: u16,
        penalty_fee: u16,
        boost_duration: u64,
    ) -> Result<()> {

        

        Ok(())
    }
}
