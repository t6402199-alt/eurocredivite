import React from 'react';
import { Landmark, Award, ShieldCheck, Heart, User, CheckCircle } from 'lucide-react';

export default function APropos() {
  const milestones = [
    {
      year: '2016',
      title: 'Fondation de CrediVite',
      description: 'Lancement de l’agence par des courtiers désireux de simplifier l’accès au crédit à Paris.'
    },
    {
      year: '2018',
      title: 'Expansion Nationale',
      description: 'Partenariat direct conclu avec 12 grandes banques françaises majeures (BNPP, SG, LCL, etc.).'
    },
    {
      year: '2021',
      title: 'Transformation Digitale',
      description: 'Lancement du portail d’analyse instantanée et d’envoi de documents justificatifs dématérialisés.'
    },
    {
      year: '2024',
      title: 'Financement Record',
      description: 'Dépassement du cap symbolique des 500 millions d’euros de crédits octroyés à nos clients.'
    }
  ];

  const values = [
    {
      title: 'Proximité & Écoute',
      description: 'Nos clients ne sont pas des numéros de compte. Nous analysons chaque situation personnelle avec attention pour trouver l’offre de prêt la plus appropriée.',
      icon: <Heart className="h-6 w-6 text-emerald-600" />
    },
    {
      title: 'Rigueur réglementaire',
      description: 'Agréée par l’ACPR (Autorité de Contrôle Prudentiel et de Résolution), notre agence respecte strictement les règles du Code de la Consommation.',
      icon: <Award className="h-6 w-6 text-emerald-600" />
    }
  ];

  return (
    <div id="apropos-view" className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Qui sommes-nous ?</span>
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mt-2 leading-tight">
            Découvrez l’histoire et les valeurs de CrediVite
          </h1>
          <p className="text-slate-600 text-base mt-4">
            Fondée par des professionnels du courtage et de la banque d’affaires, notre agence est née d’une conviction : le parcours de demande de crédit traditionnel est excessivement laborieux. Nous l’avons réinventé.
          </p>
        </div>

        {/* Presentation block with layout split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white border border-slate-200/80 rounded-3xl p-8 lg:p-12 shadow-sm mb-16">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-950">Notre Mission fondamentale</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Nous agissons comme un intermédiaire impartial et rigoureux entre vous et les institutions de crédit. En combinant l’agilité de technologies 100% en ligne et l’expertise humaine de conseillers financiers certifiés, nous négocions et structurons votre dossier de crédit au meilleur coût du marché.
            </p>
            <p className="text-slate-600 text-sm leading-relaxed">
              Que vous souhaitiez concrétiser la construction de votre maison idéale, financer l'achat de votre véhicule hybride, financer des travaux d’amélioration thermique de votre habitat ou consolider plusieurs créances, nous simplifions chaque étape de l’obtention.
            </p>

            <div className="pt-2 grid grid-cols-2 gap-6">
              <div className="flex gap-2.5 items-start">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-sm font-bold text-slate-900">Négociations directes</span>
                  <span className="block text-xs text-slate-500">Avec plus de 15 banques européennes</span>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-sm font-bold text-slate-900">Honoraires transparents</span>
                  <span className="block text-xs text-slate-500">Pour de faibles honoraires intégrés au prêt</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-6 lg:p-8 space-y-6 flex flex-col justify-between h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/10 rounded-full pointer-events-none" />
            
            <div className="space-y-2">
              <span className="inline-block rounded px-2.5 py-1 text-xs font-bold uppercase bg-emerald-500 text-emerald-950">L'Agence CrediVite</span>
              <h3 className="text-xl font-bold">Un accompagnement d'experts de bout en bout</h3>
            </div>

            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="h-8 w-8 rounded-lg bg-slate-800 text-emerald-400 font-bold text-sm flex items-center justify-center shrink-0">1</div>
                <div>
                  <span className="block text-xs font-bold text-slate-100">Simulateur exhaustif</span>
                  <p className="text-[11px] text-slate-400">Permet d’ajuster et de budgétiser sereinement.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="h-8 w-8 rounded-lg bg-slate-800 text-emerald-400 font-bold text-sm flex items-center justify-center shrink-0">2</div>
                <div>
                  <span className="block text-xs font-bold text-slate-100">Dossier dématérialisé sécurisé</span>
                  <p className="text-[11px] text-slate-400">Pièces justificatives importées et cryptées.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="h-8 w-8 rounded-lg bg-slate-800 text-emerald-400 font-bold text-sm flex items-center justify-center shrink-0">3</div>
                <div>
                  <span className="block text-xs font-bold text-slate-100">Décision et versement</span>
                  <p className="text-[11px] text-slate-400">Versement sous quelques jours après l’offre de crédit.</p>
                </div>
              </li>
            </ul>

            <div className="pt-2 text-xs text-slate-400 italic">
              « Simplifier le crédit pour accélérer la réalisation de vos ambitions locales et de vos idées. »
            </div>
          </div>
        </div>

        {/* Corporate History Section */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-slate-900 text-center mb-12">Historique et jalons</h3>
          
          <div className="relative border-l border-slate-200 ml-4 md:ml-0 md:grid md:grid-cols-4 md:gap-4 md:border-l-0 md:border-t md:pt-8 space-y-8 md:space-y-0">
            {milestones.map((stone, idx) => (
              <div key={idx} className="relative pl-6 md:pl-0">
                {/* Visual bullet marker */}
                <div className="absolute top-0 left-0 -translate-x-[25px] md:-translate-x-0 md:top-[-41px] md:left-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600 font-bold text-[10px]">
                  •
                </div>
                <div className="text-sm font-bold text-emerald-600 font-mono mb-1">{stone.year}</div>
                <h4 className="text-base font-bold text-slate-950 mb-2">{stone.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{stone.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Agency values */}
        <div>
          <h3 className="text-2xl font-bold text-slate-900 text-center mb-12">Nos Valeurs cardinales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {values.map((v, idx) => (
              <div key={idx} className="bg-white border border-slate-200/60 rounded-2xl p-6 hover:shadow-md transition-all shadow-sm space-y-4">
                <div className="h-11 w-11 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  {v.icon}
                </div>
                <h4 className="text-base font-bold text-slate-900">{v.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Regulation Compliment Banner */}
        <div className="mt-16 rounded-xl bg-slate-900 text-white p-6 justify-between flex flex-col md:flex-row items-center gap-6 border border-slate-800">
          <div>
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold block mb-1">Garantie Souveraine</span>
            <span className="text-sm font-bold block">Protection stricte et respect de votre vie privée</span>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Toutes les données à caractère personnel et dossiers financiers sont conservés localement de manière chiffrée selon les directives strictes de la CNIL et du RGPD.
            </p>
          </div>
          <div className="text-xs text-slate-400 font-mono shrink-0 px-3.5 py-1.5 border border-slate-800 bg-slate-950 rounded-lg">
            RGPD CERTIFIED
          </div>
        </div>

      </div>
    </div>
  );
}
