import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { User, KYCStatus, KYCRequest } from '../../types';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import { FileText, UploadCloud, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

const KycForm: React.FC = () => {
  const { currentUser, getUserKYCRequest, submitKYC, isLoading, setLoading } = useAppContext();

  if (!currentUser || !('balance' in currentUser)) return <p>Loading...</p>;
  const user = currentUser as User;

  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  
  const existingKycRequest = getUserKYCRequest(user.id);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError('');
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length + files.length > 3) { 
        setError('You can upload a maximum of 3 documents.');
        return;
      }
      setFiles(prev => [...prev, ...selectedFiles]);

      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setFilePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => {
        const updated = prev.filter((_, i) => i !== index);
        
        URL.revokeObjectURL(filePreviews[index]); 
        return updated;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (files.length === 0) {
      setError('Please upload at least one document.');
      return;
    }

    setLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    
    const mockDocumentUrls = files.map(file => `/uploads/mock-${user.id}-${file.name}`);
    
    try {
      submitKYC(user.id, mockDocumentUrls);
      setFiles([]);
      filePreviews.forEach(URL.revokeObjectURL); 
      setFilePreviews([]);
    } catch (err: any) {
      setError(err.message || 'Failed to submit KYC.');
    }
    setLoading(false);
  };
  
  
  React.useEffect(() => {
    return () => {
      filePreviews.forEach(URL.revokeObjectURL);
    };
  }, [filePreviews]);

  const renderStatusInfo = (req: KYCRequest | undefined) => {
    if (!req || req.status === KYCStatus.NOT_SUBMITTED) {
      return (
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-lg">
          <div className="flex items-center">
            <Icon name={AlertCircle} className="mr-2" size={20}/>
            <p>Your KYC is not yet verified. Please submit your identity documents.</p>
          </div>
        </div>
      );
    }
    switch (req.status) {
      case KYCStatus.PENDING:
        return (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 rounded-lg">
            <div className="flex items-center">
              <Icon name={Clock} className="mr-2" size={20}/>
              <p>Your KYC documents are pending review. Submitted on: {new Date(req.submittedAt).toLocaleDateString()}</p>
            </div>
          </div>
        );
      case KYCStatus.APPROVED:
        return (
          <div className="p-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg">
            <div className="flex items-center">
              <Icon name={CheckCircle} className="mr-2" size={20}/>
              <p>Your KYC is approved! Reviewed on: {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        );
      case KYCStatus.REJECTED:
        return (
          <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">
            <div className="flex items-center">
              <Icon name={XCircle} className="mr-2" size={20}/>
              <p>Your KYC submission was rejected. Reviewed on: {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString() : 'N/A'}. Please contact support or resubmit with correct documents.</p>
            </div>
          </div>
        );
      default: return null;
    }
  };


  return (
    <div className="bg-brixium-bg-light p-6 md:p-8 rounded-xl shadow-xl max-w-lg mx-auto animate-slide-in-up">
      <div className="flex items-center mb-6">
        <Icon name={FileText} className="text-brixium-purple-light mr-3" size={32} />
        <h2 className="text-2xl font-semibold text-brixium-purple-light">KYC Verification</h2>
      </div>

      <div className="mb-6">
        {renderStatusInfo(existingKycRequest)}
      </div>

      {( !existingKycRequest || existingKycRequest.status === KYCStatus.REJECTED || existingKycRequest.status === KYCStatus.NOT_SUBMITTED) && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="kycDocuments" className="block text-sm font-medium text-brixium-gray-light mb-2">
              Upload Identity Documents (e.g., Passport, ID Card, Utility Bill - Max 3 files)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-brixium-gray-dark border-dashed rounded-md hover:border-brixium-purple transition-colors">
              <div className="space-y-1 text-center">
                <Icon name={UploadCloud} className="mx-auto h-12 w-12 text-brixium-gray" />
                <div className="flex text-sm text-brixium-gray-light">
                  <label
                    htmlFor="kycDocuments"
                    className="relative cursor-pointer bg-brixium-bg-light rounded-md font-medium text-brixium-purple hover:text-brixium-purple-light focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-brixium-bg-light focus-within:ring-brixium-purple"
                  >
                    <span>Upload files</span>
                    <input id="kycDocuments" name="kycDocuments" type="file" className="sr-only" multiple onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png"/>
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-brixium-gray">PDF, PNG, JPG, JPEG up to 5MB each</p>
              </div>
            </div>
          </div>

          {filePreviews.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-brixium-gray-light mb-2">Selected files:</h4>
              <ul className="space-y-2">
                {files.map((file, index) => (
                  <li key={index} className="flex items-center justify-between p-2 bg-brixium-bg rounded-md border border-brixium-gray-dark">
                    <div className="flex items-center truncate">
                        {file.type.startsWith('image/') && <img src={filePreviews[index]} alt={file.name} className="w-10 h-10 object-cover rounded mr-2"/>}
                        {!file.type.startsWith('image/') && <FileText size={24} className="text-brixium-purple-light mr-2"/>}
                        <span className="text-sm text-white truncate">{file.name}</span>
                        <span className="text-xs text-brixium-gray ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)} className="!p-1">
                      <XCircle size={18} className="text-red-400 hover:text-red-600"/>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading || files.length === 0} size="lg">
            Submit KYC Documents
          </Button>
        </form>
      )}
    </div>
  );
};

export default KycForm;