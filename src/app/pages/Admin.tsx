import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, apiCall } from "../../utils/supabase";
import {
  Users,
  Mail,
  TrendingUp,
  Zap,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router";
import { AdminLayout } from "../components/AdminLayout";
import { motion } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Admin() {
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/signin");
    };
    checkAuth();
  }, [navigate]);

  // Fetch leads
  const { data: leadsData, isLoading } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: () => apiCall("/leads"),
    refetchInterval: 30000, // Refresh every 30s
  });

  const leads = leadsData?.leads || [];
  const newLeads = leads.filter((l: any) => l.status === "new").length;
  const totalLeads = leads.length;

  // Group leads by date for the chart
  const leadsByDate = leads.reduce((acc: any, lead: any) => {
    const date = new Date(lead.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(leadsByDate).map(date => ({
    name: date,
    leads: leadsByDate[date]
  })).reverse().slice(-7); // Last 7 days with data

  return (
    <AdminLayout>
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-500">Bienvenue sur votre interface de gestion Premunia.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden group"
        >
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-slate-500 font-medium mb-1">Total Leads</p>
              <h3 className="text-4xl font-black text-slate-900">{totalLeads}</h3>
            </div>
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="text-[#F79E1B]" size={28} />
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange-50 rounded-full opacity-50 blur-2xl group-hover:scale-150 transition-transform" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden group"
        >
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-slate-500 font-medium mb-1">Nouveaux</p>
              <h3 className="text-4xl font-black text-slate-900">{newLeads}</h3>
            </div>
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail className="text-[#EE3B33]" size={28} />
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-red-50 rounded-full opacity-50 blur-2xl group-hover:scale-150 transition-transform" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden group"
        >
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-slate-500 font-medium mb-1">Conversion</p>
              <h3 className="text-4xl font-black text-slate-900">
                {totalLeads > 0 ? Math.round(((totalLeads - newLeads) / totalLeads) * 100) : 0}%
              </h3>
            </div>
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="text-[#880E4F]" size={28} />
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-50 rounded-full opacity-50 blur-2xl group-hover:scale-150 transition-transform" />
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-10">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900">Activité des Leads</h2>
            <select className="bg-slate-50 border-none rounded-lg text-sm px-3 py-1 outline-none">
              <option>7 derniers jours</option>
              <option>30 derniers jours</option>
            </select>
          </div>
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.length > 0 ? chartData : [{name: '01/01', leads: 0}]}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EE3B33" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#EE3B33" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  cursor={{stroke: '#EE3B33', strokeWidth: 2}}
                />
                <Area type="monotone" dataKey="leads" stroke="#EE3B33" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions / Automation */}
        <div className="bg-gradient-to-br from-[#880E4F] to-[#EE3B33] rounded-3xl p-8 shadow-lg text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold">Automation</h2>
          </div>
          <p className="text-white/80 mb-8">
            Optimisez votre temps en automatisant l'envoi d'emails à vos nouveaux leads.
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Auto-répondeur actif</span>
              </div>
              <button 
                onClick={() => navigate('/admin/automation')}
                className="text-xs bg-white text-[#EE3B33] px-3 py-1 rounded-full font-bold hover:bg-orange-50 transition-colors"
              >
                Gérer
              </button>
            </div>
            <button 
              onClick={() => navigate('/admin/leads')}
              className="w-full flex items-center justify-center gap-2 py-4 bg-white text-[#EE3B33] rounded-2xl font-bold hover:shadow-xl transition-all"
            >
              Voir les leads récents <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Leads Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Derniers leads</h2>
          <button 
            onClick={() => navigate('/admin/leads')}
            className="text-sm font-bold text-[#EE3B33] hover:underline"
          >
            Voir tout
          </button>
        </div>
        
        {leads.length === 0 ? (
          <div className="p-12 text-center">
            {isLoading ? (
               <div className="animate-spin w-8 h-8 border-4 border-[#EE3B33] border-t-transparent rounded-full mx-auto" />
            ) : (
              <p className="text-slate-400">Aucun lead trouvé dans la base de données.</p>
            )}
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
                </tr>
              </thead>
              <tbody>
                {leads.slice(0, 5).map((lead: any, idx: number) => (
                  <motion.tr 
                    key={lead.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => navigate('/admin/leads')}
                  >
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                          {lead.first_name?.[0]}{lead.last_name?.[0]}
                        </div>
                        <div className="font-bold text-slate-800">
                          {lead.first_name} {lead.last_name}
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-8 text-slate-600 text-sm">{lead.email}</td>
                    <td className="py-5 px-8 text-slate-600 text-sm">{lead.profession}</td>
                    <td className="py-5 px-8">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                        lead.status === 'new' ? 'bg-orange-100 text-[#F79E1B]' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {lead.status === 'new' ? 'NOUVEAU' : lead.status.toUpperCase()}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
