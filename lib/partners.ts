import type { ChannelPartner } from '@/types';
import partnersData from '@/data/partners.json';
import { calculateHaversineDistanceKm } from './geo-utils';

export function getAllPartners(): ChannelPartner[] {
  return partnersData as ChannelPartner[];
}

export function getPartnerById(id: string): ChannelPartner | undefined {
  return (partnersData as ChannelPartner[]).find((p) => p.id === id);
}

export function getPartnersByScheme(schemeId: string): ChannelPartner[] {
  return (partnersData as ChannelPartner[]).filter((p) => p.schemesProcessed.includes(schemeId));
}

export function getPartnersByType(type: string): ChannelPartner[] {
  return (partnersData as ChannelPartner[]).filter((p) => p.type === type);
}

/**
 * Generates realistic, district-specific official Channel Partners
 * (State Channelising Agency, Lead Bank SBI, Regional Rural Bank RRB, and NBFC-MFI)
 * anchored directly at the user's detected location and coordinates.
 */
export function generateLocalPartnersForArea(
  lat: number,
  lng: number,
  district: string,
  state: string,
  pincode: string = '110001'
): ChannelPartner[] {
  const cleanDistrict = district || 'District Center';
  const cleanState = state || 'State';
  const slug = cleanDistrict.toLowerCase().replace(/[^a-z0-9]/g, '_');

  return [
    {
      id: `partner_loc_sca_${slug}`,
      name: `${cleanState} Scheduled Castes Financial & Development Corporation (${cleanDistrict} SCA Branch)`,
      nameHi: `${cleanState} अनुसूचित जाति वित्त एवं विकास निगम (${cleanDistrict} शाखा)`,
      type: 'SCA',
      typeName: 'State Channelising Agency (SCA)',
      lat: Number((lat + 0.0075).toFixed(5)),
      lng: Number((lng + 0.0062).toFixed(5)),
      address: `Vikas Bhawan, Near District Collectorate, Court Road, ${cleanDistrict}, ${cleanState} - ${pincode}`,
      district: cleanDistrict,
      state: cleanState,
      pincode: pincode,
      phone: '+91-11-23340024',
      email: `sca.${slug}@${cleanState.toLowerCase().replace(/[^a-z]/g, '')}.gov.in`,
      schemesProcessed: [
        'micro_credit_finance',
        'term_loan_scheme',
        'mahila_samriddhi_yojana',
        'swachhta_udayami_yojana',
        'green_business_scheme',
      ],
      fundUtilization: 88,
      status: 'Active & Accepting Applications',
      workingHours: 'Mon - Fri, 9:30 AM - 5:30 PM',
      isSimulated: true,
    },
    {
      id: `partner_loc_sbi_${slug}`,
      name: `State Bank of India - ${cleanDistrict} Lead District Office & SME Central Hub`,
      nameHi: `भारतीय स्टेट बैंक - ${cleanDistrict} लीड बैंक एवं एसएमई ऋण केंद्र`,
      type: 'Bank',
      typeName: 'Public Sector Bank',
      lat: Number((lat - 0.0085).toFixed(5)),
      lng: Number((lng - 0.0072).toFixed(5)),
      address: `Main Branch Complex, Station Road, Commercial Area, ${cleanDistrict}, ${cleanState} - ${pincode}`,
      district: cleanDistrict,
      state: cleanState,
      pincode: pincode,
      phone: '+91-1800-1234-56',
      email: `sme.${slug}@sbi.co.in`,
      schemesProcessed: [
        'term_loan_scheme',
        'micro_credit_finance',
        'educational_loan_scheme',
        'green_business_scheme',
      ],
      fundUtilization: 92,
      status: 'Active & Accepting Applications',
      workingHours: 'Mon - Sat (except 2nd/4th Sat), 10:00 AM - 4:30 PM',
      isSimulated: true,
    },
    {
      id: `partner_loc_pnb_${slug}`,
      name: `Punjab National Bank - ${cleanDistrict} MSME & Priority Sector Cell`,
      nameHi: `पंजाब नेशनल बैंक - ${cleanDistrict} एमएसएमई एवं प्राथमिकता क्षेत्र शाखा`,
      type: 'Bank',
      typeName: 'Public Sector Bank',
      lat: Number((lat + 0.0142).toFixed(5)),
      lng: Number((lng - 0.0098).toFixed(5)),
      address: `Civil Lines, Opposite Gandhi Smarak, ${cleanDistrict}, ${cleanState} - ${pincode}`,
      district: cleanDistrict,
      state: cleanState,
      pincode: pincode,
      phone: '+91-1800-180-2222',
      email: `leadbank.${slug}@pnb.co.in`,
      schemesProcessed: [
        'term_loan_scheme',
        'educational_loan_scheme',
        'green_business_scheme',
      ],
      fundUtilization: 81,
      status: 'Active & Accepting Applications',
      workingHours: 'Mon - Sat (except 2nd/4th Sat), 10:00 AM - 4:00 PM',
      isSimulated: true,
    },
    {
      id: `partner_loc_rrb_${slug}`,
      name: `${cleanState} Gramin Bank - Special Micro Finance Branch`,
      nameHi: `${cleanState} ग्रामीण बैंक - विशेष सूक्ष्म ऋण शाखा`,
      type: 'RRB',
      typeName: 'Regional Rural Bank (RRB)',
      lat: Number((lat - 0.0168).toFixed(5)),
      lng: Number((lng + 0.0125).toFixed(5)),
      address: `Kisan Bhawan Market, Tehsil Road, ${cleanDistrict}, ${cleanState} - ${pincode}`,
      district: cleanDistrict,
      state: cleanState,
      pincode: pincode,
      phone: '+91-1800-102-3344',
      email: `microcredit.${slug}@rrbmail.in`,
      schemesProcessed: [
        'micro_credit_finance',
        'mahila_samriddhi_yojana',
        'green_business_scheme',
      ],
      fundUtilization: 86,
      status: 'Active & Accepting Applications',
      workingHours: 'Mon - Sat (except 2nd/4th Sat), 10:00 AM - 4:00 PM',
      isSimulated: true,
    },
    {
      id: `partner_loc_mfi_${slug}`,
      name: `Annapurna Microfinance (NBFC-MFI Channel Partner - ${cleanDistrict})`,
      nameHi: `अन्नपूर्णा माइक्रोफाइनेंस (एनबीएफसी-एमएफआई भागीदार - ${cleanDistrict})`,
      type: 'NBFC-MFI',
      typeName: 'NBFC-Micro Finance Institution',
      lat: Number((lat + 0.0225).toFixed(5)),
      lng: Number((lng + 0.0185).toFixed(5)),
      address: `First Floor, Commercial Plaza, Bypass Road, ${cleanDistrict}, ${cleanState} - ${pincode}`,
      district: cleanDistrict,
      state: cleanState,
      pincode: pincode,
      phone: '+91-1800-843-8586',
      email: `branch.${slug}@annapurnafinance.in`,
      schemesProcessed: ['micro_credit_finance', 'mahila_samriddhi_yojana'],
      fundUtilization: 95,
      status: 'Active & Accepting Applications',
      workingHours: 'Mon - Fri, 9:00 AM - 6:00 PM',
      isSimulated: true,
    },
  ];
}

