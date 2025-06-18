
import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { TransactionStatus, KYCStatus, Currency } from '../../types'; 
import Icon from '../../components/common/Icon';
import { Users, DollarSign, FileText, Send, AlertTriangle, LucideIcon } from 'lucide-react'; 
import { MOCK_EXCHANGE_RATES } from '../../constants';


interface StatCardProps {
  title: string;
  value: string | number;
  iconName: LucideIcon; 
  colorClass: string; 
  bgColorClass: string; 
  unit?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, iconName, colorClass, bgColorClass, unit }) => (
  <div className={`p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300 ${bgColorClass}`}>
    <div className="flex items-center justify-between mb-2">
      <h3 className={`text-lg font-semibold ${colorClass}`}>{title}</h3>
      <Icon name={iconName} className={colorClass} size={28} />
    </div>
    <p className="text-3xl font-bold text-white">
      {typeof value === 'number' ? value.toLocaleString() : value}
      {unit && <span className="text-xl ml-1 text-brixium-gray">{unit}</span>}
    </p>
  </div>
);


const AdminDashboardSummary: React.FC = () => {
  const { users, transactions, kycRequests, withdrawalRequests, appSettings } = useAppContext();

  const totalUsers = users.length;
  
  const platformBalanceUSD = users.reduce((sum, user) => {
    let balanceInUSD = user.balance;
    if (user.currency !== Currency.USD) {
      const rate = MOCK_EXCHANGE_RATES[user.currency]?.[Currency.USD] || 0; 
      balanceInUSD = user.balance * rate;
    }
    return sum + balanceInUSD;
  }, 0);

  const pendingKYC = kycRequests.filter(k => k.status === KYCStatus.PENDING).length;
  const pendingWithdrawals = withdrawalRequests.filter(w => w.status === TransactionStatus.PENDING).length;
  const activeFeeRulesCount = appSettings.networkFees.filter(fee => fee.isEnabled).length;

  return (
    <div className="space-y-8 animate-slide-in-up">
      <h2 className="text-2xl font-semibold text-brixium-purple-light">Platform Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={totalUsers} iconName={Users} colorClass="text-blue-400" bgColorClass="bg-blue-500/10" />
        <StatCard title="Platform Balance (Est. USD)" value={platformBalanceUSD.toFixed(0)} iconName={DollarSign} colorClass="text-green-400" bgColorClass="bg-green-500/10" unit="USD"/>
        <StatCard title="Pending KYC" value={pendingKYC} iconName={FileText} colorClass="text-yellow-400" bgColorClass="bg-yellow-500/10" />
        <StatCard title="Pending Withdrawals" value={pendingWithdrawals} iconName={Send} colorClass="text-orange-400" bgColorClass="bg-orange-500/10" />
      </div>
      {appSettings.maintenanceMode && (
        <div className="mt-6 p-4 bg-yellow-600/30 border border-yellow-500 rounded-lg text-yellow-200 flex items-center">
            <Icon name={AlertTriangle} className="mr-3" size={24}/>
            <p><strong>Attention:</strong> The system is currently in <strong>Maintenance Mode</strong>. User-facing services might be affected.</p>
        </div>
      )}
       <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-brixium-bg-light p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-brixium-purple-light mb-4">Quick Stats</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>Total Transactions Logged:</span> <span className="font-semibold text-white">{transactions.length}</span></li>
            <li className="flex justify-between"><span>Approved KYC Requests:</span> <span className="font-semibold text-white">{kycRequests.filter(k => k.status === KYCStatus.APPROVED).length}</span></li>
            <li className="flex justify-between"><span>Completed Withdrawals:</span> <span className="font-semibold text-white">{withdrawalRequests.filter(w => w.status === TransactionStatus.COMPLETED).length}</span></li>
            <li className="flex justify-between"><span>Supported Currencies:</span> <span className="font-semibold text-white">{appSettings.supportedCurrencies.join(', ')}</span></li>
            <li className="flex justify-between"><span>Active Fee Rules:</span> <span className="font-semibold text-white">{activeFeeRulesCount}</span></li>
          </ul>
        </div>
        <div className="bg-brixium-bg-light p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-brixium-purple-light mb-4">System Health</h3>
            <div className="space-y-3">
                <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded-full mr-2 shrink-0"></div> API Services: Operational</div>
                <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded-full mr-2 shrink-0"></div> Database Connectivity: Nominal</div>
                <div className={`flex items-center ${appSettings.maintenanceMode ? 'text-yellow-400' : 'text-green-400'}`}>
                    <div className={`w-3 h-3 ${appSettings.maintenanceMode ? 'bg-yellow-500' : 'bg-green-500'} rounded-full mr-2 shrink-0`}></div> 
                    User Access: {appSettings.maintenanceMode ? 'Maintenance Mode' : 'Fully Operational'}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardSummary;
