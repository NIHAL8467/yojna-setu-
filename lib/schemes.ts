import type { Scheme } from '@/types';
import schemesData from '@/data/schemes.json';

export function getAllSchemes(): Scheme[] {
  return schemesData as Scheme[];
}

export function getSchemeById(id: string): Scheme | undefined {
  return (schemesData as Scheme[]).find((s) => s.id === id);
}

export function getSchemesByCategory(category: string): Scheme[] {
  return (schemesData as Scheme[]).filter((s) => s.category === category || s.eligibility.projectTypes.includes(category));
}

export function searchSchemes(query: string): Scheme[] {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  const allSchemes = getAllSchemes();

  // Common synonyms/keywords mapping
  const synonymMap: Record<string, string[]> = {
    scholarship: ['education', 'student', 'educational_loan_scheme', 'els'],
    scholarships: ['education', 'student', 'educational_loan_scheme', 'els'],
    college: ['education', 'educational_loan_scheme'],
    school: ['education', 'educational_loan_scheme'],
    student: ['education', 'educational_loan_scheme'],
    students: ['education', 'educational_loan_scheme'],
    study: ['education', 'educational_loan_scheme'],
    studies: ['education', 'educational_loan_scheme'],
    tuition: ['education', 'educational_loan_scheme'],
    degree: ['education', 'educational_loan_scheme'],
    fee: ['education', 'educational_loan_scheme'],
    fees: ['education', 'educational_loan_scheme'],
    farmer: ['agriculture', 'green_business_scheme', 'micro_credit_finance'],
    farmers: ['agriculture', 'green_business_scheme', 'micro_credit_finance'],
    farming: ['agriculture', 'green_business_scheme', 'micro_credit_finance'],
    agriculture: ['agriculture', 'green_business_scheme', 'micro_credit_finance'],
    kisan: ['agriculture', 'green_business_scheme', 'micro_credit_finance'],
    women: ['mahila_samriddhi_yojana', 'micro_credit_finance', 'female'],
    woman: ['mahila_samriddhi_yojana', 'micro_credit_finance', 'female'],
    female: ['mahila_samriddhi_yojana', 'micro_credit_finance', 'female'],
    girl: ['mahila_samriddhi_yojana', 'educational_loan_scheme'],
    girls: ['mahila_samriddhi_yojana', 'educational_loan_scheme'],
    mahila: ['mahila_samriddhi_yojana', 'micro_credit_finance'],
    shg: ['micro_credit_finance', 'mahila_samriddhi_yojana'],
    business: ['micro_credit_finance', 'term_loan_scheme', 'mahila_samriddhi_yojana', 'green_business_scheme'],
    retail: ['micro_credit_finance', 'term_loan_scheme'],
    shop: ['micro_credit_finance', 'term_loan_scheme'],
    store: ['micro_credit_finance', 'term_loan_scheme'],
    dukan: ['micro_credit_finance', 'term_loan_scheme'],
    employment: ['term_loan_scheme', 'micro_credit_finance', 'swachhta_udayami_yojana'],
    job: ['term_loan_scheme', 'micro_credit_finance'],
    rozgar: ['term_loan_scheme', 'micro_credit_finance'],
    livelihood: ['term_loan_scheme', 'micro_credit_finance', 'mahila_samriddhi_yojana'],
    health: ['swachhta_udayami_yojana'],
    sanitation: ['swachhta_udayami_yojana'],
    safai: ['swachhta_udayami_yojana'],
    clean: ['swachhta_udayami_yojana', 'green_business_scheme'],
    cleaning: ['swachhta_udayami_yojana'],
    waste: ['swachhta_udayami_yojana', 'green_business_scheme'],
    transport: ['green_business_scheme', 'term_loan_scheme'],
    vehicle: ['green_business_scheme', 'term_loan_scheme'],
    auto: ['green_business_scheme', 'term_loan_scheme'],
    rickshaw: ['green_business_scheme'],
    solar: ['green_business_scheme'],
    green: ['green_business_scheme'],
    artisan: ['micro_credit_finance', 'mahila_samriddhi_yojana'],
    craft: ['micro_credit_finance', 'mahila_samriddhi_yojana'],
    tailoring: ['mahila_samriddhi_yojana', 'micro_credit_finance'],
  };

  const expandedTokens: string[] = [cleanQuery];
  const words = cleanQuery.split(/\s+/);
  for (const word of words) {
    if (synonymMap[word]) {
      expandedTokens.push(...synonymMap[word]);
    }
  }
  if (synonymMap[cleanQuery]) {
    expandedTokens.push(...synonymMap[cleanQuery]);
  }

  return allSchemes.filter((scheme) => {
    const searchableText = [
      scheme.id,
      scheme.code,
      scheme.name,
      scheme.nameHi,
      scheme.category,
      scheme.description,
      scheme.descriptionHi,
      scheme.targetAudience,
      scheme.targetAudienceHi,
      ...(scheme.highlights || []),
      ...(scheme.requiredDocuments || []),
      ...(scheme.eligibility.projectTypes || []),
      ...(scheme.eligibility.specialFocus || []),
    ].join(' ').toLowerCase();

    // Check direct match
    if (searchableText.includes(cleanQuery)) {
      return true;
    }

    // Check expanded synonyms
    for (const token of expandedTokens) {
      if (searchableText.includes(token.toLowerCase()) || scheme.id.includes(token.toLowerCase())) {
        return true;
      }
    }

    return false;
  });
}

