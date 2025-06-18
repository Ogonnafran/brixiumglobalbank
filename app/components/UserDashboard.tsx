
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import { User, Transaction, TransactionType } from '../../types';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import { ArrowRight, Send, Repeat, Landmark, ShieldCheck, DollarSign, TrendingUp, TrendingDown, Clock } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; currency?: string }> = ({ title, value, icon, currency }) => (
  <div className="bg-brixium-bg-light p-4 sm:p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-lg font-semibold text-brixium-purple-light">{title}</h3>
      {icon}
    </div>
    <p className="text-2xl sm:text-3xl font-bold text-white">
      {typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value}
      {currency && <span className="text-lg sm:text-xl ml-1 text-brixium-gray">{currency}</span>}
    </p>
  </div>
);

const TransactionItem: React.FC<{ tx: Transaction }> = ({ tx }) => {
  const { findUserById, currentUser } = useAppContext(); // Added currentUser
  const currentAppUser = currentUser as User; // Assuming currentUser is User type here
  const isCredit = tx.type === TransactionType.DEPOSIT || (tx.type === TransactionType.TRANSFER && tx.toUserId === currentAppUser?.id);
  const isDebit = tx.type === TransactionType.WITHDRAWAL || (tx.type === TransactionType.TRANSFER && tx.fromUserId === currentAppUser?.id) || tx.type === TransactionType.FEE;
  
  let description = tx.description;
  if(tx.type === TransactionType.TRANSFER){
      if(isCredit && tx.fromUserId){
          const sender = findUserById(tx.fromUserId);
          description = `From ${sender ? sender.name : 'Unknown User'}`;
      } else if (isDebit && tx.toUserId){
          const receiver = findUserById(tx.toUserId);
          description = `To ${receiver ? receiver.name : 'Unknown User'}`;
      }
  }

  return (
    <li className="py-4 px-2 flex justify-between items-center border-b border-brixium-gray-dark/30 hover:bg-brixium-purple/10 transition-colors">
      <div className="flex items-center min-w-0"> {/* Added min-w-0 for truncation */}
        <div className={`mr-3 p-2 rounded-full shrink-0 ${isCredit ? 'bg-green-500/20 text-green-400' : isDebit ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
          {isCredit ? <TrendingUp size={20} /> : isDebit ? <TrendingDown size={20} /> : <Clock size={20} />}
        </div>
        <div className="min-w-0"> {/* Added min-w-0 for truncation */}
          <p className="text-sm font-medium text-white truncate">{tx.type} - {description}</p>
          <p className="text-xs text-brixium-gray">{new Date(tx.date).toLocaleString()}</p>
        </div>
      </div>
      <p className={`text-sm font-semibold whitespace-nowrap pl-2 ${isCredit ? 'text-green-400' : isDebit ? 'text-red-400' : 'text-blue-400'}`}>
        {isCredit ? '+' : isDebit ? '-' : ''}
        {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {tx.currency}
      </p>
    </li>
  );
};

const UserDashboard: React.FC = () => {
  const { currentUser, getUserTransactions, appSettings } = useAppContext();
  const navigate = useNavigate();

  if (!currentUser || !('balance' in currentUser)) return <p>Loading user data...</p>; // Should be User type
  const user = currentUser as User;
  const recentTransactions = getUserTransactions(user.id).slice(0, 5);

  const quickActions = [
    { label: 'Send Money', icon: Send, path: '/app/transfers' },
    { label: 'Exchange Currency', icon: Repeat, path: '/app/exchange' },
    { label: 'Withdraw Funds', icon: Landmark, path: '/app/withdrawals' },
    { label: 'KYC Verification', icon: ShieldCheck, path: '/app/kyc', highlight: !user.isVerifiedKYC },
  ];

  return (
    <div className="space-y-8 animate-slide-in-up">
      {/* Balance and KYC Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          title="Account Balance" 
          value={user.balance} 
          currency={user.currency}
          icon={<DollarSign size={28} className="text-green-400" />} 
        />
        <StatCard 
          title="KYC Status" 
          value={user.isVerifiedKYC ? 'Verified' : 'Not Verified'}
          icon={user.isVerifiedKYC ? <ShieldCheck size={28} className="text-green-400" /> : <ShieldCheck size={28} className="text-yellow-400" />}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-brixium-purple-light mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(action => (
            <Button 
              key={action.label} 
              variant="secondary" 
              className={`w-full h-full flex-col justify-center items-center p-4 !bg-brixium-bg-light !text-brixium-gray-light hover:!bg-brixium-purple/30 ${action.highlight ? 'ring-2 ring-yellow-400' : 'border-brixium-gray-dark'}`}
              onClick={() => navigate(action.path)}
            >
              <Icon name={action.icon} className={`mb-2 ${action.highlight ? 'text-yellow-400' : 'text-brixium-purple-light'}`} size={28}/>
              <span className="text-sm">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-brixium-purple-light">Recent Activity</h2>
            {recentTransactions.length > 0 && (
                 <Button variant="ghost" size="sm" onClick={() => navigate('/app/transactions')}> {/* Assuming a transactions page exists */}
                    View All <ArrowRight size={16} className="ml-1" />
                </Button>
            )}
        </div>
        {recentTransactions.length > 0 ? (
          <ul className="bg-brixium-bg-light rounded-xl shadow-lg p-2 divide-y divide-brixium-gray-dark/20">
            {recentTransactions.map(tx => <TransactionItem key={tx.id} tx={tx} />)}
          </ul>
        ) : (
          <p className="text-brixium-gray text-center py-6 bg-brixium-bg-light rounded-xl">No recent transactions.</p>
        )}
      </div>
       {appSettings.maintenanceMode && (
        <div className="bg-yellow-500/20 border border-yellow-600 text-yellow-300 p-4 rounded-lg text-center">
            <p className="font-semibold">Maintenance Mode Active</p>
            <p className="text-sm">Some services may be temporarily unavailable or delayed.</p>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;