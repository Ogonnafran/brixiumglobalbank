import React, { useState, useEffect, FormEvent } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Currency, User } from '../../types';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import { Repeat, DollarSign, ArrowRightLeft } from 'lucide-react'; // Changed ArrowRight to ArrowRightLeft for swap

const CurrencyExchange: React.FC = () => {
  const { currentUser, appSettings, getExchangeRate, performExchange, isLoading, setLoading, showToast } = useAppContext();

  if (!currentUser || !('balance' in currentUser)) return <p>Loading...</p>; // Ensure currentUser is User
  const user = currentUser as User;

  const [fromCurrency, setFromCurrency] = useState<Currency>(user.currency);
  // Initialize toCurrency to a different currency than the user's current one
  const initialToCurrency = appSettings.supportedCurrencies.find(c => c !== user.currency) || (appSettings.supportedCurrencies.length > 1 ? appSettings.supportedCurrencies[1] : appSettings.supportedCurrencies[0]);
  const [toCurrency, setToCurrency] = useState<Currency>(initialToCurrency);
  
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState<number | null>(null);
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Update 'fromCurrency' if user's account currency changes (e.g., after an exchange)
    setFromCurrency(user.currency);
    
    // If 'toCurrency' becomes the same as the new 'fromCurrency', pick another valid 'toCurrency'
    if (toCurrency === user.currency) {
      const newTo = appSettings.supportedCurrencies.find(c => c !== user.currency);
      if (newTo) {
        setToCurrency(newTo);
      } else if (appSettings.supportedCurrencies.length > 0) {
        // Fallback if no different currency is found (should not happen if multiple currencies are supported)
        setToCurrency(appSettings.supportedCurrencies[0]);
      }
    }
  }, [user.currency, appSettings.supportedCurrencies, toCurrency]);


  useEffect(() => {
    if (fromCurrency && toCurrency && fromCurrency !== toCurrency) {
      const rate = getExchangeRate(fromCurrency, toCurrency);
      setCurrentRate(rate);
      if (fromAmount && rate > 0) {
        const numericFromAmount = parseFloat(fromAmount);
        if (!isNaN(numericFromAmount)) {
          setToAmount(numericFromAmount * rate);
        } else {
          setToAmount(null);
        }
      } else {
        setToAmount(null);
      }
    } else if (fromCurrency === toCurrency) {
        setCurrentRate(1); // Rate is 1 if currencies are the same
        const numericFromAmount = parseFloat(fromAmount);
        if(!isNaN(numericFromAmount)) setToAmount(numericFromAmount); else setToAmount(null);
    } else {
        setCurrentRate(null);
        setToAmount(null);
    }
  }, [fromCurrency, toCurrency, fromAmount, getExchangeRate]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFromAmount(value);
    setError('');
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && currentRate && currentRate > 0) {
      setToAmount(numericValue * currentRate);
    } else if (value === '') {
        setToAmount(null);
    } else {
      setToAmount(null); // Or handle invalid input message
    }
  };
  
  const handleSwapCurrencies = () => {
    // 'fromCurrency' is fixed as user's account currency.
    // So, this button will cycle through available 'toCurrency' options.
    const availableToCurrencies = appSettings.supportedCurrencies.filter(c => c !== fromCurrency);
    if (availableToCurrencies.length === 0) return; // No other currency to swap to

    const currentIndex = availableToCurrencies.indexOf(toCurrency);
    const nextIndex = (currentIndex + 1) % availableToCurrencies.length;
    setToCurrency(availableToCurrencies[nextIndex]);
  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const numericFromAmount = parseFloat(fromAmount);

    if (isNaN(numericFromAmount) || numericFromAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (numericFromAmount > user.balance) {
      setError('Insufficient balance.');
      return;
    }
    if (fromCurrency === toCurrency) {
      setError('Cannot exchange to the same currency.');
      return;
    }
    if (!currentRate || currentRate <= 0) {
      setError('Exchange rate not available. Please try again later.');
      return;
    }
    if (!user.isVerifiedKYC) {
      setError('KYC verification is required for currency exchange.');
      showToast('KYC verification required.', 'error');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 700));
    const success = performExchange(user.id, fromCurrency, toCurrency, numericFromAmount);
    if (success) {
      setFromAmount('');
      // setToAmount(null); // Context update will refresh user.currency and amounts
    }
    setLoading(false);
  };

  return (
    <div className="bg-brixium-bg-light p-6 md:p-8 rounded-xl shadow-xl max-w-lg mx-auto animate-slide-in-up">
      <div className="flex items-center mb-6">
        <Icon name={Repeat} className="text-brixium-purple-light mr-3" size={32} />
        <h2 className="text-2xl font-semibold text-brixium-purple-light">Currency Exchange</h2>
      </div>
      <p className="mb-4 text-sm text-brixium-gray">Your current account currency is <strong className="text-white">{user.currency}</strong>.</p>
      
      {!user.isVerifiedKYC && (
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-600 text-yellow-300 rounded-md text-sm">
          KYC verification is required to use the exchange service.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
            <label className="block text-sm font-medium text-brixium-gray-light mb-1">From Currency</label>
            <div className="p-3 bg-brixium-bg rounded-lg border border-brixium-gray-dark text-white">
                {user.currency} (Your account balance: {user.balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})})
            </div>
        </div>

        <Input
          id="fromAmount"
          label={`Amount to Exchange (${user.currency})`}
          type="number"
          value={fromAmount}
          onChange={handleAmountChange}
          placeholder="0.00"
          icon={<DollarSign size={18} className="text-brixium-gray"/>}
          disabled={!user.isVerifiedKYC || isLoading}
          min="0.01"
          step="any"
          required
        />
        
        <div className="flex items-center justify-center my-2">
            <Button 
                type="button" 
                onClick={handleSwapCurrencies} 
                variant="ghost" 
                size="sm" 
                className="p-2" 
                title="Change 'To' Currency"
                disabled={!user.isVerifiedKYC || isLoading || appSettings.supportedCurrencies.filter(c => c !== fromCurrency).length < 1}
            >
                <ArrowRightLeft size={20} className="text-brixium-purple-light" />
            </Button>
        </div>

        <div>
          <label htmlFor="toCurrency" className="block text-sm font-medium text-brixium-gray-light mb-1">
            To Currency
          </label>
          <select
            id="toCurrency"
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value as Currency)}
            className="w-full px-3 py-2.5 bg-brixium-bg-light border border-brixium-gray-dark focus:border-brixium-purple focus:ring-brixium-purple rounded-lg text-brixium-gray-light placeholder-brixium-gray focus:outline-none focus:ring-1 sm:text-sm"
            disabled={!user.isVerifiedKYC || isLoading}
            required
          >
            {appSettings.supportedCurrencies.filter(c => c !== fromCurrency).map(curr => (
              <option key={curr} value={curr}>{curr}</option>
            ))}
            {appSettings.supportedCurrencies.filter(c => c !== fromCurrency).length === 0 && <option value="">No other currencies available</option>}
          </select>
        </div>

        {currentRate !== null && fromCurrency !== toCurrency && (
          <div className="p-3 bg-brixium-bg rounded-lg border border-brixium-gray-dark/50 text-sm">
            <p className="text-brixium-gray">Exchange Rate:</p>
            <p className="text-white font-semibold">1 {fromCurrency} = {currentRate.toFixed(4)} {toCurrency}</p>
          </div>
        )}

        {toAmount !== null && fromCurrency !== toCurrency && (
          <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30 text-sm">
            <p className="text-brixium-gray">You will receive approximately:</p>
            <p className="text-xl font-bold text-green-400">{toAmount.toFixed(2)} {toCurrency}</p>
          </div>
        )}
        
        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button 
          type="submit" 
          variant="primary" 
          className="w-full" 
          isLoading={isLoading} 
          disabled={isLoading || !fromAmount || !toAmount || fromCurrency === toCurrency || !user.isVerifiedKYC || (appSettings.supportedCurrencies.filter(c => c !== fromCurrency).length === 0)} 
          size="lg"
        >
          Exchange Now
        </Button>
      </form>
      <p className="mt-4 text-xs text-center text-brixium-gray">
        Note: Exchanging currency will change your account's primary currency and convert your entire balance. Rates are indicative.
      </p>
    </div>
  );
};

export default CurrencyExchange;
