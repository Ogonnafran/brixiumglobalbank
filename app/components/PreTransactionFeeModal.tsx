import React from 'react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import { FeeSetting } from '../../types';
import { AlertTriangle, Copy, Info } from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext'; // For showToast

interface PreTransactionFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feeSetting: FeeSetting;
  onConfirmPaid: () => void;
  transactionTypeMessage: string; // e.g., "for your transfer", "for your withdrawal"
  isLoading?: boolean;
}

const USER_TRUST_MESSAGE = "Brixium Global Bank does not hold or control your funds directly. All user wallets operate independently, and transactions require a one-time network fee. This fee is essential for maintaining the system and is not bypassable. It helps sustain and secure the platform.";
const FEE_PAYMENT_NOTICE = "This transaction requires a one-time network fee to be paid. Please send the exact amount to one of the addresses shown below. This allows the app to process your transaction securely. Ensure you are sending the correct cryptocurrency to the correct network.";


const PreTransactionFeeModal: React.FC<PreTransactionFeeModalProps> = ({
  isOpen,
  onClose,
  feeSetting,
  onConfirmPaid,
  transactionTypeMessage,
  isLoading
}) => {
  const { showToast } = useAppContext();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Address copied to clipboard!', 'info');
    }).catch(err => {
        showToast('Failed to copy address.', 'error');
        console.error('Failed to copy: ', err);
    });
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Network Fee Required ${transactionTypeMessage}`} size="lg">
      <div className="space-y-4 text-brixium-gray-light max-h-[80vh] overflow-y-auto pr-1">
        <div className="p-3 bg-yellow-500/10 border border-yellow-600/50 rounded-md">
            <div className="flex items-start">
                <Icon name={AlertTriangle} className="text-yellow-400 mr-2 shrink-0 mt-0.5" size={20}/>
                <p className="text-sm text-yellow-300">{FEE_PAYMENT_NOTICE}</p>
            </div>
        </div>

        <div className="text-center my-3">
          <p className="text-sm">Fee Amount:</p>
          <p className="text-3xl font-bold text-brixium-purple-light">
            {feeSetting.feeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {feeSetting.feeCurrency}
          </p>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 py-1 bg-brixium-bg p-3 rounded-md border border-brixium-gray-dark">
          <p className="text-sm font-semibold text-white mb-1">Pay to one of these addresses:</p>
          {feeSetting.paymentOptions.map((wallet) => (
            <div key={wallet.address + wallet.name} className="p-3 bg-brixium-bg-light rounded border border-brixium-gray-dark/70 text-xs">
              <p className="font-semibold text-white">{wallet.name} ({wallet.type === 'CUSTOM' ? wallet.customTypeDetail : wallet.type})</p>
              <div className="flex items-center justify-between mt-0.5">
                  <span className="font-mono break-all text-brixium-purple-light flex-grow mr-2" title={wallet.address}>{wallet.address}</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(wallet.address)} className="!p-1 shrink-0" title="Copy Address">
                      <Copy size={14}/>
                  </Button>
              </div>
              <p className="text-brixium-gray mt-0.5">Network: {wallet.network}</p>
              {wallet.qrCode && (
                <div className="mt-1">
                    <img src={wallet.qrCode} alt={`${wallet.name} QR Code`} className="w-20 h-20 border border-brixium-gray rounded"/>
                </div>
              )}
            </div>
          ))}
          {feeSetting.paymentOptions.length === 0 && <p className="text-xs text-center text-brixium-gray py-2">No payment addresses configured by admin for this fee.</p>}
        </div>
        
        <div className="mt-4 p-3 bg-brixium-bg border border-brixium-gray-dark/50 rounded-md">
             <div className="flex items-start">
                <Icon name={Info} className="text-blue-400 mr-2 shrink-0 mt-0.5" size={18}/>
                <p className="text-xs text-blue-300">{USER_TRUST_MESSAGE}</p>
            </div>
        </div>


        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6 pt-4 border-t border-brixium-gray-dark">
          <Button variant="secondary" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto">Cancel</Button>
          <Button 
            variant="primary" 
            onClick={onConfirmPaid} 
            isLoading={isLoading}
            disabled={isLoading || feeSetting.paymentOptions.length === 0}
            className="w-full sm:w-auto"
          >
            I Have Paid The Fee
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PreTransactionFeeModal;