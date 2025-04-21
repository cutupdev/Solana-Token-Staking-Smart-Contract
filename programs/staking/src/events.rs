use anchor_lang::prelude::*;

#[event]
pub struct CreateEvent {
    pub token_mint: Pubkey,
    pub duration: u64,
    pub lock_period: u64,
    pub pool_date: u64,
    pub boost_trigger_amount: u64,
    pub boost_purchase_amount: u64,
    pub apy: u16,
    pub boost_apy_percent: u16,
    pub penalty_fee: u16,
    pub boost_duration: u64,
    pub reward_token: Pubkey,
    pub pool_id: u64,
}

#[event]
pub struct PauseEvent {
    pub pool_id: u64,
    pub paused: u8
}

#[event]
pub struct EmergencyEvent {
    pub admin: Pubkey
}

#[event]
pub struct ConfigEvent {
    pub admin: Pubkey
}

#[event]
pub struct StakeEvent {
    pub user: Pubkey,
    pub staked_amount: u64,
    pub pool_id: u64,
    pub deposit_timestamps: u64,
}

#[event]
pub struct HarvestEvent {
    pub user: Pubkey,
    pub staked_amount: u64,
    pub reward_amount: u64,
    pub pool_id: u64,
}

#[event]
pub struct WithdrawEvent {
    pub user: Pubkey,
    pub staked_amount: u64,
    pub reward_amount: u64,
    pub withdraw_amount: u64,
    pub is_penalty: bool,
    pub pool_id: u64,
}

#[event]
pub struct PurchaseEvent {
    pub user: Pubkey,
    pub purchase_amount: u64,
    pub pool_id: u64,
    pub boost_timestamps: u64,
}

#[event]
pub struct BoostEvent {
    pub user: Pubkey,
    pub staked_amount: u64,
}