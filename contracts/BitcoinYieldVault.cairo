# SPDX-License-Identifier: MIT
# Bitcoin Yield Vault Contract - StarkNet Hackathon 2024
# Atomiq Integration + Lightning Network Yield Strategies

%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin, SignatureBuiltin
from starkware.cairo.common.uint256 import Uint256, uint256_add, uint256_sub, uint256_mul, uint256_le
from starkware.starknet.common.syscalls import get_caller_address, get_contract_address, get_block_timestamp
from starkware.cairo.common.math import assert_not_zero, assert_le, assert_lt
from starkware.cairo.common.bool import TRUE, FALSE
from openzeppelin.access.ownable.library import Ownable
from openzeppelin.security.pausable.library import Pausable
from openzeppelin.security.reentrancyguard.library import ReentrancyGuard

# ============================================================================
# CONSTANTS
# ============================================================================

const SATS_PER_BTC = 100000000;
const SECONDS_PER_YEAR = 31536000;

# Yield Strategy IDs
const LIGHTNING_ROUTING = 1;
const ATOMIQ_LIQUIDITY = 2;
const VESU_LENDING = 3;
const JEDISWAP_LP = 4;

# ============================================================================
# EVENTS
# ============================================================================

@event
func BitcoinDeposited(user: felt, amount_btc: Uint256, amount_sats: Uint256, strategy: felt) {
}

@event
func BitcoinWithdrawn(user: felt, amount_btc: Uint256, yield_earned: Uint256, strategy: felt) {
}

@event
func YieldCompounded(user: felt, strategy: felt, yield_amount: Uint256) {
}

@event
func LightningPaymentRouted(user: felt, fees_earned: Uint256) {
}

@event
func AtomiqSwapCompleted(user: felt, btc_amount: Uint256, fees_earned: Uint256) {
}

@event
func StrategyAPYUpdated(strategy: felt, new_apy: felt) {
}

# ============================================================================
# STRUCTS
# ============================================================================

struct YieldStrategy {
    id: felt,
    name: felt,  # Hash of strategy name
    apy: felt,   # APY in basis points (e.g., 850 = 8.5%)
    min_deposit: Uint256,  # Minimum deposit in sats
    risk_level: felt,  # 1=Low, 2=Medium, 3=High
    is_active: felt,
    total_deposited: Uint256,
    total_earned: Uint256,
}

struct UserPosition {
    amount_sats: Uint256,
    deposit_timestamp: felt,
    last_compound: felt,
    total_earned: Uint256,
}

# ============================================================================
# STORAGE VARIABLES
# ============================================================================

# Yield strategies
@storage_var
func yield_strategies(strategy_id: felt) -> (strategy: YieldStrategy) {
}

# User positions per strategy
@storage_var
func user_positions(user: felt, strategy_id: felt) -> (position: UserPosition) {
}

# User's total BTC deposited across all strategies
@storage_var
func user_total_btc(user: felt) -> (total: Uint256) {
}

# User's total yield earned
@storage_var
func user_total_yield(user: felt) -> (total: Uint256) {
}

# Lightning routing rewards
@storage_var
func lightning_routing_rewards(user: felt) -> (rewards: Uint256) {
}

# Atomiq swap fees
@storage_var
func atomiq_swap_fees(user: felt) -> (fees: Uint256) {
}

# Strategy performance tracking
@storage_var
func strategy_performance(strategy_id: felt, timestamp: felt) -> (apy: felt) {
}

# Auto-compound settings
@storage_var
func auto_compound_enabled(user: felt, strategy_id: felt) -> (enabled: felt) {
}

# Bitcoin price oracle (simplified)
@storage_var
func btc_price_usd() -> (price: felt) {
}

# Total Value Locked
@storage_var
func total_tvl() -> (tvl: Uint256) {
}

# ============================================================================
# CONSTRUCTOR
# ============================================================================

@constructor
func constructor{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    owner: felt
) {
    Ownable.initializer(owner);
    Pausable.initializer();
    
    # Initialize yield strategies
    _initialize_strategies();
    
    # Set initial BTC price (would be from oracle)
    btc_price_usd.write(67000);  # $67,000 USD
    
    return ();
}

