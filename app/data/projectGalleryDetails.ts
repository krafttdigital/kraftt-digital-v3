const projectGalleryDetails: Record<string, readonly string[]> = {
  'shree-hari-spintex': [
    'The About page turns manufacturing history, capacity and operating credibility into a clear introduction before a buyer reaches the product enquiry stage.',
    'The Quality page brings certifications, production standards and quality-control information together in a format procurement teams can scan quickly.',
    'The contact surface keeps phone, email, location and enquiry options close together, helping prospective buyers move from research to a direct conversation.',
    'Structured data was added behind the visible website so search systems can understand the company, its manufacturing category and important business information.',
    'This search view documents the improved discovery surface around the business name and relevant local manufacturing intent.',
    'The previous website is retained as a visible baseline, showing the limited structure and discovery support that the new system needed to replace.',
  ],
  'mittal-architect': [
    'The gallery groups architecture and interior projects into clear categories, letting prospective clients explore relevant work without searching through an unstructured image archive.',
    'Each project receives a dedicated page with its visual story, scope and supporting details presented as one considered case rather than a loose set of photographs.',
    'Project imagery and the enquiry route share the same surface, allowing interest in a specific space to move naturally into a direct conversation.',
    'The visual gallery gives finished spaces room to lead while maintaining a consistent premium frame across residential, commercial and interior work.',
    'A one-click WhatsApp route removes unnecessary form friction and carries high-intent visitors directly into an enquiry with the studio.',
    'This Google AI result is documented discovery evidence: the answer cites the website when people search for architects around the served locations.',
  ],
  'kiraq-jewellery': [
    'The brand guideline system defines how the jewellery label should appear across storefront, communication and future campaign surfaces.',
    'A restrained ivory, gold and dark palette creates a recognisable premium mood while keeping product photography and jewellery details central.',
    'The shop page makes collections and products easy to browse without losing the quiet, editorial character of the brand.',
    'Collection presentation groups related pieces into a more intentional buying journey instead of treating every item as an isolated product.',
    'The product page brings imagery, product information and WhatsApp ordering into one decision-ready surface for a practical assisted purchase flow.',
    'The self-serve administration portal lets the founders manage products and visibility without depending on a developer for routine catalogue updates.',
  ],
  'elixir-beverages': [
    'The pre-launch website introduces the botanical beverage through a focused brand story, product promise and clear route for early interest.',
    'The animated ingredients section turns the flavour system into an explorable visual story while keeping each ingredient and variant understandable.',
    'Logo usage rules protect recognition by documenting approved backgrounds, spacing and applications before the brand expands into more surfaces.',
    'The colour palette balances botanical green, warm ivory and controlled gold accents to create a premium but natural beverage identity.',
    'The typography system separates expressive brand moments from functional reading, giving future packaging and digital communication a consistent hierarchy.',
  ],
  'bharat-bhushan-singla': [
    'The complete page system connects the founder profile, practice areas and consultation paths so visitors can understand both credibility and the next step.',
    'Practice areas are separated into clear legal categories, helping visitors identify the relevant type of support before requesting a consultation.',
    'The case archive organises documented matters with filters and structured details, making professional experience easier to assess without overstating outcomes.',
    'Practical legal guidance and FAQs answer common first questions while directing case-specific concerns toward an appropriate conversation.',
    'The final call to action and information-rich footer keep consultation, phone, location and practice-area routes available at the end of the journey.',
  ],
  'the-vibed-vines': [
    'The brand and category surface establishes the anime-streetwear attitude while introducing product families in a way that remains useful for shopping.',
    'Search, sorting and category filters help visitors narrow a large catalogue without weakening the dark, graphic character of the storefront.',
    'The product page places imagery, price, size and quantity decisions together so shoppers can understand the item before adding it to their cart.',
    'Feature-led presentation gives each garment more context than a standard catalogue tile and helps the original artwork remain central.',
    'The cart supports multiple products, quantity changes and a clear order summary before the customer moves into fulfilment.',
    'The assisted WhatsApp handoff carries useful cart details forward, reducing the need for the buyer to repeat product and quantity information.',
    'The community section gives the label a point of view beyond individual products and creates space for the culture surrounding the brand.',
  ],
  'aegis-squad': [
    'The services page separates security, manpower and facility support into clearer choices than the previous single-page presentation.',
    'The careers page creates a dedicated route for applicants, keeping recruitment intent separate from client service enquiries.',
    'Structured search data gives crawlers clearer information about the company and its services without changing the visible experience.',
  ],
  'employee-os': [
    'The employee workspace keeps profiles, employment information, managed documents and routine actions together. Every visible record in this screen is clearly labelled test data.',
    'The monthly attendance register is designed around a practical workflow: mark the common status quickly, then record exceptions and approved overtime where needed.',
    'Payroll moves through visible draft, review, download and finalization stages so calculations can be checked before a month is locked.',
    'The salary-slip workspace lets an administrator search finalized records, preview the available period and generate the required employee outputs.',
  ],
};

export function galleryDetailsForProject(projectSlug: string): readonly string[] {
  return projectGalleryDetails[projectSlug] ?? [];
}
