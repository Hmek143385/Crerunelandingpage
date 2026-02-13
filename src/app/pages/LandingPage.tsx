import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Shield,
  TrendingDown,
  Users,
  CheckCircle2,
  ChevronRight,
  Building2,
  Stethoscope,
  Gavel,
  Calculator,
  Mail,
  Phone,
  MapPin,
  Menu,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { API_URL, publicAnonKey } from "../../utils/supabase";

// Premunia Brand Colors
const COLORS = {
  orange: "#F79E1B",
  coral: "#EE3B33",
  magenta: "#E91E63",
  purple: "#880E4F",
};

const CHART_DATA = [
  { name: "Investissement", value: 10000, color: "#CBD5E1" },
  { name: "Coût Réel (Tranche 41%)", value: 5900, color: "#F79E1B" },
  { name: "Économie d'Impôt", value: 4100, color: "#EE3B33" },
];

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fetch settings for dynamic content
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/settings`);
      if (!res.ok) throw new Error("Settings failed");
      return res.json();
    },
  });

  const leadMutation = useMutation({
    mutationFn: async (formData: any) => {
      const res = await fetch(`${API_URL}/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Submission failed");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Demande envoyée ! Nous vous contacterons prochainement.");
      const form = document.getElementById("lead-form") as HTMLFormElement;
      if (form) form.reset();
    },
    onError: () => {
      toast.error("Erreur lors de l'envoi. Veuillez réessayer.");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    leadMutation.mutate(data);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex-shrink-0 flex items-center">
              <img
                src="https://ucarecdn.com/8796d3aa-4089-4859-87df-1772ce670f61/-/format/auto/"
                alt="Premunia Logo"
                className="h-10 w-auto"
              />
            </div>
            <div className="hidden md:flex space-x-8 items-center">
              <a
                href="#avantages"
                className="text-slate-600 hover:text-[#EE3B33] transition-colors"
              >
                Avantages
              </a>
              <a
                href="#pourquoi"
                className="text-slate-600 hover:text-[#EE3B33] transition-colors"
              >
                Pourquoi Premunia
              </a>
              <a
                href="#cibles"
                className="text-slate-600 hover:text-[#EE3B33] transition-colors"
              >
                Cibles
              </a>
              <a
                href="#simulation"
                className="text-slate-600 hover:text-[#EE3B33] transition-colors"
              >
                Simulation
              </a>
              <a
                href="#formulaire"
                className="bg-[#EE3B33] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#880E4F] transition-all shadow-lg shadow-coral/20"
              >
                Mon Diagnostic
              </a>
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-600"
              >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 py-4 px-4 space-y-4 animate-in slide-in-from-top duration-300">
            <a
              href="#avantages"
              className="block text-slate-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Avantages
            </a>
            <a
              href="#pourquoi"
              className="block text-slate-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Pourquoi Premunia
            </a>
            <a
              href="#cibles"
              className="block text-slate-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Cibles
            </a>
            <a
              href="#simulation"
              className="block text-slate-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Simulation
            </a>
            <a
              href="#formulaire"
              className="block bg-[#EE3B33] text-white text-center py-2 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Mon Diagnostic
            </a>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-l from-orange-50 to-transparent opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-[#F79E1B] font-medium text-sm">
                <Shield size={16} className="mr-2" />
                Spécialiste PER Professions Libérales
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 leading-[1.1]">
                {settings?.hero_title ||
                  "Préparez votre retraite sans sacrifier votre présent"}
              </h1>
              <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
                {settings?.hero_subtitle ||
                  "Le Plan Épargne Retraite (PER) sur-mesure pour les professions libérales : optimisez votre fiscalité dès aujourd'hui."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#formulaire"
                  className="inline-flex items-center justify-center px-8 py-4 bg-[#EE3B33] text-white rounded-full font-semibold text-lg hover:bg-[#880E4F] transition-all shadow-xl shadow-coral/30"
                >
                  Je demande mon diagnostic <ChevronRight className="ml-2" />
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-200 to-magenta-200 rounded-[2rem] rotate-3 blur-2xl opacity-20" />
              <img
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=800"
                alt="Professions libérales"
                className="relative rounded-[2rem] shadow-2xl object-cover h-[500px] w-full border-4 border-white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section id="formulaire" className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="grid md:grid-cols-5">
              <div className="md:col-span-2 bg-[#F79E1B] p-10 text-white flex flex-col justify-center">
                <h3 className="text-2xl font-bold mb-4 italic">
                  Diagnostic Gratuit
                </h3>
                <p className="opacity-90 mb-8 leading-relaxed">
                  Laissez-nous vos coordonnées, un expert Premunia analysera
                  votre situation sous 24h.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={20} /> <span>100% Personnalisé</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={20} /> <span>Sans engagement</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={20} />{" "}
                    <span>Confidentialité garantie</span>
                  </div>
                </div>
              </div>
              <div className="md:col-span-3 p-10">
                <form
                  id="lead-form"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Prénom
                      </label>
                      <input
                        name="first_name"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-coral/20 focus:border-[#EE3B33] outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Nom
                      </label>
                      <input
                        name="last_name"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-coral/20 focus:border-[#EE3B33] outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Profession
                    </label>
                    <select
                      name="profession"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-coral/20 focus:border-[#EE3B33] outline-none transition-all appearance-none bg-white"
                    >
                      <option value="">Sélectionnez votre métier</option>
                      <option value="Médecin / Santé">Médecin / Santé</option>
                      <option value="Avocat / Juridique">
                        Avocat / Juridique
                      </option>
                      <option value="Architecte">Architecte</option>
                      <option value="Consultant / Indépendant">
                        Consultant / Indépendant
                      </option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email professionnel
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-coral/20 focus:border-[#EE3B33] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-coral/20 focus:border-[#EE3B33] outline-none transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={leadMutation.isPending}
                    className="w-full py-4 bg-[#EE3B33] text-white rounded-xl font-bold text-lg hover:bg-[#880E4F] transition-all disabled:opacity-50"
                  >
                    {leadMutation.isPending
                      ? "Envoi en cours..."
                      : "Je demande mon diagnostic retraite"}
                  </button>
                  <p className="text-center text-xs text-slate-400">
                    En validant ce formulaire, vous acceptez nos conditions
                    générales d'utilisation.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section id="avantages" className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Un PER conçu pour votre réussite
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Trois piliers fondamentaux pour sécuriser votre avenir tout en
              optimisant votre présent.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-[#F79E1B]/30 transition-all hover:shadow-xl group">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-[#F79E1B] mb-6 group-hover:bg-[#F79E1B] group-hover:text-white transition-colors">
                <TrendingDown size={28} />
              </div>
              <h3 className="text-xl font-bold mb-4">Déductions Fiscales</h3>
              <p className="text-slate-600 leading-relaxed">
                Déduisez vos versements de votre revenu imposable. Plus votre
                tranche d'imposition est haute, plus l'économie est importante.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-[#EE3B33]/30 transition-all hover:shadow-xl group">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-[#EE3B33] mb-6 group-hover:bg-[#EE3B33] group-hover:text-white transition-colors">
                <Shield size={28} />
              </div>
              <h3 className="text-xl font-bold mb-4">Retraite sur-mesure</h3>
              <p className="text-slate-600 leading-relaxed">
                Adaptez vos versements en fonction de votre activité annuelle.
                Une flexibilité totale pour les revenus variables.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-[#E91E63]/30 transition-all hover:shadow-xl group">
              <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center text-[#E91E63] mb-6 group-hover:bg-[#E91E63] group-hover:text-white transition-colors">
                <TrendingDown size={28} />
              </div>
              <h3 className="text-xl font-bold mb-4">Gestion Évolutive</h3>
              <p className="text-slate-600 leading-relaxed">
                Bénéficiez d'une allocation d'actifs pilotée par des experts,
                qui se sécurise automatiquement à l'approche de votre retraite.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Professions */}
      <section id="cibles" className="py-24 bg-[#880E4F] text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Accompagnement Dédié
            </h2>
            <p className="opacity-80 max-w-2xl mx-auto italic">
              Nous connaissons les spécificités de chaque métier pour une
              expertise sans faille.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                icon: <Stethoscope size={40} />,
                label: "Santé",
                list: "Médecins, Chirurgiens...",
              },
              {
                icon: <Gavel size={40} />,
                label: "Droit",
                list: "Avocats, Notaires...",
              },
              {
                icon: <Building2 size={40} />,
                label: "Architecture",
                list: "Architectes, Urbanistes...",
              },
              {
                icon: <Calculator size={40} />,
                label: "Conseil",
                list: "Consultants, Experts...",
              },
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="mx-auto w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h4 className="text-xl font-bold mb-2">{item.label}</h4>
                <p className="text-sm opacity-60">{item.list}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simulation Section */}
      <section id="simulation" className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                L'impact fiscal immédiat <br />
                <span className="text-[#EE3B33]">Un exemple concret</span>
              </h2>
              <div className="space-y-4">
                <p className="text-lg text-slate-600 leading-relaxed">
                  Pour un professionnel en tranche marginale d'imposition (TMI)
                  à 41% :
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-bold">
                        Vous versez 10 000 € sur votre PER
                      </p>
                      <p className="text-sm text-slate-500">
                        Capital investi pour votre futur
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4 p-4 rounded-2xl bg-orange-50 border border-orange-100">
                    <div className="w-10 h-10 bg-orange-100 text-[#F79E1B] rounded-full flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-bold">
                        Votre économie d'impôt : 4 100 €
                      </p>
                      <p className="text-sm text-slate-500">
                        Déduction fiscale immédiate
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4 p-4 rounded-2xl bg-red-50 border border-red-100">
                    <div className="w-10 h-10 bg-red-100 text-[#EE3B33] rounded-full flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-bold">
                        Coût réel de l'effort : 5 900 €
                      </p>
                      <p className="text-sm text-slate-500">
                        Pour 10 000 € capitalisés
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 h-[400px]">
              <h4 className="text-lg font-bold mb-8 text-center">
                Visualisation de l'économie (TMI 41%)
              </h4>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart
                  data={CHART_DATA}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "1rem",
                      border: "none",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {CHART_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-center text-xs text-slate-400 mt-4 italic">
                Simulation basée sur un versement unique de 10 000€
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2 space-y-6">
              <img
                src="https://ucarecdn.com/8796d3aa-4089-4859-87df-1772ce670f61/-/format/auto/"
                alt="Premunia Logo White"
                className="h-10 w-auto brightness-0 invert"
              />
              <p className="text-slate-400 max-w-sm leading-relaxed">
                Premunia accompagne les professionnels indépendants dans la
                sécurisation de leur avenir et l'optimisation fiscale de leur
                patrimoine.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-[#EE3B33] transition-colors"
                >
                  <span className="sr-only">LinkedIn</span>
                  <Users size={18} />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Contact</h4>
              <ul className="space-y-4 text-slate-400">
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-[#EE3B33]" />{" "}
                  {settings?.contact_email || "contact@premunia.fr"}
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-[#EE3B33]" />{" "}
                  {settings?.contact_phone || "01 00 00 00 00"}
                </li>
                <li className="flex items-center gap-3">
                  <MapPin size={18} className="text-[#EE3B33]" />{" "}
                  {settings?.contact_address ||
                    "828 Av. Roger Salengro, 92370 Chaville"}
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Navigation</h4>
              <ul className="space-y-4 text-slate-400">
                <li>
                  <a
                    href="#avantages"
                    className="hover:text-white transition-colors"
                  >
                    Avantages
                  </a>
                </li>
                <li>
                  <a
                    href="#pourquoi"
                    className="hover:text-white transition-colors"
                  >
                    Pourquoi nous
                  </a>
                </li>
                <li>
                  <a
                    href="#simulation"
                    className="hover:text-white transition-colors"
                  >
                    Simulation
                  </a>
                </li>
                <li>
                  <a
                    href="/signin"
                    className="hover:text-white transition-colors"
                  >
                    Espace Pro
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
            <p>© 2026 Premunia. Tous droits réservés.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">
                Mentions Légales
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Confidentialité
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}