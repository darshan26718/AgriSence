import React, { useState, useEffect } from 'react';
import { ClientDataService, OfficerInfo, KendraInfo } from '../../services/clientDataService';

interface StitchOfficersViewProps {
  onShowToast: (msg: string) => void;
}

export const StitchOfficersView: React.FC<StitchOfficersViewProps> = ({ onShowToast }) => {
  const [filter, setFilter] = useState<'all' | 'entomology' | 'officers' | 'kendra'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [selectedOfficerName, setSelectedOfficerName] = useState<string>('Dr. Gajanan Deshmukh');
  const [inspectionDate, setInspectionDate] = useState<string>('2024-09-20');
  const [inspectionCrop, setInspectionCrop] = useState<string>('Cotton');

  const [liveOfficers, setLiveOfficers] = useState<OfficerInfo[]>([]);
  const [liveKendras, setLiveKendras] = useState<KendraInfo[]>([]);

  useEffect(() => {
    ClientDataService.getOfficers().then(data => {
      if (data && data.length > 0) setLiveOfficers(data);
    });
    ClientDataService.getKendras().then(data => {
      if (data && data.length > 0) setLiveKendras(data);
    });
  }, []);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsScheduleModalOpen(false);
    const res = await ClientDataService.bookInspection({
      officerName: selectedOfficerName,
      crop: inspectionCrop,
      village: 'Sector 1 (North Farms)',
      preferredDate: inspectionDate,
    });
    onShowToast(res.message || `Field inspection requested with ${selectedOfficerName} for ${inspectionCrop}.`);
  };

  const officers = [
    {
      id: '1',
      name: 'Dr. Gajanan Deshmukh',
      role: 'Senior Agricultural Entomologist',
      dept: 'Krishi Vigyan Kendra (KVK) Agricultural Research Center',
      qualification: 'Ph.D. Agricultural Entomology',
      experience: '14 Yrs Gov Service',
      category: 'entomology',
      phone: '18001801551',
      wa: '919420000000',
      rating: '4.9',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCHuAD4oDl-tSyT9WbJlb2b7Smep6AC-hQgtPqrYzVaCiY-RMt8ZiDvfcAJF1_pIlmvdVIqrr6TvvYlcosIQNr9Ld2GXJFnr-1qEQO9PdWD8igTD9vdsuNOcCY28SenpiMBoUFGFyNS10jU9BZqux7UuBhr1ap9MzCy9Gz4geBU1_kWoQKbbMhaKjHa1EbyThJJQlQZIosLErljSuCgCwWJMsA5mBNGd5e2soe6pAtVggT-wck3vxpu',
      status: 'Available Today (10 AM - 4:30 PM)',
      specialty: 'Pink Bollworm, Soybean Rust, Biological Parasitoids',
    },
    {
      id: '2',
      name: 'Smt. Sunita More',
      role: 'Block Agriculture Officer (BAO)',
      dept: 'Block Agriculture Development Office',
      qualification: 'M.Sc. Agronomy',
      experience: '11 Yrs Gov Service',
      category: 'officers',
      phone: '0721200022',
      wa: '919420000022',
      rating: '4.8',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDQfNA7Fg2WTYv5sAxroGQDZ2_qa05fJTnqqSwycco331aSfRZb5uEfNRtX5tIKeON7ESa6N6miIBolQXrM2WknMZUeKH6fCN5WGmGWKSeSglo4gBvPxEFX-7LSkBpyfeha2GS8LX8M3X0EtHOasVQGA80oKOoLtJm59R2SF0jX6lJyhuhAIzQDeKZA3vl-I--olxpTcQFi4jO_XKgHrg5pAAnrwdbIcjXeFAfZptn9RYW9_aAUrwXY',
      status: 'In Field Inspection (Active Sector)',
      specialty: 'Crop Insurance (PMFBY), Drip Subsidies, Certified Seeds',
    },
    {
      id: '3',
      name: 'Shri Rajesh Belsare',
      role: 'Sub-Divisional Agriculture Officer (SDAO)',
      dept: 'Regional Agricultural Extension Division',
      qualification: 'B.Sc. Agriculture (Honours)',
      experience: '18 Yrs Gov Service',
      category: 'officers',
      phone: '0721200033',
      wa: '919420000033',
      rating: '4.9',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA6bDK9QswgcG-qVkioIJyDtTekmy2OdvwNHxiUL1LOHomVdYr5GA8WTGiTW9RF1FT1q3uy1-MZuXI5o0BikgfxHppXLFZ74XMfc_T1O0AsyY_Fu3UzJGaPViVpLtYKYg6wKHx4X7S03eIDo3aAuZF_PAjMgZM44w_vALsjFCGuChbeYxpRrYlLqb292UWt0p2FR_C1Ki_d_uTBz3o2TTRUEf6sMNQjl228bLj_3ANVhRZtP7lmYMMb',
      status: 'Office Duty (Extension HQ)',
      specialty: 'Watershed Development, Organic Certification, CIBRC Regulations',
    },
  ];

  const kendras = [
    {
      id: 'k1',
      name: 'Kisan Krishi Seva Kendra',
      dealer: 'Sureshji Tayade',
      address: 'Shop 4, Market Yard, Sector 1',
      distance: '2.1 km away',
      license: 'LIC #AGRI-DEALER-2021-992 (Valid up to 2028)',
      phone: '0721200000',
      stocks: ['Neem Oil 10,000 PPM', 'Pheromone Traps & Lures', 'Profenofos 50% EC', 'Trichoderma'],
      badge: 'Certified CIBRC Dealer',
    },
    {
      id: 'k2',
      name: 'Farmer Agri Store & Seeds',
      dealer: 'Anilrao Deshmukh',
      address: 'Market Yard Chowk, Sector 2',
      distance: '6.4 km away',
      license: 'LIC #AGRI-DEALER-2019-411 (Valid up to 2029)',
      phone: '0721200001',
      stocks: ['Yellow Sticky Traps', 'Cold Pressed Azadirachtin', 'Chlorantraniliprole', 'Bio-fertilizers'],
      badge: 'Open Today',
    },
    {
      id: 'k3',
      name: 'Kisan Suvidha Agro Kendra',
      dealer: 'Pramod Wankhede',
      address: 'Main Mandi Road, Sector 3',
      distance: '11.8 km away',
      license: 'LIC #AGRI-DEALER-2022-108 (Valid up to 2027)',
      phone: '0721200002',
      stocks: ['Pheromone Lures', 'Copper Oxychloride (COC)', 'Hexaconazole 5% SC'],
      badge: 'In Stock',
    },
  ];

  const displayOfficers = liveOfficers.length > 0 ? liveOfficers : officers;
  const displayKendras = liveKendras.length > 0 ? liveKendras : kendras;

  const filteredOfficers = displayOfficers.filter(o => {
    if (filter === 'kendra') return false;
    if (filter === 'entomology' && o.category !== 'entomology') return false;
    if (filter === 'officers' && o.category !== 'officers') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        o.name.toLowerCase().includes(q) ||
        o.role.toLowerCase().includes(q) ||
        o.specialty.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredKendras = displayKendras.filter(k => {
    if (filter === 'entomology' || filter === 'officers') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        k.name.toLowerCase().includes(q) ||
        k.dealer.toLowerCase().includes(q) ||
        k.stocks.some(s => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full gap-space-md max-w-4xl mx-auto pb-6 select-none">
      {/* Official Govt Seal & Extension Hub Ribbon */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[28px]">account_balance</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">
                Agricultural Extension &amp; Officer Directory
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Farmer Agricultural Helpdesk
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Authorized Krishi Adhikari, Entomologists &amp; Krishi Seva Kendra Network
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-primary font-bold border border-primary/20">
          All Farming Zones
        </span>
      </div>

      {/* Search Input */}
      <div className="relative w-full">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search officer, KVK expert, pest specialist, or Krishi Kendra..."
          className="w-full h-12 pl-11 pr-4 rounded-xl bg-surface-container-lowest text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none shadow-sm border border-outline-variant/30"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'All Personnel & Shops' },
          { id: 'entomology', label: 'Entomology & Pest Experts' },
          { id: 'officers', label: 'Block Agriculture Officers' },
          { id: 'kendra', label: 'Krishi Seva Kendra (Shops)' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id as any)}
            className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md shrink-0 transition-all cursor-pointer font-bold ${
              filter === t.id
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Free Krishi Toll-Free Helplines Card */}
      <div className="w-full bg-secondary-fixed text-on-secondary-fixed rounded-xl p-space-md shadow-sm border border-outline-variant/20 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">contact_phone</span>
            <h3 className="font-label-lg text-label-lg font-bold text-secondary">
              24x7 Government Krishi Helpline Desks
            </h3>
          </div>
          <span className="font-label-sm text-label-sm bg-surface-container-lowest px-2 py-0.5 rounded text-secondary font-bold">
            Toll-Free
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <a
            href="tel:18001801551"
            className="flex items-center gap-2 bg-surface-container-lowest/80 p-2.5 rounded-lg text-on-surface font-label-sm text-label-sm hover:bg-surface-container-lowest transition-colors"
          >
            <span className="material-symbols-outlined text-primary text-[20px]">headset_mic</span>
            <div className="flex flex-col">
              <span className="font-bold text-primary">1800-180-1551</span>
              <span className="text-on-surface-variant text-[11px]">Kisan Call Centre (All Languages)</span>
            </div>
          </a>
          <a
            href="tel:18001208040"
            className="flex items-center gap-2 bg-surface-container-lowest/80 p-2.5 rounded-lg text-on-surface font-label-sm text-label-sm hover:bg-surface-container-lowest transition-colors"
          >
            <span className="material-symbols-outlined text-secondary text-[20px]">support_agent</span>
            <div className="flex flex-col">
              <span className="font-bold text-secondary">1800-120-8040</span>
              <span className="text-on-surface-variant text-[11px]">Kisan DBT &amp; Grievance</span>
            </div>
          </a>
          <a
            href="https://wa.me/919420000000"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-surface-container-lowest/80 p-2.5 rounded-lg text-on-surface font-label-sm text-label-sm hover:bg-surface-container-lowest transition-colors"
          >
            <span className="material-symbols-outlined text-primary text-[20px]">chat</span>
            <div className="flex flex-col">
              <span className="font-bold text-primary">Kisan Agri WhatsApp</span>
              <span className="text-on-surface-variant text-[11px]">Direct Digital Extension</span>
            </div>
          </a>
        </div>
      </div>

      {/* Officers List Section */}
      {filteredOfficers.length > 0 && (
        <div className="flex flex-col gap-space-sm">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Government Krishi Officers &amp; Research Scientists
            </h3>
            <span className="font-label-sm text-label-sm text-primary font-bold">
              {filteredOfficers.length} Verified
            </span>
          </div>

          <div className="flex flex-col gap-space-sm">
            {(filteredOfficers || []).map(officer => (
              <div
                key={officer.id}
                className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/20 flex flex-col gap-space-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={officer.image}
                      alt={officer.name}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/30 shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-label-lg text-label-lg text-on-surface font-bold">
                          {officer.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-bold flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[13px]">star</span>
                          {officer.rating}
                        </span>
                      </div>
                      <p className="font-label-md text-label-md text-primary font-semibold truncate">
                        {officer.role}
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                        {officer.dept}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-surface-container-high text-on-surface font-label-sm text-label-sm font-semibold shrink-0">
                    {officer.experience}
                  </span>
                </div>

                {/* Specialties Tag */}
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-primary text-[18px] shrink-0">
                    psychology
                  </span>
                  <span className="text-on-surface-variant">Focus Areas:</span>
                  <span className="font-semibold text-on-surface truncate">{officer.specialty}</span>
                </div>

                {/* Availability status */}
                <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                  <span className="flex items-center gap-1.5 text-primary font-bold">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    {officer.status}
                  </span>
                  <span className="italic">{officer.qualification}</span>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-surface-container">
                  <a
                    href={`tel:${officer.phone}`}
                    className="h-11 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all font-bold cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">phone</span>
                    <span>Call Officer</span>
                  </a>
                  <a
                    href={`https://wa.me/${officer.wa}?text=Namaste%20${encodeURIComponent(
                      officer.name
                    )},%20I%20am%20a%20farmer%20requesting%20crop%20advice.`}
                    target="_blank"
                    rel="noreferrer"
                    className="h-11 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all font-bold cursor-pointer hover:bg-surface-container-high"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary">chat</span>
                    <span>WhatsApp</span>
                  </a>
                  <button
                    onClick={() => {
                      setSelectedOfficerName(officer.name);
                      setIsScheduleModalOpen(true);
                    }}
                    className="h-11 rounded-lg bg-surface-container-high text-primary font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all font-bold cursor-pointer hover:bg-surface-container-highest"
                  >
                    <span className="material-symbols-outlined text-[18px]">event</span>
                    <span>Field Inspection</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Krishi Seva Kendra Section */}
      {filteredKendras.length > 0 && (
        <div className="flex flex-col gap-space-sm mt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Licensed Krishi Seva Kendra Retailers
            </h3>
            <span className="font-label-sm text-label-sm text-primary font-bold">
              {filteredKendras.length} Authorized
            </span>
          </div>

          <div className="flex flex-col gap-space-sm">
            {(filteredKendras || []).map(kendra => (
              <div
                key={kendra.id}
                className="w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/20 flex flex-col gap-space-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-[22px]">storefront</span>
                    </div>
                    <div>
                      <h4 className="font-label-lg text-label-lg text-on-surface font-bold">
                        {kendra.name}
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Prop: {kendra.dealer} • {kendra.address}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-primary-container text-on-primary font-label-sm text-label-sm font-bold shrink-0">
                    {kendra.distance}
                  </span>
                </div>

                {/* Stocked supplies chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-label-sm text-label-sm text-on-surface-variant mr-1">
                    Verified Stock:
                  </span>
                  {(kendra.stocks || []).map((item, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm border-t border-surface-container pt-2">
                  <span className="text-primary font-bold flex items-center gap-1">
                    <span
                      className="material-symbols-outlined text-[15px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      verified
                    </span>
                    {kendra.license}
                  </span>
                  <span className="bg-surface-container-highest px-2 py-0.5 rounded text-on-surface font-semibold">
                    {kendra.badge}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={`tel:${kendra.phone}`}
                    className="h-11 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all font-bold cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">call</span>
                    <span>Call Kendra</span>
                  </a>
                  <button
                    onClick={() => {
                      onShowToast(`Opening directions for ${kendra.name}...`);
                      window.open(`https://maps.google.com/?q=${encodeURIComponent(kendra.name)}`, '_blank');
                    }}
                    className="h-11 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all font-bold cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary">directions</span>
                    <span>Get Directions</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Field Inspection Booking Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-center justify-center p-space-md animate-fadeIn">
          <div className="w-full max-w-md bg-surface-container-lowest text-on-surface rounded-xl shadow-2xl overflow-hidden flex flex-col border border-outline-variant/30">
            <div className="bg-primary-container text-on-primary p-space-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px]">event_available</span>
                <h3 className="font-headline-sm text-headline-sm font-bold">Request Field Inspection</h3>
              </div>
              <button
                className="w-8 h-8 rounded-full bg-surface/20 flex items-center justify-center text-on-primary hover:bg-surface/30 cursor-pointer"
                onClick={() => setIsScheduleModalOpen(false)}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="p-space-md flex flex-col gap-space-md">
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1 font-bold">
                  Selected Officer
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedOfficerName}
                  className="w-full h-12 px-3 rounded-lg bg-surface-container text-on-surface font-body-md text-body-md border border-outline-variant/30"
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1 font-bold">
                  Crop Under Inspection
                </label>
                <select
                  value={inspectionCrop}
                  onChange={e => setInspectionCrop(e.target.value)}
                  className="w-full h-12 px-3 rounded-lg bg-surface-container text-on-surface font-body-md text-body-md border border-outline-variant/30"
                >
                  <option value="Cotton">Cotton (Kapus)</option>
                  <option value="Soybean">Soybean</option>
                  <option value="Pigeon Pea (Tur)">Pigeon Pea (Tur)</option>
                  <option value="Citrus / Orange">Citrus / Orange</option>
                </select>
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1 font-bold">
                  Preferred Visit Date
                </label>
                <input
                  type="date"
                  value={inspectionDate}
                  onChange={e => setInspectionDate(e.target.value)}
                  className="w-full h-12 px-3 rounded-lg bg-surface-container text-on-surface font-body-md text-body-md border border-outline-variant/30"
                />
              </div>

              <div className="bg-surface-container-low p-2.5 rounded-lg flex items-center gap-2 border border-outline-variant/20">
                <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Free government service under Krishi Vigyan Kendra Extension Scheme.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="flex-1 h-12 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm active:scale-95 transition-all font-bold cursor-pointer hover:bg-primary-container"
                >
                  Confirm Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
