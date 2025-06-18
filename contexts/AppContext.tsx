import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, AdminUser, Transaction, KYCRequest, WithdrawalRequest, AppNotification, AppSettings, Currency, TransactionStatus, KYCStatus, NotificationType, TransactionType, FeeSetting } from '../types';
import { INITIAL_USERS, INITIAL_ADMINS, INITIAL_TRANSACTIONS, INITIAL_KYC_REQUESTS, INITIAL_WITHDRAWAL_REQUESTS, INITIAL_NOTIFICATIONS, INITIAL_SETTINGS, MOCK_EXCHANGE_RATES } from '../constants';

export interface AppContextType {
  // Auth
  currentUser: User | AdminUser | null;
  isAdmin: boolean;
  login: (email: string, pass: string, isAdminLogin: boolean) => Promise<boolean>;
  signup: (name: string, email: string, pass: string, currency: Currency) => Promise<boolean>;
  logout: () => void;

  // Data - Users
  users: User[];
  findUserById: (id: string) => User | undefined;
  findUserByEmail: (email: string) => User | undefined;
  updateUser: (updatedUser: User) => void;
  fundUserWallet: (userId: string, amount: number, currency: Currency) => boolean;
  deductUserBalance: (userId: string, amount: number, currency: Currency) => boolean;

  // Data - Transactions
  transactions: Transaction[];
  getUserTransactions: (userId: string) => Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Transaction;

  // Data - KYC
  kycRequests: KYCRequest[];
  getUserKYCRequest: (userId: string) => KYCRequest | undefined;
  submitKYC: (userId: string, documentUrls: string[]) => KYCRequest;
  updateKYCStatus: (requestId: string, status: KYCStatus, adminId: string) => boolean;
  
  // Data - Withdrawals
  withdrawalRequests: WithdrawalRequest[];
  getUserWithdrawalRequests: (userId: string) => WithdrawalRequest[];
  requestWithdrawal: (userId: string, amount: number, currency: Currency, walletAddress: string, appliedFeeSetting?: FeeSetting | null) => WithdrawalRequest;
  updateWithdrawalStatus: (requestId: string, status: TransactionStatus.COMPLETED | TransactionStatus.REJECTED, adminId: string) => boolean;

  // Data - Exchange
  getExchangeRate: (from: Currency, to: Currency) => number;
  performExchange: (userId: string, fromCurrency: Currency, toCurrency: Currency, fromAmount: number) => boolean;


  // Notifications
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  getUserNotifications: (userId: string) => AppNotification[];
  getAdminNotifications: () => AppNotification[];
  
  // Settings
  appSettings: AppSettings;
  updateAppSettings: (newSettings: Partial<AppSettings>) => void;

  // General
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);


