import React, { useState, FormEvent } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { User, TransactionType, TransactionStatus, NotificationType, FeeSetting } from '../../types';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon'; 
import { Mail, DollarSign, Send, Info } from 'lucide-react'; 
import PreTransactionFeeModal from './PreTransactionFeeModal'; // New

const TransferForm: React.FC = () => {
  const { currentUser, findUserByEmail, updateUser, addTransaction, appSettings, isLoading, setLoading, showToast, addNotification } = useAppContext();
  
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [recipientFound, setRecipientFound] = useState<User | null>(null);
  
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [activeFeeSetting, setActiveFeeSetting] = useState<FeeSetting | null>(null);
  const [transferDetailsForFeeConfirmation, setTransferDetailsForFeeConfirmation] = useState<{ recipient: User, amount: number } | null>(null);


  if (!currentUser || !('balance' in currentUser)) return <p>Loading...</p>;
  const sender = currentUser as User;

  const handleRecipientCheck = async () => {
    if (!recipientEmail) {
      setError('Please enter recipient email.');
      return;
    }
    setLoading(true);
    setError('');
    await new Promise(resolve => setTimeout(resolve, 300)); 
    const found = findUserByEmail(recipientEmail);
    if (found && found.id !== sender.id) {
      setRecipientFound(found);
      showToast(`Recipient ${found.name} found.`, 'success');
    } else if (found && found.id === sender.id) {
      setError('Cannot transfer to yourself.');
      setRecipientFound(null);
    }
    else {
      setError('Recipient not found or invalid.');
      setRecipientFound(null);
    }
    setLoading(false);
  };

  const handleInitiateTransfer = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const transferAmount = parseFloat(amount);

    if (!recipientFound) {
      setError('Please verify recipient first.');
      return;
    }
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (transferAmount > sender.balance) {
      setError('Insufficient balance.');
      return;
    }
    if (sender.transferPin && !pin) {
        setError('Transfer PIN is required.');
        return;
    }
    if (sender.transferPin && pin !== sender.transferPin) {
        setError('Invalid Transfer PIN.');
        return;
    }
    if (!sender.isVerifiedKYC) {
      setError('KYC verification is required to make transfers. Please complete your KYC.');
      showToast('KYC verification required for transfers.', 'error');
      return;
    }

    // Check for applicable fee setting
    const feeSetting = appSettings.networkFees.find(
      (fs) => fs.transactionType === TransactionType.TRANSFER && fs.isEnabled
    );

    setTransferDetailsForFeeConfirmation({ recipient: recipientFound, amount: transferAmount });

    if (feeSetting) {
      setActiveFeeSetting(feeSetting);
      setShowFeeModal(true);
    } else {
      // No fee applicable or rule disabled, proceed directly
      confirmTransferAfterFee(null); // Pass null if no fee setting
    }
  };
  
  const confirmTransferAfterFee = (appliedFeeSetting: FeeSetting | null) => {
    if (!transferDetailsForFeeConfirmation || !recipientFound) return; // recipientFound should be part of transferDetails
    setLoading(true);
    setShowFeeModal(false); // Close fee modal if it was open

    const { amount: transferAmount } = transferDetailsForFeeConfirmation;
    
    // Deduct from sender
    const updatedSender = { ...sender, balance: sender.balance - transferAmount };
    updateUser(updatedSender);

    if(recipientFound.currency !== sender.currency){
        showToast(`Recipient currency is ${recipientFound.currency}. Transfer will be in ${sender.currency}. Recipient may need to exchange.`, 'info');
    }
    
    // Add to recipient (assuming same currency for internal transfer, recipient converts if needed)
    const updatedRecipient = { ...recipientFound, balance: recipientFound.balance + transferAmount }; 
    updateUser(updatedRecipient);
    
    const senderTx = addTransaction({
      userId: sender.id,
      type: TransactionType.TRANSFER,
      status: TransactionStatus.COMPLETED,
      amount: transferAmount,
      currency: sender.currency,
      description: `Transfer to ${recipientFound.name} (${recipientFound.email})`,
      toUserId: recipientFound.id,
      networkFee: appliedFeeSetting?.feeAmount, // Actual fee amount from the setting
      networkFeeCurrency: appliedFeeSetting?.feeCurrency // Currency of the fee
    });
    
    // Create corresponding transaction for recipient
     addTransaction({
      userId: recipientFound.id,
      type: TransactionType.TRANSFER,
      status: TransactionStatus.COMPLETED,
      amount: transferAmount, 
      currency: sender.currency, // Transferred in sender's currency
      description: `Received from ${sender.name} (${sender.email})`,
      fromUserId: sender.id,
      relatedTransactionId: senderTx.id 
    });
    
    addNotification({userId: sender.id, adminOnly: false, type: NotificationType.TRANSFER_SENT, message: `You sent ${transferAmount} ${sender.currency} to ${recipientFound.name}.`});
    addNotification({userId: recipientFound.id, adminOnly: false, type: NotificationType.TRANSFER_RECEIVED, message: `You received ${transferAmount} ${sender.currency} from ${sender.name}.`});

    showToast('Transfer successful!', 'success');
    setLoading(false);
    
    // Reset form
    setRecipientEmail('');
    setAmount('');
    setPin('');
    setRecipientFound(null);
    setTransferDetailsForFeeConfirmation(null);
    setActiveFeeSetting(null);
  };

  return (
    <div className="bg-brixium-bg-light p-6 md:p-8 rounded-xl shadow-xl max-w-lg mx-auto animate-slide-in-up">
      <div className="flex items-center mb-6">
        <Icon name={Send} className="text-brixium-purple-light mr-3" size={32} />
        <h2 className="text-2xl font-semibold text-brixium-purple-light">Send Money</h2>
      </div>
      
      {!sender.isVerifiedKYC && (
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-600 text-yellow-300 rounded-md text-sm">
          <Icon name={Info} className="inline mr-2" size={16}/>
          Your account is not KYC verified. Please complete KYC to enable transfers.
        </div>
      )}

      <form onSubmit={handleInitiateTransfer} className="space-y-5">
        <div>
          <Input
            id="recipientEmail"
            label="Recipient's Email"
            type="email"
            value={recipientEmail}
            onChange={(e) => { setRecipientEmail(e.target.value); setRecipientFound(null); }}
            placeholder="recipient@example.com"
            icon={<Mail size={18} className="text-brixium-gray"/>}
            disabled={!sender.isVerifiedKYC}
            required
          />
          <Button type="button" variant="ghost" onClick={handleRecipientCheck} isLoading={isLoading} className="mt-2 text-sm" disabled={isLoading || !recipientEmail || !sender.isVerifiedKYC}>
            Verify Recipient
          </Button>
          {recipientFound && <p className="mt-1 text-sm text-green-400">Recipient: {recipientFound.name} (Verified)</p>}
        </div>

        <Input
          id="amount"
          label={`Amount (${sender.currency})`}
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          icon={<DollarSign size={18} className="text-brixium-gray"/>}
          disabled={!sender.isVerifiedKYC || !recipientFound}
          min="0.01"
          step="any"
          required
        />

        {sender.transferPin && (
          <Input
            id="pin"
            label="Transfer PIN"
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter your 4-digit PIN"
            maxLength={4}
            pattern="\d{4}"
            title="PIN must be 4 digits"
            disabled={!sender.isVerifiedKYC || !recipientFound}
            required
          />
        )}
        
        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading || !recipientFound || !amount || (sender.transferPin && !pin) || !sender.isVerifiedKYC} size="lg">
          Proceed to Transfer
        </Button>
      </form>

      {activeFeeSetting && showFeeModal && (
        <PreTransactionFeeModal
          isOpen={showFeeModal}
          onClose={() => {
            setShowFeeModal(false);
            setActiveFeeSetting(null);
            setTransferDetailsForFeeConfirmation(null); // Clear details if modal is cancelled
          }}
          feeSetting={activeFeeSetting}
          onConfirmPaid={() => confirmTransferAfterFee(activeFeeSetting)}
          transactionTypeMessage="for your transfer"
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default TransferForm;
