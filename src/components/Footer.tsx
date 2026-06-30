import React from 'react';
import { Landmark, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  setCurrentPage: (page: string) => void;
}

export default function Footer({ setCurrentPage }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="site-footer" className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          
          {/* Brand & info */}
          <div className="space-y-6 xl:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <Landmark className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white leading-tight">CrediVite</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md">
              Depuis plus de 10 ans, CrediVite accompagne les particuliers et professionnels dans la réalisation de leurs projets grâce à des solutions de financement simples, transparentes et sur-mesure.
            </p>
            <div className="flex items-center gap-2.5 text-xs text-emerald-500 font-medium">
              <ShieldCheck className="h-4 w-4" />
              Agrément ACPR n° 4876094 · Organisme certifié et régulé
            </div>
          </div>

          {/* Quick links & Contact Info */}
          <div className="mt-12 xl:col-span-2 xl:mt-0 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="max-w-xs">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-100">Mentions Légales</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
                <li className="hover:text-slate-300 cursor-pointer hover:text-emerald-400 transition-colors">Protection des données (RGPD)</li>
                <li className="hover:text-slate-300 cursor-pointer hover:text-emerald-400 transition-colors">Conditions Générales d'Utilisation</li>
                <li className="hover:text-slate-300 cursor-pointer hover:text-emerald-400 transition-colors">Conditions Générales de vente</li>
                <li className="hover:text-slate-300 cursor-pointer hover:text-emerald-400 transition-colors">Politique de Cookies</li>
              </ul>
            </div>
            <div className="max-w-xs">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-100">Contact & Support</h3>
              <ul className="mt-4 space-y-3 px-0 list-none">
                <li className="flex items-center gap-2.5 text-sm text-slate-400">
                  <Mail className="h-4 w-4 text-emerald-500 shrink-0" />
                  <a href="mailto:contact@support-credivite.online" className="hover:text-emerald-400 transition-colors notranslate">
                    contact@support-credivite.online
                  </a>
                </li>
                <li className="flex items-center gap-2.5 text-sm text-slate-400">
                  <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                  <a href="https://wa.me/13433418740" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors notranslate">
                    +1(343)341-8740 <span className="text-[10px] ml-1.5 px-1.5 py-0.5 bg-emerald-600/20 text-emerald-400 rounded-md font-semibold tracking-wide">WhatsApp</span>
                  </a>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-slate-400">
                  <MapPin className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="notranslate">
                    Montréal, QUEBEC, CANADA
                  </span>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Regulatory disclaimer warning removed */}
        <div className="mt-12 border-t border-slate-800/80 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-slate-500">
            <p>© {currentYear} CrediVite SAS. Tous droits réservés. Agence de courtage en crédits et opérations de banque.</p>
            <p>Conforme au RGPD et à la réglementation CNIL.</p>
          </div>
        </div>

      </div>
    </footer>
  );
}
