import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Transaction, TransactionType, TransactionStatus } from '../../types';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import { ListFilter, Search, ArrowRightLeft, TrendingUp, TrendingDown, Clock, ChevronDown, ChevronUp, Repeat, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import Modal from '../../components/common/Modal'; 

const TransactionTable: React.FC = () => {
  const { transactions, users, findUserById, updateWithdrawalStatus, isLoading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<TransactionStatus | 'all'>('all');
  const [filterUserId, setFilterUserId] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction | 'userName', direction: 'asc' | 'dsc' } | null>(null);

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const enrichedTransactions = useMemo(() => {
    return transactions.map(tx => {
      const user = findUserById(tx.userId);
      return { ...tx, userName: user?.name || 'N/A' };
    });
  }, [transactions, findUserById]);

  const filteredTransactions = useMemo(() => {
    return enrichedTransactions
      .filter(tx => {
        const searchLower = searchTerm.toLowerCase();
        const user = findUserById(tx.userId);
        return (
          tx.id.toLowerCase().includes(searchLower) ||
          tx.description.toLowerCase().includes(searchLower) ||
          (user && user.name.toLowerCase().includes(searchLower)) ||
          (user && user.email.toLowerCase().includes(searchLower)) ||
          (tx.toAddress && tx.toAddress.toLowerCase().includes(searchLower))
        );
      })
      .filter(tx => filterType === 'all' || tx.type === filterType)
      .filter(tx => filterStatus === 'all' || tx.status === filterStatus)
      .filter(tx => !filterUserId || tx.userId === filterUserId || tx.toUserId === filterUserId);
  }, [enrichedTransactions, searchTerm, filterType, filterStatus, filterUserId, findUserById]);

  const sortedTransactions = useMemo(() => {
    let sortableItems = [...filteredTransactions];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const key = sortConfig.key;
        let valA: any;
        let valB: any;

        if (key === 'userName') {
          valA = a.userName;
          valB = b.userName;
        } else {
          valA = a[key as keyof Transaction];
          valB = b[key as keyof Transaction];
        }
        
        // Handle undefined or null by treating them as lesser or based on type
        if (valA === undefined || valA === null) valA = typeof valB === 'number' ? -Infinity : "";
        if (valB === undefined || valB === null) valB = typeof valA === 'number' ? -Infinity : "";


        if (typeof valA === 'string' && typeof valB === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        if (valA < valB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredTransactions, sortConfig]);

  const requestSort = (key: keyof Transaction | 'userName') => {
    let direction: 'asc' | 'dsc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'dsc';
    }
    setSortConfig({ key, direction });
  };
  
  const renderSortIcon = (key: keyof Transaction | 'userName') => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ChevronDown size={14} className="opacity-50" />;
    }
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const ThSortable: React.FC<{ sortKey: keyof Transaction | 'userName'; children: React.ReactNode; className?: string }> = ({ sortKey, children, className }) => (
    <th className={`p-3 text-left text-xs font-medium text-brixium-gray uppercase tracking-wider cursor-pointer hover:bg-brixium-purple/20 ${className}`} onClick={() => requestSort(sortKey)}>
      <div className="flex items-center justify-between">
        {children}
        {renderSortIcon(sortKey)}
      </div>
    </th>
  );

  const handleViewDetails = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setIsDetailModalOpen(true);
  };

  const handleWithdrawalAction = (txId: string, approve: boolean) => {
    
    updateWithdrawalStatus(txId, approve ? TransactionStatus.COMPLETED : TransactionStatus.REJECTED, 'admin-001');
    
  };

  const getTransactionIcon = (type: TransactionType) => {
    switch(type) {
        case TransactionType.TRANSFER: return <ArrowRightLeft size={18}/>;
        case TransactionType.DEPOSIT: return <TrendingUp size={18} className="text-green-400"/>;
        case TransactionType.WITHDRAWAL: return <TrendingDown size={18} className="text-red-400"/>;
        case TransactionType.EXCHANGE: return <Icon name={Repeat} size={18} className="text-blue-400"/>;
        case TransactionType.FEE: return <Icon name={DollarSign} size={18} className="text-yellow-400"/>;
        default: return <Clock size={18}/>;
    }
  }


  return (
    <div className="bg-brixium-bg-light p-4 sm:p-6 rounded-xl shadow-xl animate-slide-in-up">
      <h2 className="text-2xl font-semibold text-brixium-purple-light mb-6">Transaction Management</h2>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <Input 
          type="text"
          placeholder="Search Transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search size={18} className="text-brixium-gray"/>}
          className="!py-2.5 w-full"
        />
        <div className="w-full">
          <label htmlFor="filterUser" className="block text-xs font-medium text-brixium-gray-light mb-1">User</label>
          <select 
            id="filterUser"
            value={filterUserId}
            onChange={(e) => setFilterUserId(e.target.value)}
            className="w-full bg-brixium-bg border border-brixium-gray-dark text-brixium-gray-light text-sm rounded-lg focus:ring-brixium-purple focus:border-brixium-purple p-2.5"
          >
            <option value="">All Users</option>
            {users.map(user => <option key={user.id} value={user.id}>{user.name} ({user.email})</option>)}
          </select>
        </div>
        <div className="w-full">
            <label htmlFor="filterType" className="block text-xs font-medium text-brixium-gray-light mb-1">Type</label>
            <select 
                id="filterType"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as TransactionType | 'all')}
                className="w-full bg-brixium-bg border border-brixium-gray-dark text-brixium-gray-light text-sm rounded-lg focus:ring-brixium-purple focus:border-brixium-purple p-2.5"
            >
                <option value="all">All Types</option>
                {Object.values(TransactionType).map(type => <option key={type} value={type}>{type}</option>)}
            </select>
        </div>
        <div className="w-full">
            <label htmlFor="filterStatus" className="block text-xs font-medium text-brixium-gray-light mb-1">Status</label>
            <select 
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as TransactionStatus | 'all')}
                className="w-full bg-brixium-bg border border-brixium-gray-dark text-brixium-gray-light text-sm rounded-lg focus:ring-brixium-purple focus:border-brixium-purple p-2.5"
            >
                <option value="all">All Statuses</option>
                {Object.values(TransactionStatus).map(status => <option key={status} value={status}>{status}</option>)}
            </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-brixium-gray-dark">
        <table className="min-w-full divide-y divide-brixium-gray-dark">
          <thead className="bg-brixium-bg">
            <tr>
              <ThSortable sortKey="id">Txn ID</ThSortable>
              <ThSortable sortKey="date">Date</ThSortable>
              <ThSortable sortKey="userName">User</ThSortable>
              <ThSortable sortKey="type">Type</ThSortable>
              <ThSortable sortKey="amount">Amount</ThSortable>
              <ThSortable sortKey="status">Status</ThSortable>
              <th className="p-3 text-left text-xs font-medium text-brixium-gray uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-brixium-bg-light divide-y divide-brixium-gray-dark">
            {sortedTransactions.map(tx => (
              <tr key={tx.id} className="hover:bg-brixium-purple/5 transition-colors">
                <td className="p-3 text-sm text-white whitespace-nowrap font-mono text-xs">{tx.id}</td>
                <td className="p-3 text-sm text-brixium-gray-light whitespace-nowrap">{new Date(tx.date).toLocaleString()}</td>
                <td className="p-3 text-sm text-white whitespace-nowrap">{tx.userName}</td>
                <td className="p-3 text-sm text-white whitespace-nowrap">
                    <span className="flex items-center gap-2">{getTransactionIcon(tx.type)} {tx.type}</span>
                </td>
                <td className="p-3 text-sm text-white whitespace-nowrap">{tx.amount.toFixed(2)} {tx.currency}</td>
                <td className="p-3 text-sm whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                    ${tx.status === TransactionStatus.COMPLETED ? 'bg-green-500/20 text-green-400' : ''}
                    ${tx.status === TransactionStatus.PENDING ? 'bg-yellow-500/20 text-yellow-300' : ''}
                    ${tx.status === TransactionStatus.FEE_PENDING ? 'bg-orange-500/20 text-orange-300' : ''}
                    ${tx.status === TransactionStatus.REJECTED ? 'bg-red-500/20 text-red-400' : ''}
                  `}>
                    {tx.status}
                  </span>
                </td>
                <td className="p-3 text-sm whitespace-nowrap">
                  <Button variant="ghost" size="sm" onClick={() => handleViewDetails(tx)} className="!p-1.5 mr-1" title="View Details">
                    <ListFilter size={16} className="text-blue-400"/>
                  </Button>
                  {tx.type === TransactionType.WITHDRAWAL && tx.status === TransactionStatus.PENDING && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => handleWithdrawalAction(tx.relatedTransactionId || tx.id, true)} className="!p-1.5 mr-1" title="Approve Withdrawal" disabled={isLoading}>
                        <CheckCircle size={16} className="text-green-400"/>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleWithdrawalAction(tx.relatedTransactionId || tx.id, false)} className="!p-1.5" title="Reject Withdrawal" disabled={isLoading}>
                        <XCircle size={16} className="text-red-400"/>
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
             {sortedTransactions.length === 0 && (
                <tr><td colSpan={7} className="p-4 text-center text-brixium-gray">No transactions found matching criteria.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={`Transaction Details: ${selectedTransaction?.id}`}>
        {selectedTransaction && (
          <div className="space-y-3 text-sm text-brixium-gray-light max-h-[60vh] overflow-y-auto pr-2">
            <p><strong>User:</strong> {findUserById(selectedTransaction.userId)?.name} ({selectedTransaction.userId})</p>
            <p><strong>Date:</strong> {new Date(selectedTransaction.date).toLocaleString()}</p>
            <p><strong>Type:</strong> {selectedTransaction.type}</p>
            <p><strong>Amount:</strong> {selectedTransaction.amount.toFixed(2)} {selectedTransaction.currency}</p>
            <p><strong>Status:</strong> {selectedTransaction.status}</p>
            <p><strong>Description:</strong> {selectedTransaction.description}</p>
            {selectedTransaction.fromUserId && <p><strong>From User ID:</strong> {selectedTransaction.fromUserId} ({findUserById(selectedTransaction.fromUserId)?.name})</p>}
            {selectedTransaction.toUserId && <p><strong>To User ID:</strong> {selectedTransaction.toUserId} ({findUserById(selectedTransaction.toUserId)?.name})</p>}
            {selectedTransaction.toAddress && <p><strong>To Address:</strong> <span className="break-all">{selectedTransaction.toAddress}</span></p>}
            {selectedTransaction.networkFee && <p><strong>Network Fee:</strong> {selectedTransaction.networkFee.toFixed(2)}</p>}
            {selectedTransaction.relatedTransactionId && <p><strong>Related Withdrawal/Request ID:</strong> {selectedTransaction.relatedTransactionId}</p>}
            <div className="mt-4 flex justify-end">
                <Button onClick={() => setIsDetailModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};


export default TransactionTable;