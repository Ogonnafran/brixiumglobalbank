import React, { useState, FormEvent, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { AppSettings, Currency } from '../../types';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import { Settings, List, DollarSign } from 'lucide-react';

const SystemSettingsForm: React.FC = () => {
  const { appSettings, updateAppSettings, isLoading, setLoading } = useAppContext();
  const [currentSettings, setCurrentSettings] = useState<Pick<AppSettings, 'supportedCurrencies' | 'maintenanceMode' | 'defaultUserCurrency'>>(appSettings);

  useEffect(() => {
    setCurrentSettings({
        supportedCurrencies: appSettings.supportedCurrencies,
        maintenanceMode: appSettings.maintenanceMode,
        defaultUserCurrency: appSettings.defaultUserCurrency
    });
  }, [appSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setCurrentSettings(prev => ({ ...prev, [name]: checked }));
    } else if (name === "supportedCurrencies") {
        const options = (e.target as HTMLSelectElement).options;
        const selectedCurrencies: Currency[] = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedCurrencies.push(options[i].value as Currency);
            }
        }
        setCurrentSettings(prev => ({ ...prev, supportedCurrencies: selectedCurrencies }));
    } else {
        setCurrentSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    // Merge with existing networkFees from appSettings to not overwrite them
    updateAppSettings({ 
        ...appSettings, // Preserve existing full settings like networkFees
        ...currentSettings // Apply changes from this form
    });
    setLoading(false);
  };

  return (
    <div className="bg-brixium-bg-light p-6 md:p-8 rounded-xl shadow-xl max-w-xl mx-auto animate-slide-in-up">
      <div className="flex items-center mb-8">
        <Icon name={Settings} className="text-brixium-purple-light mr-3" size={32} />
        <h2 className="text-2xl font-semibold text-brixium-purple-light">General System Settings</h2>
      </div>
      <p className="text-sm text-brixium-gray mb-6">Manage basic platform settings here. Network fee configurations are handled in the "Network Fee Manager" section.</p>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Supported Currencies */}
        <div>
          <label htmlFor="supportedCurrencies" className="block text-sm font-medium text-brixium-gray-light mb-1">
            Supported Currencies (Ctrl/Cmd + Click to select multiple)
          </label>
          <div className="relative">
            <Icon name={List} size={18} className="text-brixium-gray absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
            <select
                multiple
                id="supportedCurrencies"
                name="supportedCurrencies"
                value={currentSettings.supportedCurrencies}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2.5 bg-brixium-bg border border-brixium-gray-dark focus:border-brixium-purple focus:ring-brixium-purple rounded-lg text-brixium-gray-light placeholder-brixium-gray focus:outline-none focus:ring-1 sm:text-sm h-32"
            >
                {Object.values(Currency).map(curr => (
                <option key={curr} value={curr}>{curr}</option>
                ))}
            </select>
          </div>
        </div>
        
        {/* Default User Currency on Signup */}
         <div>
          <label htmlFor="defaultUserCurrency" className="block text-sm font-medium text-brixium-gray-light mb-1">
            Default Currency for New Users
          </label>
          <div className="relative">
            <Icon name={DollarSign} size={18} className="text-brixium-gray absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
            <select
              id="defaultUserCurrency"
              name="defaultUserCurrency"
              value={currentSettings.defaultUserCurrency}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2.5 bg-brixium-bg border border-brixium-gray-dark focus:border-brixium-purple focus:ring-brixium-purple rounded-lg text-brixium-gray-light focus:outline-none focus:ring-1 sm:text-sm"
            >
              {currentSettings.supportedCurrencies.map(curr => ( // Only list from currently supported
                <option key={curr} value={curr}>{curr}</option>
              ))}
              {!currentSettings.supportedCurrencies.includes(currentSettings.defaultUserCurrency) && (
                  <option key={currentSettings.defaultUserCurrency} value={currentSettings.defaultUserCurrency}>{currentSettings.defaultUserCurrency} (Not in supported list)</option>
              )}
            </select>
          </div>
          {!currentSettings.supportedCurrencies.includes(currentSettings.defaultUserCurrency) && 
            <p className="text-xs text-yellow-400 mt-1">Warning: Default currency is not in the list of supported currencies. Add it to the list above.</p>
          }
        </div>

        {/* Maintenance Mode */}
        <div>
          <label className="block text-sm font-medium text-brixium-gray-light mb-2">Maintenance Mode</label>
          <button
            type="button"
            name="maintenanceMode"
            onClick={() => setCurrentSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brixium-purple focus:ring-offset-2 focus:ring-offset-brixium-bg-light ${
              currentSettings.maintenanceMode ? 'bg-brixium-purple' : 'bg-brixium-gray-dark'
            }`}
            aria-pressed={currentSettings.maintenanceMode}
          >
            <span className="sr-only">Toggle Maintenance Mode</span>
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${
                currentSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`ml-3 text-sm font-medium ${currentSettings.maintenanceMode ? 'text-yellow-400' : 'text-green-400'}`}>
            {currentSettings.maintenanceMode ? 'ENABLED' : 'DISABLED'}
          </span>
          <p className="text-xs text-brixium-gray mt-1">
            When enabled, certain user-facing features may be restricted.
          </p>
        </div>

        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading} size="lg">
          Save General Settings
        </Button>
      </form>
    </div>
  );
};

export default SystemSettingsForm;