const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | AdminUser | null>(() => {
    try {
      const storedUser = localStorage.getItem('brixiumUser');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) { return null; }
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
     const storedIsAdmin = localStorage.getItem('brixiumIsAdmin');
     return storedIsAdmin ? JSON.parse(storedIsAdmin) : false;
    } catch (error) { return false; }
  });
  
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const storedUsers = localStorage.getItem('brixiumUsers');
      return storedUsers ? JSON.parse(storedUsers) : INITIAL_USERS;
    } catch (error) { return INITIAL_USERS; }
  });
  const [_admins] = useState<AdminUser[]>(INITIAL_ADMINS); 
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const storedTx = localStorage.getItem('brixiumTransactions');
      return storedTx ? JSON.parse(storedTx) : INITIAL_TRANSACTIONS;
    } catch (error) { return INITIAL_TRANSACTIONS; }
  });
  const [kycRequests, setKycRequests] = useState<KYCRequest[]>(() => {
    try {
      const storedKyc = localStorage.getItem('brixiumKycRequests');
      return storedKyc ? JSON.parse(storedKyc) : INITIAL_KYC_REQUESTS;
    } catch (error) { return INITIAL_KYC_REQUESTS; }
  });
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>(() => {
    try {
      const storedWithdrawals = localStorage.getItem('brixiumWithdrawalRequests');
      return storedWithdrawals ? JSON.parse(storedWithdrawals) : INITIAL_WITHDRAWAL_REQUESTS;
    } catch (error) { return INITIAL_WITHDRAWAL_REQUESTS; }
  });
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const storedNotifs = localStorage.getItem('brixiumNotifications');
      return storedNotifs ? JSON.parse(storedNotifs) : INITIAL_NOTIFICATIONS;
    } catch (error) { return INITIAL_NOTIFICATIONS; }
  });
  const [appSettings, setAppSettingsState] = useState<AppSettings>(() => {
    try {
      const storedSettings = localStorage.getItem('brixiumAppSettings');
      // Basic migration for users from old settings structure
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        if (parsed.defaultNetworkFee !== undefined || parsed.networkFeeWallets !== undefined && parsed.networkFees === undefined) {
          // This is an old structure, try to migrate or use INITIAL_SETTINGS
          const migratedSettings: AppSettings = {
            ...INITIAL_SETTINGS, // Start with new structure defaults
            supportedCurrencies: parsed.supportedCurrencies || INITIAL_SETTINGS.supportedCurrencies,
            maintenanceMode: parsed.maintenanceMode !== undefined ? parsed.maintenanceMode : INITIAL_SETTINGS.maintenanceMode,
            defaultUserCurrency: parsed.defaultUserCurrency || INITIAL_SETTINGS.defaultUserCurrency,
          };
          // Potentially migrate old networkFeeWallets to a default FeeSetting if desired, or just discard
          // For simplicity, we'll just use the new INITIAL_SETTINGS if old structure is detected.
           console.warn("Old settings structure detected, re-initializing with new structure. Some settings might be reset.");
           localStorage.setItem('brixiumAppSettings', JSON.stringify(migratedSettings));
           return migratedSettings;
        }
        return parsed;
      }
      return INITIAL_SETTINGS;
    } catch (error) { return INITIAL_SETTINGS; }
  });

  const [isLoading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info', id: number} | null>(null);


  
  useEffect(() => { localStorage.setItem('brixiumUser', JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem('brixiumIsAdmin', JSON.stringify(isAdmin)); }, [isAdmin]);
  useEffect(() => { localStorage.setItem('brixiumUsers', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('brixiumTransactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('brixiumKycRequests', JSON.stringify(kycRequests)); }, [kycRequests]);
  useEffect(() => { localStorage.setItem('brixiumWithdrawalRequests', JSON.stringify(withdrawalRequests)); }, [withdrawalRequests]);
  useEffect(() => { localStorage.setItem('brixiumNotifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('brixiumAppSettings', JSON.stringify(appSettings)); }, [appSettings]);
  

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, id: Date.now() });
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  };

  
  const addNotification = useCallback((notificationData: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: AppNotification = {
      ...notificationData,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  }, []);

  const getUserNotifications = useCallback((userId: string) => {
    return notifications.filter(n => n.userId === userId && !n.adminOnly).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications]);

  const getAdminNotifications = useCallback(() => {
    return notifications.filter(n => n.adminOnly).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications]);


  
  const login = useCallback(async (email: string, pass: string, isAdminLogin: boolean): Promise<boolean> => {
    setLoading(true);
    await delay(500);
    if (isAdminLogin) {
      const admin = _admins.find(a => a.email === email && a.hashedPassword === pass);
      if (admin) {
        setCurrentUser(admin);
        setIsAdmin(true);
        setLoading(false);
        showToast('Admin login successful!', 'success');
        return true;
      }
    } else {
      const user = users.find(u => u.email === email && u.hashedPassword === pass);
      if (user) {
        setCurrentUser(user);
        setIsAdmin(false);
        setLoading(false);
        showToast(`Welcome back, ${user.name}!`, 'success');
        return true;
      }
    }
    setLoading(false);
    showToast('Invalid credentials.', 'error');
    return false;
  }, [_admins, users]);

  const signup = useCallback(async (name: string, email: string, pass: string, currency: Currency): Promise<boolean> => {
    setLoading(true);
    await delay(500);
    if (users.find(u => u.email === email)) {
      setLoading(false);
      showToast('Email already exists.', 'error');
      return false;
    }
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
      name,
      email,
      hashedPassword: pass, 
      balance: 0, 
      currency: currency, 
      isVerifiedKYC: false,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
    setLoading(false);
    showToast('Signup successful! Please log in.', 'success');
    return true;
  }, [users]); 

  const logout = useCallback(() => {
    setCurrentUser(null);
    setIsAdmin(false);
    
    localStorage.removeItem('brixiumUser');
    localStorage.removeItem('brixiumIsAdmin');
    showToast('Logged out successfully.', 'info');
  }, []);

  
  const findUserById = useCallback((id: string) => users.find(u => u.id === id), [users]);
  const findUserByEmail = useCallback((email: string) => users.find(u => u.email === email), [users]);
  
  const updateUser = useCallback((updatedUser: User) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser && currentUser.id === updatedUser.id && !isAdmin) {
      setCurrentUser(updatedUser);
    }
  }, [currentUser, isAdmin]);

  const addTransaction = useCallback((transactionData: Omit<Transaction, 'id' | 'date'>): Transaction => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: `txn-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
      date: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    return newTransaction;
  }, []);
  
  const getUserTransactions = useCallback((userId: string) => {
    return transactions.filter(t => t.userId === userId || t.toUserId === userId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);


  const fundUserWallet = useCallback((userId: string, amount: number, currency: Currency): boolean => {
    const user = findUserById(userId);
    if (!user || amount <= 0) return false;
    if (user.currency !== currency) {
        showToast(`Cannot fund in ${currency}. User's currency is ${user.currency}. Exchange first.`, 'error');
        return false;
    }
    const updatedUser = { ...user, balance: user.balance + amount };
    updateUser(updatedUser);
    addTransaction({
        userId,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.COMPLETED,
        amount,
        currency,
        description: `Account funded by admin.`,
    });
    addNotification({userId, adminOnly:false, type: NotificationType.BALANCE_FUNDED, message: `Your account has been funded with ${amount} ${currency}.`});
    showToast(`Funded ${user.name}'s wallet with ${amount} ${currency}.`, 'success');
    return true;
  }, [findUserById, updateUser, addTransaction, addNotification]);

  const deductUserBalance = useCallback((userId: string, amount: number, currency: Currency): boolean => {
    const user = findUserById(userId);
    if (!user || amount <= 0) return false;
    if (user.currency !== currency) {
        showToast(`Cannot deduct in ${currency}. User's currency is ${user.currency}.`, 'error');
        return false;
    }
    if (user.balance < amount) {
        showToast(`Insufficient balance for ${user.name}.`, 'error');
        return false;
    }
    const updatedUser = { ...user, balance: user.balance - amount };
    updateUser(updatedUser);
    // This is an admin deduction, not a standard fee-based withdrawal
    addTransaction({
        userId,
        type: TransactionType.WITHDRAWAL, 
        status: TransactionStatus.COMPLETED,
        amount,
        currency,
        description: `Balance deducted by admin.`, 
    });
    addNotification({userId, adminOnly: false, type: NotificationType.BALANCE_DEDUCTED, message: `An amount of ${amount} ${currency} has been deducted from your account by an admin.`});
    showToast(`Deducted ${amount} ${currency} from ${user.name}'s wallet.`, 'success');
    return true;
  }, [findUserById, updateUser, addTransaction, addNotification]);


  
  const getUserKYCRequest = useCallback((userId: string) => kycRequests.find(k => k.userId === userId), [kycRequests]);
  
  const submitKYC = useCallback((userId: string, documentUrls: string[]): KYCRequest => {
    const existingRequest = kycRequests.find(r => r.userId === userId);
    if (existingRequest && (existingRequest.status === KYCStatus.PENDING || existingRequest.status === KYCStatus.APPROVED)) {
      showToast('KYC request already pending or approved.', 'info');
      return existingRequest;
    }

    const newRequest: KYCRequest = {
      id: `kyc-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
      userId,
      documentUrls,
      status: KYCStatus.PENDING,
      submittedAt: new Date().toISOString(),
    };
    setKycRequests(prev => [newRequest, ...prev.filter(r => r.userId !== userId)]);
    const user = findUserById(userId);
    if (user) {
        updateUser({...user, isVerifiedKYC: false}); // Set to false until approved
    }
    addNotification({ adminOnly: true, type: NotificationType.NEW_KYC_SUBMISSION, message: `New KYC submission from user ${user?.name || userId}.`, linkTo: `/admin/kyc` });
    showToast('KYC documents submitted for review.', 'success');
    return newRequest;
  }, [kycRequests, addNotification, findUserById, updateUser]);

  const updateKYCStatus = useCallback((requestId: string, status: KYCStatus, adminId: string): boolean => {
    const request = kycRequests.find(r => r.id === requestId);
    if (!request) {
        showToast(`KYC Request ${requestId} not found.`, "error");
        return false;
    }

    setKycRequests(prev => prev.map(r => r.id === requestId ? { ...r, status, reviewedAt: new Date().toISOString(), reviewerId: adminId } : r));
    const user = findUserById(request.userId);
    if (user) {
      updateUser({ ...user, isVerifiedKYC: status === KYCStatus.APPROVED });
      const notifType = status === KYCStatus.APPROVED ? NotificationType.KYC_APPROVED : NotificationType.KYC_REJECTED;
      const message = status === KYCStatus.APPROVED ? 'Your KYC has been approved.' : 'Your KYC has been rejected. Please contact support or resubmit documents if applicable.';
      addNotification({ userId: user.id, adminOnly: false, type: notifType, message });
    }
    showToast(`KYC request for ${user?.name || requestId} ${status.toLowerCase()}.`, 'success');
    return true;
  }, [kycRequests, findUserById, updateUser, addNotification]);

  
  const getUserWithdrawalRequests = useCallback((userId: string) => {
    return withdrawalRequests.filter(w => w.userId === userId).sort((a,b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }, [withdrawalRequests]);

  const requestWithdrawal = useCallback((userId: string, amount: number, currency: Currency, walletAddress: string, appliedFeeSetting?: FeeSetting | null): WithdrawalRequest => {
    const user = findUserById(userId);
    if (!user) {
        showToast("User not found for withdrawal", 'error');
        throw new Error("User not found for withdrawal");
    }
    // Balance check is for the withdrawal amount only. Fee is separate.
    if (user.balance < amount) {
        showToast('Insufficient balance for withdrawal amount.', 'error');
        throw new Error("Insufficient balance for withdrawal");
    }
    if (user.currency !== currency) {
        showToast(`Withdrawal currency ${currency} must match account currency ${user.currency}. Exchange first.`, 'error');
        throw new Error("Currency mismatch");
    }

    const newWithdrawal: WithdrawalRequest = {
      id: `wd-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
      userId,
      amount,
      currency,
      walletAddress,
      status: TransactionStatus.PENDING, // Pending admin approval after fee "payment"
      requestedAt: new Date().toISOString(),
      networkFeePaidAmount: appliedFeeSetting?.feeAmount,
      networkFeePaidCurrency: appliedFeeSetting?.feeCurrency,
      // For simplicity, not capturing which specific wallet type user "paid" to in this mock.
      // networkFeePaymentWalletType: ..., 
      feeSettingId: appliedFeeSetting?.id,
    };
    setWithdrawalRequests(prev => [newWithdrawal, ...prev].sort((a,b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()));
    addNotification({ adminOnly: true, type: NotificationType.NEW_WITHDRAWAL_REQUEST, message: `New withdrawal request from ${user.name} for ${amount} ${currency}. Fee details submitted.`, linkTo: `/admin/withdrawals` });
    showToast('Withdrawal request submitted for review.', 'success');
    return newWithdrawal;
  }, [findUserById, addNotification]);

  const updateWithdrawalStatus = useCallback((requestId: string, status: TransactionStatus.COMPLETED | TransactionStatus.REJECTED, adminId: string): boolean => {
    const request = withdrawalRequests.find(r => r.id === requestId);
    if (!request || request.status !== TransactionStatus.PENDING) { // Only act on PENDING requests
        showToast('Withdrawal request not found or already processed.', 'error');
        return false;
    }

    const user = findUserById(request.userId);
    if (!user) {
        showToast(`User for withdrawal request ${requestId} not found.`, 'error');
        return false;
    }

    if (status === TransactionStatus.COMPLETED) { 
      // Ensure user still has balance for the withdrawal amount itself.
      // The fee was "paid" externally in this simulation.
      if (user.balance < request.amount) {
        showToast(`User ${user.name} has insufficient balance to complete withdrawal. Rejecting.`, 'error');
        setWithdrawalRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: TransactionStatus.REJECTED, processedAt: new Date().toISOString(), adminId } : r));
        addNotification({ userId: user.id, adminOnly: false, type: NotificationType.WITHDRAWAL_REJECTED, message: `Your withdrawal of ${request.amount} ${request.currency} was rejected due to insufficient funds at time of processing.` });
        return false;
      }
      updateUser({ ...user, balance: user.balance - request.amount });
      // Create the actual transaction record for this withdrawal
      addTransaction({
        userId: user.id,
        type: TransactionType.WITHDRAWAL,
        status: TransactionStatus.COMPLETED,
        amount: request.amount,
        currency: request.currency,
        description: `Withdrawal to ${request.walletAddress}`,
        toAddress: request.walletAddress,
        networkFee: request.networkFeePaidAmount, // Record the fee that was supposed to be paid
        networkFeeCurrency: request.networkFeePaidCurrency,
        relatedTransactionId: request.id // Link to the withdrawal request
      });
      addNotification({ userId: user.id, adminOnly: false, type: NotificationType.WITHDRAWAL_APPROVED, message: `Your withdrawal of ${request.amount} ${request.currency} has been approved and processed.` });
      showToast(`Withdrawal ${requestId} for ${user.name} approved.`, 'success');
    } else if (status === TransactionStatus.REJECTED) {
      addNotification({ userId: user.id, adminOnly: false, type: NotificationType.WITHDRAWAL_REJECTED, message: `Your withdrawal of ${request.amount} ${request.currency} has been rejected.` });
      showToast(`Withdrawal ${requestId} for ${user.name} rejected.`, 'success');
    }
    
    setWithdrawalRequests(prev => prev.map(r => r.id === requestId ? { ...r, status, processedAt: new Date().toISOString(), adminId } : r));
    return true;
  }, [withdrawalRequests, findUserById, updateUser, addTransaction, addNotification]);

  
  const getExchangeRate = useCallback((from: Currency, to: Currency): number => {
    return MOCK_EXCHANGE_RATES[from]?.[to] || 0;
  }, []);

  const performExchange = useCallback((userId: string, fromCurrency: Currency, toCurrency: Currency, fromAmount: number): boolean => {
    const user = findUserById(userId);
    if(!user) {
        showToast("User not found.", "error");
        return false;
    }
    if(user.currency !== fromCurrency) {
        showToast(`Account currency is ${user.currency}. Cannot exchange from ${fromCurrency}. This action is for converting the entire account balance.`, "error");
        return false;
    }
    if(fromAmount <= 0 || user.balance < fromAmount) {
        showToast("Invalid amount or insufficient balance for exchange.", "error");
        return false;
    }
    
    const rate = getExchangeRate(fromCurrency, toCurrency);
    if(rate <= 0) {
        showToast(`Exchange rate not available for ${fromCurrency} to ${toCurrency}.`, "error");
        return false;
    }
    const toAmount = fromAmount * rate; 
    
    const updatedUser: User = {
        ...user,
        balance: toAmount, 
        currency: toCurrency, 
    };
    updateUser(updatedUser);

    addTransaction({
        userId,
        type: TransactionType.EXCHANGE,
        status: TransactionStatus.COMPLETED,
        amount: fromAmount, 
        currency: fromCurrency,
        description: `Exchanged ${fromAmount.toFixed(2)} ${fromCurrency} to ${toAmount.toFixed(2)} ${toCurrency}. Rate: ${rate.toFixed(4)}. Account currency now ${toCurrency}.`,
        // No network fee for internal exchange usually
    });
    showToast(`Exchanged ${fromAmount.toFixed(2)} ${fromCurrency} to ${toAmount.toFixed(2)} ${toCurrency}. Account currency is now ${toCurrency}.`, 'success');
    return true;
  }, [findUserById, updateUser, addTransaction, getExchangeRate]);


  
  const updateAppSettings = useCallback((newSettings: Partial<AppSettings>) => {
    let finalSettings = { ...appSettings, ...newSettings }; // Start with current, then overlay
  
    // Ensure defaultUserCurrency is part of the new or existing supportedCurrencies
    const effectiveSupportedCurrencies = newSettings.supportedCurrencies || appSettings.supportedCurrencies;
    const effectiveDefaultUserCurrency = newSettings.defaultUserCurrency || appSettings.defaultUserCurrency;

    if (effectiveDefaultUserCurrency && !effectiveSupportedCurrencies.includes(effectiveDefaultUserCurrency)) {
      finalSettings.supportedCurrencies = [...effectiveSupportedCurrencies, effectiveDefaultUserCurrency];
    } else {
      finalSettings.supportedCurrencies = effectiveSupportedCurrencies; // Use the updated list
    }
    finalSettings.defaultUserCurrency = effectiveDefaultUserCurrency;


    setAppSettingsState(finalSettings);
    showToast('System settings updated.', 'success');
  }, [appSettings]); 
  

  const contextValue: AppContextType = {
    currentUser, isAdmin, login, signup, logout,
    users, findUserById, findUserByEmail, updateUser, fundUserWallet, deductUserBalance,
    transactions, getUserTransactions, addTransaction,
    kycRequests, getUserKYCRequest, submitKYC, updateKYCStatus,
    withdrawalRequests, getUserWithdrawalRequests, requestWithdrawal, updateWithdrawalStatus,
    getExchangeRate, performExchange,
    notifications, addNotification, markNotificationAsRead, getUserNotifications, getAdminNotifications,
    appSettings, updateAppSettings,
    isLoading, setLoading, showToast
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
      {toast && (
        <div className={`fixed top-5 right-5 p-4 rounded-md shadow-lg text-white animate-fade-in
          ${toast.type === 'success' ? 'bg-green-500' : ''}
          ${toast.type === 'error' ? 'bg-red-500' : ''}
          ${toast.type === 'info' ? 'bg-blue-500' : ''}
          z-[100]`}>
          {toast.message}
        </div>
      )}
    </AppContext.Provider>
  );
};