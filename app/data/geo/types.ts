export type SchemaPlace = Readonly<Record<string, unknown>>;

export type LocationMarket = {
  slug: string;
  name: string;
  stateOrRegion: string;
  country: 'India';
  eyebrow: string;
  heroIntro: string;
  metaTitle: string;
  metaDescription: string;
  ogLabel: string;
  localContext: {
    eyebrow: string;
    title: string;
    body: string;
  };
  nearbyAreas: readonly string[];
  searchTerms: readonly string[];
  schemaPlace: SchemaPlace;
};

export type RegionMarket = {
  slug: string;
  name: string;
  shortName: string;
  languageRegion: 'en-US' | 'en-GB' | 'en-AE' | 'en-CA' | 'en-AU';
  ogLocale: 'en_US' | 'en_GB' | 'en_AE' | 'en_CA' | 'en_AU';
  eyebrow: string;
  heroIntro: string;
  metaTitle: string;
  metaDescription: string;
  ogLabel: string;
  localContext: {
    eyebrow: string;
    title: string;
    body: string;
  };
  communication: {
    timezone: string;
    terminology: string;
  };
  currencyLabel: 'USD';
  schemaCountry: SchemaPlace;
};
