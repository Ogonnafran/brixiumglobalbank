import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { WithdrawalRequest, TransactionStatus, User } from '../../types';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input'; 
import { CheckCircle, XCircle, Eye, Filter, Search } from 'lucide-react';

interface EnrichedWithdrawalRequest extends WithdrawalRequest {
  user?: User;
}

const WithdrawalRequestList: React.FC = () => {
  const { withdrawalRequests, updateWithdrawalStatus, isLoading, findUserById } = useAppContext();
  const [filterStatus, setFilterStatus] = useState<TransactionStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState(''); 

  const [selectedRequest, setSelectedRequest] = useState<EnrichedWithdrawalRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredRequests: EnrichedWithdrawalRequest[] = withdrawalRequests
    .map(req => ({ ...req, user: findUserById(req.userId) }))
    .filter(req => filterStatus === 'all' || req.status === filterStatus)
    .filter(req => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            req.user?.name.toLowerCase().includes(searchLower) ||
            req.user?.email.toLowerCase().includes(searchLower) ||
            req.userId.toLowerCase().includes(searchLower) ||
            req.id.toLowerCase().includes(searchLower) ||
            req.walletAddress.toLowerCase().includes(searchLower)
        );
    })
    .sort((a,b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());


  const handleAction = (requestId: string, status: TransactionStatus.COMPLETED | TransactionStatus.REJECTED) => {
    
    updateWithdrawalStatus(requestId, status, 'admin-001');
    setIsModalOpen(false);
  };

  const viewRequestDetails = (request: EnrichedWithdrawalRequest) => {
      setSelectedRequest(request);
      setIsModalOpen(true);
  };

  return (
    <div className="bg-brixium-bg-light p-4 sm:p-6 rounded-xl shadow-xl animate-slide-in-up">
      <h2 className="text-2xl font-semibold text-brixium-purple-light mb-6">Withdrawal Requests Management</h2>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full">
            <Input 
                type="text"
                placeholder="Search by User, Request ID, Wallet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search size={18} className="text-brixium-gray"/>}
                className="!py-2.5 w-full"
            />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
            <Icon name={Filter} className="text-brixium-gray" size={20}/>
            <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as TransactionStatus | 'all')}
                className="w-full sm:w-auto bg-brixium-bg border border-brixium-gray-dark text-brixium-gray-light text-sm rounded-lg focus:ring-brixium-purple focus:border-brixium-purple p-2.5"
            >
                <option value="all">All Statuses</option>
                <option value={TransactionStatus.PENDING}>Pending</option>
                <option value={TransactionStatus.COMPLETED}>Approved</option>
                <option value={TransactionStatus.REJECTED}>Rejected</option>
            </select>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <p className="text-center text-brixium-gray py-8">No withdrawal requests match your criteria.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRequests.map(req => {
            const user = req.user;
            return (
              <div key={req.id} className="bg-brixium-bg p-5 rounded-lg shadow-md border border-brixium-gray-dark/50 transform hover:shadow-brixium-purple/20 transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                      <div>
                          <p className="text-xs text-brixium-gray font-mono">{req.id}</p>
                          <h3 className="text-lg font-semibold text-white truncate" title={user?.name}>{user?.name || 'Unknown User'}</h3>
                          <p className="text-sm text-brixium-gray-light truncate" title={user?.email}>{user?.email}</p>
                      </div>
                       <span className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap
                          ${req.status === TransactionStatus.PENDING ? 'bg-yellow-500/20 text-yellow-300' : ''}
                          ${req.status === TransactionStatus.COMPLETED ? 'bg-green-500/20 text-green-400' : ''}
                          ${req.status === TransactionStatus.REJECTED ? 'bg-red-500/20 text-red-400' : ''}
                      `}>
                          {req.status}
                      </span>
                  </div>
                  <div className="mb-3">
                      <p className="text-xl font-bold text-brixium-purple-light">{req.amount.toLocaleString()} {req.currency}</p>
                      <p className="text-xs text-brixium-gray truncate" title={req.walletAddress}>To: {req.walletAddress}</p>
                  </div>
                  <p className="text-xs text-brixium-gray mb-1">Requested: {new Date(req.requestedAt).toLocaleString()}</p>
                  {req.processedAt && <p className="text-xs text-brixium-gray mb-3">Processed: {new Date(req.processedAt).toLocaleString()} by {req.adminId}</p>}
                  {req.networkFeePaidAmount && (
                    <p className="text-xs text-green-300/80">Fee Paid: {req.networkFeePaidAmount.toFixed(2)} {req.networkFeePaidCurrency}</p>
                  )}
                </div>
                
                <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => viewRequestDetails(req)} className="!px-3 !py-1.5 w-full sm:w-auto">
                    <Eye size={16} className="mr-1.5" /> Details
                  </Button>
                  {req.status === TransactionStatus.PENDING && (
                    <>
                      <Button variant="primary" size="sm" onClick={() => handleAction(req.id, TransactionStatus.COMPLETED)} isLoading={isLoading} className="!px-3 !py-1.5 bg-green-500 hover:bg-green-600 w-full sm:w-auto">
                        <CheckCircle size={16} className="mr-1.5" /> Approve
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleAction(req.id, TransactionStatus.REJECTED)} isLoading={isLoading} className="!px-3 !py-1.5 w-full sm:w-auto">
                        <XCircle size={16} className="mr-1.5" /> Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Withdrawal Request: ${selectedRequest?.id}`} size="md">
        {selectedRequest && (
            <div className="text-brixium-gray-light space-y-2 max-h-[70vh] overflow-y-auto pr-2">
                <p><strong>User:</strong> {selectedRequest.user?.name} ({selectedRequest.user?.email})</p>
                <p><strong>Current Balance:</strong> {selectedRequest.user?.balance.toFixed(2)} {selectedRequest.user?.currency}</p>
                <hr className="border-brixium-gray-dark/50 my-2"/>
                <p><strong>Amount:</strong> {selectedRequest.amount.toLocaleString()} {selectedRequest.currency}</p>
                <p><strong>Wallet Address:</strong> <span className="font-mono break-all">{selectedRequest.walletAddress}</span></p>
                <p><strong>Status:</strong> {selectedRequest.status}</p>
                <p><strong>Requested At:</strong> {new Date(selectedRequest.requestedAt).toLocaleString()}</p>
                {selectedRequest.processedAt && <p><strong>Processed At:</strong> {new Date(selectedRequest.processedAt).toLocaleString()} by Admin: {selectedRequest.adminId}</p>}
                
                {selectedRequest.networkFeePaidAmount && (
                  <>
                    <hr className="border-brixium-gray-dark/50 my-2"/>
                    <p className="font-semibold text-green-300">Fee Payment Details (User Claimed):</p>
                    <p><strong>Fee Amount Paid:</strong> {selectedRequest.networkFeePaidAmount.toFixed(2)} {selectedRequest.networkFeePaidCurrency}</p>
                    {selectedRequest.networkFeePaymentWalletType && <p><strong>Paid To Wallet Type:</strong> {selectedRequest.networkFeePaymentWalletType}</p>}
                    {selectedRequest.feeSettingId && <p><strong>Applied Fee Rule ID:</strong> <span className="font-mono text-xs">{selectedRequest.feeSettingId}</span></p>}
                  </>
                )}
                
                {selectedRequest.status === TransactionStatus.PENDING && (
                    <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                        <Button variant="primary" onClick={() => handleAction(selectedRequest.id, TransactionStatus.COMPLETED)} isLoading={isLoading} className="bg-green-500 hover:bg-green-600 w-full sm:w-auto">
                            Approve Withdrawal
                        </Button>
                        <Button variant="danger" onClick={() => handleAction(selectedRequest.id, TransactionStatus.REJECTED)} isLoading={isLoading} className="w-full sm:w-auto">
                            Reject Withdrawal
                        </Button>
                    </div>
                )}
            </div>
        )}
      </Modal>
    </div>
  );
};

export default WithdrawalRequestList;