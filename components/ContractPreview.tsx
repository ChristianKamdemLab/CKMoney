
import React from 'react';
import { Loan } from '../types';
import { Printer, ArrowLeft, ShieldCheck, CheckCircle } from 'lucide-react';

interface ContractPreviewProps {
  loan: Loan;
  onClose: () => void;
}

const ContractPreview: React.FC<ContractPreviewProps> = ({ loan, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const formattedSignedDate = new Date(loan.signedDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl z-50 flex items-center justify-center overflow-y-auto print:bg-white print:block print:relative print:z-0 print:p-0">
      <div className="bg-white min-h-screen sm:min-h-0 w-full max-w-4xl sm:rounded-[2.5rem] shadow-2xl relative sm:my-8 animate-in slide-in-from-bottom-8 duration-500 overflow-hidden flex flex-col print:shadow-none print:my-0 print:rounded-none print:max-w-none">
        
        {/* Barre d'outils mobile - cachée au PDF */}
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 px-6 py-4 flex justify-between items-center no-print z-30 shrink-0">
          <button onClick={onClose} className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-widest px-3 py-2 hover:bg-slate-100 rounded-xl transition-all">
            <ArrowLeft size={18} />
            Retour
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
          >
            <Printer size={18} />
            Télécharger PDF
          </button>
        </div>

        {/* Document Officiel */}
        <div className="flex-1 p-8 sm:p-20 md:p-24 bg-white relative print:p-0 print:m-0 print:block">
          
          <div className="max-w-full mx-auto text-slate-900 relative z-10 print:text-black">
            
            {/* Header Document */}
            <div className="text-center mb-12 sm:mb-20">
              <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 print:border-2 print:border-black print:text-black print:bg-white">
                <ShieldCheck size={14} />
                Accord Certifié Numériquement
              </div>
              <h1 className="serif text-3xl sm:text-5xl mb-6 font-bold tracking-tight leading-tight uppercase">Reconnaissance de Dette</h1>
              <div className="w-24 h-2 bg-indigo-600 mx-auto rounded-full print:bg-black"></div>
            </div>

            {/* Corps du texte généré par Gemini */}
            <div className="serif text-lg sm:text-2xl leading-relaxed text-justify space-y-8 sm:space-y-12 text-slate-800 print:text-black print:text-[14pt] print:leading-normal antialiased">
              {loan.contractText ? (
                loan.contractText.split('\n').map((para, i) => (
                  para.trim() ? <p key={i} className="break-words">{para}</p> : <div key={i} className="h-4" />
                ))
              ) : (
                <div className="text-center py-20 text-slate-300 animate-pulse">
                  Rédaction du contrat en cours...
                </div>
              )}
            </div>

            {/* ZONE DE SIGNATURES ÉLECTRONIQUES UNIQUES */}
            <div className="mt-24 pt-12 border-t-4 border-slate-900 print:border-black print:mt-16 page-break-avoid">
              <h2 className="text-center text-xs font-black uppercase tracking-[0.5em] text-slate-400 mb-12 print:text-black">Signatures Électroniques Certifiées</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 sm:gap-20 print:grid-cols-2 print:gap-10">
                {/* Bloc Emprunteur */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-full h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center p-6 relative mb-4 print:bg-white print:border-slate-300 print:h-40">
                    {loan.borrowerSignature ? (
                      <img 
                        src={loan.borrowerSignature} 
                        alt="Signature Emprunteur" 
                        className="max-h-full max-w-full object-contain block opacity-100" // Forcer l'affichage
                      />
                    ) : (
                      <span className="text-slate-300 text-xs italic">Signature non détectée</span>
                    )}
                    <div className="absolute -top-3 -right-3 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg print:border print:border-black print:text-black print:bg-white no-print">
                      <CheckCircle size={16} />
                    </div>
                  </div>
                  <p className="text-xl font-black text-slate-900 uppercase tracking-tight mb-1 print:text-lg">{loan.borrowerName}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest print:text-black">L'Emprunteur - Signature Numérique</p>
                </div>

                {/* Bloc Prêteur */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-full h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center p-6 relative mb-4 print:bg-white print:border-slate-300 print:h-40">
                    {loan.lenderSignature ? (
                      <img 
                        src={loan.lenderSignature} 
                        alt="Signature Prêteur" 
                        className="max-h-full max-w-full object-contain block opacity-100" // Forcer l'affichage
                      />
                    ) : (
                      <span className="text-slate-300 text-xs italic">Signature non détectée</span>
                    )}
                    <div className="absolute -top-3 -right-3 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg print:border print:border-black print:text-black print:bg-white no-print">
                      <CheckCircle size={16} />
                    </div>
                  </div>
                  <p className="text-xl font-black text-slate-900 uppercase tracking-tight mb-1 print:text-lg">{loan.lenderName}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest print:text-black">Le Prêteur - Signature Numérique</p>
                </div>
              </div>

              {/* Validation en bas de page */}
              <div className="mt-20 text-center page-break-avoid">
                <p className="serif text-lg italic text-slate-600 mb-8 print:text-black print:text-sm">
                  Signé numériquement à {loan.city}, {loan.country} le {formattedSignedDate}
                </p>
                <div className="inline-block p-6 border-2 border-slate-100 rounded-3xl text-left print:border-black print:p-4">
                  <div className="flex items-start gap-4">
                    <ShieldCheck className="text-indigo-600 shrink-0 mt-1 print:text-black" size={24} />
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest leading-relaxed print:text-black">
                      <p className="font-black text-slate-800 mb-1 print:text-[8pt]">Authentification CKMoney Secure</p>
                      <p>ID Document : {loan.id.toUpperCase()}</p>
                      <p>Montant initial : {loan.amount} {loan.currency} | Remboursement : EUR (€)</p>
                      <p className="mt-2 font-bold text-slate-300 print:text-black">© {new Date().getFullYear()} Christian KAMDEM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPreview;