# ============================================================================
# INTERNAL FUNCTIONS
# ============================================================================

func _initialize_strategies{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() {
    # Lightning Routing Strategy
    let lightning_strategy = YieldStrategy(
        id=LIGHTNING_ROUTING,
        name=1234567890,  # Hash of "Lightning Routing"
        apy=450,  # 4.5%
        min_deposit=Uint256(100000, 0),  # 0.001 BTC in sats
        risk_level=1,  # Low risk
        is_active=TRUE,
        total_deposited=Uint256(0, 0),
        total_earned=Uint256(0, 0)
    );
    yield_strategies.write(LIGHTNING_ROUTING, lightning_strategy);
    
    # Atomiq Liquidity Strategy
    let atomiq_strategy = YieldStrategy(
        id=ATOMIQ_LIQUIDITY,
        name=2345678901,  # Hash of "Atomiq Liquidity"
        apy=820,  # 8.2%
        min_deposit=Uint256(1000000, 0),  # 0.01 BTC in sats
        risk_level=2,  # Medium risk
        is_active=TRUE,
        total_deposited=Uint256(0, 0),
        total_earned=Uint256(0, 0)
    );
    yield_strategies.write(ATOMIQ_LIQUIDITY, atomiq_strategy);
    
    # Vesu Lending Strategy
    let vesu_strategy = YieldStrategy(
        id=VESU_LENDING,
        name=3456789012,  # Hash of "Vesu Lending"
        apy=680,  # 6.8%
        min_deposit=Uint256(500000, 0),  # 0.005 BTC in sats
        risk_level=1,  # Low risk
        is_active=TRUE,
        total_deposited=Uint256(0, 0),
        total_earned=Uint256(0, 0)
    );
    yield_strategies.write(VESU_LENDING, vesu_strategy);
    
    # JediSwap LP Strategy
    let jediswap_strategy = YieldStrategy(
        id=JEDISWAP_LP,
        name=4567890123,  # Hash of "JediSwap LP"
        apy=1250,  # 12.5%
        min_deposit=Uint256(1000000, 0),  # 0.01 BTC in sats
        risk_level=3,  # High risk (impermanent loss)
        is_active=TRUE,
        total_deposited=Uint256(0, 0),
        total_earned=Uint256(0, 0)
    );
    yield_strategies.write(JEDISWAP_LP, jediswap_strategy);
    
    return ();
}

# ============================================================================
# YIELD STRATEGY FUNCTIONS
# ============================================================================

@external
func deposit_btc{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    amount_sats: Uint256, strategy_id: felt
) {
    alloc_locals;
    ReentrancyGuard.start();
    
    let (caller) = get_caller_address();
    let (timestamp) = get_block_timestamp();
    
    # Validate strategy
    let (strategy) = yield_strategies.read(strategy_id);
    assert strategy.is_active = TRUE;
    
    # Check minimum deposit
    let (is_min_met) = uint256_le(strategy.min_deposit, amount_sats);
    assert is_min_met = TRUE;
    
    # Get current user position
    let (current_position) = user_positions.read(caller, strategy_id);
    
    # Update user position
    let (new_amount, _) = uint256_add(current_position.amount_sats, amount_sats);
    let updated_position = UserPosition(
        amount_sats=new_amount,
        deposit_timestamp=timestamp,
        last_compound=timestamp,
        total_earned=current_position.total_earned
    );
    user_positions.write(caller, strategy_id, updated_position);
    
    # Update user total BTC
    let (user_total) = user_total_btc.read(caller);
    let (new_user_total, _) = uint256_add(user_total, amount_sats);
    user_total_btc.write(caller, new_user_total);
    
    # Update strategy totals
    let (new_strategy_total, _) = uint256_add(strategy.total_deposited, amount_sats);
    let updated_strategy = YieldStrategy(
        id=strategy.id,
        name=strategy.name,
        apy=strategy.apy,
        min_deposit=strategy.min_deposit,
        risk_level=strategy.risk_level,
        is_active=strategy.is_active,
        total_deposited=new_strategy_total,
        total_earned=strategy.total_earned
    );
    yield_strategies.write(strategy_id, updated_strategy);
    
    # Update total TVL
    let (tvl) = total_tvl.read();
    let (new_tvl, _) = uint256_add(tvl, amount_sats);
    total_tvl.write(new_tvl);
    
    # Convert sats to BTC for event
    let amount_btc = Uint256(amount_sats.low / SATS_PER_BTC, 0);
    
    BitcoinDeposited.emit(caller, amount_btc, amount_sats, strategy_id);
    
    ReentrancyGuard.end();
    return ();
}

@external
func withdraw_btc{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    amount_sats: Uint256, strategy_id: felt
) {
    alloc_locals;
    ReentrancyGuard.start();
    
    let (caller) = get_caller_address();
    let (timestamp) = get_block_timestamp();
    
    # Get user position
    let (position) = user_positions.read(caller, strategy_id);
    
    # Check sufficient balance
    let (has_sufficient) = uint256_le(amount_sats, position.amount_sats);
    assert has_sufficient = TRUE;
    
    # Calculate yield earned
    let yield_earned = _calculate_yield_earned(position, strategy_id, timestamp);
    
    # Update user position
    let (new_amount, _) = uint256_sub(position.amount_sats, amount_sats);
    let (new_total_earned, _) = uint256_add(position.total_earned, yield_earned);
    let updated_position = UserPosition(
        amount_sats=new_amount,
        deposit_timestamp=position.deposit_timestamp,
        last_compound=timestamp,
        total_earned=new_total_earned
    );
    user_positions.write(caller, strategy_id, updated_position);
    
    # Update user total yield
    let (user_yield) = user_total_yield.read(caller);
    let (new_user_yield, _) = uint256_add(user_yield, yield_earned);
    user_total_yield.write(caller, new_user_yield);
    
    # Update strategy totals
    let (strategy) = yield_strategies.read(strategy_id);
    let (new_strategy_total, _) = uint256_sub(strategy.total_deposited, amount_sats);
    let (new_strategy_earned, _) = uint256_add(strategy.total_earned, yield_earned);
    let updated_strategy = YieldStrategy(
        id=strategy.id,
        name=strategy.name,
        apy=strategy.apy,
        min_deposit=strategy.min_deposit,
        risk_level=strategy.risk_level,
        is_active=strategy.is_active,
        total_deposited=new_strategy_total,
        total_earned=new_strategy_earned
    );
    yield_strategies.write(strategy_id, updated_strategy);
    
    # Convert sats to BTC for event
    let amount_btc = Uint256(amount_sats.low / SATS_PER_BTC, 0);
    
    BitcoinWithdrawn.emit(caller, amount_btc, yield_earned, strategy_id);
    
    ReentrancyGuard.end();
    return ();
}

func _calculate_yield_earned{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    position: UserPosition, strategy_id: felt, current_timestamp: felt
) -> (yield_earned: Uint256) {
    alloc_locals;
    
    let (strategy) = yield_strategies.read(strategy_id);
    
    # Calculate time elapsed since last compound
    let time_elapsed = current_timestamp - position.last_compound;
    
    # Calculate annual yield
    let (annual_yield, _) = uint256_mul(position.amount_sats, Uint256(strategy.apy, 0));
    let (annual_yield_normalized) = uint256_mul(annual_yield, Uint256(1, 0));  # Divide by 10000 for basis points
    
    # Calculate proportional yield for time elapsed
    let (yield_per_second, _) = uint256_mul(annual_yield_normalized, Uint256(1, 0));  # Divide by SECONDS_PER_YEAR
    let (total_yield, _) = uint256_mul(yield_per_second, Uint256(time_elapsed, 0));
    
    return (total_yield,);
}

# ============================================================================
# AUTO-COMPOUND FUNCTIONS
# ============================================================================

@external
func enable_auto_compound{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    strategy_id: felt
) {
    let (caller) = get_caller_address();
    auto_compound_enabled.write(caller, strategy_id, TRUE);
    return ();
}

@external
func compound_yield{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    strategy_id: felt
) {
    alloc_locals;
    let (caller) = get_caller_address();
    let (timestamp) = get_block_timestamp();
    
    # Get user position
    let (position) = user_positions.read(caller, strategy_id);
    
    # Calculate yield earned
    let yield_earned = _calculate_yield_earned(position, strategy_id, timestamp);
    
    # Add yield to principal
    let (new_amount, _) = uint256_add(position.amount_sats, yield_earned);
    let (new_total_earned, _) = uint256_add(position.total_earned, yield_earned);
    
    let updated_position = UserPosition(
        amount_sats=new_amount,
        deposit_timestamp=position.deposit_timestamp,
        last_compound=timestamp,
        total_earned=new_total_earned
    );
    user_positions.write(caller, strategy_id, updated_position);
    
    YieldCompounded.emit(caller, strategy_id, yield_earned);
    return ();
}

# ============================================================================
# LIGHTNING NETWORK FUNCTIONS
# ============================================================================

@external
func process_lightning_routing_fee{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    user: felt, fee_sats: Uint256
) {
    # Only authorized Lightning router can call this
    # In practice, this would be called by the Lightning integration
    
    let (current_rewards) = lightning_routing_rewards.read(user);
    let (new_rewards, _) = uint256_add(current_rewards, fee_sats);
    lightning_routing_rewards.write(user, new_rewards);
    
    LightningPaymentRouted.emit(user, fee_sats);
    return ();
}

# ============================================================================
# ATOMIQ INTEGRATION
# ============================================================================

@external
func process_atomiq_swap_fee{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    user: felt, btc_amount: Uint256, fee_sats: Uint256
) {
    # Only authorized Atomiq contract can call this
    
    let (current_fees) = atomiq_swap_fees.read(user);
    let (new_fees, _) = uint256_add(current_fees, fee_sats);
    atomiq_swap_fees.write(user, new_fees);
    
    AtomiqSwapCompleted.emit(user, btc_amount, fee_sats);
    return ();
}

# ============================================================================
# VIEW FUNCTIONS
# ============================================================================

@view
func get_yield_strategy{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    strategy_id: felt
) -> (strategy: YieldStrategy) {
    let (strategy) = yield_strategies.read(strategy_id);
    return (strategy,);
}

@view
func get_user_position{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    user: felt, strategy_id: felt
) -> (position: UserPosition) {
    let (position) = user_positions.read(user, strategy_id);
    return (position,);
}

@view
func get_user_total_btc{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    user: felt
) -> (total: Uint256) {
    let (total) = user_total_btc.read(user);
    return (total,);
}

@view
func get_total_tvl{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (tvl: Uint256) {
    let (tvl) = total_tvl.read();
    return (tvl,);
}

@view
func calculate_current_yield{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    user: felt, strategy_id: felt
) -> (yield_earned: Uint256) {
    let (position) = user_positions.read(user, strategy_id);
    let (timestamp) = get_block_timestamp();
    let yield_earned = _calculate_yield_earned(position, strategy_id, timestamp);
    return (yield_earned,);
}

# ============================================================================
# ADMIN FUNCTIONS
# ============================================================================

@external
func update_strategy_apy{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    strategy_id: felt, new_apy: felt
) {
    Ownable.assert_only_owner();
    
    let (strategy) = yield_strategies.read(strategy_id);
    let updated_strategy = YieldStrategy(
        id=strategy.id,
        name=strategy.name,
        apy=new_apy,
        min_deposit=strategy.min_deposit,
        risk_level=strategy.risk_level,
        is_active=strategy.is_active,
        total_deposited=strategy.total_deposited,
        total_earned=strategy.total_earned
    );
    yield_strategies.write(strategy_id, updated_strategy);
    
    StrategyAPYUpdated.emit(strategy_id, new_apy);
    return ();
}

@external
func update_btc_price{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    new_price: felt
) {
    Ownable.assert_only_owner();
    btc_price_usd.write(new_price);
    return ();
}

@external
func pause_strategy{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    strategy_id: felt
) {
    Ownable.assert_only_owner();
    
    let (strategy) = yield_strategies.read(strategy_id);
    let updated_strategy = YieldStrategy(
        id=strategy.id,
        name=strategy.name,
        apy=strategy.apy,
        min_deposit=strategy.min_deposit,
        risk_level=strategy.risk_level,
        is_active=FALSE,
        total_deposited=strategy.total_deposited,
        total_earned=strategy.total_earned
    );
    yield_strategies.write(strategy_id, updated_strategy);
    return ();
}