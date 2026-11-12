// MetroBar · the Zone: your Supabase project. Fill in the Project URL and the PUBLIC key (anon / publishable) once,
// so everyone who opens MetroBar gets the Zone. Never put the secret or service_role key here: this file is public.
// Leave both empty to connect from the Zone tab instead (that stays in your own browser only).
// pay: Stripe Payment Links for MetroBar AI (Stripe > Payment Links). Empty = the buttons say "Coming soon".
window.ZONE_CONFIG = { url: 'https://uwxictlpfsgsgghnhdov.supabase.co', key: 'sb_publishable_eQsCNd0UmD4DH1i1gP_RWw_M0Ugs5pw',
  ai: false,   // true once the edge function "ai" is deployed with its GEMINI_API_KEY secret (zone/AI-SETUP.md)
  pay: { pro: '', proPrice: '€7.99 / month', proCredits: 800, pack: '', packPrice: '€4.99 once', packCredits: 300 } };
