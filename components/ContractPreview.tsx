
import React, { useEffect } from 'react';
import { Loan } from '../types';
import { Printer, ArrowLeft, ShieldCheck, CheckCircle } from 'lucide-react';

interface ContractPreviewProps {
  loan: Loan;
  onClose: () => void;
  autoPrint?: boolean;
}

const ContractPreview: React.FC<ContractPreviewProps> = ({ loan, onClose, autoPrint }) => {
  const handlePrint = () => {
    window.print();
  };
  
  // Déclenchement automatique de l'impression si demandé
  useEffect(() => {
    if (autoPrint) {
        const timer = setTimeout(() => {
            window.print();
        }, 800);
        return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  const formattedSignedDate = new Date(loan.signedDate || loan.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-[100] flex sm:items-center sm:justify-center print:bg-white print:block print:relative print:z-0 print:p-0">
      
      {/* Styles spécifiques pour l'impression haute lisibilité */}
      <style>{`
        @media print {
          body, p, div, span, li {
            font-size: 12pt !important;
            line-height: 1.6 !important;
            color: black !important;
          }
          h1 {
            font-size: 24pt !important;
            font-weight: 900 !important;
            margin-bottom: 0.5cm !important;
          }
          h2, h3, .uppercase {
            font-size: 14pt !important;
            font-weight: bold !important;
          }
          .text-xs {
             font-size: 10pt !important;
          }
          .leading-relaxed {
             line-height: 1.8 !important;
          }
          .no-print {
             display: none !important;
          }
        }
      `}</style>

      {/* Container Principal : Pleine hauteur écran mobile (100dvh pour gérer la barre URL mobile) */}
      <div className="w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-4xl bg-white sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden print:shadow-none print:h-auto print:max-w-none print:rounded-none">
        
        {/* BARRE D'OUTILS FIXE EN HAUT - Z-Index élevé pour rester au dessus du texte */}
        <div className="bg-white border-b border-slate-100 px-4 py-4 sm:px-6 flex justify-between items-center z-50 shrink-0 no-print shadow-sm">
          <button 
            onClick={onClose} 
            className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-widest px-5 py-4 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all active:scale-95 touch-manipulation"
          >
            <ArrowLeft size={20} />
            Retour
          </button>
          
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 touch-manipulation"
          >
            <Printer size={20} />
            <span className="hidden sm:inline">Imprimer / PDF</span>
          </button>
        </div>

        {/* ZONE DE CONTENU DÉFILANTE - Scroll fluide natif */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-12 md:p-20 bg-white relative scroll-smooth overscroll-contain">
          
          <div className="max-w-full mx-auto text-slate-900 relative z-10 print:text-black pb-32 sm:pb-0">
            
            {/* Header Document */}
            <div className="text-center mb-10 sm:mb-16">
              <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 print:border-2 print:border-black print:text-black print:bg-white">
                <ShieldCheck size={14} />
                Accord Certifié Numériquement
              </div>
              <h1 className="serif text-2xl sm:text-4xl mb-6 font-bold tracking-tight leading-tight uppercase">Reconnaissance de Dette</h1>
              <div className="w-16 h-1.5 bg-indigo-600 mx-auto rounded-full print:bg-black"></div>
            </div>

            {/* Corps du texte */}
            <div className="serif text-base sm:text-xl leading-relaxed text-justify space-y-6 sm:space-y-10 text-slate-800 print:text-black print:text-[12pt] print:leading-normal antialiased">
              {loan.contractText ? (
                loan.contractText.split('\n').map((para, i) => (
                  para.trim() ? <p key={i} className="break-words">{para}</p> : <div key={i} className="h-2" />
                ))
              ) : (
                <div className="text-center py-20 text-slate-300 animate-pulse">
                  Chargement du contrat...
                </div>
              )}
            </div>

            {/* ZONE DE SIGNATURES */}
            <div className="mt-16 pt-8 border-t-2 border-slate-200 print:border-black print:mt-12 page-break-avoid">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 print:gap-8 items-start">
                
                {/* Bloc Prêteur */}
                <div className="flex flex-col text-left">
                  <p className="font-bold uppercase text-slate-900 mb-4 text-xs sm:text-sm print:text-black tracking-widest">LE PRÊTEUR</p>
                  
                  <div className="h-20 sm:h-24 mb-2 flex items-center justify-start relative">
                    {loan.lenderSignature ? (
                      <img 
                        src={loan.lenderSignature} 
                        alt="Signature Prêteur" 
                        className="max-h-full max-w-full object-contain" 
                      />
                    ) : (
                      <span className="text-slate-300 text-xs italic">Non signé</span>
                    )}
                  </div>
                  
                  <p className="text-[10px] text-slate-500 italic print:text-black font-medium">
                     Signé électroniquement le {formattedSignedDate} via CKMoney
                  </p>
                </div>

                {/* Bloc Emprunteur */}
                <div className="flex flex-col text-left mt-8 sm:mt-0">
                   <p className="font-bold uppercase text-slate-900 mb-4 text-xs sm:text-sm print:text-black tracking-widest">L'EMPRUNTEUR</p>
                   
                   <p className="text-[11px] text-slate-600 mb-4 print:text-black leading-tight italic">
                     Mention manuscrite "Lu et approuvé" suivie de la signature :
                   </p>
                   
                   <div className="h-20 sm:h-24 w-full"></div>
                   <div className="border-b border-slate-300 print:border-black w-3/4"></div>
                </div>

              </div>
              
              {/* Mentions légales bas de page */}
              <div className="mt-12 text-center text-[9px] text-slate-400 print:text-black print:mt-8">
                  <p>Document généré par CKMoney. Valeur juridique probante selon l'article 1376 du Code Civil.</p>
              </div>

              {/* Annexe Scannée */}
              {loan.signedContractUrl && (
                  <div className="mt-12 pt-12 border-t-4 border-slate-200 page-break-avoid print:block">
                      <h3 className="text-center font-bold uppercase mb-4 text-sm">Annexe : Contrat Scanné</h3>
                      <img src={loan.signedContractUrl} className="max-w-full mx-auto border shadow-lg rounded-xl" alt="Contrat scanné" />
                  </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPreview;
