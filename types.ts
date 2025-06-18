import { LucideIcon } from 'lucide-react';

export interface User {
  id: string;
  name: string;
  email: string;
  hashedPassword?: string; // Only for internal mock, not sent to client
  balance: number;
  currency: Currency;
  isVerifiedKYC: boolean;
  transferPin?: string; // Optional
  phone?: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  hashedPassword?: string; // Only for internal mock
}

export enum TransactionType {
  TRANSFER = 'Transfer',
  WITHDRAWAL = 'Withdrawal',
  DEPOSIT = 'Deposit', // For admin funding
  FEE = 'Fee', // For recording actual fee deduction if ever implemented beyond simulation
  EXCHANGE = 'Exchange'
}

export enum TransactionStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  REJECTED = 'Rejected',
  FEE_PENDING = 'Fee Pending' // Indicates user needs to "pay" fee for this transaction
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: Currency;
  date: string;
  description: string;
  fromUserId?: string; // For transfers
  toUserId?: string;   // For transfers
  toAddress?: string; // For withdrawals
  networkFee?: number; // The actual fee amount applied to this transaction
  networkFeeCurrency?: Currency; // Currency of the fee
  relatedTransactionId?: string; // To link fee payment to transfer or withdrawal request
}

export enum KYCStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  NOT_SUBMITTED = 'Not Submitted'
}

export interface KYCRequest {
  id: string;
  userId: string;
  documentUrls: string[]; // Mock URLs
  status: KYCStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewerId?: string; // Admin ID
}

export interface WithdrawalRequest {
  id:string;
  userId: string;
  amount: number;
  currency: Currency;
  walletAddress: string;
  status: TransactionStatus; // PENDING, COMPLETED (approved), REJECTED
  requestedAt: string;
  processedAt?: string;
  adminId?: string; // Admin who processed
  // Fields to store details about the fee paid (simulated) for this request
  networkFeePaidAmount?: number;
  networkFeePaidCurrency?: Currency;
  networkFeePaymentWalletType?: NetworkFeeWallet['type']; // Which type of wallet user claims to have paid to
  feeSettingId?: string; // ID of the FeeSetting rule applied
}

export enum NotificationType {
  INFO = 'Info',
  SUCCESS = 'Success',
  ERROR = 'Error',
  KYC_APPROVED = 'KYC Approved',
  KYC_REJECTED = 'KYC Rejected',
  WITHDRAWAL_APPROVED = 'Withdrawal Approved',
  WITHDRAWAL_REJECTED = 'Withdrawal Rejected',
  NEW_KYC_SUBMISSION = 'New KYC Submission',
  NEW_WITHDRAWAL_REQUEST = 'New Withdrawal Request',
  ADMIN_MESSAGE = 'Admin Message',
  TRANSFER_SENT = 'Transfer Sent',
  TRANSFER_RECEIVED = 'Transfer Received',
  BALANCE_DEDUCTED = 'Balance Deducted',
  BALANCE_FUNDED = 'Balance Funded',
  FEE_REQUIRED = 'Fee Required', // For notifications about pending fees
}

export interface AppNotification {
  id: string;
  userId?: string; // Target user, undefined for admin-wide notifications
  adminOnly: boolean; // True if only for admins
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
  linkTo?: string; // Optional link for navigation
}

export enum Currency {
  USD = 'USD', // United States Dollar
  EUR = 'EUR', // Euro
  GBP = 'GBP', // British Pound
  NGN = 'NGN', // Nigerian Naira
  ZAR = 'ZAR', // South African Rand
  CNY = 'CNY', // Chinese Yuan
  INR = 'INR', // Indian Rupee
  JPY = 'JPY', // Japanese Yen
}

export interface NetworkFeeWallet {
  type: 'USDT_TRC20' | 'TRON_TRX' | 'BITCOIN_BTC' | 'ETHEREUM_ETH' | 'CUSTOM';
  name: string; // e.g., "USDT TRC20 Wallet", "Main Bitcoin Fee Wallet"
  address: string;
  network: string; // e.g., "TRC20", "Bitcoin", "Ethereum (ERC20)"
  qrCode?: string; // Optional: path to a QR code image
  customTypeDetail?: string; // If type is CUSTOM, specifies the detail like "Solana SPL"
}

export interface FeeSetting {
  id: string; // Unique ID for this fee rule
  transactionType: TransactionType.WITHDRAWAL | TransactionType.TRANSFER;
  description: string;
  feeAmount: number;
  feeCurrency: Currency; // Currency of the fee itself
  isEnabled: boolean; // Admin can toggle this fee rule
  paymentOptions: NetworkFeeWallet[]; // Wallets where user sends this specific fee
}

export interface AppSettings {
  supportedCurrencies: Currency[];
  networkFees: FeeSetting[]; // New: Manages all fee rules
  maintenanceMode: boolean;
  defaultUserCurrency: Currency;
}

export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}
