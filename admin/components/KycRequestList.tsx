import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { KYCRequest, KYCStatus, User } from '../../types';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input'; 
import { CheckCircle, XCircle, Eye, Filter, Search } from 'lucide-react';

interface EnrichedKYCRequest extends KYCRequest {
  user?: User;
}

const KycRequestList: React.FC = () => {
  const { kycRequests, updateKYCStatus, isLoading, findUserById } = useAppContext();
  const [filterStatus, setFilterStatus] = useState<KYCStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState(''); 

  const [selectedRequest, setSelectedRequest] = useState<EnrichedKYCRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredRequests: EnrichedKYCRequest[] = kycRequests
    .map(req => ({ ...req, user: findUserById(req.userId) }))
    .filter(req => filterStatus === 'all' || req.status === filterStatus)
    .filter(req => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            req.user?.name.toLowerCase().includes(searchLower) ||
            req.user?.email.toLowerCase().includes(searchLower) ||
            req.userId.toLowerCase().includes(searchLower) ||
            req.id.toLowerCase().includes(searchLower)
        );
    })
    .sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  const handleAction = (requestId: string, status: KYCStatus) => {
    
    updateKYCStatus(requestId, status, 'admin-001');
    setIsModalOpen(false); 
  };
  
  const viewRequestDetails = (request: EnrichedKYCRequest) => {
      setSelectedRequest(request);
      setIsModalOpen(true);
  };

  return (
    <div className="bg-brixium-bg-light p-4 sm:p-6 rounded-xl shadow-xl animate-slide-in-up">
      <h2 className="text-2xl font-semibold text-brixium-purple-light mb-6">KYC Requests Management</h2>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full">
            <Input 
                type="text"
                placeholder="Search by User Name, Email, User ID, Request ID..."
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
                onChange={(e) => setFilterStatus(e.target.value as KYCStatus | 'all')}
                className="w-full sm:w-auto bg-brixium-bg border border-brixium-gray-dark text-brixium-gray-light text-sm rounded-lg focus:ring-brixium-purple focus:border-brixium-purple p-2.5"
            >
                <option value="all">All Statuses</option>
                <option value={KYCStatus.PENDING}>Pending</option>
                <option value={KYCStatus.APPROVED}>Approved</option>
                <option value={KYCStatus.REJECTED}>Rejected</option>
            </select>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <p className="text-center text-brixium-gray py-8">No KYC requests match your criteria.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRequests.map(req => {
            const user = req.user;
            return (
              <div key={req.id} className="bg-brixium-bg p-5 rounded-lg shadow-md border border-brixium-gray-dark/50 transform hover:shadow-brixium-purple/20 transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-brixium-gray font-mono">{req.id}</p>
                      <h3 className="text-lg font-semibold text-white truncate" title={user?.name}>{user?.name || 'Unknown User'}</h3>
                      <p className="text-sm text-brixium-gray-light truncate" title={user?.email}>{user?.email}</p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap
                      ${req.status === KYCStatus.PENDING ? 'bg-yellow-500/20 text-yellow-300' : ''}
                      ${req.status === KYCStatus.APPROVED ? 'bg-green-500/20 text-green-400' : ''}
                      ${req.status === KYCStatus.REJECTED ? 'bg-red-500/20 text-red-400' : ''}
                    `}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-xs text-brixium-gray mb-1">Submitted: {new Date(req.submittedAt).toLocaleString()}</p>
                  {req.reviewedAt && <p className="text-xs text-brixium-gray mb-3">Reviewed: {new Date(req.reviewedAt).toLocaleString()} by {req.reviewerId}</p>}
                </div>
                
                <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => viewRequestDetails(req)} className="!px-3 !py-1.5 w-full sm:w-auto">
                    <Eye size={16} className="mr-1.5" /> View Docs
                  </Button>
                  {req.status === KYCStatus.PENDING && (
                    <>
                      <Button variant="primary" size="sm" onClick={() => handleAction(req.id, KYCStatus.APPROVED)} isLoading={isLoading} className="!px-3 !py-1.5 bg-green-500 hover:bg-green-600 w-full sm:w-auto">
                        <CheckCircle size={16} className="mr-1.5" /> Approve
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleAction(req.id, KYCStatus.REJECTED)} isLoading={isLoading} className="!px-3 !py-1.5 w-full sm:w-auto">
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
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`KYC Documents for ${selectedRequest?.user?.name || 'Request'}`} size="md">
        {selectedRequest && (
            <div className="text-brixium-gray-light max-h-[60vh] overflow-y-auto pr-2">
                <p className="mb-2"><strong>User:</strong> {selectedRequest.user?.name} ({selectedRequest.user?.email})</p>
                <p className="mb-4"><strong>Status:</strong> {selectedRequest.status}</p>
                <h4 className="font-semibold text-white mb-2">Submitted Documents:</h4>
                {selectedRequest.documentUrls.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                        {selectedRequest.documentUrls.map((url, index) => (
                            <li key={index} className="truncate">
                                <a href={url} target="_blank" rel="noopener noreferrer" className="text-brixium-purple-light hover:underline">
                                    Mock_Document_{index + 1}.pdf 
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : <p>No documents found (mock data).</p>}

                {selectedRequest.status === KYCStatus.PENDING && (
                    <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                        <Button variant="primary" onClick={() => handleAction(selectedRequest.id, KYCStatus.APPROVED)} isLoading={isLoading} className="bg-green-500 hover:bg-green-600 w-full sm:w-auto">
                            Approve
                        </Button>
                        <Button variant="danger" onClick={() => handleAction(selectedRequest.id, KYCStatus.REJECTED)} isLoading={isLoading} className="w-full sm:w-auto">
                            Reject
                        </Button>
                    </div>
                )}
            </div>
        )}
      </Modal>
    </div>
  );
};

export default KycRequestList;