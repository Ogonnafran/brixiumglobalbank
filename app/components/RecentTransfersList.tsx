import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { TransactionType, User } from '../../types';
import { ArrowRightLeft, TrendingUp, TrendingDown } from 'lucide-react';
import Icon from '../../components/common/Icon';

const RecentTransfersList: React.FC = () => {
  const { currentUser, getUserTransactions, findUserById } = useAppContext();

  if (!currentUser || !('balance' in currentUser)) return null;
  const user = currentUser as User;

  const transferTransactions = getUserTransactions(user.id)
    .filter(tx => tx.type === TransactionType.TRANSFER)
    .slice(0, 10); 

  if (transferTransactions.length === 0) {
    return (
      <div className="mt-8 bg-brixium-bg-light p-6 rounded-xl shadow-xl max-w-lg mx-auto text-center">
        <Icon name={ArrowRightLeft} className="text-brixium-gray mx-auto mb-2" size={32}/>
        <p className="text-brixium-gray">No recent transfer history.</p>
      </div>
    );
  }

  return (
    <div className="mt-12 bg-brixium-bg-light p-6 md:p-8 rounded-xl shadow-xl max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <Icon name={ArrowRightLeft} className="text-brixium-purple-light mr-3" size={28} />
        <h3 className="text-xl font-semibold text-brixium-purple-light">Recent Transfers</h3>
      </div>
      <ul className="divide-y divide-brixium-gray-dark/50">
        {transferTransactions.map(tx => {
          const isSent = tx.userId === user.id;
          const otherPartyId = isSent ? tx.toUserId : tx.fromUserId;
          const otherParty = otherPartyId ? findUserById(otherPartyId) : null;
          const otherPartyName = otherParty ? otherParty.name : 'Unknown User';

          return (
            <li key={tx.id} className="py-4 flex justify-between items-center">
              <div className="flex items-center">
                <div className={`mr-3 p-1.5 rounded-full ${isSent ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                    {isSent ? <TrendingDown size={18}/> : <TrendingUp size={18}/>}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {isSent ? `Sent to ${otherPartyName}` : `Received from ${otherPartyName}`}
                  </p>
                  <p className="text-xs text-brixium-gray">{new Date(tx.date).toLocaleString()}</p>
                </div>
              </div>
              <p className={`text-sm font-semibold ${isSent ? 'text-red-400' : 'text-green-400'}`}>
                {isSent ? '-' : '+'}
                {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {tx.currency}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RecentTransfersList;