
import { GoogleGenAI } from "@google/genai";
import { Loan } from "../types";

export const generateContractContent = async (loan: Loan): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Formatage des détails des parties
  const lenderDetails = `${loan.lenderCivility || ''} ${loan.lenderName}, né(e) le ${loan.lenderBirthDate ? new Date(loan.lenderBirthDate).toLocaleDateString('fr-FR') : '___'} à ${loan.lenderBirthPlace || '___'}, résidant à ${loan.lenderAddress || '___'}`;
  const borrowerDetails = `${loan.borrowerCivility || ''} ${loan.borrowerName}, né(e) le ${loan.borrowerBirthDate ? new Date(loan.borrowerBirthDate).toLocaleDateString('fr-FR') : '___'} à ${loan.borrowerBirthPlace || '___'}, résidant à ${loan.borrowerAddress || '___'}`;

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
  - Date du prêt (versement des fonds) : ${new Date(loan.loanDate).toLocaleDateString('fr-FR')}
  - Échéance de remboursement : ${new Date(loan.repaymentDate).toLocaleDateString('fr-FR')}
  - Lieu de signature : ${loan.city}, ${loan.country}
  
  CONDITIONS DE RETARD :
  - Pénalité : 1% du montant principal par jour de retard après le ${new Date(loan.repaymentDate).toLocaleDateString('fr-FR')}. Les intérêts sont également payables en Euros.
  
  FORMATAGE :
  - Titres en MAJUSCULES. Pas de markdown (* ou #).
  - Finir par : "Fait à ${loan.city}, le ${new Date(loan.signedDate).toLocaleDateString('fr-FR')} en deux exemplaires originaux."`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.2, 
        topP: 0.8,
      }
    });
    
    return response.text || "Erreur de génération.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Erreur lors de la rédaction du contrat.";
  }
};
