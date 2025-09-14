# SPDX-License-Identifier: MIT
# Invisible Payments Contract - StarkNet Hackathon 2024
# Account Abstraction + ChipiPay Integration

%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin, SignatureBuiltin
from starkware.cairo.common.uint256 import Uint256, uint256_add, uint256_sub, uint256_mul
from starkware.starknet.common.syscalls import get_caller_address, get_contract_address
from starkware.cairo.common.math import assert_not_zero, assert_le
from starkware.cairo.common.bool import TRUE, FALSE
from openzeppelin.access.ownable.library import Ownable
from openzeppelin.security.pausable.library import Pausable
from openzeppelin.security.reentrancyguard.library import ReentrancyGuard

# ============================================================================
# EVENTS
# ============================================================================

@event
func UserRegistered(address: felt, username: felt, email_hash: felt) {
}

@event
func InvisiblePaymentSent(from_address: felt, to_username: felt, amount: Uint256, token: felt) {
}

@event
func PaymentReceived(to_address: felt, from_username: felt, amount: Uint256, token: felt) {
}

@event
func YieldDeposit(user: felt, amount: Uint256, strategy: felt, apy: felt) {
}

@event
func YieldWithdraw(user: felt, amount: Uint256, yield_earned: Uint256) {
}

# ============================================================================
# STORAGE VARIABLES
# ============================================================================

# User registry: address -> username hash
@storage_var
func user_to_username(address: felt) -> (username_hash: felt) {
}

# Username registry: username hash -> address
@storage_var
func username_to_address(username_hash: felt) -> (address: felt) {
}

# User email hash: address -> email hash (for ChipiPay integration)
@storage_var
func user_email_hash(address: felt) -> (email_hash: felt) {
}

# ChipiPay gasless quota: address -> remaining transactions
@storage_var
func gasless_quota(address: felt) -> (remaining: felt) {
}

# Yield positions: user -> (amount, strategy, timestamp)
@storage_var
func yield_positions(user: felt, strategy: felt) -> (amount: Uint256, timestamp: felt) {
}

# Yield earnings: user -> total earned
@storage_var
func yield_earnings(user: felt) -> (total_earned: Uint256) {
}

# Supported tokens
@storage_var
func supported_tokens(token: felt) -> (is_supported: felt) {
}

# Payment notifications
@storage_var
func payment_notifications(user: felt, index: felt) -> (from_user: felt, amount: Uint256, timestamp: felt) {
}

@storage_var
func notification_count(user: felt) -> (count: felt) {
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
    return ();
}

# ============================================================================
# USER REGISTRATION & AUTHENTICATION
# ============================================================================

@external
func register_user{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    username_hash: felt, email_hash: felt
) {
    alloc_locals;
    
    let (caller) = get_caller_address();
    
    # Check if user is already registered
    let (existing_username) = user_to_username.read(caller);
    assert existing_username = 0;  # User not already registered
    
    # Check if username is available
    let (existing_address) = username_to_address.read(username_hash);
    assert existing_address = 0;  # Username not taken
    
    # Register user
    user_to_username.write(caller, username_hash);
    username_to_address.write(username_hash, caller);
    user_email_hash.write(caller, email_hash);
    
    # Initialize gasless quota (100 transactions)
    gasless_quota.write(caller, 100);
    
    # Initialize supported tokens
    let usdc_address = 0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8;  # USDC on StarkNet
    supported_tokens.write(usdc_address, TRUE);
    
    let eth_address = 0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7;  # ETH on StarkNet
    supported_tokens.write(eth_address, TRUE);
    
    let strk_address = 0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d;  # STRK on StarkNet
    supported_tokens.write(strk_address, TRUE);
    
    UserRegistered.emit(caller, username_hash, email_hash);
    return ();
}

@view
func get_user_by_username{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    username_hash: felt
) -> (address: felt) {
    let (address) = username_to_address.read(username_hash);
    return (address,);
}

@view
func get_username_by_user{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    user_address: felt
) -> (username_hash: felt) {
    let (username_hash) = user_to_username.read(user_address);
    return (username_hash,);
}

# ============================================================================
# INVISIBLE PAYMENTS
# ============================================================================

