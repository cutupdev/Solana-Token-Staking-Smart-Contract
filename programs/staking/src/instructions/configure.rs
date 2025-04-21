use anchor_lang::{prelude::*, system_program, Discriminator};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};
// use std::str::FromStr;
use crate::{
    constants::{CONFIG, GLOBAL, ADMIN_WALLET},
    errors::StakingError,
    state::Config,
    utils::sol_transfer_from_user,
    events::ConfigEvent
};
use borsh::BorshDeserialize;
use std::str::FromStr;

#[derive(Accounts)]
pub struct Configure<'info> {
    #[account(mut)]
    payer: Signer<'info>,

    /// CHECK: initialization handled inside the instruction
    #[account(
        init_if_needed,
        payer = payer,
        space = Config::DATA_SIZE,
        seeds = [CONFIG.as_bytes()],
        bump,
    )]
    config: Box<Account<'info, Config>>,

    /// CHECK: global vault pda which stores quote token
    #[account(
        mut,
        seeds = [GLOBAL.as_bytes()],
        bump,
    )]
    pub global_vault: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = native_mint,
        associated_token::authority = global_vault
    )]
    global_wsol_account: Box<Account<'info, TokenAccount>>,

    #[account(
        address = spl_token::native_mint::ID
    )]
    native_mint: Box<Account<'info, Mint>>,

    #[account(address = system_program::ID)]
    system_program: Program<'info, System>,

    token_program: Program<'info, Token>,

    associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> Configure<'info> {
    pub fn process(&mut self, new_config: Config, config_bump: u8) -> Result<()> {

        

        Ok(())
    }
}
