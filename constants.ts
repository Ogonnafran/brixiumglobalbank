import { Currency, AppSettings, User, AdminUser, KYCStatus, TransactionStatus, TransactionType, KYCRequest, WithdrawalRequest, AppNotification, NotificationType, Transaction, NavItem, FeeSetting, NetworkFeeWallet } from './types';
import { LayoutDashboard, Users, Repeat, Landmark, FileText, UserCircle, Settings as SettingsIcon, ShieldCheck, CreditCard, Send, TrendingUp, AlertTriangle, Briefcase } from 'lucide-react'; // Added Briefcase for Fee Manager

export const APP_NAME = "Brixium Global Bank";
export const ADMIN_EMAIL = "brixiumglobalbank@gmail.com";
export const ADMIN_PASSWORD = "ogonna1@1"; 

export const INITIAL_USERS: User[] = [
  {
    id: 'user-001',
    name: 'Alice Wonderland',
    email: 'alice@example.com',
    hashedPassword: 'password123', 
    balance: 50000.75,
    currency: Currency.USD,
    isVerifiedKYC: true,
    transferPin: '1234',
    phone: '555-0101',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), 
  },
  {
    id: 'user-002',
    name: 'Bob The Builder',
    email: 'bob@example.com',
    hashedPassword: 'password456',
    balance: 125000.00,
    currency: Currency.EUR,
    isVerifiedKYC: false,
    phone: '555-0102',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), 
  },
  {
    id: 'user-003',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    hashedPassword: 'password789',
    balance: 7800.50,
    currency: Currency.NGN,
    isVerifiedKYC: true,
    transferPin: '5678',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), 
  },
];

export const INITIAL_ADMINS: AdminUser[] = [
  { id: 'admin-001', email: ADMIN_EMAIL, hashedPassword: ADMIN_PASSWORD }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-001',
    userId: 'user-001',
    type: TransactionType.DEPOSIT,
    status: TransactionStatus.COMPLETED,
    amount: 50000.75,
    currency: Currency.USD,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(),
    description: 'Initial account funding',
  },
  {
    id: 'txn-002',
    userId: 'user-001',
    type: TransactionType.TRANSFER,
    status: TransactionStatus.COMPLETED,
    amount: 200,
    currency: Currency.USD,
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    description: 'Transfer to Bob The Builder',
    toUserId: 'user-002',
    networkFee: 1, // Example applied fee
    networkFeeCurrency: Currency.USD,
  },
  {
    id: 'txn-003',
    userId: 'user-002',
    type: TransactionType.WITHDRAWAL,
    status: TransactionStatus.PENDING, // This might represent the withdrawal request before fee payment
    amount: 1000,
    currency: Currency.EUR,
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    description: 'Withdrawal to external account - Awaiting Fee',
    toAddress: '0x1234...abcd',
  },
];

export const INITIAL_KYC_REQUESTS: KYCRequest[] = [
  {
    id: 'kyc-001',
    userId: 'user-001',
    documentUrls: ['/mock-doc-alice-1.pdf', '/mock-doc-alice-2.jpg'],
    status: KYCStatus.APPROVED,
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 29).toISOString(),
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(),
    reviewerId: 'admin-001',
  },
  {
    id: 'kyc-002',
    userId: 'user-002',
    documentUrls: ['/mock-doc-bob-1.pdf'],
    status: KYCStatus.PENDING,
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
];

export const INITIAL_WITHDRAWAL_REQUESTS: WithdrawalRequest[] = [
  {
    id: 'wd-001',
    userId: 'user-002',
    amount: 1000,
    currency: Currency.EUR,
    walletAddress: '0x1234BobWalletAddress5678',
    status: TransactionStatus.PENDING, // This status means admin needs to approve/reject
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    // Assume fee was "paid" for this pending request based on a rule
    networkFeePaidAmount: 5,
    networkFeePaidCurrency: Currency.USD,
    networkFeePaymentWalletType: "USDT_TRC20",
    feeSettingId: "withdrawal_main_fee"
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-001',
    userId: 'user-001',
    adminOnly: false,
    type: NotificationType.KYC_APPROVED,
    message: 'Your KYC verification has been approved!',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(),
  },
  {
    id: 'notif-002',
    adminOnly: true,
    type: NotificationType.NEW_KYC_SUBMISSION,
    message: 'New KYC submission from Bob The Builder (bob@example.com).',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    linkTo: '/admin/kyc' 
  },
  {
    id: 'notif-003',
    adminOnly: true,
    type: NotificationType.NEW_WITHDRAWAL_REQUEST,
    message: 'New withdrawal request from Bob The Builder (bob@example.com) for 1000 EUR.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    linkTo: '/admin/withdrawals'
  },
];

const defaultFeePaymentOptions: NetworkFeeWallet[] = [
  { type: "USDT_TRC20", name: "USDT (TRC20 Network)", address: "ADMIN_USDT_TRC20_ADDRESS", network: "TRC20", qrCode: "/qr/usdt-trc20.png" },
  { type: "BITCOIN_BTC", name: "Bitcoin (BTC)", address: "ADMIN_BITCOIN_ADDRESS", network: "Bitcoin", qrCode: "/qr/bitcoin-btc.png" },
  { type: "ETHEREUM_ETH", name: "Ethereum (ETH)", address: "ADMIN_ETHEREUM_ADDRESS", network: "ERC20", qrCode: "/qr/ethereum-eth.png" },
];

