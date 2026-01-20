
import React, { useState } from 'react';
import { X, ShieldCheck, Lock, ArrowRight, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';

interface PaymentPortalProps {
  amount: number;
  currency: string;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentPortal: React.FC<PaymentPortalProps> = ({ amount, currency, onClose, onSuccess }) => {
  const [step, setStep] = useState<'method' | 'login' | 'processing' | 'success'>('method');
  const [method, setMethod] = useState<'paypal' | 'bank' | null>(null);

  const handleMethodSelect = (m: 'paypal' | 'bank') => {
    setMethod(m);
    setStep('login');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(onSuccess, 2000);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Lock className="text-emerald-500" size={18} />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Paiement Sécurisé</span>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {step === 'method' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center mb-8">
                <p className="text-slate-500 text-sm font-medium mb-1">Montant à rembourser</p>
                <h3 className="text-4xl font-black text-slate-900">{amount.toLocaleString('fr-FR')} {currency}</h3>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => handleMethodSelect('paypal')}
                  className="w-full p-6 bg-[#0070ba] text-white rounded-3xl flex items-center justify-between group hover:bg-[#005ea6] transition-all shadow-xl shadow-blue-100"
                >
                  <div className="flex items-center gap-4">
                    <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" className="h-6 rounded" alt="Paypal" />
                    <span className="font-bold">PayPal</span>
                  </div>
                  <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </button>

                <button 
                  onClick={() => handleMethodSelect('bank')}
                  className="w-full p-6 bg-slate-900 text-white rounded-3xl flex items-center justify-between group hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                >
                  <div className="flex items-center gap-4">
                    <CreditCard size={24} />
                    <span className="font-bold">Banque / Revolut</span>
                  </div>
                  <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </button>
              </div>

              <p className="text-[10px] text-center text-slate-400 font-medium px-4">
                Vos informations bancaires sont cryptées et jamais stockées sur nos serveurs.
              </p>
            </div>
          )}

          {step === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${method === 'paypal' ? 'bg-[#0070ba]/10 text-[#0070ba]' : 'bg-slate-100 text-slate-900'}`}>
                  {method === 'paypal' ? <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" className="h-6" alt="Paypal" /> : <CreditCard />}
                </div>
                <h3 className="text-xl font-black text-slate-900">Connexion à {method === 'paypal' ? 'PayPal' : 'votre banque'}</h3>
                <p className="text-sm text-slate-500 font-medium">Lien de paiement pour le remboursement</p>
              </div>

              <div className="space-y-4">
                <input required type="email" placeholder="Email ou Identifiant" className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all" />
                <input required type="password" placeholder="Mot de passe" className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all" />
              </div>

              <button className={`w-full py-4 rounded-2xl text-white font-black shadow-lg transition-all ${method === 'paypal' ? 'bg-[#0070ba] hover:bg-[#005ea6]' : 'bg-slate-900 hover:bg-slate-800'}`}>
                Confirmer le transfert
              </button>
              
              <button type="button" onClick={() => setStep('method')} className="w-full text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600">
                Changer de méthode
              </button>
            </form>
          )}

          {step === 'processing' && (
            <div className="text-center py-12 animate-in fade-in zoom-in">
              <div className="relative w-24 h-24 mx-auto mb-8">
                <Loader2 className="w-full h-full text-indigo-500 animate-spin" size={60} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck className="text-indigo-200" size={32} />
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Traitement Sécurisé</h3>
              <p className="text-sm text-slate-500 font-medium px-8">Communication avec les serveurs de {method === 'paypal' ? 'PayPal' : 'votre banque'}...</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-12 animate-in zoom-in-50 duration-500">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-50">
                <CheckCircle2 size={48} className="animate-in slide-in-from-bottom-2" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Paiement Réussi !</h3>
              <p className="text-sm text-slate-500 font-medium px-8">Le montant de {amount.toLocaleString('fr-FR')} {currency} a été transféré avec succès. Votre contrat sera mis à jour.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPortal;
