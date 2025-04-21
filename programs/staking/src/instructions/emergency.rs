use anchor_lang::{prelude::*, system_program};
use anchor_spl::{
    associated_token::{self, AssociatedToken},
    token::{self, Mint, Token, TokenAccount}
};
use std::str::FromStr;


use crate::{
    constants::{ADMIN_WALLET, CONFIG, GLOBAL},
    errors::StakingError,
    state::Config,
    utils::{
        sol_transfer_with_signer, token_transfer_with_signer,
    },
    events::EmergencyEvent
};

#[derive(Accounts)]
pub struct Emergency<'info> {
    #[account(mut)]
    payer: Signer<'info>,

    #[account(
        seeds = [CONFIG.as_bytes()],
        bump,
    )]
    global_config: Box<Account<'info, Config>>,

    /// CHECK: global vault pda which stores quote token
    #[account(
        mut,
        seeds = [GLOBAL.as_bytes()],
        bump,
    )]
    pub global_vault: AccountInfo<'info>,

    #[account(
        mut,
        associated_token::mint = native_mint,
        associated_token::authority = global_vault
    )]
    global_wsol_account: Box<Account<'info, TokenAccount>>,

    /// CHECK: ata of team wallet
    #[account(
        mut,
        seeds = [
            payer.key().as_ref(),
            spl_token::id().as_ref(),
            native_mint.key().as_ref(),
        ],
        bump,
        seeds::program = anchor_spl::associated_token::ID
    )]
    admin_wsol_ata: AccountInfo<'info>,

    #[account(
        address = spl_token::native_mint::ID
    )]
    native_mint: Box<Account<'info, Mint>>,

    #[account(address = system_program::ID)]
    system_program: Program<'info, System>,

    #[account(address = token::ID)]
    token_program: Program<'info, Token>,
    
    #[account(address = associated_token::ID)]
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> Emergency<'info> {
    pub fn process(&mut self, global_vault_bump: u8) -> Result<()> {
        

        Ok(())
    }
}
