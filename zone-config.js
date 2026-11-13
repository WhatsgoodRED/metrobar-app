// MetroBar · the Zone: your Supabase project. Fill in the Project URL and the PUBLIC key (anon / publishable) once,
// so everyone who opens MetroBar gets the Zone. Never put the secret or service_role key here: this file is public.
// Leave both empty to connect from the Zone tab instead (that stays in your own browser only).
// pay: Stripe Payment Links for MetroBar AI (Stripe > Payment Links). Empty = the buttons say "Coming soon".
window.ZONE_CONFIG = { url: 'https://uwxictlpfsgsgghnhdov.supabase.co', key: 'sb_publishable_eQsCNd0UmD4DH1i1gP_RWw_M0Ugs5pw',
  ai: true,
  zoneLock: true,    // true = The Highlight Zone needs Pro or Super Pro (links below are LIVE since 2026-11-13).    // true once the edge function "ai" is deployed with its GEMINI_API_KEY secret (see zone/AI-SETUP.md)
  // Plans v2 (2026-11-13): Pro = The Highlight Zone, Super Pro = Pro + 800 AI credits; packs = one-off credits. Empty link = "Coming soon". LIVE links (2026-11-13); the sandbox test_ links stay in Stripe for testing.
  pay: { pro: 'https://buy.stripe.com/bJefZjdtk3uHgqccNJ1VK05', proPrice: '€15', super: 'https://buy.stripe.com/dRm3cx8909T52zm2951VK04', superPrice: '€20', superCredits: 800, freeCredits: 15,
    packs: [{ k: 'pack5', price: '€5', credits: 250 }, { k: 'pack10', price: '€10', credits: 500 }, { k: 'pack15', price: '€15', credits: 800 }, { k: 'pack20', price: '€20', credits: 1200 }],
    pack5: 'https://buy.stripe.com/dRm28t3SK4yLc9W2951VK03', pack10: 'https://buy.stripe.com/4gMfZjexoe9l5LydRN1VK02', pack15: 'https://buy.stripe.com/4gMcN74WOc1db5SdRN1VK01', pack20: 'https://buy.stripe.com/14A9AV60S0iv3DqeVR1VK00' } };
