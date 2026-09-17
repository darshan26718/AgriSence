export interface AgroCentreRecord {
  id: string;
  name: string;
  state: 'Karnataka' | 'Andhra Pradesh' | 'Telangana';
  district: string;
  location: string;
  phone: string;
  whatsapp: string;
  timings: string;
  workingDays: string;
  services: string[];
  coordinates: { lat: number; lng: number };
  distanceKm?: number;
  badge: 'Government KVK' | 'Raitha Seva Kendra' | 'Rythu Bharosa Kendra' | 'Certified Clinic';
  email: string;
  officerInCharge: string;
}

export const AGRO_CENTRES_DATA: AgroCentreRecord[] = [
  {
    id: 'agro-01',
    name: 'ICAR - Krishi Vigyan Kendra (KVK) Kalaburagi',
    state: 'Karnataka',
    district: 'Kalaburagi',
    location: 'Agricultural Research Station Campus, Aland Road, Kalaburagi, Karnataka 585101',
    phone: '08472-278625',
    whatsapp: '+91 94484 95620',
    timings: '9:00 AM – 6:00 PM',
    workingDays: 'Monday – Saturday',
    services: [
      'Crop Consultation',
      'Disease Guidance',
      'Certified Seeds (Red Gram/Pigeon Pea, Chickpea)',
      'Bio-Fertilizers & Trichoderma',
      'Soil Testing Lab',
      'Agricultural Drone Demonstration',
    ],
    coordinates: { lat: 17.3297, lng: 76.8343 },
    distanceKm: 4.2,
    badge: 'Government KVK',
    email: 'kvkkalaburagi@icar.gov.in',
    officerInCharge: 'Dr. Basavaraj Patil (Senior Agronomist)',
  },
  {
    id: 'agro-02',
    name: 'Raitha Seva Kendra (RSK) Dharwad North',
    state: 'Karnataka',
    district: 'Dharwad',
    location: 'Near APMC Yard, PB Road, Dharwad, Karnataka 580007',
    phone: '0836-2447812',
    whatsapp: '+91 98450 12340',
    timings: '9:00 AM – 5:30 PM',
    workingDays: 'Monday – Saturday',
    services: [
      'Crop Health Guidance',
      'Fertilizers & Micro-nutrients',
      'Certified Cotton & Soybean Seeds',
      'Subsidized Farm Machinery Support',
      'Pest Outbreak Alert Desk',
    ],
    coordinates: { lat: 15.4589, lng: 75.0078 },
    distanceKm: 8.5,
    badge: 'Raitha Seva Kendra',
    email: 'rsk.dharwad@karnataka.gov.in',
    officerInCharge: 'Shri. Manjunath Gouda (Assistant Director of Agriculture)',
  },
  {
    id: 'agro-03',
    name: 'Raitha Seva Kendra (RSK) Mandya Central',
    state: 'Karnataka',
    district: 'Mandya',
    location: 'Opposite District Agriculture Complex, Mysore-Bangalore Highway, Mandya 571401',
    phone: '08232-224150',
    whatsapp: '+91 94481 88920',
    timings: '9:30 AM – 6:00 PM',
    workingDays: 'Monday – Saturday',
    services: [
      'Sugarcane & Paddy Specialist Clinic',
      'CIBRC Certified Bio-pesticides',
      'Soil Health Card Testing',
      'Drip & Sprinkler Micro-irrigation Guidance',
      'Agricultural Loans & Subsidy Desk',
    ],
    coordinates: { lat: 12.5218, lng: 76.8951 },
    distanceKm: 12.0,
    badge: 'Raitha Seva Kendra',
    email: 'rsk.mandya@karnataka.gov.in',
    officerInCharge: 'Smt. Roopa K. (Agricultural Extension Officer)',
  },
  {
    id: 'agro-04',
    name: 'Rythu Bharosa Kendra (RBK) Warangal Rural',
    state: 'Telangana',
    district: 'Warangal',
    location: 'Collectorate Junction, Hanamkonda Road, Warangal, Telangana 506001',
    phone: '0870-2458910',
    whatsapp: '+91 98490 54321',
    timings: '9:00 AM – 6:00 PM',
    workingDays: 'Monday – Saturday',
    services: [
      'Cotton Pink Bollworm Diagnosis Clinic',
      'Certified Seeds & Neem-coated Urea',
      'Soil Testing & Micronutrient Analysis',
      'Kisan Call Support Desk',
      'Crop Insurance Enrolment Assistance',
    ],
    coordinates: { lat: 17.9689, lng: 79.5941 },
    distanceKm: 6.8,
    badge: 'Rythu Bharosa Kendra',
    email: 'rbk.warangal@telangana.gov.in',
    officerInCharge: 'Dr. K. Srinivas Rao (District Agriculture Officer)',
  },
  {
    id: 'agro-05',
    name: 'Dr. YSR Rythu Bharosa Kendra (RBK) Guntur',
    state: 'Andhra Pradesh',
    district: 'Guntur',
    location: 'Agricultural Market Yard Complex, Amaravathi Road, Guntur, Andhra Pradesh 522002',
    phone: '0863-2234567',
    whatsapp: '+91 94401 77650',
    timings: '8:30 AM – 5:30 PM',
    workingDays: 'Monday – Saturday',
    services: [
      'Chilli, Cotton & Tobacco Diagnostics',
      'CIBRC Authorized Fungicides & Insecticides',
      'Free Digital Soil Quality Testing',
      'Farmer Field School Demonstration',
      'Organic Fertilizer & Vermicompost',
    ],
    coordinates: { lat: 16.3067, lng: 80.4365 },
    distanceKm: 9.3,
    badge: 'Rythu Bharosa Kendra',
    email: 'rbk.guntur@ap.gov.in',
    officerInCharge: 'Sri. M. Venkata Reddy (Deputy Director of Agriculture)',
  },
  {
    id: 'agro-06',
    name: 'ICAR - Krishi Vigyan Kendra (KVK) Vijayawada / Krishna',
    state: 'Andhra Pradesh',
    district: 'Krishna',
    location: 'Garikapadu Post, Jaggayyapeta Mandal, Krishna District, AP 521175',
    phone: '08654-288238',
    whatsapp: '+91 94901 55432',
    timings: '9:00 AM – 5:30 PM',
    workingDays: 'Monday – Saturday',
    services: [
      'Paddy Brown Planthopper (BPH) Diagnostic Lab',
      'Certified Seed Multiplication Nursery',
      'Soil & Water Quality Analysis',
      'Biological Pest Control (Trichogramma Cards)',
      'Farmer Helplines & Training Workshops',
    ],
    coordinates: { lat: 16.8921, lng: 80.0984 },
    distanceKm: 14.5,
    badge: 'Government KVK',
    email: 'kvk.krishna@icar.gov.in',
    officerInCharge: 'Dr. N. Rajasekhar (Program Coordinator)',
  },
];
