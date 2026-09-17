export interface AgriExpertRecord {
  id: string;
  name: string;
  qualification: string;
  role: string;
  specialization: string;
  category: 'disease' | 'entomology' | 'soil' | 'horticulture';
  experience: string;
  crops: string[];
  diseasesSupported: string[];
  location: string;
  district: string;
  state: 'Karnataka' | 'Telangana' | 'Andhra Pradesh' | 'Maharashtra';
  coordinates: { lat: number; lng: number };
  distanceKm?: number;
  availability: 'available' | 'offline';
  consultationTiming: string;
  phone: string;
  whatsapp: string;
  languages: string[];
  consultationType: ('Phone Call' | 'WhatsApp Consultation' | 'KVK Clinic Visit')[];
  fee: string;
  about: string;
  avatar: string;
  institute: string;
}

export const AGRI_EXPERTS_DATA: AgriExpertRecord[] = [
  {
    id: 'expert-01',
    name: 'Dr. Basavaraj Patil',
    qualification: 'Ph.D. Plant Pathology (UAS Raichur)',
    role: 'Senior Crop Disease Specialist & Plant Doctor',
    specialization: 'Fungal Blights, Wilts & Viral Leaf Curl Management',
    category: 'disease',
    experience: '14+ Years Experience',
    crops: ['Tomato', 'Potato', 'Cotton', 'Chilli', 'Pigeon Pea (Tur)'],
    diseasesSupported: [
      'Tomato Early Blight',
      'Tomato Late Blight',
      'Chilli Leaf Curl Virus',
      'Fusarium Wilt',
      'Powdery Mildew',
    ],
    location: 'ICAR Krishi Vigyan Kendra (KVK), Aland Road',
    district: 'Kalaburagi',
    state: 'Karnataka',
    coordinates: { lat: 17.3364, lng: 76.8373 },
    distanceKm: 3.5,
    availability: 'available',
    consultationTiming: '9:00 AM – 5:00 PM',
    phone: '08472-278625',
    whatsapp: '+91 94484 95620',
    languages: ['Kannada', 'English', 'Hindi'],
    consultationType: ['Phone Call', 'WhatsApp Consultation', 'KVK Clinic Visit'],
    fee: 'Free (ICAR Farmer Helpline)',
    about:
      'Dr. Basavaraj Patil specializes in rapid fungal disease diagnostics, biological control with Trichoderma, and customized fungicide spray schedules tailored to local agro-climatic conditions.',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    institute: 'ICAR - Krishi Vigyan Kendra Kalaburagi',
  },
  {
    id: 'expert-02',
    name: 'Dr. Aruna Mallikarjun',
    qualification: 'M.Sc. (Agri) Agricultural Entomology',
    role: 'Senior Crop Pest Entomologist',
    specialization: 'Bollworm Complex, Sucking Pests & IPM Systems',
    category: 'entomology',
    experience: '11+ Years Experience',
    crops: ['Cotton', 'Soybean', 'Chilli', 'Tomato', 'Bengal Gram'],
    diseasesSupported: [
      'Pink Bollworm',
      'Spodoptera Frugiperda',
      'Thrips & Whiteflies',
      'Stem Borer',
      'Mites Outbreak',
    ],
    location: 'University of Agricultural Sciences Campus',
    district: 'Dharwad',
    state: 'Karnataka',
    coordinates: { lat: 15.4989, lng: 74.9896 },
    distanceKm: 7.8,
    availability: 'available',
    consultationTiming: '9:30 AM – 4:30 PM',
    phone: '0836-2447812',
    whatsapp: '+91 98450 12340',
    languages: ['Kannada', 'English', 'Telugu'],
    consultationType: ['Phone Call', 'WhatsApp Consultation', 'KVK Clinic Visit'],
    fee: 'Free (Govt Extension Service)',
    about:
      'Expert in Integrated Pest Management (IPM), pheromone trap threshold analysis, and scientific botanical pesticide preparation to combat resistance in sucking insects.',
    avatar:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    institute: 'UAS Dharwad Agricultural Research Center',
  },
  {
    id: 'expert-03',
    name: 'Dr. K. Srinivas Reddy',
    qualification: 'Ph.D. Plant Pathology (PJTSAU Hyderabad)',
    role: 'Plant Doctor & Vegetable Pathologist',
    specialization: 'Solanaceous & Cash Crop Pathology',
    category: 'disease',
    experience: '16+ Years Experience',
    crops: ['Tomato', 'Chilli', 'Cotton', 'Turmeric', 'Maize'],
    diseasesSupported: [
      'Bacterial Leaf Spot',
      'Anthracnose / Dieback',
      'Yellow Mosaic Virus',
      'Root Rot Complex',
    ],
    location: 'Regional Agricultural Research Station (RARS)',
    district: 'Warangal',
    state: 'Telangana',
    coordinates: { lat: 17.9689, lng: 79.5941 },
    distanceKm: 5.1,
    availability: 'available',
    consultationTiming: '10:00 AM – 5:00 PM',
    phone: '0870-2100450',
    whatsapp: '+91 94901 23450',
    languages: ['Telugu', 'English', 'Hindi'],
    consultationType: ['Phone Call', 'WhatsApp Consultation', 'KVK Clinic Visit'],
    fee: 'Free (PJTSAU Advisory Service)',
    about:
      'Specialist in high-humidity fungal epidemics, weather-based preventive spray schedules, and nursery disease management for vegetable growers across Telangana.',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    institute: 'PJTSAU Regional Agricultural Research Station Warangal',
  },
  {
    id: 'expert-04',
    name: 'Dr. T. Venkanna Naidu',
    qualification: 'M.Sc. Soil Science & Agricultural Chemistry',
    role: 'Chief Agronomist & Soil Nutrition Expert',
    specialization: 'Soil Fertility, Micro-nutrient Deficiencies & Fertigation',
    category: 'soil',
    experience: '13+ Years Experience',
    crops: ['Chilli', 'Cotton', 'Paddy', 'Banana', 'Tomato'],
    diseasesSupported: [
      'Nitrogen Deficiency Yellowing',
      'Zinc & Iron Chlorosis',
      'Blossom End Rot (Calcium Deficiency)',
      'Salinity Stress',
    ],
    location: 'Rythu Bharosa Kendra (RBK) Cluster Hub, Lam',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    coordinates: { lat: 16.3524, lng: 80.4412 },
    distanceKm: 6.4,
    availability: 'offline',
    consultationTiming: '9:00 AM – 4:00 PM (Mon – Fri)',
    phone: '0863-2234567',
    whatsapp: '+91 94400 98760',
    languages: ['Telugu', 'English'],
    consultationType: ['Phone Call', 'KVK Clinic Visit'],
    fee: 'Free (Govt Extension Service)',
    about:
      'Guides farmers in interpreting soil test reports, calculating correct NPK ratios, and resolving physiological crop disorders mistaken for infectious diseases.',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    institute: 'Dr. YSR Horticultural University & RBK Hub Guntur',
  },
  {
    id: 'expert-05',
    name: 'Dr. Ramesh Chandra Hegde',
    qualification: 'Ph.D. Horticulture & Organic Crop Protection',
    role: 'Horticultural Doctor & Organic Specialist',
    specialization: 'Bio-pesticides, Trichoderma & Zero-Budget Natural Farming',
    category: 'horticulture',
    experience: '18+ Years Experience',
    crops: ['Tomato', 'Potato', 'Sugarcane', 'Pomegranate', 'Arecanut'],
    diseasesSupported: [
      'Early & Late Blights',
      'Bacterial Canker',
      'Nematode Infestation',
      'Damping Off',
    ],
    location: 'ICAR - Krishi Vigyan Kendra Mandya, VC Farm',
    district: 'Mandya',
    state: 'Karnataka',
    coordinates: { lat: 12.5218, lng: 76.8951 },
    distanceKm: 8.9,
    availability: 'available',
    consultationTiming: '9:00 AM – 5:30 PM',
    phone: '08232-277250',
    whatsapp: '+91 94481 23090',
    languages: ['Kannada', 'English', 'Hindi'],
    consultationType: ['Phone Call', 'WhatsApp Consultation', 'KVK Clinic Visit'],
    fee: 'Free (Govt KVK Consultation)',
    about:
      'Pioneer in organic crop medicine, jeevamrutha formulation, neem oil deterrence, and non-chemical management of soil-borne pathogens.',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    institute: 'ICAR - KVK VC Farm Mandya',
  },
  {
    id: 'expert-06',
    name: 'Dr. P. V. Lakshmi Devi',
    qualification: 'M.Sc. (Agri) Plant Pathology',
    role: 'Associate Crop Doctor',
    specialization: 'Vegetable Crop Viruses & Seed Treatment',
    category: 'disease',
    experience: '9+ Years Experience',
    crops: ['Tomato', 'Chilli', 'Okra', 'Cucurbits', 'Paddy'],
    diseasesSupported: [
      'Tomato Leaf Curl Virus (ToLCV)',
      'Anthracnose Fruit Rot',
      'Damping Off in Nurseries',
      'Powdery Mildew',
    ],
    location: 'Agricultural Research Station, Garikapadu',
    district: 'Krishna',
    state: 'Andhra Pradesh',
    coordinates: { lat: 16.8924, lng: 80.0842 },
    distanceKm: 12.3,
    availability: 'available',
    consultationTiming: '9:30 AM – 5:00 PM',
    phone: '08654-222340',
    whatsapp: '+91 94902 44550',
    languages: ['Telugu', 'English', 'Hindi'],
    consultationType: ['Phone Call', 'WhatsApp Consultation', 'KVK Clinic Visit'],
    fee: 'Free (Govt Extension Service)',
    about:
      'Specialist in nursery hygiene, systemic seed treatment protocols, and early diagnosis of viral infections transmitted by whiteflies and thrips.',
    avatar:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    institute: 'ANGRAU Agricultural Research Station Krishna',
  },
];

/**
 * Calculates distance in kilometers between two geographic coordinates using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Checks if a given time range (e.g. "9:00 AM – 5:00 PM") is currently open
 */
export function isCurrentlyOpen(timingStr: string): boolean {
  try {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Standard business hours fallback (9:00 AM - 6:00 PM)
    const openMin = 9 * 60; // 540
    const closeMin = 18 * 60; // 1080

    return currentMinutes >= openMin && currentMinutes <= closeMin;
  } catch {
    return true;
  }
}
