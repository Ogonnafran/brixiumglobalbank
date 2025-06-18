import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { User, KYCStatus } from '../../types'; 
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Icon from '../../components/common/Icon';
import { Edit2, DollarSign, ShieldAlert, ShieldCheck, Trash2, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';

interface UserActionsModalState {
  isOpen: boolean;
  user: User | null;
  action: 'fund' | 'deduct' | 'edit' | 'kyc' | 'deactivate' | null;
}

const UserTable: React.FC = () => {
  const { users, updateUser, fundUserWallet, deductUserBalance, updateKYCStatus, isLoading, showToast } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerified, setFilterVerified] = useState<boolean | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof User | 'actions', direction: 'asc' | 'dsc' } | null>(null);

  const [modalState, setModalState] = useState<UserActionsModalState>({ isOpen: false, user: null, action: null });
  const [fundAmount, setFundAmount] = useState('');
  const [deductAmount, setDeductAmount] = useState('');
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');


  const filteredUsers = users
    .filter(user => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.id.toLowerCase().includes(searchLower)
      );
    })
    .filter(user => filterVerified === null || user.isVerifiedKYC === filterVerified);

  const sortedUsers = React.useMemo(() => {
    let sortableItems = [...filteredUsers];
    if (sortConfig !== null) {
      const { key, direction } = sortConfig;
      if (key !== 'actions') { 
        const typedKey = key as keyof User; 
        sortableItems.sort((a, b) => {
          const valA = a[typedKey];
          const valB = b[typedKey];
          
          let compA: any = valA;
          let compB: any = valB;

          if (valA === undefined || valA === null) compA = typeof valB === 'number' ? -Infinity : (typeof valB === 'boolean' ? false : "");
          if (valB === undefined || valB === null) compB = typeof valA === 'number' ? -Infinity : (typeof valA === 'boolean' ? false : "");


          if (typeof compA === 'string' && typeof compB === 'string') {
            compA = compA.toLowerCase();
            compB = compB.toLowerCase();
          }

          if (compA < compB) {
            return direction === 'asc' ? -1 : 1;
          }
          if (compA > compB) {
            return direction === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }
    }
    return sortableItems;
  }, [filteredUsers, sortConfig]);

  const requestSort = (key: keyof User | 'actions') => {
    let direction: 'asc' | 'dsc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'dsc';
    }
    setSortConfig({ key, direction });
  };

  const openModal = (user: User, action: UserActionsModalState['action']) => {
    setModalState({ isOpen: true, user, action });
    if (action === 'edit' && user) {
        setEditName(user.name);
        setEditPhone(user.phone || '');
    }
    setFundAmount('');
    setDeductAmount('');
  };
  const closeModal = () => setModalState({ isOpen: false, user: null, action: null });

  const handleFund = () => {
    if (modalState.user && fundAmount) {
      const amountNum = parseFloat(fundAmount);
      if (fundUserWallet(modalState.user.id, amountNum, modalState.user.currency)) {
        closeModal();
      }
    }
  };
  
  const handleDeduct = () => {
    if (modalState.user && deductAmount) {
      const amountNum = parseFloat(deductAmount);
      if (deductUserBalance(modalState.user.id, amountNum, modalState.user.currency)) {
        closeModal();
      }
    }
  };

  const handleEdit = () => {
    if(modalState.user && editName) {
        updateUser({...modalState.user, name: editName, phone: editPhone });
        showToast("User profile updated.", "success");
        closeModal();
    }
  };

  const handleKYCAction = (approve: boolean) => {
    if(modalState.user) {
        const kycReq = useAppContext().kycRequests.find(k => k.userId === modalState.user!.id);
        const newStatus = approve ? KYCStatus.APPROVED : KYCStatus.REJECTED;
        if(kycReq) {
            updateKYCStatus(kycReq.id, newStatus, 'admin-001' );
        } else {
            updateUser({...modalState.user, isVerifiedKYC: approve});
            showToast(`User KYC status manually set to ${approve ? 'Verified' : 'Not Verified'}. No formal request found.`, 'info');
        }
        closeModal();
    }
  };
  
  const handleDeactivate = () => {
      if(modalState.user){
          showToast(`User ${modalState.user.name} deactivated (mock action).`, "info");
          closeModal();
      }
  };


  const renderSortIcon = (key: keyof User | 'actions') => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ChevronDown size={14} className="opacity-50" />;
    }
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const ThSortable: React.FC<{ sortKey: keyof User | 'actions'; children: React.ReactNode; className?: string }> = ({ sortKey, children, className }) => (
    <th className={`p-3 text-left text-xs font-medium text-brixium-gray uppercase tracking-wider cursor-pointer hover:bg-brixium-purple/20 ${className}`} onClick={() => requestSort(sortKey)}>
      <div className="flex items-center justify-between">
        {children}
        {renderSortIcon(sortKey)}
      </div>
    </th>
  );


  return (
    <div className="bg-brixium-bg-light p-4 sm:p-6 rounded-xl shadow-xl animate-slide-in-up">
      <h2 className="text-2xl font-semibold text-brixium-purple-light mb-6">User Management</h2>
      
      <div className="mb-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full">
            <Input 
                type="text"
                placeholder="Search by ID, Name, Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search size={18} className="text-brixium-gray"/>}
                className="!py-2.5 w-full"
            />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
            <Icon name={Filter} className="text-brixium-gray" size={20}/>
            <select 
                value={filterVerified === null ? 'all' : (filterVerified ? 'verified' : 'not_verified')}
                onChange={(e) => {
                    if (e.target.value === 'all') setFilterVerified(null);
                    else if (e.target.value === 'verified') setFilterVerified(true);
                    else setFilterVerified(false);
                }}
                className="w-full sm:w-auto bg-brixium-bg border border-brixium-gray-dark text-brixium-gray-light text-sm rounded-lg focus:ring-brixium-purple focus:border-brixium-purple p-2.5"
            >
                <option value="all">All KYC Status</option>
                <option value="verified">Verified</option>
                <option value="not_verified">Not Verified</option>
            </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-brixium-gray-dark">
        <table className="min-w-full divide-y divide-brixium-gray-dark">
          <thead className="bg-brixium-bg">
            <tr>
              <ThSortable sortKey="id">User ID</ThSortable>
              <ThSortable sortKey="name">Name</ThSortable>
              <ThSortable sortKey="email">Email</ThSortable>
              <ThSortable sortKey="balance">Balance</ThSortable>
              <ThSortable sortKey="isVerifiedKYC" className="text-center">KYC</ThSortable>
              <ThSortable sortKey="createdAt">Joined</ThSortable>
              <ThSortable sortKey="actions" className="text-center">Actions</ThSortable>
            </tr>
          </thead>
          <tbody className="bg-brixium-bg-light divide-y divide-brixium-gray-dark">
            {sortedUsers.map(user => (
              <tr key={user.id} className="hover:bg-brixium-purple/5 transition-colors">
                <td className="p-3 text-sm text-white whitespace-nowrap">{user.id}</td>
                <td className="p-3 text-sm text-white whitespace-nowrap">{user.name}</td>
                <td className="p-3 text-sm text-brixium-gray-light whitespace-nowrap">{user.email}</td>
                <td className="p-3 text-sm text-white whitespace-nowrap">{user.balance.toFixed(2)} {user.currency}</td>
                <td className="p-3 text-sm text-center">
                  <span className={`p-1.5 rounded-full text-xs font-semibold ${user.isVerifiedKYC ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-300'}`}>
                    {user.isVerifiedKYC ? 'Verified' : 'Not Verified'}
                  </span>
                </td>
                <td className="p-3 text-sm text-brixium-gray-light whitespace-nowrap">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="p-3 text-sm text-center whitespace-nowrap">
                  <div className="flex justify-center items-center space-x-1 flex-wrap">
                    <Button variant="ghost" size="sm" onClick={() => openModal(user, 'fund')} className="!p-1.5" title="Fund Wallet"><DollarSign size={16} className="text-green-400"/> </Button>
                    <Button variant="ghost" size="sm" onClick={() => openModal(user, 'deduct')} className="!p-1.5" title="Deduct Balance"><DollarSign size={16} className="text-red-400"/>-</Button>
                    <Button variant="ghost" size="sm" onClick={() => openModal(user, 'edit')} className="!p-1.5" title="Edit Profile"><Edit2 size={16} className="text-blue-400"/></Button>
                    <Button variant="ghost" size="sm" onClick={() => openModal(user, 'kyc')} className="!p-1.5" title="KYC Actions">
                        {user.isVerifiedKYC ? <ShieldCheck size={16} className="text-green-400"/> : <ShieldAlert size={16} className="text-yellow-400"/>}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openModal(user, 'deactivate')} className="!p-1.5" title="Deactivate User"><Trash2 size={16} className="text-red-500"/></Button>
                  </div>
                </td>
              </tr>
            ))}
            {sortedUsers.length === 0 && (
                <tr><td colSpan={7} className="p-4 text-center text-brixium-gray">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals for actions */}
      <Modal isOpen={modalState.isOpen && (modalState.action === 'fund' || modalState.action === 'deduct')} onClose={closeModal} title={`${modalState.action === 'fund' ? 'Fund' : 'Deduct from'} Wallet: ${modalState.user?.name}`}>
        <div className="space-y-4">
          <p>Current Balance: {modalState.user?.balance.toFixed(2)} {modalState.user?.currency}</p>
          <Input
            label={`Amount to ${modalState.action} (${modalState.user?.currency})`}
            type="number"
            value={modalState.action === 'fund' ? fundAmount : deductAmount}
            onChange={(e) => modalState.action === 'fund' ? setFundAmount(e.target.value) : setDeductAmount(e.target.value)}
            placeholder="0.00"
            required
          />
          <Button onClick={modalState.action === 'fund' ? handleFund : handleDeduct} isLoading={isLoading} className="w-full">
            Confirm {modalState.action === 'fund' ? 'Funding' : 'Deduction'}
          </Button>
        </div>
      </Modal>

      <Modal isOpen={modalState.isOpen && modalState.action === 'edit'} onClose={closeModal} title={`Edit Profile: ${modalState.user?.name}`}>
          <div className="space-y-4">
            <Input label="Full Name" value={editName} onChange={e => setEditName(e.target.value)} />
            <Input label="Phone (Optional)" value={editPhone} onChange={e => setEditPhone(e.target.value)} />
            <Button onClick={handleEdit} isLoading={isLoading} className="w-full">Save Changes</Button>
          </div>
      </Modal>

      <Modal isOpen={modalState.isOpen && modalState.action === 'kyc'} onClose={closeModal} title={`KYC Action: ${modalState.user?.name}`}>
          <div className="space-y-4 text-center">
            <p>User is currently: <strong>{modalState.user?.isVerifiedKYC ? 'Verified' : 'Not Verified'}</strong></p>
            <p>Note: This directly impacts user's KYC status. For formal review, use KYC Requests page.</p>
            <div className="flex gap-4 justify-center">
                <Button onClick={() => handleKYCAction(true)} variant="primary" className="bg-green-500 hover:bg-green-600">Approve KYC</Button>
                <Button onClick={() => handleKYCAction(false)} variant="danger">Reject KYC</Button>
            </div>
          </div>
      </Modal>
      
      <Modal isOpen={modalState.isOpen && modalState.action === 'deactivate'} onClose={closeModal} title={`Deactivate User: ${modalState.user?.name}`}>
          <div className="space-y-4 text-center">
            <p>Are you sure you want to deactivate this user? This action is a placeholder and might restrict their access in a full system.</p>
            <Button onClick={handleDeactivate} variant="danger" className="w-full">Confirm Deactivation (Mock)</Button>
          </div>
      </Modal>

    </div>
  );
};

export default UserTable;