use anchor_lang::prelude::*;

pub use StakingError::*;

#[error_code]
pub enum StakingError {
    #[msg("ValueTooSmall")]
    ValueTooSmall,

    #[msg("ValueTooLarge")]
    ValueTooLarge,

    #[msg("ValueInvalid")]
    ValueInvalid,

    #[msg("IncorrectConfigAccount")]
    IncorrectConfigAccount,

    #[msg("AlreadyConfigured")]
    AlreadyConfigured,

    #[msg("AlreadyStaked")]
    AlreadyStaked,

    #[msg("AlreadyBoosted")]
    AlreadyBoosted,

    #[msg("NotEnoughBoosted")]
    NotEnoughBoosted,

    #[msg("IncorrectAuthority")]
    IncorrectAuthority,

    #[msg("Overflow or underflow occured")]
    OverflowOrUnderflowOccurred,

    #[msg("Amount is invalid")]
    InvalidAmount,

    #[msg("Token mint is not same with pool.token_mint")]
    InvalidPool,

    #[msg("Pool is paused")]
    PoolPaused,

    #[msg("Mint address is mismatched")]
    MintMismatched,

    #[msg("Incorrect user wallet address")]
    IncorrectUserWallet,
    
    #[msg("Can not withdraw now")]
    CanNotWithdraw,

    #[msg("Return amount is too small compared to the minimum received amount")]
    ReturnAmountTooSmall,
}
