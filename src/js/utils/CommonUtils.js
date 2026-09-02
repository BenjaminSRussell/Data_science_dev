const CommonUtils = {
    formatCurrency: (amount, currency = '$') => {
        return `${currency}${amount.toLocaleString()}`;
    },
    // Other utility functions...
};

export default CommonUtils;