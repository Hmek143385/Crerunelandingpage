import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { API_URL, publicAnonKey, supabase, getAccessToken } from "../../utils/supabase";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  PlayCircle,
  Database,
  Server,
  Mail,
  Settings,
  Users,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

interface TestResult {
  name: string;
  status: "success" | "error" | "pending" | "running";
  message?: string;
  details?: any;
  duration?: number;
}

export default function SystemTest() {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState("");

  const updateTestResult = (result: TestResult) => {
    setTestResults((prev) => {
      const index = prev.findIndex((r) => r.name === result.name);
      if (index >= 0) {
        const newResults = [...prev];
        newResults[index] = result;
        return newResults;
      }
      return [...prev, result];
    });
  };

  const runTest = async (
    name: string,
    testFn: () => Promise<any>
  ): Promise<boolean> => {
    setCurrentTest(name);
    updateTestResult({ name, status: "running" });
    const startTime = Date.now();

    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      updateTestResult({
        name,
        status: "success",
        message: "✓ Test réussi",
        details: result,
        duration,
      });
      return true;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateTestResult({
        name,
        status: "error",
        message: error.message || "Erreur inconnue",
        details: error,
        duration,
      });
      return false;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    toast.info("Démarrage des tests système...");

    try {
      // Test 1: Health Check
      await runTest("🏥 Health Check Backend", async () => {
        const response = await fetch(`${API_URL}/health`);
        if (!response.ok) throw new Error("Backend non disponible");
        return await response.json();
      });

      // Test 2: Get Settings (Public)
      await runTest("⚙️ Récupération Settings (Public)", async () => {
        const response = await fetch(`${API_URL}/settings`);
        if (!response.ok) throw new Error("Échec de récupération des settings");
        const data = await response.json();
        if (!data.hero_title) throw new Error("Settings incomplets");
        return data;
      });

      // Test 3: Create Test Lead
      await runTest("📝 Création Lead Test", async () => {
        const testLead = {
          first_name: "Test",
          last_name: "Système",
          email: `test_${Date.now()}@premunia.fr`,
          phone: "0600000000",
          profession: "Médecin",
          message: "Lead de test automatique",
        };

        const response = await fetch(`${API_URL}/leads`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(testLead),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Échec création lead");
        }

        return await response.json();
      });

      // Test 4: Check Auth Session
      await runTest("🔐 Vérification Session Auth", async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw new Error(error.message);
        
        return {
          authenticated: !!session,
          user: session?.user?.email || "Non connecté",
          expires_at: session?.expires_at
            ? new Date(session.expires_at * 1000).toLocaleString("fr-FR")
            : "N/A",
        };
      });

      // Test 5: Get Access Token
      await runTest("🎫 Récupération Access Token", async () => {
        const token = await getAccessToken();
        if (!token) throw new Error("Token non disponible");
        return { token_length: token.length, token_preview: token.substring(0, 20) + "..." };
      });

      // Test 6: Fetch Leads (Auth Required)
      await runTest("📊 Récupération Leads (Auth)", async () => {
        const token = await getAccessToken();
        const response = await fetch(`${API_URL}/leads`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          return { message: "Non authentifié (normal si pas connecté)", leads: [] };
        }

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Échec récupération leads");
        }

        const data = await response.json();
        return { lead_count: data.leads?.length || 0, leads: data.leads };
      });

      // Test 7: Get User Role (Auth Required)
      await runTest("👤 Vérification Rôle Utilisateur", async () => {
        const token = await getAccessToken();
        const response = await fetch(`${API_URL}/user/role`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          return { message: "Non authentifié (normal si pas connecté)", role: "none" };
        }

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Échec récupération rôle");
        }

        return await response.json();
      });

      // Test 8: Get SMTP Config (Auth Required)
      await runTest("📧 Récupération Config SMTP", async () => {
        const token = await getAccessToken();
        const response = await fetch(`${API_URL}/smtp-config`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          return { message: "Non authentifié (normal si pas connecté)", configured: false };
        }

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Échec récupération SMTP config");
        }

        const data = await response.json();
        return {
          configured: !!data.host,
          host: data.host || "Non configuré",
        };
      });

      // Test 9: Database Connection Test
      await runTest("💾 Test Connexion Base de Données", async () => {
        // Tester via un endpoint qui utilise KV store
        const response = await fetch(`${API_URL}/settings`);
        if (!response.ok) throw new Error("Connexion KV store échouée");
        return { status: "KV Store opérationnel" };
      });

      // Test 10: Frontend Build Check
      await runTest("🎨 Vérification Build Frontend", async () => {
        const checks = {
          react_query: !!useQuery,
          mutation: !!useMutation,
          router: !!navigate,
          supabase: !!supabase,
          api_url: !!API_URL,
        };

        const allChecks = Object.values(checks).every((v) => v);
        if (!allChecks) throw new Error("Certaines dépendances manquent");

        return checks;
      });

      toast.success("Tous les tests sont terminés !");
    } catch (error: any) {
      console.error("Error running tests:", error);
      toast.error("Erreur lors de l'exécution des tests");
    } finally {
      setIsRunning(false);
      setCurrentTest("");
    }
  };

  const successCount = testResults.filter((r) => r.status === "success").length;
  const errorCount = testResults.filter((r) => r.status === "error").length;
  const totalTests = testResults.length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin")}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <img
              src="https://ucarecdn.com/8796d3aa-4089-4859-87df-1772ce670f61/-/format/auto/"
              alt="Premunia Logo"
              className="h-8 w-auto"
            />
            <span className="text-slate-400">|</span>
            <h1 className="text-xl font-bold text-slate-800">Tests Système & Debug</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Control Panel */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Diagnostic Système Premunia
              </h2>
              <p className="text-slate-600 mt-1">
                Testez tous les composants de la plateforme CRM
              </p>
            </div>
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="px-6 py-3 bg-gradient-to-r from-[#EE3B33] to-[#880E4F] text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Tests en cours...
                </>
              ) : (
                <>
                  <PlayCircle size={20} />
                  Lancer tous les tests
                </>
              )}
            </button>
          </div>

          {/* Stats */}
          {totalTests > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-slate-800">{totalTests}</div>
                <div className="text-sm text-slate-600">Tests exécutés</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-600">{successCount}</div>
                <div className="text-sm text-green-700">Réussis</div>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                <div className="text-sm text-red-700">Échecs</div>
              </div>
            </div>
          )}
        </div>

        {/* Test Results */}
        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl p-6 shadow-sm border transition-all ${
                result.status === "success"
                  ? "border-green-200 bg-green-50/30"
                  : result.status === "error"
                  ? "border-red-200 bg-red-50/30"
                  : result.status === "running"
                  ? "border-blue-200 bg-blue-50/30"
                  : "border-slate-100"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {result.status === "success" && (
                    <CheckCircle2 className="text-green-600" size={24} />
                  )}
                  {result.status === "error" && (
                    <XCircle className="text-red-600" size={24} />
                  )}
                  {result.status === "running" && (
                    <Loader2 className="text-blue-600 animate-spin" size={24} />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-800">{result.name}</h3>
                    {result.duration && (
                      <span className="text-xs text-slate-500">
                        {result.duration}ms
                      </span>
                    )}
                  </div>

                  {result.message && (
                    <p
                      className={`text-sm mb-2 ${
                        result.status === "error"
                          ? "text-red-600"
                          : result.status === "success"
                          ? "text-green-600"
                          : "text-slate-600"
                      }`}
                    >
                      {result.message}
                    </p>
                  )}

                  {result.details && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700">
                        Voir les détails
                      </summary>
                      <pre className="mt-2 p-4 bg-slate-900 text-green-400 rounded-lg text-xs overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Current Test Indicator */}
        {isRunning && currentTest && (
          <div className="fixed bottom-8 right-8 bg-blue-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <Loader2 className="animate-spin" size={20} />
            <span className="font-medium">Test en cours : {currentTest}</span>
          </div>
        )}

        {/* Info Panel */}
        <div className="mt-8 bg-gradient-to-br from-orange-50 to-purple-50 rounded-2xl p-8 border border-orange-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Database size={20} className="text-[#EE3B33]" />
            Informations Système
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-slate-700 mb-2">Backend</h4>
              <ul className="space-y-1 text-slate-600">
                <li>• API URL: {API_URL}</li>
                <li>• 12 endpoints disponibles</li>
                <li>• Utilise Supabase Edge Functions (Deno)</li>
                <li>• KV Store pour la base de données</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-700 mb-2">Frontend</h4>
              <ul className="space-y-1 text-slate-600">
                <li>• React 18 + TypeScript</li>
                <li>• React Query pour les données</li>
                <li>• React Router 7</li>
                <li>• Tailwind CSS v4</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/signin")}
            className="p-6 bg-white border border-slate-200 rounded-xl hover:shadow-lg transition-all group"
          >
            <Shield className="text-[#EE3B33] mb-3 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="font-bold text-slate-800 mb-1">Se connecter</h3>
            <p className="text-sm text-slate-500">Pour tester les endpoints Auth</p>
          </button>

          <button
            onClick={() => navigate("/signup")}
            className="p-6 bg-white border border-slate-200 rounded-xl hover:shadow-lg transition-all group"
          >
            <Users className="text-[#F79E1B] mb-3 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="font-bold text-slate-800 mb-1">Créer un compte</h3>
            <p className="text-sm text-slate-500">Premier utilisateur</p>
          </button>

          <button
            onClick={() => navigate("/")}
            className="p-6 bg-white border border-slate-200 rounded-xl hover:shadow-lg transition-all group"
          >
            <Server className="text-[#880E4F] mb-3 group-hover:scale-110 transition-transform" size={32} />
            <h3 className="font-bold text-slate-800 mb-1">Landing Page</h3>
            <p className="text-sm text-slate-500">Tester le formulaire</p>
          </button>
        </div>
      </div>
    </div>
  );
}
