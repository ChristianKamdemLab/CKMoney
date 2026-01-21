
import React from 'react';
import { ShieldCheck, ArrowLeft, Lock } from 'lucide-react';

interface LegalDocsProps {
  view: 'cgu' | 'privacy';
  onClose: () => void;
}

const LegalDocs: React.FC<LegalDocsProps> = ({ view, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-50 z-50 overflow-y-auto animate-in slide-in-from-bottom-8 duration-300">
      <div className="max-w-3xl mx-auto px-6 py-12">
        
        {/* Header */}
        <button 
          onClick={onClose} 
          className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors"
        >
          <ArrowLeft size={20} /> Retour au Dashboard
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-xl p-8 sm:p-12">
          {view === 'cgu' ? (
            <div className="prose prose-slate max-w-none">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-slate-900 text-white rounded-2xl">
                    <ShieldCheck size={32} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 m-0">Conditions Générales d'Utilisation</h1>
              </div>

              <div className="space-y-8 text-slate-600 leading-relaxed">
                 <section>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">1. Indépendance de la plateforme</h3>
                    <p>
                        CKMoney est un outil technique permettant la génération de reconnaissances de dette entre particuliers. 
                        CKMoney n'est ni une banque, ni un organisme de crédit, ni un intermédiaire financier. 
                        L'application n'est pas responsable de la véracité des informations saisies, de la solvabilité de l'emprunteur, ou des éventuels défauts de remboursement.
                    </p>
                 </section>

                 <section>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">2. Respect du Taux d'Usure</h3>
                    <p>
                        Le prêteur est seul responsable du respect de la législation en vigueur concernant les taux d'intérêt. 
                        Il est rappelé que le prêt entre particuliers ne doit pas dépasser le taux d'usure légal publié trimestriellement par la Banque de France (ou l'autorité compétente du pays de signature). 
                        Toute clause fixant un taux usuraire est réputée non écrite.
                    </p>
                 </section>

                 <section>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">3. Valeur Juridique</h3>
                    <p>
                        Les documents générés par CKMoney sont des modèles de reconnaissance de dette régis par les articles 1376 et suivants du Code Civil. 
                        Pour être valables, ils doivent être signés par les deux parties. La mention manuscrite ("Lu et approuvé") est fortement recommandée sur la version papier.
                    </p>
                 </section>
              </div>
            </div>
          ) : (
            <div className="prose prose-slate max-w-none">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-emerald-500 text-white rounded-2xl">
                    <Lock size={32} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 m-0">Politique de Confidentialité</h1>
              </div>

              <div className="space-y-8 text-slate-600 leading-relaxed">
                 <section>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">1. Stockage Local (Local Storage)</h3>
                    <p>
                        CKMoney privilégie une approche "Privacy-First". 
                        Les informations sensibles telles que votre IBAN ou vos brouillons de contrats sont stockées prioritairement dans la mémoire locale de votre navigateur (LocalStorage).
                    </p>
                 </section>

                 <section>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">2. Traitement des Données</h3>
                    <p>
                        Les données transmises à nos serveurs (pour la génération PDF ou le cloud backup) sont chiffrées. 
                        Nous ne vendons aucune donnée personnelle à des tiers. Les contrats générés sont privés et accessibles uniquement par le prêteur et l'emprunteur désignés.
                    </p>
                 </section>
              </div>
            </div>
          )}
        </div>
        
        <p className="mt-8 text-center text-xs text-slate-400 font-medium">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>
    </div>
  );
};

export default LegalDocs;
