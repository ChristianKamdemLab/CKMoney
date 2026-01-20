
import { GoogleGenAI } from "@google/genai";
import { Loan } from "../types";

export const generateContractContent = async (loan: Loan): Promise<string> => {
  // Préparation des détails pour l'IA et le Fallback
  const lenderDetails = `${loan.lenderCivility || ''} ${loan.lenderName}, né(e) le ${loan.lenderBirthDate ? new Date(loan.lenderBirthDate).toLocaleDateString('fr-FR') : '___'} à ${loan.lenderBirthPlace || '___'}, résidant à ${loan.lenderAddress || '___'}`;
  const borrowerDetails = `${loan.borrowerCivility || ''} ${loan.borrowerName}, né(e) le ${loan.borrowerBirthDate ? new Date(loan.borrowerBirthDate).toLocaleDateString('fr-FR') : '___'} à ${loan.borrowerBirthPlace || '___'}, résidant à ${loan.borrowerAddress || '___'}`;
  
  const loanDateStr = new Date(loan.loanDate).toLocaleDateString('fr-FR');
  const repaymentDateStr = new Date(loan.repaymentDate).toLocaleDateString('fr-FR');
  const signedDateStr = new Date(loan.signedDate).toLocaleDateString('fr-FR');

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `Génère une reconnaissance de dette formelle et juridique en français. 
    
    IMPORTANT : 
    1. Le texte doit être structuré avec des sauts de ligne clairs pour une lecture sur mobile.
    2. NE GÉNÈRE AUCUNE ZONE DE SIGNATURE (pas de lignes ou noms à la fin). Les signatures sont gérées par l'app.
    3. CLAUSE DE DEVISE : Le prêt est consenti en ${loan.currency}, mais le remboursement doit impérativement être effectué en EUROS (€). 
    4. Précise que la conversion se fera selon le taux de change en vigueur au moment du remboursement ou selon un accord mutuel, mais que la valeur finale de remboursement est en Euros.
  
    ENTRE LES SOUSSIGNÉS :
    1. LE PRÊTEUR :
       ${lenderDetails}
    
    2. L'EMPRUNTEUR :
       ${borrowerDetails}
  
    DÉTAILS DU PRÊT :
    - Montant principal : ${loan.amount} ${loan.currency} (Préciser en toutes lettres)
    - Date du prêt (versement des fonds) : ${loanDateStr}
    - Échéance de remboursement : ${repaymentDateStr}
    - Lieu de signature : ${loan.city}, ${loan.country}
    
    CONDITIONS DE RETARD :
    - Pénalité : 1% du montant principal par jour de retard après le ${repaymentDateStr}. Les intérêts sont également payables en Euros.
    
    FORMATAGE :
    - Titres en MAJUSCULES. Pas de markdown (* ou #).
    - Finir par : "Fait à ${loan.city}, le ${signedDateStr} en deux exemplaires originaux."`;
  
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.1, 
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("Réponse vide de l'IA");
    return text;

  } catch (error) {
    console.warn("Gemini API Error (using fallback template):", error);
    
    // --- MODELE DE SECOURS (FALLBACK) ---
    // Utilisé si l'API échoue, si la clé est manquante ou si le réseau est coupé.
    return `RECONNAISSANCE DE DETTE (Standardisé)

ENTRE LES SOUSSIGNÉS :

LE PRÊTEUR :
${lenderDetails}

ET

L'EMPRUNTEUR :
${borrowerDetails}

IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT :

1. OBJET DU PRÊT
Le Prêteur consent ce jour à l'Emprunteur un prêt d'un montant principal de ${loan.amount} ${loan.currency}.
L'Emprunteur reconnaît avoir reçu cette somme ce jour par virement ou remise d'espèces.

2. REMBOURSEMENT ET DEVISE
L'Emprunteur s'engage irrévocablement à rembourser la totalité de la somme susmentionnée au plus tard le ${repaymentDateStr}.
Il est expressément convenu que bien que le prêt soit libellé en ${loan.currency}, le remboursement devra être effectué en EUROS (€) selon la contre-valeur au jour du paiement.

3. INTÉRÊTS ET PÉNALITÉS
Le présent prêt est consenti sans intérêts jusqu'à la date d'échéance.
Toutefois, en cas de défaut de paiement à la date indiquée (${repaymentDateStr}), une pénalité de retard de 1% du montant principal sera appliquée par jour de retard, payable en Euros.

4. LOI APPLICABLE ET JURIDICTION
Le présent contrat est soumis au droit en vigueur dans le pays de signature. En cas de litige, les tribunaux compétents seront ceux du domicile du Prêteur.

Fait à ${loan.city}, le ${signedDateStr} en deux exemplaires originaux.`;
  }
};
