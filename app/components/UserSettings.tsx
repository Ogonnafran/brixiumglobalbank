import React, { useState, FormEvent, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { User, Currency } from '../../types';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import { Settings, Bell, LockKeyhole, DollarSign, Repeat, Info } from 'lucide-react'; 

const USER_TRUST_MESSAGE = "Brixium Global Bank does not hold or control your funds directly. All user wallets operate independently, and transactions may require a one-time network fee. This fee is essential for maintaining the system and is not bypassable. It helps sustain and secure the platform.";

const UserSettings: React.FC = () => {
  const { currentUser, updateUser, isLoading, setLoading, showToast, appSettings } = useAppContext();
  
  if (!currentUser || !('balance' in currentUser)) { 
    return <p>Loading user settings...</p>;
  }
  const user = currentUser as User;

  const [accountCurrency, setAccountCurrency] = useState<Currency>(user.currency);
  const [enableTransferPin, setEnableTransferPin] = useState<boolean>(!!user.transferPin);
  const [transferPin, setTransferPin] = useState<string>(user.transferPin || '');
  const [confirmTransferPin, setConfirmTransferPin] = useState<string>(user.transferPin || '');
  const [enableNotifications, setEnableNotifications] = useState<boolean>(true); 
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
        setAccountCurrency(user.currency);
        setEnableTransferPin(!!user.transferPin);
        setTransferPin(user.transferPin || '');
        setConfirmTransferPin(user.transferPin || '');
    }
  }, [user]);

  const handleSettingsUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (enableTransferPin && (!transferPin || transferPin.length !== 4 || !/^\d{4}$/.test(transferPin))) {
      setError('Transfer PIN must be 4 digits.');
      return;
    }
    if (enableTransferPin && transferPin !== confirmTransferPin) {
      setError('Transfer PINs do not match.');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    const updatedUserData: Partial<User> = {
        currency: accountCurrency,
        transferPin: enableTransferPin ? transferPin : undefined,
    };

    updateUser({ ...user, ...updatedUserData });
    showToast('Settings updated successfully!', 'success');
    setLoading(false);
  };

  return (
    <div className="bg-brixium-bg-light p-6 md:p-8 rounded-xl shadow-xl max-w-lg mx-auto animate-slide-in-up">
      <div className="flex items-center mb-8">
        <Icon name={Settings} className="text-brixium-purple-light mr-3" size={32} />
        <h2 className="text-2xl font-semibold text-brixium-purple-light">Account Settings</h2>
      </div>
      <form onSubmit={handleSettingsUpdate} className="space-y-8">
        {/* Account Currency Setting */}
        <div>
          <h3 className="text-lg font-medium text-white mb-2 flex items-center">
            <Icon name={DollarSign} className="text-brixium-purple-light mr-2" size={20} /> Account Currency
          </h3>
          <p className="text-sm text-brixium-gray mb-1">This is your main account currency.</p>
          <p className="text-xs text-brixium-gray mb-3">
            Current balance: {user.balance.toFixed(2)} {user.currency}.
            Changing currency here updates your account's denomination. Use the <Icon name={Repeat} size={12} className="inline mx-0.5"/> <strong>Exchange</strong> page to convert your balance.
          </p>
          <select
            id="accountCurrency"
            name="accountCurrency"
            value={accountCurrency}
            onChange={(e) => setAccountCurrency(e.target.value as Currency)}
            className="w-full px-3 py-2.5 bg-brixium-bg border border-brixium-gray-dark focus:border-brixium-purple focus:ring-brixium-purple rounded-lg text-brixium-gray-light placeholder-brixium-gray focus:outline-none focus:ring-1 sm:text-sm"
          >
            {appSettings.supportedCurrencies.map(curr => (
              <option key={curr} value={curr}>{curr}</option>
            ))}
          </select>
        </div>

        {/* Transfer PIN Setting */}
        <div>
          <h3 className="text-lg font-medium text-white mb-2 flex items-center">
            <Icon name={LockKeyhole} className="text-brixium-purple-light mr-2" size={20} /> Transfer PIN
          </h3>
          <div className="flex items-center space-x-3 mb-3">
            <input
              type="checkbox"
              id="enableTransferPin"
              checked={enableTransferPin}
              onChange={(e) => {
                setEnableTransferPin(e.target.checked);
                if (!e.target.checked) {
                    setTransferPin('');
                    setConfirmTransferPin('');
                }
              }}
              className="h-5 w-5 rounded text-brixium-purple bg-brixium-bg-light border-brixium-gray-dark focus:ring-brixium-purple focus:ring-offset-brixium-bg-light"
            />
            <label htmlFor="enableTransferPin" className="text-sm text-brixium-gray-light">Enable Transfer PIN for added security</label>
          </div>
          {enableTransferPin && (
            <div className="space-y-4 pl-8 border-l-2 border-brixium-purple/30">
              <Input
                id="transferPin"
                label="Set 4-Digit PIN"
                type="password" 
                value={transferPin}
                onChange={(e) => setTransferPin(e.target.value)}
                maxLength={4}
                placeholder="••••"
                pattern="\d{4}"
                title="PIN must be 4 digits"
              />
              <Input
                id="confirmTransferPin"
                label="Confirm 4-Digit PIN"
                type="password"
                value={confirmTransferPin}
                onChange={(e) => setConfirmTransferPin(e.target.value)}
                maxLength={4}
                placeholder="••••"
                pattern="\d{4}"
              />
            </div>
          )}
        </div>

        {/* Notification Preferences */}
        <div>
          <h3 className="text-lg font-medium text-white mb-2 flex items-center">
            <Icon name={Bell} className="text-brixium-purple-light mr-2" size={20} /> Notification Preferences
          </h3>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="enableNotifications"
              checked={enableNotifications}
              onChange={(e) => setEnableNotifications(e.target.checked)}
              className="h-5 w-5 rounded text-brixium-purple bg-brixium-bg-light border-brixium-gray-dark focus:ring-brixium-purple focus:ring-offset-brixium-bg-light"
            />
            <label htmlFor="enableNotifications" className="text-sm text-brixium-gray-light">Receive real-time notifications</label>
          </div>
          <p className="text-xs text-brixium-gray mt-1 pl-8">Control alerts for KYC, withdrawals, transfers, and admin messages.</p>
        </div>
        
        {error && <p className="text-sm text-red-400 mt-4 text-center">{error}</p>}

        <Button type="submit" variant="primary" className="w-full mt-8" isLoading={isLoading} disabled={isLoading} size="lg">
          Save Settings
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-brixium-gray-dark">
        <h3 className="text-lg font-medium text-white mb-2 flex items-center">
            <Icon name={Info} className="text-blue-400 mr-2" size={20} /> Important Information
        </h3>
        <p className="text-sm text-brixium-gray-light">{USER_TRUST_MESSAGE}</p>
      </div>

    </div>
  );
};

export default UserSettings;
