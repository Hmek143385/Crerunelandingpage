import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "../../utils/supabase";
import { 
  Zap, 
  Mail, 
  Play, 
  Settings, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "../components/AdminLayout";
import { motion, AnimatePresence } from "motion/react";

export default function AdminAutomation() {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  
  // Fetch automations
  const { data: automations, isLoading } = useQuery({
    queryKey: ["admin-automations"],
    queryFn: () => apiCall("/automations"),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (newAutomations: any) =>
      apiCall("/automations", {
        method: "PUT",
        body: JSON.stringify(newAutomations),
      }),
    onSuccess: () => {
      toast.success("Automatisations mises à jour");
      queryClient.invalidateQueries({ queryKey: ["admin-automations"] });
    },
  });

  const handleToggleActive = (id: string) => {
    const updated = automations.map((a: any) => 
      a.id === id ? { ...a, active: !a.active } : a
    );
    updateMutation.mutate(updated);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = automations.map((a: any) => 
      a.id === selectedTemplate.id ? selectedTemplate : a
    );
    updateMutation.mutate(updated);
    setSelectedTemplate(null);
  };

  const variables = ["{{first_name}}", "{{last_name}}", "{{email}}", "{{profession}}", "{{today}}"];

  return (
    <AdminLayout>
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Zap className="text-[#880E4F]" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Automation & Emails</h1>
        </div>
        <p className="text-slate-500">Gérez vos séquences d'emails automatiques pour vos nouveaux leads.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Templates List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-slate-800">Workflows actifs</h2>
            <button className="text-[#EE3B33] text-sm font-bold flex items-center gap-1 hover:underline">
              <Plus size={16} /> Nouveau
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            automations?.map((item: any) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -2 }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  selectedTemplate?.id === item.id 
                    ? "bg-white border-[#EE3B33] shadow-md ring-1 ring-[#EE3B33]" 
                    : "bg-white border-slate-100 shadow-sm hover:shadow-md"
                }`}
                onClick={() => setSelectedTemplate(item)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.active ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Mail size={20} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${item.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {item.active ? 'Actif' : 'Inactif'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer" onClick={e => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={item.active}
                        onChange={() => handleToggleActive(item.id)}
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#EE3B33]"></div>
                    </label>
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{item.name}</h3>
                <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
                  <Play size={10} /> Déclencheur : {item.trigger === 'new_lead' ? 'Nouveau Lead' : 'Sans contact (J+3)'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
                    ))}
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              </motion.div>
            ))
          )}

          <div className="p-5 bg-slate-900 rounded-2xl text-white">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={18} className="text-orange-400" />
              <h3 className="font-bold text-sm">Aide à l'envoi</h3>
            </div>
            <p className="text-xs text-white/60 leading-relaxed mb-4">
              Les emails sont envoyés via votre configuration SMTP. Assurez-vous que vos paramètres sont corrects dans la section Paramètres.
            </p>
            <button className="text-xs font-bold text-orange-400 hover:underline">
              Tester la connexion →
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="lg:col-span-2">
          {selectedTemplate ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100"
            >
              <form onSubmit={handleSaveTemplate}>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-slate-900">Éditeur de Template</h2>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setSelectedTemplate(null)}
                      className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="flex items-center gap-2 px-6 py-2 bg-[#EE3B33] text-white rounded-xl font-bold hover:bg-[#880E4F] transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                    >
                      <Save size={18} />
                      {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Objet de l'email</label>
                    <input 
                      type="text" 
                      value={selectedTemplate.subject}
                      onChange={e => setSelectedTemplate({...selectedTemplate, subject: e.target.value})}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#EE3B33]/20 outline-none font-medium"
                      placeholder="Ex: Bienvenue chez Premunia"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold text-slate-700">Corps de l'email</label>
                      <div className="flex gap-2">
                        {variables.map(v => (
                          <button 
                            key={v}
                            type="button"
                            onClick={() => {
                              const body = selectedTemplate.body + " " + v;
                              setSelectedTemplate({...selectedTemplate, body});
                            }}
                            className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md text-slate-600 transition-colors"
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea 
                      rows={12}
                      value={selectedTemplate.body}
                      onChange={e => setSelectedTemplate({...selectedTemplate, body: e.target.value})}
                      className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#EE3B33]/20 outline-none font-sans text-slate-700 leading-relaxed"
                      placeholder="Rédigez votre email ici..."
                    />
                  </div>

                  <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100">
                    <h4 className="text-sm font-bold text-orange-800 mb-2 flex items-center gap-2">
                      <CheckCircle2 size={16} /> Prévisualisation dynamique
                    </h4>
                    <div className="text-sm text-orange-900/70 italic">
                      "Bonjour {selectedTemplate.body.includes('{{first_name}}') ? 'Jean' : ''}, {selectedTemplate.body.split('\n')[0].replace('{{first_name}}', 'Jean')}"
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
          ) : (
            <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 border-dashed flex flex-col items-center justify-center text-center h-full min-h-[500px]">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Settings size={40} className="text-slate-200" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Sélectionnez un template</h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-8">
                Choisissez un workflow à gauche pour modifier son contenu, son déclencheur et ses paramètres d'envoi.
              </p>
              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                <div className="p-4 bg-slate-50 rounded-2xl text-left">
                  <Copy size={20} className="text-slate-400 mb-2" />
                  <h4 className="font-bold text-slate-800 text-sm">Dupliquer</h4>
                  <p className="text-[10px] text-slate-400">Copiez un template existant</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl text-left">
                  <Plus size={20} className="text-slate-400 mb-2" />
                  <h4 className="font-bold text-slate-800 text-sm">Nouveau</h4>
                  <p className="text-[10px] text-slate-400">Partez d'une page blanche</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
