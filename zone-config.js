// MetroBar · the Zone: your Supabase project. Fill in the Project URL and the PUBLIC key (anon / publishable) once,
// so everyone who opens MetroBar gets the Zone. Never put the secret or service_role key here: this file is public.
// Leave both empty to connect from the Zone tab instead (that stays in your own browser only).
// pay: Stripe Payment Links for MetroBar AI (Stripe > Payment Links). Empty = the buttons say "Coming soon".
window.ZONE_CONFIG = { url: 'https://uwxictlpfsgsgghnhdov.supabase.co', key: 'sb_publishable_eQsCNd0UmD4DH1i1gP_RWw_M0Ugs5pw',
  ai: true,
  zoneLock: false,   // true = The Highlight Zone needs Pro or Super Pro. Turn on only once the Stripe links below are LIVE (sandbox links can't take real money).    // true once the edge function "ai" is deployed with its GEMINI_API_KEY secret (see zone/AI-SETUP.md)
  // Plans v2 (2026-11-13): Pro = The Highlight Zone, Super Pro = Pro + 800 AI credits; packs = one-off credits. Empty link = "Coming soon". These are SANDBOX links (test_), made 2026-11-13.
  pay: { pro: 'https://buy.stripe.com/test_3cI00j4mD3a6af9dwvenS02', proPrice: '€15', super: 'https://buy.stripe.com/test_bJe9AT1ar262drl3VVenS03', superPrice: '€20', superCredits: 800, freeCredits: 15,
    packs: [{ k: 'pack5', price: '€5', credits: 250 }, { k: 'pack10', price: '€10', credits: 500 }, { k: 'pack15', price: '€15', credits: 800 }, { k: 'pack20', price: '€20', credits: 1200 }],
    pack5: 'https://buy.stripe.com/test_bJe00jg5lfWSdrlcsrenS04', pack10: 'https://buy.stripe.com/test_6oU7sL1ar2629b5787enS05', pack15: 'https://buy.stripe.com/test_6oUdR9bP5dOKdrl3VVenS06', pack20: 'https://buy.stripe.com/test_fZu3cv2ev9yu0Ez787enS07' } };
