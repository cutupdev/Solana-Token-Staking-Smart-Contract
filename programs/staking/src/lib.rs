pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;
pub mod utils;

use crate::instructions::*;
use anchor_lang::prelude::*;
use state::Config;

declare_id!("D2dTLQp2w485kQDwDvngfDo2GV1r7DdeGgYWxjAaDkPv");

#[program]
pub mod staking {

    use super::*;

    pub fn initialize(ctx: Context<Configure>, new_config: Config) -> Result<()> {
        ctx.accounts.process(new_config, ctx.bumps.config)
    }

    pub fn create_pool(
        ctx: Context<Create>,

        //  pool setting
        duration: u64,
        lock_period: u64,
        boost_trigger_amount: u64,
        boost_purchase_amount: u64,
        apy: u16,
        boost_apy_percent: u16,
        penalty_fee: u16,
        boost_duration: u64,
    ) -> Result<()> {
        ctx.accounts
            .process(
                duration, 
                lock_period, 
                boost_trigger_amount, 
                boost_purchase_amount,
                apy,
                boost_apy_percent,
                penalty_fee,
                boost_duration
            )
    }

    pub fn emergency(
        ctx: Context<Emergency>
    ) -> Result<()> {
        ctx.accounts
            .process(
                ctx.bumps.global_vault
            )
    }

    pub fn set_pause(
        ctx: Context<SetPause>,
        pool_id: u64
    ) -> Result<u8> {
        ctx.accounts
            .process(
                pool_id
            )
    }

    pub fn stake(
        ctx: Context<Stake>,
        pool_id: u64,
        amount: u64,
    ) -> Result<u64> {
        ctx.accounts
            .process(
                pool_id,
                amount
            )
    }

    pub fn withdraw(
        ctx: Context<Withdraw>,
        pool_id: u64,

        sol_price: f64,
        token_price: f64,
    ) -> Result<()> {
        ctx.accounts
            .process(
                pool_id,
                sol_price,
                token_price,
                
                ctx.bumps.global_vault,
                ctx.bumps.staking_pool
            )
    }

    pub fn harvest(
        ctx: Context<Harvest>,
        pool_id: u64,

        sol_price: f64,
        token_price: f64,
    ) -> Result<()> {
        ctx.accounts
            .process(
                pool_id,
                sol_price,
                token_price,
                ctx.bumps.global_vault
            )
    }

    pub fn purchase_boost(
        ctx: Context<PurchaseBoost>,
        pool_id: u64,

        amount: u64
    ) -> Result<u64> {
        ctx.accounts
            .process(
                pool_id,
                amount,
            )
    }
}
