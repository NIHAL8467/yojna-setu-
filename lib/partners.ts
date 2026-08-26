import type { ChannelPartner } from '@/types';
import partnersData from '@/data/partners.json';

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
