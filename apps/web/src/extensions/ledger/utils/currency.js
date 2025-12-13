import { ledgerApi } from '../api';

/**
 * 检查特定货币是否已启用
 * @param {string} currencyCode - 货币代码 (默认 'credits')
 * @returns {Promise<boolean>}
 */
export async function isCurrencyActive(currencyCode = 'credits') {
    try {
        // 使用公开接口检查货币状态
        const currencies = await ledgerApi.getActiveCurrencies();
        
        if (!Array.isArray(currencies)) {
            return false;
        }

        const currency = currencies.find(c => c.code === currencyCode);
        return !!(currency && currency.isActive);
    } catch (error) {
        console.error(`Failed to check status for currency ${currencyCode}`, error);
        return false;
    }
}
