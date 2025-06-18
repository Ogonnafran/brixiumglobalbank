
import React from 'react';
import TransferForm from '../components/TransferForm';
import RecentTransfersList from '../components/RecentTransfersList'; // New component

const TransfersPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <TransferForm />
      <RecentTransfersList />
    </div>
  );
};

export default TransfersPage;
    