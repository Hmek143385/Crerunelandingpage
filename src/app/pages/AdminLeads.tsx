import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "../../utils/supabase";
import { 
  Search, 
  Trash2, 
  Edit, 
  Phone, 
  Mail, 
  Filter, 
  Download,
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "../components/AdminLayout";
import { motion, AnimatePresence } from "motion/react";

export default function AdminLeads() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ status: "", notes: "" });
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch leads
  const { data: leadsData, isLoading } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: () => apiCall("/leads"),
  });

  const leads = leadsData?.leads || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (leadId: string) => apiCall(`/leads/${leadId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Lead supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
      setSelectedLead(null);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiCall(`/leads/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success("Lead mis à jour");
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
      setEditMode(false);
    },
  });

  const filteredLeads = leads.filter((lead: any) => {
    const matchesSearch = 
      lead.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.profession?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || lead.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleEdit = (lead: any) => {
    setSelectedLead(lead);
    setEditData({ status: lead.status || "new", notes: lead.notes || "" });
    setEditMode(true);
  };

  const handleUpdate = () => {
    if (selectedLead) {
      updateMutation.mutate({ id: (selectedLead.id || selectedLead.key), data: editData });
    }
  };

  const exportLeads = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Nom", "Prénom", "Email", "Téléphone", "Profession", "Statut", "Date"].join(",") + "\n"
      + filteredLeads.map((l: any) => [
          l.last_name, 
          l.first_name, 
          l.email, 
          l.phone, 
          l.profession, 
          l.status, 
          new Date(l.created_at).toLocaleDateString()
        ].join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leads_premunia_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestion des Leads</h1>
          <p className="text-slate-500">Visualisez et gérez tous vos prospects entrants.</p>
        </div>
        <button 
          onClick={exportLeads}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
        >
          <Download size={18} />
          Exporter CSV
        </button>
      </header>

      {/* Filters & Search */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher par nom, email, profession..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#EE3B33]/20 focus:border-[#EE3B33] outline-none transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={18} className="text-slate-400" />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 md:w-48 px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#EE3B33]/20 outline-none appearance-none bg-white font-medium text-slate-700"
          >
            <option value="all">Tous les statuts</option>
            <option value="new">Nouveaux</option>
            <option value="contacted">Contactés</option>
            <option value="converted">Convertis</option>
            <option value="rejected">Rejetés</option>
          </select>
        </div>
      </div>

      {/* Leads List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-[#EE3B33] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Récupération des prospects...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun lead trouvé</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              Nous n'avons trouvé aucun prospect correspondant à vos critères de recherche.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="text-left py-4 px-8 font-semibold text-slate-600 text-sm uppercase tracking-wider">Prospect</th>
                  <th className="text-left py-4 px-8 font-semibold text-slate-600 text-sm uppercase tracking-wider">Contact</th>
                  <th className="text-left py-4 px-8 font-semibold text-slate-600 text-sm uppercase tracking-wider">Profession</th>
                  <th className="text-left py-4 px-8 font-semibold text-slate-600 text-sm uppercase tracking-wider">Statut</th>
                  <th className="text-left py-4 px-8 font-semibold text-slate-600 text-sm uppercase tracking-wider">Date</th>
                  <th className="text-right py-4 px-8 font-semibold text-slate-600 text-sm uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead: any, idx: number) => (
                  <motion.tr 
                    key={lead.id || lead.key || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-slate-500 text-sm">
                          {lead.first_name?.[0]}{lead.last_name?.[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 leading-tight">
                            {lead.first_name} {lead.last_name}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">ID: {lead.id?.slice(0, 8) || "N/A"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail size={14} className="text-slate-400" />
                          {lead.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone size={14} className="text-slate-400" />
                          {lead.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <span className="text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                        {lead.profession}
                      </span>
                    </td>
                    <td className="py-6 px-8">
                      {lead.status === 'new' && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-orange-100 text-[#F79E1B]">
                          <Clock size={12} /> NOUVEAU
                        </span>
                      )}
                      {lead.status === 'contacted' && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-600">
                          <MoreVertical size={12} /> CONTACTÉ
                        </span>
                      )}
                      {lead.status === 'converted' && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-600">
                          <CheckCircle2 size={12} /> CONVERTI
                        </span>
                      )}
                      {lead.status === 'rejected' && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-600">
                          <XCircle size={12} /> REJETÉ
                        </span>
                      )}
                    </td>
                    <td className="py-6 px-8 text-slate-500 text-sm">
                      {new Date(lead.created_at).toLocaleDateString("fr-FR", { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-6 px-8 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(lead)}
                          className="p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors"
                          title="Modifier"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Supprimer ce prospect ?")) {
                              deleteMutation.mutate(lead.id || lead.key);
                            }
                          }}
                          className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editMode && selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditMode(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative z-10"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-slate-900">
                  Détails du Prospect
                </h3>
                <button 
                  onClick={() => setEditMode(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-400 uppercase font-bold mb-2">Informations</p>
                  <p className="font-bold text-slate-900 text-lg">
                    {selectedLead.first_name} {selectedLead.last_name}
                  </p>
                  <p className="text-slate-600">{selectedLead.profession}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Statut actuel
                  </label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#EE3B33]/20 focus:border-[#EE3B33] outline-none font-medium"
                  >
                    <option value="new">Nouveau</option>
                    <option value="contacted">Contacté</option>
                    <option value="converted">Converti</option>
                    <option value="rejected">Rejeté</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Notes internes
                  </label>
                  <textarea
                    value={editData.notes}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-[#EE3B33]/20 focus:border-[#EE3B33] outline-none"
                    placeholder="Ajouter des observations sur ce prospect..."
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setEditMode(false)}
                  className="flex-1 py-4 px-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={updateMutation.isPending}
                  className="flex-1 py-4 px-4 bg-[#EE3B33] text-white rounded-2xl font-bold hover:bg-[#880E4F] transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                >
                  {updateMutation.isPending ? "Mise à jour..." : "Enregistrer"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
