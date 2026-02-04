import { GoogleGenAI } from "@google/genai";
import { InvoiceData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateEmailDraft = async (invoice: InvoiceData, total: number): Promise<string> => {
  const currencySymbol = invoice.currency === 'ALL' ? 'Lek' : invoice.currency === 'EUR' ? '€' : '$';
  
  const dueDateText = invoice.dueDate ? `- Data e pagesës: ${invoice.dueDate}` : '';
  const senderIdText = invoice.senderId ? `(NUIS: ${invoice.senderId})` : '';
  const receiverIdText = invoice.receiverId ? `(NUIS: ${invoice.receiverId})` : '';

  const prompt = `
    Je një asistent administrativ shqiptar i sjellshëm dhe profesional.
    Shkruaj një email shoqërues për një faturë për klientin.
    
    Detajet e faturës:
    - Numri i Faturës: ${invoice.invoiceNumber}
    - Dërguesi: ${invoice.senderName} ${senderIdText}
    - Marrësi: ${invoice.receiverName} ${receiverIdText}
    - Totali: ${total.toFixed(2)} ${currencySymbol}
    ${dueDateText}
    
    Udhëzime:
    - Gjuha: Shqip standarde.
    - Turi: Profesional, mirënjohës dhe i qartë.
    - Përfshi titullin e emailit (Subject) dhe trupin e tekstit.
    - Mos shto placeholders si [Emri], përdor të dhënat reale më sipër.
    - Nëse data e pagesës nuk është e specifikuar, mos e përmend afatin, ose thuaj "sipas marrëveshjes".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "Nuk u gjenerua asnjë tekst.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ndodhi një gabim gjatë gjenerimit të email-it. Ju lutem provoni përsëri.";
  }
};