/**
 * Returns the full list of channel partners, dynamically supplemented
 * with local branches if user coordinates or district/state is provided.
 */
export function getPartnersForLocation(
  coords: { lat: number; lng: number } | null,
  district?: string,
  state?: string,
  pincode?: string
): ChannelPartner[] {
  const base = partnersData as ChannelPartner[];

  if (coords) {
    // Check if any seeded partner is already within 25 km
    const closeSeedPartners = base.filter((p) => {
      const dist = calculateHaversineDistanceKm(coords.lat, coords.lng, p.lat, p.lng);
      return dist <= 30;
    });

    // Generate local branches for this exact GPS point
    const localGenerated = generateLocalPartnersForArea(
      coords.lat,
      coords.lng,
      district || 'Local District',
      state || 'State',
      pincode || '110001'
    );

    // Combine local generated with existing close partners and remaining network
    const seenIds = new Set<string>();
    const combined: ChannelPartner[] = [];

    // Prioritize local generated and close seed partners
    for (const p of [...localGenerated, ...closeSeedPartners, ...base]) {
      if (!seenIds.has(p.id)) {
        seenIds.add(p.id);
        combined.push(p);
      }
    }

    return combined;
  }

  // If no GPS, but user selected a State or District
  if (district || (state && state !== 'All India')) {
    const stateMatches = base.filter((p) => {
      if (state && state !== 'All India' && p.state.toLowerCase() !== state.toLowerCase()) {
        return false;
      }
      if (district && !p.district.toLowerCase().includes(district.toLowerCase())) {
        return false;
      }
      return true;
    });

    if (stateMatches.length > 0) {
      return base;
    }

    // Generate fallback partners for this state/district if not in seed data
    // Use approximate coordinates for major states or default center
    const fallbackCoords = { lat: 20.5937, lng: 78.9629 };
    const local = generateLocalPartnersForArea(
      fallbackCoords.lat,
      fallbackCoords.lng,
      district || 'Central District',
      state || 'State',
      pincode || '110001'
    );

    return [...local, ...base];
  }

  return base;
}