@external
func send_invisible_payment{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    to_username_hash: felt, amount: Uint256, token: felt, message_hash: felt
) {
    alloc_locals;
    ReentrancyGuard.start();
    
    let (caller) = get_caller_address();
    
    # Verify sender is registered
    let (sender_username) = user_to_username.read(caller);
    assert_not_zero(sender_username);
    
    # Get recipient address
    let (recipient) = username_to_address.read(to_username_hash);
    assert_not_zero(recipient);
    
    # Verify token is supported
    let (is_supported) = supported_tokens.read(token);
    assert is_supported = TRUE;
    
    # Check and consume gasless quota
    let (quota) = gasless_quota.read(caller);
    assert_le(1, quota);
    gasless_quota.write(caller, quota - 1);
    
    # Transfer tokens (simplified - would use ERC20 interface)
    # IERC20.transferFrom(token, caller, recipient, amount)
    
    # Add notification for recipient
    let (notification_index) = notification_count.read(recipient);
    payment_notifications.write(recipient, notification_index, sender_username, amount, 1234567890);  # timestamp
    notification_count.write(recipient, notification_index + 1);
    
    InvisiblePaymentSent.emit(caller, to_username_hash, amount, token);
    PaymentReceived.emit(recipient, sender_username, amount, token);
    
    ReentrancyGuard.end();
    return ();
}

@view
func get_payment_notifications{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    user: felt, start_index: felt, count: felt
) -> (notifications_len: felt, notifications: felt*) {
    alloc_locals;
    let (notifications) = alloc();
    let (total_count) = notification_count.read(user);
    
    # Simple implementation - would need proper loop and bounds checking
    return (total_count, notifications);
}

# ============================================================================
# YIELD FARMING INTEGRATION
# ============================================================================

@external
func deposit_to_yield{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    amount: Uint256, token: felt, strategy: felt
) {
    alloc_locals;
    ReentrancyGuard.start();
    
    let (caller) = get_caller_address();
    
    # Verify user is registered
    let (username) = user_to_username.read(caller);
    assert_not_zero(username);
    
    # Verify token is supported
    let (is_supported) = supported_tokens.read(token);
    assert is_supported = TRUE;
    
    # Update yield position
    let (current_amount, _) = yield_positions.read(caller, strategy);
    let (new_amount, _) = uint256_add(current_amount, amount);
    yield_positions.write(caller, strategy, new_amount, 1234567890);  # timestamp
    
    YieldDeposit.emit(caller, amount, strategy, 850);  # 8.5% APY
    
    ReentrancyGuard.end();
    return ();
}

@external
func withdraw_from_yield{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    amount: Uint256, strategy: felt
) {
    alloc_locals;
    ReentrancyGuard.start();
    
    let (caller) = get_caller_address();
    
    # Get current position
    let (current_amount, deposit_time) = yield_positions.read(caller, strategy);
    
    # Calculate yield earned (simplified)
    let yield_earned = Uint256(10000, 0);  # Placeholder calculation
    
    # Update position
    let (new_amount, _) = uint256_sub(current_amount, amount);
    yield_positions.write(caller, strategy, new_amount, deposit_time);
    
    # Update total earnings
    let (current_earnings) = yield_earnings.read(caller);
    let (new_earnings, _) = uint256_add(current_earnings, yield_earned);
    yield_earnings.write(caller, new_earnings);
    
    YieldWithdraw.emit(caller, amount, yield_earned);
    
    ReentrancyGuard.end();
    return ();
}

@view
func get_yield_position{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    user: felt, strategy: felt
) -> (amount: Uint256, timestamp: felt) {
    let (amount, timestamp) = yield_positions.read(user, strategy);
    return (amount, timestamp);
}

@view
func get_total_yield_earnings{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    user: felt
) -> (earnings: Uint256) {
    let (earnings) = yield_earnings.read(user);
    return (earnings,);
}

# ============================================================================
# GASLESS TRANSACTIONS (ChipiPay Integration)
# ============================================================================

@view
func get_gasless_quota{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    user: felt
) -> (remaining: felt) {
    let (remaining) = gasless_quota.read(user);
    return (remaining,);
}

@external
func refill_gasless_quota{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    user: felt, amount: felt
) {
    Ownable.assert_only_owner();
    let (current) = gasless_quota.read(user);
    gasless_quota.write(user, current + amount);
    return ();
}

# ============================================================================
# ADMIN FUNCTIONS
# ============================================================================

@external
func add_supported_token{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    token: felt
) {
    Ownable.assert_only_owner();
    supported_tokens.write(token, TRUE);
    return ();
}

@external
func pause{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() {
    Ownable.assert_only_owner();
    Pausable._pause();
    return ();
}

@external
func unpause{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() {
    Ownable.assert_only_owner();
    Pausable._unpause();
    return ();
}