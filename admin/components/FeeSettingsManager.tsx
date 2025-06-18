import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { FeeSetting, TransactionType, Currency, NetworkFeeWallet } from '../../types';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Icon from '../../components/common/Icon';
import { PlusCircle, Edit, Trash2, Settings, DollarSign, Server, Type as TypeIcon, Image, Briefcase, ChevronDown, ChevronUp, Copy } from 'lucide-react';

const FeeSettingsManager: React.FC = () => {
  const { appSettings, updateAppSettings, isLoading } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFeeSetting, setCurrentFeeSetting] = useState<Partial<FeeSetting> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPaymentOptionIndex, setEditingPaymentOptionIndex] = useState<number | null>(null);
  const [currentPaymentOption, setCurrentPaymentOption] = useState<Partial<NetworkFeeWallet> | null>(null);
  const [isPaymentOptionModalOpen, setIsPaymentOptionModalOpen] = useState(false);
  const [expandedFeeSettingId, setExpandedFeeSettingId] = useState<string | null>(null);


  const openModalForNew = () => {
    setIsEditing(false);
    setCurrentFeeSetting({
      id: `fee-${Date.now()}`,
      transactionType: TransactionType.WITHDRAWAL, // Default
      description: '',
      feeAmount: 0,
      feeCurrency: Currency.USD, // Default
      isEnabled: true,
      paymentOptions: [],
    });
    setIsModalOpen(true);
  };

  const openModalForEdit = (feeSetting: FeeSetting) => {
    setIsEditing(true);
    setCurrentFeeSetting({ ...feeSetting, paymentOptions: [...feeSetting.paymentOptions.map(opt => ({...opt}))] }); // Deep copy payment options
    setIsModalOpen(true);
  };

  const handleModalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!currentFeeSetting) return;
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setCurrentFeeSetting({ ...currentFeeSetting, [name]: (e.target as HTMLInputElement).checked });
    } else if (name === 'feeAmount') {
      setCurrentFeeSetting({ ...currentFeeSetting, [name]: parseFloat(value) || 0 });
    } else {
      setCurrentFeeSetting({ ...currentFeeSetting, [name]: value });
    }
  };

  const handleModalSubmit = () => {
    if (!currentFeeSetting || !currentFeeSetting.id || !currentFeeSetting.transactionType || !currentFeeSetting.feeCurrency) return;
    
    const finalSetting = currentFeeSetting as FeeSetting; // Assert type after checks
    let updatedFees;
    if (isEditing) {
      updatedFees = appSettings.networkFees.map(fs => fs.id === finalSetting.id ? finalSetting : fs);
    } else {
      updatedFees = [...appSettings.networkFees, finalSetting];
    }
    updateAppSettings({ ...appSettings, networkFees: updatedFees });
    setIsModalOpen(false);
    setCurrentFeeSetting(null);
  };

  const handleDeleteFeeSetting = (feeSettingId: string) => {
    if (window.confirm('Are you sure you want to delete this fee setting?')) {
      const updatedFees = appSettings.networkFees.filter(fs => fs.id !== feeSettingId);
      updateAppSettings({ ...appSettings, networkFees: updatedFees });
    }
  };
  
  // Payment Option Management
  const openPaymentOptionModalForNew = () => {
    if (!currentFeeSetting) return;
    setEditingPaymentOptionIndex(null);
    setCurrentPaymentOption({ type: 'USDT_TRC20', name: '', address: '', network: '', qrCode: '' });
    setIsPaymentOptionModalOpen(true);
  };

  const openPaymentOptionModalForEdit = (option: NetworkFeeWallet, index: number) => {
    if (!currentFeeSetting) return;
    setEditingPaymentOptionIndex(index);
    setCurrentPaymentOption({ ...option });
    setIsPaymentOptionModalOpen(true);
  };

  const handlePaymentOptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!currentPaymentOption) return;
    const { name, value } = e.target;
    setCurrentPaymentOption({ ...currentPaymentOption, [name]: value });
  };

  const handlePaymentOptionSubmit = () => {
    if (!currentPaymentOption || !currentFeeSetting || !currentPaymentOption.type || !currentPaymentOption.name || !currentPaymentOption.address || !currentPaymentOption.network) return;
    
    const finalOption = currentPaymentOption as NetworkFeeWallet;
    let updatedPaymentOptions = [...(currentFeeSetting.paymentOptions || [])];

    if (editingPaymentOptionIndex !== null) {
      updatedPaymentOptions[editingPaymentOptionIndex] = finalOption;
    } else {
      updatedPaymentOptions.push(finalOption);
    }
    setCurrentFeeSetting({ ...currentFeeSetting, paymentOptions: updatedPaymentOptions });
    setIsPaymentOptionModalOpen(false);
    setCurrentPaymentOption(null);
    setEditingPaymentOptionIndex(null);
  };

  const handleDeletePaymentOption = (index: number) => {
    if (!currentFeeSetting || !currentFeeSetting.paymentOptions) return;
    const updatedPaymentOptions = currentFeeSetting.paymentOptions.filter((_, i) => i !== index);
    setCurrentFeeSetting({ ...currentFeeSetting, paymentOptions: updatedPaymentOptions });
  };
  
  const toggleExpand = (id: string) => {
    setExpandedFeeSettingId(expandedFeeSettingId === id ? null : id);
  };

  return (
    <div className="bg-brixium-bg-light p-6 md:p-8 rounded-xl shadow-xl animate-slide-in-up">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
            <Icon name={Briefcase} className="text-brixium-purple-light mr-3" size={32} />
            <h2 className="text-2xl font-semibold text-brixium-purple-light">Network Fee Manager</h2>
        </div>
        <Button onClick={openModalForNew} variant="primary">
          <PlusCircle size={18} className="mr-2" /> Add New Fee Rule
        </Button>
      </div>

      {appSettings.networkFees.length === 0 ? (
        <p className="text-center text-brixium-gray py-8">No network fee rules configured yet.</p>
      ) : (
        <div className="space-y-4">
          {appSettings.networkFees.map(fs => (
            <div key={fs.id} className="bg-brixium-bg p-4 rounded-lg border border-brixium-gray-dark">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleExpand(fs.id)}>
                <div>
                  <h3 className="text-lg font-semibold text-white">{fs.description} <span className="text-sm text-brixium-gray">({fs.transactionType})</span></h3>
                  <p className="text-sm text-brixium-purple-light">{fs.feeAmount.toFixed(2)} {fs.feeCurrency} - {fs.isEnabled ? <span className="text-green-400">Enabled</span> : <span className="text-red-400">Disabled</span>}</p>
                </div>
                <div className="flex items-center">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openModalForEdit(fs);}} className="!p-1.5 mr-2" title="Edit Rule"><Edit size={16} /></Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteFeeSetting(fs.id);}} className="!p-1.5" title="Delete Rule"><Trash2 size={16} className="text-red-500" /></Button>
                    <Icon name={expandedFeeSettingId === fs.id ? ChevronUp : ChevronDown} size={20} className="ml-2 text-brixium-gray"/>
                </div>
              </div>
              {expandedFeeSettingId === fs.id && (
                <div className="mt-3 pt-3 border-t border-brixium-gray-dark/50">
                    <h4 className="text-md font-semibold text-brixium-gray-light mb-2">Payment Options ({fs.paymentOptions.length}):</h4>
                    {fs.paymentOptions.length > 0 ? (
                        <ul className="space-y-2 pl-2 max-h-48 overflow-y-auto">
                            {fs.paymentOptions.map((opt, idx) =>(
                                <li key={idx} className="text-xs p-2 bg-brixium-bg-light rounded border border-brixium-gray-dark/70">
                                    <p className="font-semibold text-white">{opt.name} ({opt.type === 'CUSTOM' ? opt.customTypeDetail : opt.type})</p>
                                    <div className="flex items-center">
                                        <span className="text-brixium-purple-light font-mono break-all flex-grow mr-2" title={opt.address}>{opt.address}</span>
                                        <Copy size={14} className="text-brixium-gray hover:text-white cursor-pointer" onClick={() => navigator.clipboard.writeText(opt.address)}/>
                                    </div>
                                    <p className="text-brixium-gray">Network: {opt.network}</p>
                                    {opt.qrCode && <p className="text-brixium-gray">QR: {opt.qrCode}</p>}
                                </li>
                            ))}
                        </ul>
                    ): <p className="text-xs text-brixium-gray">No payment options configured for this rule.</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal for Adding/Editing FeeSetting */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'Edit Fee Rule' : 'Add New Fee Rule'} size="lg">
        {currentFeeSetting && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <Input label="Description" name="description" value={currentFeeSetting.description || ''} onChange={handleModalChange} placeholder="e.g., Standard Withdrawal Fee" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="transactionType" className="block text-sm font-medium text-brixium-gray-light mb-1">Transaction Type</label>
                <select id="transactionType" name="transactionType" value={currentFeeSetting.transactionType} onChange={handleModalChange} className="w-full input-style">
                  <option value={TransactionType.WITHDRAWAL}>Withdrawal</option>
                  <option value={TransactionType.TRANSFER}>Transfer</option>
                </select>
              </div>
              <div>
                <label htmlFor="feeCurrency" className="block text-sm font-medium text-brixium-gray-light mb-1">Fee Currency</label>
                <select id="feeCurrency" name="feeCurrency" value={currentFeeSetting.feeCurrency} onChange={handleModalChange} className="w-full input-style">
                  {Object.values(Currency).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <Input label="Fee Amount" name="feeAmount" type="number" value={currentFeeSetting.feeAmount?.toString() || '0'} onChange={handleModalChange} icon={<DollarSign size={16}/>} />
            <div className="flex items-center">
              <input type="checkbox" id="isEnabled" name="isEnabled" checked={currentFeeSetting.isEnabled || false} onChange={handleModalChange} className="h-4 w-4 text-brixium-purple rounded focus:ring-brixium-purple" />
              <label htmlFor="isEnabled" className="ml-2 text-sm text-brixium-gray-light">Enable this fee rule</label>
            </div>

            {/* Payment Options Management */}
            <div>
              <h4 className="text-md font-semibold text-brixium-gray-light mt-4 mb-2">Payment Options for this Rule</h4>
              <Button onClick={openPaymentOptionModalForNew} size="sm" variant="secondary" className="mb-2">
                <PlusCircle size={16} className="mr-1"/> Add Payment Option
              </Button>
              {currentFeeSetting.paymentOptions && currentFeeSetting.paymentOptions.length > 0 ? (
                <ul className="space-y-2 border border-brixium-gray-dark p-2 rounded-md max-h-40 overflow-y-auto">
                  {currentFeeSetting.paymentOptions.map((opt, index) => (
                    <li key={index} className="flex justify-between items-center p-2 bg-brixium-bg rounded text-xs">
                      <div>
                        <span className="font-semibold text-white">{opt.name} ({opt.type})</span>
                        <p className="text-brixium-gray font-mono truncate" title={opt.address}>{opt.address}</p>
                      </div>
                      <div>
                        <Button variant="ghost" size="sm" onClick={() => openPaymentOptionModalForEdit(opt, index)} className="!p-1 mr-1"><Edit size={14}/></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeletePaymentOption(index)} className="!p-1"><Trash2 size={14} className="text-red-400"/></Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-xs text-brixium-gray">No payment options added yet.</p>}
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button onClick={handleModalSubmit} isLoading={isLoading} variant="primary">{isEditing ? 'Save Changes' : 'Add Rule'}</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal for Adding/Editing PaymentOption */}
      <Modal isOpen={isPaymentOptionModalOpen} onClose={() => setIsPaymentOptionModalOpen(false)} title={editingPaymentOptionIndex !== null ? 'Edit Payment Option' : 'Add Payment Option'} size="md">
        {currentPaymentOption && (
          <div className="space-y-3">
            <Input label="Display Name" name="name" value={currentPaymentOption.name || ''} onChange={handlePaymentOptionChange} icon={<TypeIcon size={16}/>} placeholder="e.g., USDT TRC20 Main"/>
            <div>
                <label htmlFor="type" className="block text-sm font-medium text-brixium-gray-light mb-1">Wallet Type</label>
                <select id="type" name="type" value={currentPaymentOption.type} onChange={handlePaymentOptionChange} className="w-full input-style">
                    <option value="USDT_TRC20">USDT (TRC20)</option>
                    <option value="TRON_TRX">TRON (TRX)</option>
                    <option value="BITCOIN_BTC">Bitcoin (BTC)</option>
                    <option value="ETHEREUM_ETH">Ethereum (ETH)</option>
                    <option value="CUSTOM">Custom</option>
                </select>
            </div>
            {currentPaymentOption.type === 'CUSTOM' && (
                 <Input label="Custom Type Detail" name="customTypeDetail" value={currentPaymentOption.customTypeDetail || ''} onChange={handlePaymentOptionChange} placeholder="e.g., Solana SPL, BEP20 USDT"/>
            )}
            <Input label="Wallet Address" name="address" value={currentPaymentOption.address || ''} onChange={handlePaymentOptionChange} icon={<Server size={16}/>}/>
            <Input label="Network Identifier" name="network" value={currentPaymentOption.network || ''} onChange={handlePaymentOptionChange} icon={<Settings size={16}/>} placeholder="e.g., TRC20, Bitcoin, ERC20"/>
            <Input label="QR Code Image URL (Optional)" name="qrCode" value={currentPaymentOption.qrCode || ''} onChange={handlePaymentOptionChange} icon={<Image size={16}/>} placeholder="e.g., /qr/my-wallet.png"/>
            <div className="flex justify-end space-x-3 pt-3">
                <Button variant="ghost" onClick={() => setIsPaymentOptionModalOpen(false)}>Cancel</Button>
                <Button onClick={handlePaymentOptionSubmit} variant="primary">{editingPaymentOptionIndex !== null ? 'Save Option' : 'Add Option'}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FeeSettingsManager;

// Add this utility style to index.html or a global CSS file if not already present
// For now, I'll rely on Tailwind's default input styling being sufficient or existing custom classes.
// .input-style {
//   width: 100%;
//   padding: 0.625rem 0.75rem; /* Equivalent to py-2.5 px-3 */
//   background-color: #1F2937; /* brixium-bg-light */
//   border: 1px solid #374151; /* brixium-gray-dark */
//   border-radius: 0.5rem; /* rounded-lg */
//   color: #F3F4F6; /* brixium-gray-light */
// }
// .input-style:focus {
//   border-color: #7C5DFA; /* brixium-purple */
//   outline: none;
//   box-shadow: 0 0 0 1px #7C5DFA; /* Equivalent to focus:ring-1 focus:ring-brixium-purple */
// }
// For select, Tailwind applies some base styles. Additional styling can be added.