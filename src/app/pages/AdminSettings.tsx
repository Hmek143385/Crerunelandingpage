import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "../../utils/supabase";
import { 
  Save, 
  Globe, 
  Mail, 
  Server, 
  ShieldCheck, 
  Smartphone,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "../components/AdminLayout";
import { motion } from "motion/react";

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");

  // Fetch settings
  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => apiCall("/settings"),
  });

  // Fetch SMTP config
  const { data: smtpConfig, isLoading: loadingSmtp } = useQuery({
    queryKey: ["admin-smtp"],
    queryFn: () => apiCall("/smtp-config"),
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: any) =>
      apiCall("/settings", {
        method: "PUT",
        body: JSON.stringify(newSettings),
      }),
    onSuccess: () => {
      toast.success("Paramètres mis à jour");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
  });

  // Update SMTP mutation
  const updateSmtpMutation = useMutation({
    mutationFn: (newConfig: any) =>
      apiCall("/smtp-config", {
        method: "PUT",
        body: JSON.stringify(newConfig),
      }),
    onSuccess: () => {
      toast.success("Configuration SMTP enregistrée");
      queryClient.invalidateQueries({ queryKey: ["admin-smtp"] });
    },
  });

  const handleSettingsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    updateSettingsMutation.mutate(data);
  };

  const handleSmtpSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    updateSmtpMutation.mutate(data);
  };

  if (loadingSettings || loadingSmtp) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin w-10 h-10 border-4 border-[#EE3B33] border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Paramètres</h1>
        <p className="text-slate-500">Configurez l'apparence et le fonctionnement de votre plateforme.</p>
      </header>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab("general")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'general' ? 'bg-[#EE3B33] text-white font-bold shadow-lg shadow-red-500/20' : 'text-slate-600 hover:bg-white'}`}
          >
            <Globe size={20} />
            <span>Général</span>
          </button>
          <button 
            onClick={() => setActiveTab("smtp")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'smtp' ? 'bg-[#EE3B33] text-white font-bold shadow-lg shadow-red-500/20' : 'text-slate-600 hover:bg-white'}`}
          >
            <Server size={20} />
            <span>Serveur SMTP</span>
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'security' ? 'bg-[#EE3B33] text-white font-bold shadow-lg shadow-red-500/20' : 'text-slate-600 hover:bg-white'}`}
          >
            <ShieldCheck size={20} />
            <span>Sécurité</span>
          </button>
          <button 
            onClick={() => setActiveTab("contact")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'contact' ? 'bg-[#EE3B33] text-white font-bold shadow-lg shadow-red-500/20' : 'text-slate-600 hover:bg-white'}`}
          >
            <Smartphone size={20} />
            <span>Coordonnées</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100"
          >
            {activeTab === "general" && (
              <form onSubmit={handleSettingsSubmit} className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-800">Paramètres du Site</h2>
                  <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-[#EE3B33] text-white rounded-xl font-bold hover:bg-[#880E4F] transition-all">
                    <Save size={18} /> Enregistrer
                  </button>
                </div>

                <div className="grid gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Titre Hero (Landing)</label>
                    <textarea 
                      name="hero_title"
                      defaultValue={settings?.hero_title}
                      rows={2}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#EE3B33]/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Sous-titre Hero</label>
                    <textarea 
                      name="hero_subtitle"
                      defaultValue={settings?.hero_subtitle}
                      rows={3}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#EE3B33]/20 outline-none"
                    />
                  </div>
                </div>
              </form>
            )}

            {activeTab === "smtp" && (
              <form onSubmit={handleSmtpSubmit} className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-800">Configuration Email (SMTP)</h2>
                  <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-[#EE3B33] text-white rounded-xl font-bold hover:bg-[#880E4F] transition-all">
                    <Save size={18} /> Enregistrer
                  </button>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3 mb-6 text-blue-800">
                  <Info size={20} className="shrink-0 mt-0.5" />
                  <p className="text-sm">
                    Ces paramètres sont utilisés pour envoyer les emails d'automatisation. Utilisez un service comme SendGrid, Mailjet ou Amazon SES.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Hôte SMTP</label>
                    <input 
                      name="host"
                      defaultValue={smtpConfig?.host}
                      placeholder="smtp.example.com"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#EE3B33]/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Port</label>
                    <input 
                      name="port"
                      defaultValue={smtpConfig?.port}
                      placeholder="587"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#EE3B33]/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Utilisateur</label>
                    <input 
                      name="user"
                      defaultValue={smtpConfig?.user}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#EE3B33]/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Mot de passe</label>
                    <input 
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#EE3B33]/20 outline-none"
                    />
                  </div>
                </div>
              </form>
            )}

            {activeTab === "contact" && (
              <form onSubmit={handleSettingsSubmit} className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-800">Coordonnées de l'entreprise</h2>
                  <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-[#EE3B33] text-white rounded-xl font-bold hover:bg-[#880E4F] transition-all">
                    <Save size={18} /> Enregistrer
                  </button>
                </div>

                <div className="grid gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email de contact</label>
                    <input 
                      name="contact_email"
                      defaultValue={settings?.contact_email}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#EE3B33]/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Téléphone</label>
                    <input 
                      name="contact_phone"
                      defaultValue={settings?.contact_phone}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#EE3B33]/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Adresse</label>
                    <textarea 
                      name="contact_address"
                      defaultValue={settings?.contact_address}
                      rows={2}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#EE3B33]/20 outline-none"
                    />
                  </div>
                </div>
              </form>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Paramètres de sécurité</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <h4 className="font-bold text-slate-800">Authentification à deux facteurs</h4>
                      <p className="text-xs text-slate-500">Ajoutez une couche de sécurité supplémentaire à votre compte.</p>
                    </div>
                    <button className="px-4 py-2 bg-slate-200 text-slate-600 rounded-xl font-bold text-sm">Bientôt</button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <h4 className="font-bold text-slate-800">Logs de connexion</h4>
                      <p className="text-xs text-slate-500">Consultez l'historique des accès à l'interface admin.</p>
                    </div>
                    <button className="text-[#EE3B33] font-bold text-sm">Voir →</button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
