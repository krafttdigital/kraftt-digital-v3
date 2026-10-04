# Kraftt UTM naming guide

Use UTMs on links shared outside the website. Use lowercase snake_case with no spaces and consistent campaign names. Never put personal names, contact information, customer identifiers, invoice numbers or message text in a UTM. Never add UTMs to navigation, service cards or any other internal Kraftt link. Track internal position through `cta_location` instead.

| Parameter | Meaning | Examples |
| --- | --- | --- |
| utm_source | Platform/source | instagram, linkedin, whatsapp, newsletter, partner_name, brochure |
| utm_medium | Distribution method | organic_social, paid_social, email, messaging, referral, qr |
| utm_campaign | Campaign shared across assets | web_design_oct_2026, branding_outreach, architect_outreach, case_studies |
| utm_content | Asset/link variation | reel_01, carousel_02, profile_link, initial_message, shree_hari_post |
| utm_term | Optional paid keyword context | web_design_agency |

`partner_name` means an anonymous business/source label, not a person's private name. Keep campaign taxonomy in a shared sheet. Paid platforms may add click IDs automatically; keep these intact rather than inventing your own IDs.

Examples:

```text
https://krafttdigital.in/services/web-design-development?utm_source=instagram&utm_medium=organic_social&utm_campaign=web_design&utm_content=reel_01
https://krafttdigital.in/work/shree-hari-spintex?utm_source=linkedin&utm_medium=organic_social&utm_campaign=case_studies&utm_content=shree_hari_post
https://krafttdigital.in/services/web-design-development?utm_source=whatsapp&utm_medium=messaging&utm_campaign=architect_outreach&utm_content=initial_message
https://krafttdigital.in/services/brand-identity?utm_source=brochure&utm_medium=qr&utm_campaign=branding_outreach&utm_content=profile_link
```

Internal developer URL builder (no public page):

```powershell
npm run utm -- "https://krafttdigital.in/services/web-design-development" instagram organic_social web_design_oct_2026 reel_01
```

Arguments: URL, source, medium, campaign, optional content, optional term. The builder requires the production HTTPS origin, encodes values correctly and rejects incorrectly formatted or obvious personal values. Operators must still ensure a valid-looking campaign token does not contain private information. Check that the target page exists before sharing a link. Scan a printed QR code on a phone and inspect the final URL; a link shortener must preserve the parameters.
