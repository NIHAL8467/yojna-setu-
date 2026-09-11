import { NextRequest, NextResponse } from 'next/server';

interface ReverseGeocodeResult {
  state: string;
  district: string;
  city: string;
  pincode: string;
  displayName: string;
  source: string;
}

// Major cities fallback coordinate lookup
const KNOWN_INDIAN_REGIONS = [
  { name: 'Delhi', state: 'Delhi', district: 'New Delhi', lat: 28.6139, lng: 77.2090, pincode: '110001' },
  { name: 'North Delhi', state: 'Delhi', district: 'North Delhi', lat: 28.6850, lng: 77.2180, pincode: '110007' },
  { name: 'South Delhi', state: 'Delhi', district: 'South Delhi', lat: 28.5244, lng: 77.2066, pincode: '110017' },
  { name: 'Noida', state: 'Uttar Pradesh', district: 'Gautam Buddha Nagar', lat: 28.5355, lng: 77.3910, pincode: '201301' },
  { name: 'Gurugram', state: 'Haryana', district: 'Gurugram', lat: 28.4595, lng: 77.0266, pincode: '122001' },
  { name: 'Faridabad', state: 'Haryana', district: 'Faridabad', lat: 28.4089, lng: 77.3178, pincode: '121001' },
  { name: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow', lat: 26.8467, lng: 80.9462, pincode: '226001' },
  { name: 'Varanasi', state: 'Uttar Pradesh', district: 'Varanasi', lat: 25.3176, lng: 82.9739, pincode: '221001' },
  { name: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar', lat: 26.4499, lng: 80.3319, pincode: '208001' },
  { name: 'Patna', state: 'Bihar', district: 'Patna', lat: 25.5941, lng: 85.1376, pincode: '800001' },
  { name: 'Ranchi', state: 'Jharkhand', district: 'Ranchi', lat: 23.3441, lng: 85.3096, pincode: '834001' },
  { name: 'Mumbai', state: 'Maharashtra', district: 'Mumbai', lat: 19.0760, lng: 72.8777, pincode: '400001' },
  { name: 'Pune', state: 'Maharashtra', district: 'Pune', lat: 18.5204, lng: 73.8567, pincode: '411001' },
  { name: 'Nagpur', state: 'Maharashtra', district: 'Nagpur', lat: 21.1458, lng: 79.0882, pincode: '440001' },
  { name: 'Jaipur', state: 'Rajasthan', district: 'Jaipur', lat: 26.9124, lng: 75.7873, pincode: '302001' },
  { name: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', lat: 12.9716, lng: 77.5946, pincode: '560001' },
  { name: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', lat: 17.3850, lng: 78.4867, pincode: '500001' },
  { name: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', lat: 13.0827, lng: 80.2707, pincode: '600001' },
  { name: 'Kolkata', state: 'West Bengal', district: 'Kolkata', lat: 22.5726, lng: 88.3639, pincode: '700001' },
  { name: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad', lat: 23.0225, lng: 72.5714, pincode: '380001' },
  { name: 'Surat', state: 'Gujarat', district: 'Surat', lat: 21.1702, lng: 72.8311, pincode: '395001' },
  { name: 'Indore', state: 'Madhya Pradesh', district: 'Indore', lat: 22.7196, lng: 75.8577, pincode: '452001' },
  { name: 'Bhopal', state: 'Madhya Pradesh', district: 'Bhopal', lat: 23.2599, lng: 77.4126, pincode: '462001' },
  { name: 'Chandigarh', state: 'Chandigarh', district: 'Chandigarh', lat: 30.7333, lng: 76.7794, pincode: '160017' },
  { name: 'Dehradun', state: 'Uttarakhand', district: 'Dehradun', lat: 30.3165, lng: 78.0322, pincode: '248001' },
  { name: 'Bhubaneswar', state: 'Odisha', district: 'Khordha', lat: 20.2961, lng: 85.8245, pincode: '751001' },
  { name: 'Raipur', state: 'Chhattisgarh', district: 'Raipur', lat: 21.2514, lng: 81.6296, pincode: '492001' },
  { name: 'Guwahati', state: 'Assam', district: 'Kamrup Metropolitan', lat: 26.1445, lng: 91.7362, pincode: '781001' },
  { name: 'Amritsar', state: 'Punjab', district: 'Amritsar', lat: 31.6340, lng: 74.8723, pincode: '143001' },
  { name: 'Kochi', state: 'Kerala', district: 'Ernakulam', lat: 9.9312, lng: 76.2673, pincode: '682001' },
];

function findNearestKnownRegion(lat: number, lng: number) {
  let nearest = KNOWN_INDIAN_REGIONS[0];
  let minDiff = Infinity;
  for (const reg of KNOWN_INDIAN_REGIONS) {
    const dLat = reg.lat - lat;
    const dLng = reg.lng - lng;
    const distSq = dLat * dLat + dLng * dLng;
    if (distSq < minDiff) {
      minDiff = distSq;
      nearest = reg;
    }
  }
  return nearest;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const latStr = searchParams.get('lat');
  const lngStr = searchParams.get('lng');

  if (!latStr || !lngStr) {
    return NextResponse.json({ error: 'Latitude and Longitude are required' }, { status: 400 });
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  // 1. Attempt OpenStreetMap Nominatim reverse geocoding
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`;
    const res = await fetch(nominatimUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'YojnaSetu/1.0 (Government Schemes Channel Partner Locator)',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      const district =
        addr.state_district ||
        addr.county ||
        addr.district ||
        addr.city ||
        addr.town ||
        addr.suburb ||
        '';

      const city =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.suburb ||
        district ||
        '';

      const state = addr.state || '';
      const pincode = addr.postcode || '';

      if (state) {
        const result: ReverseGeocodeResult = {
          state,
          district: district || city || 'Central',
          city: city || district || 'City Center',
          pincode: pincode || '110001',
          displayName: data.display_name || `${city}, ${district}, ${state}`,
          source: 'nominatim',
        };
        return NextResponse.json(result);
      }
    }
  } catch (err) {
    // Nominatim timeout or error, continue to secondary reverse geocoder
  }

  // 2. Secondary reverse geocoder (BigDataCloud free client API)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
    const res = await fetch(bdcUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const state = data.principalSubdivision || '';
      const city = data.city || data.locality || '';
      const district = data.locality || city || '';
      const pincode = data.postcode || '';

      if (state) {
        return NextResponse.json({
          state,
          district: district || city || 'Central',
          city: city || district || 'City Center',
          pincode: pincode || '110001',
          displayName: `${city ? `${city}, ` : ''}${state}, India`,
          source: 'bigdatacloud',
        });
      }
    }
  } catch (err) {
    // Continue to fallback lookup
  }

  // 3. Fallback to nearest known Indian region
  const nearest = findNearestKnownRegion(lat, lng);
  return NextResponse.json({
    state: nearest.state,
    district: nearest.district,
    city: nearest.name,
    pincode: nearest.pincode,
    displayName: `${nearest.name}, ${nearest.district}, ${nearest.state}`,
    source: 'proximity_fallback',
  });
}
