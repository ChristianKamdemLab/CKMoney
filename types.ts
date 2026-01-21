
export interface Loan {
  id: string;
  // Lender Details
  lenderName: string;
  lenderEmail: string;
  lenderCivility: 'M.' | 'Mme';
  lenderBirthDate: string;
  lenderBirthPlace: string;
  lenderAddress: string;
  lenderSignature: string;
  
  // Payment Preferences
  lenderIban?: string;
  lenderPaymentLink?: string;

  // Borrower Details (Remplis par le prêteur désormais)
  borrowerName: string;
  borrowerCivility: 'M.' | 'Mme';
  borrowerBirthDate: string;
  borrowerBirthPlace: string;
  borrowerAddress: string;
  borrowerEmail?: string; 
  borrowerPhone?: string; // Format international sans +, ex: 33612345678
  
  // La signature emprunteur est désormais sur le document papier uploadé
  borrowerSignature?: string; 

  // Loan Details
  amount: number;
  currency: string;
  loanDate: string;
  repaymentDate: string;
  
  // Status
  status: 'pending_borrower' | 'active' | 'repayment_pending' | 'paid' | 'delay_requested';
  lateInterestRate?: number;
  
  // Contract Data
  contractText?: string;
  city?: string;
  country?: string; // Pays du prêteur (contexte signature)
  
  // Champs spécifiques pour l'automatisation
  lenderCountry?: string;
  borrowerCountry?: string;

  signedDate?: string;
  signedContractUrl?: string; // URL/Base64 du contrat scanné

  // Repayment Data
  repaymentDeclaredDate?: string;
  repaymentMethod?: string;
  repaymentProof?: string;

  // Delay / Amendment Request
  delayProposedDate?: string; 
  delayRequestDate?: string; 

  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  loanId: string;
  type: 'info' | 'warning' | 'danger' | 'success' | 'action_required';
  title: string;
  message: string;
  date: string;
  read: boolean;
  actionType?: 'review_delay' | 'review_payment';
}

export interface CalculationResult {
  daysLate: number;
  interestAmount: number;
  totalDue: number;
  isOverdue: boolean;
  daysRemaining: number;
  dailyCost: number; // Coût par jour
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}