const initialNetworkFees: FeeSetting[] = [
  {
    id: 'withdrawal_main_fee',
    transactionType: TransactionType.WITHDRAWAL,
    description: 'Standard fee for all external crypto withdrawals.',
    feeAmount: 5, // e.g., 5 USD
    feeCurrency: Currency.USD,
    isEnabled: true,
    paymentOptions: defaultFeePaymentOptions,
  },
  {
    id: 'transfer_internal_fee',
    transactionType: TransactionType.TRANSFER,
    description: 'Standard fee for internal user-to-user transfers.',
    feeAmount: 1, // e.g., 1 USD
    feeCurrency: Currency.USD,
    isEnabled: true,
    paymentOptions: defaultFeePaymentOptions.slice(0,1), // Example: only USDT for internal transfer fees
  }
];

export const INITIAL_SETTINGS: AppSettings = {
  supportedCurrencies: [Currency.USD, Currency.EUR, Currency.GBP, Currency.NGN, Currency.ZAR, Currency.CNY, Currency.INR, Currency.JPY],
  networkFees: initialNetworkFees,
  maintenanceMode: false,
  defaultUserCurrency: Currency.USD,
};

export const USER_NAV_ITEMS: NavItem[] = [
  { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/app/transfers', label: 'Transfers', icon: Send },
  { path: '/app/exchange', label: 'Exchange', icon: Repeat },
  { path: '/app/withdrawals', label: 'Withdrawals', icon: Landmark },
  { path: '/app/kyc', label: 'KYC', icon: FileText },
  { path: '/app/profile', label: 'Profile', icon: UserCircle },
  { path: '/app/settings', label: 'Settings', icon: SettingsIcon },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', label: 'User Management', icon: Users },
  { path: '/admin/transactions', label: 'Transactions', icon: CreditCard },
  { path: '/admin/kyc', label: 'KYC Requests', icon: ShieldCheck },
  { path: '/admin/withdrawals', label: 'Withdrawals', icon: TrendingUp }, 
  { path: '/admin/fees', label: 'Network Fee Manager', icon: Briefcase }, // New
  { path: '/admin/settings', label: 'System Settings', icon: SettingsIcon },
  { path: '/admin/notifications', label: 'Admin Alerts', icon: AlertTriangle},
];

// MOCK_EXCHANGE_RATES remains the same
export const MOCK_EXCHANGE_RATES: Record<Currency, Partial<Record<Currency, number>>> = {
  [Currency.USD]: {
    [Currency.USD]: 1,
    [Currency.EUR]: 0.93, 
    [Currency.GBP]: 0.79,
    [Currency.NGN]: 1500.00, 
    [Currency.ZAR]: 18.50,
    [Currency.CNY]: 7.25,
    [Currency.INR]: 83.30,
    [Currency.JPY]: 155.00,
  },
  [Currency.EUR]: {
    [Currency.USD]: 1.08, 
    [Currency.EUR]: 1,
    [Currency.GBP]: 0.85,
    [Currency.NGN]: 1620.00, 
    [Currency.ZAR]: 19.95,
    [Currency.CNY]: 7.82,
    [Currency.INR]: 89.80,
    [Currency.JPY]: 167.00,
  },
  [Currency.GBP]: {
    [Currency.USD]: 1.27,
    [Currency.EUR]: 1.18,
    [Currency.GBP]: 1,
    [Currency.NGN]: 1900.00, 
    [Currency.ZAR]: 23.45,
    [Currency.CNY]: 9.18,
    [Currency.INR]: 105.50,
    [Currency.JPY]: 196.50,
  },
  [Currency.NGN]: {
    [Currency.USD]: 0.00067, 
    [Currency.EUR]: 0.00062, 
    [Currency.GBP]: 0.00053,
    [Currency.NGN]: 1,
    [Currency.ZAR]: 0.0123,
    [Currency.CNY]: 0.0048,
    [Currency.INR]: 0.055,
    [Currency.JPY]: 0.103,
  },
  [Currency.ZAR]: {
    [Currency.USD]: 0.054,
    [Currency.EUR]: 0.050,
    [Currency.GBP]: 0.043,
    [Currency.NGN]: 81.00,
    [Currency.ZAR]: 1,
    [Currency.CNY]: 0.39,
    [Currency.INR]: 4.50,
    [Currency.JPY]: 8.38,
  },
  [Currency.CNY]: {
    [Currency.USD]: 0.138,
    [Currency.EUR]: 0.128,
    [Currency.GBP]: 0.109,
    [Currency.NGN]: 207.00,
    [Currency.ZAR]: 2.55,
    [Currency.CNY]: 1,
    [Currency.INR]: 11.48,
    [Currency.JPY]: 21.35,
  },
  [Currency.INR]: {
    [Currency.USD]: 0.012,
    [Currency.EUR]: 0.011,
    [Currency.GBP]: 0.0095,
    [Currency.NGN]: 18.00,
    [Currency.ZAR]: 0.22,
    [Currency.CNY]: 0.087,
    [Currency.INR]: 1,
    [Currency.JPY]: 1.86,
  },
  [Currency.JPY]: {
    [Currency.USD]: 0.00645,
    [Currency.EUR]: 0.00599,
    [Currency.GBP]: 0.00509,
    [Currency.NGN]: 9.68,
    [Currency.ZAR]: 0.119,
    [Currency.CNY]: 0.0468,
    [Currency.INR]: 0.537,
    [Currency.JPY]: 1,
  },
};
