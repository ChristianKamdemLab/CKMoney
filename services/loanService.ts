
import { db } from "./firebase";
import { collection, addDoc, updateDoc, doc, getDoc, query, where, getDocs, orderBy, DocumentReference, DocumentSnapshot } from "firebase/firestore";
import { Loan } from "../types";
import { sendNotification } from "./notificationService";

const COLLECTION_NAME = "loans";
const LOCAL_STORAGE_KEY = "ckmoney_loans_backup";

// --- HELPERS LOCAL STORAGE (FALLBACK) ---
const getLocalLoans = (): Loan[] => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalLoans = (loans: Loan[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(loans));
};

const addLocalLoan = (loanData: Omit<Loan, 'id'>): string => {
  const loans = getLocalLoans();
  const newId = 'local_' + Math.random().toString(36).substr(2, 9);
  const newLoan: Loan = { id: newId, ...loanData } as Loan;
  loans.push(newLoan);
  saveLocalLoans(loans);
  return newId;
};

const updateLocalLoan = (loanId: string, updates: Partial<Loan>) => {
  const loans = getLocalLoans();
  const index = loans.findIndex(l => l.id === loanId);
  if (index !== -1) {
    loans[index] = { ...loans[index], ...updates };
    saveLocalLoans(loans);
  }
};

// --- TIMEOUT WRAPPER ---
const withTimeout = <T>(promise: Promise<T>, ms: number = 2000): Promise<T> => {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error("Firestore timeout - Connection too slow or blocked"));
        }, ms);

        promise
            .then(value => {
                clearTimeout(timer);
                resolve(value);
            })
            .catch(reason => {
                clearTimeout(timer);
                reject(reason);
            });
    });
};

// ----------------------------------------

export const createLoanRequest = async (loanData: Omit<Loan, 'id'>): Promise<string> => {
  try {
    const docRef = await withTimeout(addDoc(collection(db, COLLECTION_NAME), loanData)) as DocumentReference;
    return docRef.id;
  } catch (e) {
    console.warn("Firestore blocked or failed, switching to Offline Mode:", e);
    return addLocalLoan(loanData);
  }
};

export const updateLoan = async (loanId: string, updates: Partial<Loan>): Promise<void> => {
  try {
    if (loanId.startsWith('local_')) {
        updateLocalLoan(loanId, updates);
        return;
    }
    const loanRef = doc(db, COLLECTION_NAME, loanId);
    await withTimeout(updateDoc(loanRef, updates));
  } catch (e) {
    console.warn("Firestore update failed, saving locally:", e);
    updateLocalLoan(loanId, updates);
  }
};

// NOUVEAU : Fonction pour activer le prêt après upload du contrat signé
export const activateLoanWithContract = async (loanId: string, fileDataUrl: string): Promise<void> => {
    await updateLoan(loanId, {
        status: 'active',
        signedContractUrl: fileDataUrl,
        signedDate: new Date().toISOString()
    });
};

export const declareRepayment = async (loanId: string, method: string, proof: string | null = null): Promise<void> => {
    const loan = await getLoanById(loanId);
    if (!loan) return;

    const updates: any = {
        status: 'repayment_pending',
        repaymentMethod: method,
        repaymentDeclaredDate: new Date().toISOString()
    };
    
    if (proof) {
        updates.repaymentProof = proof;
    }

    await updateLoan(loanId, updates);

    // Notif Prêteur
    await sendNotification({
        userId: loan.lenderEmail,
        loanId: loanId,
        type: 'action_required',
        title: 'Remboursement Déclaré',
        message: `💰 ${loan.borrowerName} déclare vous avoir remboursé ${loan.amount} ${loan.currency}.`,
        actionType: 'review_payment'
    });
};

export const requestDelay = async (loanId: string, newDate: string): Promise<void> => {
    const loan = await getLoanById(loanId);
    if (!loan) return;

    await updateLoan(loanId, {
        status: 'delay_requested',
        delayProposedDate: newDate,
        delayRequestDate: new Date().toISOString()
    });

    // Notif Prêteur
    await sendNotification({
        userId: loan.lenderEmail,
        loanId: loanId,
        type: 'action_required',
        title: 'Demande de délai',
        message: `📅 ${loan.borrowerName} propose une nouvelle date de remboursement : le ${new Date(newDate).toLocaleDateString('fr-FR')}.`,
        actionType: 'review_delay'
    });
};

export const respondToDelay = async (loanId: string, accepted: boolean): Promise<void> => {
    const loan = await getLoanById(loanId);
    if (!loan || !loan.delayProposedDate) return;

    if (accepted) {
        await updateLoan(loanId, {
            status: 'active',
            repaymentDate: loan.delayProposedDate,
            delayProposedDate: undefined,
            delayRequestDate: undefined
        });
    } else {
        await updateLoan(loanId, {
            status: 'active',
            delayProposedDate: undefined,
            delayRequestDate: undefined
        });
    }
};

export const confirmPayment = async (loanId: string): Promise<void> => {
    const loan = await getLoanById(loanId);
    if (!loan) return;
    await updateLoan(loanId, { status: 'paid' });
};

export const getLoanById = async (loanId: string): Promise<Loan | null> => {
  if (loanId.startsWith('local_')) {
      const loans = getLocalLoans();
      return loans.find(l => l.id === loanId) || null;
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, loanId);
    const docSnap = await withTimeout(getDoc(docRef)) as DocumentSnapshot;

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Loan;
    } else {
        const loans = getLocalLoans();
        return loans.find(l => l.id === loanId) || null;
    }
  } catch (e) {
    const loans = getLocalLoans();
    return loans.find(l => l.id === loanId) || null;
  }
};

export const getUserLoans = async (userEmail: string): Promise<Loan[]> => {
  try {
    const loansRef = collection(db, COLLECTION_NAME);
    const qLender = query(loansRef, where("lenderEmail", "==", userEmail));
    const qBorrower = query(loansRef, where("borrowerEmail", "==", userEmail));

    const [lenderSnapshot, borrowerSnapshot] = await withTimeout(Promise.all([
      getDocs(qLender),
      getDocs(qBorrower)
    ]), 3000) as [any, any];

    // Utilisation d'une Map pour garantir l'unicité par ID
    const loansMap = new Map<string, Loan>();

    lenderSnapshot.forEach((doc: any) => {
        loansMap.set(doc.id, { id: doc.id, ...doc.data() } as Loan);
    });

    borrowerSnapshot.forEach((doc: any) => {
        loansMap.set(doc.id, { id: doc.id, ...doc.data() } as Loan);
    });
    
    // Créer un Set des 'createdAt' existants dans Firestore pour dédupliquer les prêts locaux 
    // qui seraient des copies (créés via fallback mais finalement sync)
    const existingCreatedAts = new Set(Array.from(loansMap.values()).map(l => l.createdAt));

    // Merge avec Local
    const localLoans = getLocalLoans().filter(
        l => l.lenderEmail === userEmail || l.borrowerEmail === userEmail
    );
    
    localLoans.forEach(localL => {
        // On n'ajoute que si l'ID n'existe pas DÉJÀ ET si le createdAt n'existe pas DÉJÀ
        if (!loansMap.has(localL.id) && !existingCreatedAts.has(localL.createdAt)) {
            loansMap.set(localL.id, localL);
        }
    });

    return Array.from(loansMap.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  } catch (e) {
    // Fallback offline total
    const localLoans = getLocalLoans().filter(
        l => l.lenderEmail === userEmail || l.borrowerEmail === userEmail
    );
    return localLoans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
};
