import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase admin client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Prefix for all Premunia data to keep it separate from other projects in the same DB
const NS = "premunia_";

// Health check endpoint
app.get("/make-server-07afcff5/health", (c) => {
  return c.json({ status: "ok", project: "premunia" });
});

// ============ LEADS ROUTES ============

// Create a new lead (public)
app.post("/make-server-07afcff5/leads", async (c) => {
  try {
    const body = await c.req.json();
    const { first_name, last_name, email, phone, profession, message } = body;

    if (!first_name || !last_name || !email || !phone || !profession) {
      return c.json({ error: "Champs obligatoires manquants" }, 400);
    }

    const leadId = crypto.randomUUID();
    const leadData = { 
      id: leadId, 
      first_name, 
      last_name, 
      email, 
      phone, 
      profession, 
      message: message || '', 
      status: 'new', 
      created_at: new Date().toISOString() 
    };

    // Store in KV store with namespace prefix
    await kv.set(`${NS}lead_${leadId}`, leadData);

    // Simulate automation trigger
    console.log(`[Automation] Lead created: ${email}. Triggering welcome email sequence...`);
    
    return c.json({ success: true, lead: leadData });
  } catch (error) {
    console.error("Error creating lead:", error);
    return c.json({ error: "Erreur lors de la création du lead" }, 500);
  }
});

// Get all leads (requires auth)
app.get("/make-server-07afcff5/leads", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    // Get all leads using the namespace prefix
    const leads = await kv.getByPrefix(`${NS}lead_`);
    
    // Sort by date (descending)
    const sortedLeads = leads.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return c.json({ leads: sortedLeads });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return c.json({ error: "Erreur lors de la récupération des leads" }, 500);
  }
});

// Update lead status/notes (requires auth)
app.put("/make-server-07afcff5/leads/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) return c.json({ error: 'Non autorisé' }, 401);

    const leadId = c.req.param('id');
    const body = await c.req.json();
    
    const existingLead = await kv.get(`${NS}lead_${leadId}`);
    if (!existingLead) return c.json({ error: 'Lead non trouvé' }, 404);

    const updatedLead = { 
      ...existingLead, 
      ...body, 
      updated_at: new Date().toISOString() 
    };

    await kv.set(`${NS}lead_${leadId}`, updatedLead);
    
    return c.json({ success: true, lead: updatedLead });
  } catch (error) {
    console.error("Error updating lead:", error);
    return c.json({ error: "Erreur lors de la mise à jour" }, 500);
  }
});

// Delete lead (requires auth)
app.delete("/make-server-07afcff5/leads/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) return c.json({ error: 'Non autorisé' }, 401);

    const leadId = c.req.param('id');
    await kv.del(`${NS}lead_${leadId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return c.json({ error: "Erreur lors de la suppression" }, 500);
  }
});

// ============ AUTOMATION ROUTES ============

app.get("/make-server-07afcff5/automations", async (c) => {
  try {
    const automations = await kv.get(`${NS}email_automations`);
    return c.json(automations || [
      {
        id: 'auto_welcome',
        name: 'Email de Bienvenue',
        trigger: 'new_lead',
        subject: 'Bienvenue chez Premunia - Votre demande a bien été reçue',
        body: 'Bonjour {{first_name}},\n\nMerci de nous avoir contactés. Un conseiller va vous rappeler sous 24h.\n\nCordialement,\nL\'équipe Premunia',
        active: true
      }
    ]);
  } catch (error) {
    return c.json({ error: "Erreur automations" }, 500);
  }
});

app.put("/make-server-07afcff5/automations", async (c) => {
  try {
    const body = await c.req.json();
    await kv.set(`${NS}email_automations`, body);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Erreur mise à jour automations" }, 500);
  }
});

// ============ SETTINGS ROUTES ============

app.get("/make-server-07afcff5/settings", async (c) => {
  try {
    const settings = await kv.get(`${NS}app_settings`);
    return c.json(settings || {
      hero_title: "Préparez votre retraite sans sacrifier votre présent",
      hero_subtitle: "Le Plan Épargne Retraite (PER) sur-mesure pour les professions libérales.",
      contact_email: "contact@premunia.fr",
      contact_phone: "01 00 00 00 00",
      contact_address: "828 Av. Roger Salengro, 92370 Chaville"
    });
  } catch (error) {
    return c.json({ error: "Erreur settings" }, 500);
  }
});

app.put("/make-server-07afcff5/settings", async (c) => {
  try {
    const body = await c.req.json();
    await kv.set(`${NS}app_settings`, body);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Erreur mise à jour settings" }, 500);
  }
});

// ============ STATS ============

app.get("/make-server-07afcff5/stats", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) return c.json({ error: 'Non autorisé' }, 401);

    const leads = await kv.getByPrefix(`${NS}lead_`);
    
    const stats = {
      total: leads.length,
      new: leads.filter(l => l.status === 'new').length,
      contacted: leads.filter(l => l.status === 'contacted').length,
      converted: leads.filter(l => l.status === 'converted').length,
      by_profession: leads.reduce((acc, lead) => {
        acc[lead.profession] = (acc[lead.profession] || 0) + 1;
        return acc;
      }, {})
    };

    return c.json(stats);
  } catch (error) {
    return c.json({ error: "Erreur stats" }, 500);
  }
});

Deno.serve(app.fetch);