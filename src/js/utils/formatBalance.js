/**
 * formatBalance.js
 * Helper function to format the balance for display
 */

export function formatBalance(balance) {
    // Ensure balance is a number
    const amount = parseFloat(balance);

    // Check if balance is a valid number
    if (isNaN(amount)) {
        return '$0.00';
    }

    // Format balance with two decimal places and comma separator
    return amount.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}