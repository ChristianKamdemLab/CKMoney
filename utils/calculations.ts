
import { CalculationResult } from "../types";

export const calculateDueAmount = (amount: number, repaymentDate: string, status: string): CalculationResult => {
  if (status === 'paid') {
    return { daysLate: 0, interestAmount: 0, totalDue: amount, isOverdue: false };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(repaymentDate);
  due.setHours(0, 0, 0, 0);

  if (today <= due) {
    return { daysLate: 0, interestAmount: 0, totalDue: amount, isOverdue: false };
  }

  const diffTime = Math.abs(today.getTime() - due.getTime());
  const daysLate = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // 1% interest per day (simple interest based on principal)
  const interestRatePerDay = 0.01;
  const interestAmount = amount * interestRatePerDay * daysLate;
  const totalDue = amount + interestAmount;

  return {
    daysLate,
    interestAmount,
    totalDue,
    isOverdue: true
  };
};

export const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};
