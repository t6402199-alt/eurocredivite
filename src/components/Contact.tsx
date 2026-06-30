import React, { useState } from 'react';
import { 
  getContactMessages, saveContactMessages, mockSendEmailNotification 
} from '../services/api';
import { ContactMessage } from '../types';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Contact() {
  const [formData, setFormData] = useState({
    nomComplet: '',
    email: '',
    telephone: '',
    sujet: '',
    message: ''
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.nomComplet.trim()) errors.nomComplet = 'Le nom complet est obligatoire.';
    
    if (!formData.email.trim()) {
      errors.email = 'L’adresse e-mail est obligatoire.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Veuillez saisir un e-mail valide.';
    }

    if (!formData.telephone.trim()) {
      errors.telephone = 'Le numéro de téléphone est obligatoire.';
    } else if (!/^[+]?[0-9\s.-]{8,20}$/.test(formData.telephone)) {
      errors.telephone = 'Veuillez saisir un numéro de téléphone valide.';
    }

    if (!formData.sujet.trim()) {
      errors.sujet = 'Le sujet est obligatoire.';
    }

    if (!formData.message.trim()) {
      errors.message = 'Le message ne peut pas être vide (minimum 10 caractères).';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Le message doit contenir au moins 10 caractères.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setStatus('loading');

    fetch('https://formspree.io/f/mzdwjnkv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: formData.nomComplet,
        nomComplet: formData.nomComplet,
        email: formData.email,
        telephone: formData.telephone,
        sujet: formData.sujet,
        message: formData.message
      })
    })
    .then(response => {
      if (response.ok) {
        try {
          const messages = getContactMessages();
          const newMessage: ContactMessage = {
            id: `msg-${Date.now()}`,
            nomComplet: formData.nomComplet,
            email: formData.email,
            telephone: formData.telephone,
            sujet: formData.sujet,
            message: formData.message,
            createdAt: new Date().toISOString(),
            lu: false
          };

          messages.unshift(newMessage);
          saveContactMessages(messages);

          // Send mock email notification to the agent's owner as required
          const emailBody = `Bonjour,

Un nouveau message a été envoyé depuis le formulaire de contact par ${formData.nomComplet} (Téléphone: ${formData.telephone}).

Sujet : ${formData.sujet}

Message :
"${formData.message}"

Consultez et répondez à ce message depuis l'espace de gestion Admin de CrediVite.

Cordialement,
Le service CrediVite.`;

          mockSendEmailNotification(
            'sillyfr079@gmail.com', // Dynamic email target
            `Nouveau message de contact - ${formData.nomComplet}`,
            emailBody,
            'message_recu'
          );
        } catch (localErr) {
          console.error('Local store error:', localErr);
        }

        setStatus('success');
        setFormData({
          nomComplet: '',
          email: '',
          telephone: '',
          sujet: '',
          message: ''
        });
      } else {
        setStatus('error');
      }
    })
    .catch(err => {
      console.error(err);
      setStatus('error');
    });
  };

  return (
    <div id="contact-view" className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Contactez-nous</span>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mt-2">
            Une question ou besoin d’assistance ?
          </h1>
          <p className="text-slate-600 text-sm mt-4">
            Nos conseillers spécialisés vous recontactent sous 24 heures ouvrées.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
          {/* E-mail Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">E-mail de support</h3>
              <a href="mailto:contact@support-credivite.online" className="block text-sm font-bold text-slate-900 hover:text-emerald-600 mt-1 transition-colors notranslate">
                contact@support-credivite.online
              </a>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Notre secrétariat traite vos demandes sous 24h ouvrées.
              </p>
            </div>
          </div>

          {/* WhatsApp Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">WhatsApp Direct</h3>
              <a href="https://wa.me/13433418740" target="_blank" rel="noopener noreferrer" className="block text-sm font-bold text-slate-900 hover:text-emerald-600 mt-1 transition-colors notranslate">
                +1(343)341-8740
              </a>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Service client disponible 7j/7 pour vos dossiers.
              </p>
            </div>
          </div>

          {/* Address Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">Adresse</h3>
              <div className="block text-sm font-bold text-slate-900 mt-1 notranslate">
                Montréal, QUEBEC, CANADA
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Siège de notre organisation.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <div id="contact-form-container" className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950 mb-6">Formulaire de contact rapide</h2>
              
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-4"
                  >
                    <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-emerald-900">Votre message a été transmis avec succès !</h3>
                      <p className="text-xs text-emerald-700 leading-relaxed">
                        Merci de votre confiance. Une notification par e-mail a été adressée à notre équipe de conseillers. Nous analyserons votre message et vous répondrons dans les plus brefs délais.
                      </p>
                    </div>
                    <button
                      onClick={() => setStatus('idle')}
                      className="mt-2 text-xs font-semibold px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
                    >
                      Envoyer un nouveau message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    action="https://formspree.io/f/mzdwjnkv"
                    method="POST"
                    className="space-y-5"
                  >
                    
                    {/* Nom Complet */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Nom complet *</label>
                      <input
                        type="text"
                        name="nomComplet"
                        id="contact-nomComplet"
                        placeholder=""
                        value={formData.nomComplet}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 ${
                          validationErrors.nomComplet 
                            ? 'border-rose-400 focus:ring-rose-200/60' 
                            : 'border-slate-200 focus:ring-emerald-200/60 focus:border-emerald-600'
                        }`}
                      />
                      {validationErrors.nomComplet && (
                        <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1.5 font-medium">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {validationErrors.nomComplet}
                        </p>
                      )}
                    </div>

                    {/* Email et Téléphone Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Adresse e-mail *</label>
                        <input
                          type="email"
                          name="email"
                          id="contact-email"
                          placeholder=""
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 ${
                            validationErrors.email 
                              ? 'border-rose-400 focus:ring-rose-200/60' 
                              : 'border-slate-200 focus:ring-emerald-200/60 focus:border-emerald-600'
                          }`}
                        />
                        {validationErrors.email && (
                          <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1.5 font-medium">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            {validationErrors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Numéro de téléphone *</label>
                        <input
                          type="tel"
                          name="telephone"
                          id="contact-telephone"
                          placeholder=""
                          value={formData.telephone}
                          onChange={handleInputChange}
                          className={`w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 ${
                            validationErrors.telephone 
                              ? 'border-rose-400 focus:ring-rose-200/60' 
                              : 'border-slate-200 focus:ring-emerald-200/60 focus:border-emerald-600'
                          }`}
                        />
                        {validationErrors.telephone && (
                          <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1.5 font-medium">
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            {validationErrors.telephone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Sujet */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Sujet de votre demande *</label>
                      <input
                        type="text"
                        name="sujet"
                        id="contact-sujet"
                        placeholder=""
                        value={formData.sujet}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 ${
                          validationErrors.sujet 
                            ? 'border-rose-400 focus:ring-rose-200/60' 
                            : 'border-slate-200 focus:ring-emerald-200/60 focus:border-emerald-600'
                        }`}
                      />
                      {validationErrors.sujet && (
                        <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1.5 font-medium">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {validationErrors.sujet}
                        </p>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Votre message *</label>
                      <textarea
                        name="message"
                        id="contact-message"
                        rows={5}
                        placeholder=""
                        value={formData.message}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 ${
                          validationErrors.message 
                            ? 'border-rose-400 focus:ring-rose-200/60' 
                            : 'border-slate-200 focus:ring-emerald-200/60 focus:border-emerald-600'
                        }`}
                      />
                      {validationErrors.message && (
                        <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1.5 font-medium">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {validationErrors.message}
                        </p>
                      )}
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800 focus:outline-none cursor-pointer transition-colors active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        {status === 'loading' ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Transmission en cours...
                          </>
                        ) : (
                          <>
                            Envoyer le message
                            <Send className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>

                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>

      </div>
    </div>
  );
}
