
import React, { useState, useEffect } from 'react';
import { Loan } from '../types';
import { calculateDueAmount, formatDate } from '../utils/calculations';
import { fetchExchangeRate } from '../services/exchangeRate';
import { Calendar, User, CreditCard, AlertCircle, CheckCircle2, Coins, TrendingUp, Loader2 } from 'lucide-react';

interface LoanCardProps {
  loan: Loan;
  onClick: (loan: Loan) => void;
  onMarkAsPaid: (id: string) => void;
}

const LoanCard: React.FC<LoanCardProps> = ({ loan, onClick, onMarkAsPaid }) => {
  const [eurEquivalent, setEurEquivalent] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(false);
  const calculation = calculateDueAmount(loan.amount, loan.repaymentDate, loan.status);

  useEffect(() => {
    if (loan.currency !== 'EUR' && loan.status !== 'paid') {
      setLoadingRate(true);
      fetchExchangeRate(loan.amount, loan.currency).then(rate => {
        setEurEquivalent(rate);
        setLoadingRate(false);
      });
    }
  }, [loan.amount, loan.currency, loan.status]);

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
              <User size={24} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg tracking-tight">{loan.borrowerName}</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{loan.city}, {loan.country}</p>
            </div>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
            loan.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 
            calculation.isOverdue ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-indigo-100 text-indigo-700'
          }`}>
            {loan.status === 'paid' ? 'Soldé' : calculation.isOverdue ? 'En Retard' : 'Actif'}
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between text-slate-600">
            <div className="flex items-center gap-3">
              <CreditCard size={18} className="text-slate-300" />
              <span className="text-sm font-bold">Principal</span>
            </div>
            <span className="font-black text-slate-900">{loan.amount.toLocaleString('fr-FR')} {loan.currency}</span>
          </div>

          {loan.currency !== 'EUR' && (
            <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-2xl">
              <div className="flex items-center gap-3 text-indigo-600">
                {loadingRate ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />}
                <span className="text-xs font-black uppercase tracking-tighter">Val. Marché (EUR)</span>
              </div>
              <span className="font-black text-indigo-700">
                {eurEquivalent ? `≈ ${eurEquivalent.toFixed(2)} €` : '...'}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-slate-600">
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-slate-300" />
              <span className="text-sm font-bold">Échéance</span>
            </div>
            <span className="text-sm font-bold text-slate-900">{formatDate(loan.repaymentDate)}</span>
          </div>
          
          {calculation.isOverdue && loan.status !== 'paid' && (
            <div className="mt-4 p-4 bg-rose-50 rounded-2xl border border-rose-100 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Pénalités de retard (1%/j)</span>
                <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-lg">+{calculation.daysLate}J</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-rose-700">Total dû avec intérêts</span>
                <span className="font-black text-rose-800 text-xl">{calculation.totalDue.toLocaleString('fr-FR')} {loan.currency}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => onClick(loan)}
            className="flex-1 px-4 py-3 bg-slate-100 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-colors"
          >
            Voir Contrat
          </button>
          {loan.status !== 'paid' && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsPaid(loan.id);
              }}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={14} />
              Rembourser
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanCard;
