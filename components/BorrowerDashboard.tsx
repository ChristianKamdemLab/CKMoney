
import React, { useState } from 'react';
import { Loan } from '../types';
import { calculateDueAmount, formatDate } from '../utils/calculations';
import { declareRepayment, requestDelay } from '../services/loanService';
import ContractPreview from './ContractPreview';
import PaymentPortal from './PaymentPortal';
import { 
  ShieldCheck, Clock, Calendar, AlertTriangle, TrendingUp, 
  Download, CheckCircle2, User, ArrowRight, Loader2, Banknote, CreditCard, Lock, Hourglass
} from 'lucide-react';

interface BorrowerDashboardProps {
  loan: Loan;
  onClose: () => void;
}

const BorrowerDashboard: React.FC<BorrowerDashboardProps> = ({ loan, onClose }) => {
  const [showContract, setShowContract] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [newDelayDate, setNewDelayDate] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  
  const calc = calculateDueAmount(loan.amount, loan.repaymentDate, loan.status, loan.lateInterestRate || 0);
  
  // Coût journalier du retard
  const dailyPenalty = (loan.amount * ((loan.lateInterestRate || 0) / 100)) / 365;

  // Calcul du % de temps écoulé pour la barre de progression
  const startDate = new Date(loan.loanDate).getTime();
  const endDate = new Date(loan.repaymentDate).getTime();
  const now = new Date().getTime();
  const totalDuration = endDate - startDate;
  const elapsed = now - startDate;
  const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);

  // Détermination du statut d'urgence pour l'UI
  let statusColor = "bg-emerald-500";
  let statusBg = "bg-emerald-50";
  let statusText = "text-emerald-700";
  let alertMessage = null;

  if (loan.status === 'repayment_pending') {
      statusColor = "bg-purple-500";
      statusBg = "bg-purple-50";
      statusText = "text-purple-700";
  } else if (loan.status === 'delay_requested') {
      statusColor = "bg-indigo-500";
      statusBg = "bg-indigo-50";
      statusText = "text-indigo-700";
      alertMessage = "⏳ Demande de délai en cours d'examen par le prêteur.";
  } else if (calc.isOverdue) {
      statusColor = "bg-rose-500";
      statusBg = "bg-rose-50";
      statusText = "text-rose-700";
      alertMessage = `🚨 Échéance dépassée. La clause de retard est activée. Des intérêts de ${dailyPenalty.toFixed(2)} ${loan.currency} s'ajoutent désormais chaque jour.`;
  } else if (calc.daysRemaining <= 7) {
      statusColor = "bg-amber-500";
      statusBg = "bg-amber-50";
      statusText = "text-amber-700";
      if (calc.daysRemaining <= 1) {
          alertMessage = "⚠️ Dernier jour ! Votre remboursement est dû demain. Après cette date, la clause de retard s'appliquera.";
      } else {
          alertMessage = `📅 Rappel : Votre remboursement de ${loan.amount} ${loan.currency} est prévu dans ${calc.daysRemaining} jours.`;
      }
  }

  const handleDeclarePayment = async (method: string, proof: string | null) => {
      setLoadingAction(true);
      try {
          await declareRepayment(loan.id, method, proof);
          alert("Déclaration envoyée au prêteur !");
          setShowPayModal(false);
          window.location.reload();
      } catch (e) {
          console.error(e);
          alert("Erreur lors de la déclaration.");
      } finally {
          setLoadingAction(false);
      }
  };

  const handleRequestDelay = async () => {
      if (!newDelayDate) return;
      setLoadingAction(true);
      try {
          await requestDelay(loan.id, newDelayDate);
          alert("Demande de délai envoyée au prêteur.");
          setShowDelayModal(false);
          window.location.reload();
      } catch (e) {
          alert("Erreur lors de l'envoi.");
      } finally {
          setLoadingAction(false);
      }
  };

  if (showContract) {
      return <ContractPreview loan={loan} onClose={() => setShowContract(false)} />;
  }

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 overflow-y-auto">
      {/* Header Mobile App Style */}
      <div className="bg-slate-900 text-white pb-12 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="max-w-md mx-auto px-6 pt-8">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <ShieldCheck size={16} className="text-emerald-400" />
                    <span>Espace Tiers de Confiance</span>
                </div>
                <button onClick={onClose} className="bg-slate-800 p-2 rounded-full hover:bg-slate-700 transition-colors">
                    <ArrowRight size={20} />
                </button>
            </div>

            <div className="text-center space-y-2 relative z-10">
                <p className="text-slate-400 font-medium">Montant à rembourser</p>
                <h1 className="text-5xl font-black tracking-tighter">
                    {calc.totalDue.toLocaleString('fr-FR')} 
                    <span className="text-2xl text-indigo-400 ml-1">{loan.currency}</span>
                </h1>
                
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mt-4 ${statusBg} ${statusText} bg-opacity-10 backdrop-blur-md border border-white/10`}>
                    {loan.status === 'repayment_pending' ? (
                        <>
                         <Loader2 size={12} className="animate-spin" /> En attente validation
                        </>
                    ) : loan.status === 'delay_requested' ? (
                        <>
                         <Hourglass size={12} className="animate-pulse" /> Demande délai envoyée
                        </>
                    ) : calc.isOverdue ? (
                        <>
                        <AlertTriangle size={12} /> Retard (+{calc.daysLate}j)
                        </>
                    ) : (
                        <>
                        <Clock size={12} /> En cours ({calc.daysRemaining}j restants)
                        </>
                    )}
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 -mt-8 relative z-20 pb-20">
        
        {/* Alert Banner */}
        {alertMessage && (
            <div className="bg-white p-4 rounded-2xl shadow-lg border-l-4 border-amber-500 flex items-start gap-3 mb-6 animate-in slide-in-from-bottom-4">
                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                <p className="text-sm font-bold text-slate-700 leading-relaxed">{alertMessage}</p>
            </div>
        )}

        {/* Countdown Card */}
        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 mb-6">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h3 className="font-black text-slate-900 text-lg">Échéance</h3>
                    <p className="text-slate-500 text-sm font-medium">{formatDate(loan.repaymentDate)}</p>
                </div>
                {calc.isOverdue ? (
                    <div className="text-right">
                         <span className="text-rose-500 font-black text-2xl">+{calc.daysLate}</span>
                         <span className="text-xs font-bold text-rose-300 block uppercase">Jours de retard</span>
                    </div>
                ) : (
                    <div className="text-right">
                         <span className="text-indigo-600 font-black text-2xl">{calc.daysRemaining}</span>
                         <span className="text-xs font-bold text-indigo-300 block uppercase">Jours restants</span>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden relative">
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ${statusColor}`} 
                    style={{ width: `${calc.isOverdue ? 100 : progress}%` }}
                >
                    {calc.isOverdue && (
                        <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite] bg-[length:200%_100%] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                    )}
                </div>
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Début du prêt</span>
                <span>Date limite</span>
            </div>
        </div>

        {/* Penalty Simulator Module */}
        <div className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] mb-6">
            <div className="flex items-center gap-2 mb-3">
                <div className="bg-rose-100 p-1.5 rounded-lg text-rose-600">
                    <TrendingUp size={16} />
                </div>
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">Simulation Clause de Retard</h3>
            </div>
            
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                Votre contrat stipule un taux de pénalité de <strong className="text-slate-900">{loan.lateInterestRate}% annuel</strong> en cas de dépassement de la date limite.
            </p>

            <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Coût par jour de retard</span>
                <span className="font-black text-rose-500 text-lg">
                    {dailyPenalty.toFixed(2)} {loan.currency}
                </span>
            </div>
            {calc.isOverdue && (
                <p className="text-[10px] text-rose-500 font-bold mt-2 text-center">
                    Cumul actuel : {(calc.interestAmount).toFixed(2)} {loan.currency} de pénalités
                </p>
            )}
        </div>

        {/* Lender Info Card */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-8">
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <User size={16} className="text-indigo-500" /> Coordonnées du Prêteur
            </h3>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold">
                    {loan.lenderName.charAt(0)}
                </div>
                <div>
                    <p className="font-bold text-slate-900">{loan.lenderName}</p>
                    <p className="text-xs text-slate-500 font-medium">{loan.lenderEmail}</p>
                </div>
            </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
            {loan.status !== 'repayment_pending' && loan.status !== 'paid' && loan.status !== 'delay_requested' && (
                <>
                    <button 
                        onClick={() => setShowPayModal(true)}
                        className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                    >
                        <CheckCircle2 size={24} />
                        Rembourser maintenant
                    </button>
                    
                    {/* Bouton Demander Délai */}
                    <button 
                        onClick={() => setShowDelayModal(true)}
                        className="w-full py-4 bg-white text-indigo-600 border border-indigo-100 rounded-2xl font-bold text-sm shadow-sm hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                    >
                        <Hourglass size={18} />
                        Demander un délai supplémentaire
                    </button>
                </>
            )}

            {loan.status === 'repayment_pending' && (
                 <div className="w-full py-5 bg-purple-100 text-purple-700 rounded-2xl font-bold text-sm text-center border-2 border-purple-200 border-dashed">
                    En attente de confirmation par {loan.lenderName}
                 </div>
            )}
            
            {loan.status === 'delay_requested' && (
                 <div className="w-full py-5 bg-indigo-100 text-indigo-700 rounded-2xl font-bold text-sm text-center border-2 border-indigo-200 border-dashed">
                    Demande de délai envoyée le {new Date(loan.delayRequestDate!).toLocaleDateString()}
                 </div>
            )}

            <button 
                onClick={() => setShowContract(true)}
                className="w-full py-4 bg-slate-50 text-slate-900 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
            >
                <Download size={18} />
                Télécharger mon Contrat
            </button>
        </div>
      </div>

      {/* MODAL OPTIONS DE PAIEMENT */}
      {showPayModal && (
          <PaymentPortal 
              loan={loan}
              onClose={() => setShowPayModal(false)}
              onSuccess={(method, proof) => handleDeclarePayment(method, proof)}
          />
      )}

      {/* MODAL DEMANDE DE DÉLAI */}
      {showDelayModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 animate-in zoom-in-95">
                  <h3 className="text-xl font-black text-slate-900 mb-2">Demander un délai</h3>
                  <p className="text-sm text-slate-500 mb-6">
                      Si le prêteur accepte, un avenant sera généré et les pénalités seront recalculées sur la base de la nouvelle date.
                  </p>

                  <div className="space-y-4 mb-6">
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 uppercase">Nouvelle date souhaitée</label>
                          <input 
                              type="date" 
                              min={new Date().toISOString().split('T')[0]}
                              value={newDelayDate} 
                              onChange={(e) => setNewDelayDate(e.target.value)}
                              className="w-full p-4 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 outline-none font-bold text-slate-900" 
                           />
                      </div>
                  </div>

                  <div className="flex gap-3">
                      <button onClick={() => setShowDelayModal(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50">Annuler</button>
                      <button 
                        onClick={handleRequestDelay}
                        disabled={!newDelayDate || loadingAction}
                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 disabled:opacity-50"
                      >
                          {loadingAction ? <Loader2 className="animate-spin mx-auto"/> : 'Envoyer'}
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default BorrowerDashboard;
