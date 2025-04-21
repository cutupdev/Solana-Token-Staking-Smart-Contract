use crate::constants::LAMPORT_DECIMALS;
use crate::utils::*;
use anchor_lang::{prelude::*, AnchorDeserialize, AnchorSerialize};

#[account]
pub struct Config {
    pub admin: Pubkey,
    pub total_pool_count: u64,
    pub configured: bool,
}

impl Config {
    pub const DATA_SIZE: usize = 8 + std::mem::size_of::<Config>();
}

#[account]
#[derive(Default)]
pub struct Pool {
    pub token_mint: Pubkey,
    pub duration: u64,
    pub lock_period: u64,
    pub pool_date: u64,
    pub boost_trigger_amount: u64,
    pub boost_purchase_amount: u64,
    pub apy: u16,
    pub boost_apy_percent: u16,
    pub penalty_fee: u16,
    pub paused: u8,
    pub boost_duration: u64,
    pub reward_token: Pubkey,
    pub pool_id: u64,
    // pub token_pyth: Pubkey,
    // pub reward_pyth: Pubkey,
}

impl Pool {
    pub const DATA_SIZE: usize = 8 + std::mem::size_of::<Pool>();
}

#[account]
pub struct User {
    pub user: Pubkey,
    pub staked_amount: u64,
    pub deposit_timestamps: u64,
    pub boost_timestamps: u64,
    pub pool_id: u64,
    pub pool_key: Pubkey,    
}

impl User {
    pub const DATA_SIZE: usize = 8 + std::mem::size_of::<User>();
}
pub trait UserAccount<'info> {
    fn calculate_rewards(
        &mut self,
        staked_amount: u64,
        deposit_timestamps: u64,
        boost_timestamps: u64,
        normal_apy: u16,
        boost_apy: u16,
        sol_price: f64,
        token_price: f64,
        token_decimals: u8
    ) -> Result<u64>;

    fn calculate_withdraw(
        &mut self,
        staked_amount: u64,
        deposit_timestamps: u64,
        lock_period: u64,
        penalty_fee: u16
    ) -> Result<u64>;
}

impl <'info> UserAccount <'info> for Account<'info, User> {
    fn calculate_rewards(
        &mut self,
        staked_amount: u64,
        deposit_timestamps: u64,
        boost_timestamps: u64,
        normal_apy: u16,
        boost_apy: u16,
        sol_price: f64,
        token_price: f64,
        token_decimals: u8
    ) -> Result<u64> {
        // Current timestamps
        let timestamp = Clock::get().unwrap().unix_timestamp as u64;

        let normal_rewards_duration = (timestamp - deposit_timestamps) / 87600 as u64;
        let normal_rewards = staked_amount * normal_rewards_duration * normal_apy as u64 / 36500;

        let boost_rewards_duration = if boost_timestamps > 0 { (timestamp - boost_timestamps) / 87600 as u64 } else { 0 };
        let boost_rewards = staked_amount * boost_rewards_duration * boost_apy as u64 / 36500;

        let total_rewards = normal_rewards + boost_rewards;

        let total_rewards_in_float = convert_to_float(total_rewards, token_decimals);

        let total_sol_in_float = total_rewards_in_float * token_price / sol_price;

        let total_reward_lamports = convert_from_float(total_sol_in_float, LAMPORT_DECIMALS); 
        
        Ok(total_reward_lamports as u64)
    }

    fn calculate_withdraw(
        &mut self,
        staked_amount: u64,
        deposit_timestamps: u64,
        lock_period: u64,
        penalty_fee: u16
    ) -> Result<u64> {
        // Current timestamps
        let timestamp = Clock::get().unwrap().unix_timestamp as u64;
        if timestamp - deposit_timestamps < lock_period {
            Ok((staked_amount * penalty_fee as u64 / 100) as u64)
        } else {
            Ok(staked_amount)
        }
    }
}