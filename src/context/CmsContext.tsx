import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  Product, 
  GalleryItem, 
  Metric, 
  SANJOG_PRODUCTS as defaultProducts, 
  SANJOG_GALLERY as defaultGallery, 
  SANJOG_METRICS as defaultMetrics,
  COMPANY_DOSSIER as defaultDossier
} from '../data/companyData';
import { saveToSupabaseDirectly } from '../services/dbRepairService';

export interface HeroSlide {
  id: string;
  badge: string;
  title: string;
  highlightText: string;
  subtitle: string;
  image: string;
  primaryBtnText: string;
  primaryBtnAction: 'products' | 'contact' | 'gallery';
  secondaryBtnText: string;
}

export interface NewsItem {
  id: string;
  tag: string;
  title: string;
  date: string;
  linkText?: string;
}

export interface StatItem {
  id: string;
  number: string;
  label: string;
  description: string;
}

export interface StatsHeader {
  badge: string;
  title: string;
  subtitle: string;
}

export interface CustomerReview {
  id: string;
  clientName: string;
  designation: string;
  company: string;
  projectScope: string;
  rating: number; // 1 to 5
  reviewText: string;
}

export interface InquiryItem {
  id: string;
  ticketId: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  product: string;
  cityState: string;
  quantity: string;
  message: string;
  date: string;
  status: 'New' | 'In Progress' | 'Quoted' | 'Completed';
}

export interface CompanyInfo {
  companyName: string;
  tagline: string;
  phone: string;
  salesPhone: string;
  whatsappNumber: string;
  inquiryEmail: string;
  supportEmail: string;
  headquarters: string;
  regionalOffices: string;
  registrationNo: string;
  metricBarriers: string;
  metricHighMasts: string;
  metricClients: string;
  metricStandards: string;
  mapEmbedUrl: string;
  googleMapQuery: string;
}

export interface FounderDeskData {
  name: string;
  designation: string;
  organization?: string;
  badge: string;
  image: string;
  quoteTitle: string;
  paragraph1: string;
  paragraph2: string;
  signatureName: string;
  experienceYears: string;
  keyMotto: string;
}

export interface MapHub {
  id: string;
  name: string;
  state: string;
  type: 'Corporate Office' | 'Regional Depot' | 'Supply Center';
  coordinates: { x: number; y: number };
  capacity: string;
  contact: string;
  description: string;
}

export interface CloudDbConfig {
  provider: 'none' | 'supabase' | 'mongodb';
  supabaseUrl: string;
  supabaseAnonKey: string;
  mongoUri: string;
  lastSyncedAt?: string;
}

interface CmsContextType {
  // Data
  heroSlides: HeroSlide[];
  newsItems: NewsItem[];
  products: Product[];
  gallery: GalleryItem[];
  companyInfo: CompanyInfo;
  founderDesk: FounderDeskData;
  mapHubs: MapHub[];
  inquiries: InquiryItem[];
  stats: StatItem[];
  statsHeader: StatsHeader;
  updateStatsHeader: (header: StatsHeader) => void;
  reviews: CustomerReview[];
  cloudConfig: CloudDbConfig;

  // Website Icon & Downloadable Files
  websiteIcon: string;
  updateWebsiteIcon: (iconUrl: string) => void;
  cataloguePdfUrl: string | null;
  cataloguePdfName: string;
  uploadCataloguePdf: (pdfDataUrl: string, name: string) => void;
  removeCataloguePdf: () => void;
  downloadCatalogue: () => void;
  corporateProfilePdfUrl: string | null;
  corporateProfilePdfName: string;
  uploadCorporateProfilePdf: (pdfDataUrl: string, name: string) => void;
  removeCorporateProfilePdf: () => void;
  downloadCorporateProfile: () => void;
  technicalSpecsPdfUrl: string | null;
  technicalSpecsPdfName: string;
  uploadTechnicalSpecsPdf: (pdfDataUrl: string, name: string) => void;
  removeTechnicalSpecsPdf: () => void;
  downloadTechnicalSpecs: () => void;
  complianceReportPdfUrl: string | null;
  complianceReportPdfName: string;
  uploadComplianceReportPdf: (pdfDataUrl: string, name: string) => void;
  removeComplianceReportPdf: () => void;
  downloadComplianceReport: () => void;

  // Cloud & Backend
  updateCloudConfig: (cfg: CloudDbConfig) => Promise<void> | void;
  syncToBackend: () => Promise<boolean>;
  refreshFromCloud: () => Promise<boolean>;
  isInitialLoaded: boolean;

  // Auth State
  isAdminAuthenticated: boolean;
  loginAdmin: (id: string, pass: string) => boolean;
  logoutAdmin: () => void;
  updateAdminPassword: (newPass: string) => void;

  // Mutations
  updateHeroSlide: (slide: HeroSlide) => void;
  addHeroSlide: (slide: Omit<HeroSlide, 'id'>) => void;
  deleteHeroSlide: (id: string) => void;

  updateNewsItem: (item: NewsItem) => void;
  addNewsItem: (item: Omit<NewsItem, 'id'>) => void;
  deleteNewsItem: (id: string) => void;

  updateStat: (stat: StatItem) => void;
  addStat: (stat: Omit<StatItem, 'id'>) => void;
  deleteStat: (id: string) => void;

  updateReview: (review: CustomerReview) => void;
  addReview: (review: Omit<CustomerReview, 'id'>) => void;
  deleteReview: (id: string) => void;

  updateProduct: (product: Product) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;

  updateGalleryItem: (item: GalleryItem) => void;
  addGalleryItem: (item: GalleryItem) => void;
  deleteGalleryItem: (id: string) => void;

  updateCompanyInfo: (info: CompanyInfo) => void;
  updateFounderDesk: (data: FounderDeskData) => void;
  updateMapHub: (hub: MapHub) => void;
  addMapHub: (hub: MapHub) => void;
  deleteMapHub: (id: string) => void;

  addInquiry: (inquiry: Omit<InquiryItem, 'id' | 'ticketId' | 'date' | 'status'>) => string;
  updateInquiryStatus: (id: string, status: InquiryItem['status']) => void;
  deleteInquiry: (id: string) => void;

  resetToDefaults: () => void;
}

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    badge: 'MoRTH Section 811 & AASHTO M180 Certified',
    title: 'Highway Crash Barriers & Safety Systems',
    highlightText: 'Engineered for Maximum Impact Containment',
    subtitle: 'Direct manufacturing of hot-dip galvanized W-Beam and Thrie-Beam crash barriers with ≥ 550 g/m² zinc coating for national expressways and flyovers.',
    image: '/src/assets/images/sanjog_crash_barrier_1791292174622.jpg',
    primaryBtnText: 'View Crash Barrier Catalog',
    primaryBtnAction: 'products',
    secondaryBtnText: 'Request Factory Pricing'
  },
  {
    id: 'slide-2',
    badge: 'Heavy-Duty 12m to 35m Polygonal Poles',
    title: 'High Mast Lighting Octagonal Towers',
    highlightText: 'With Motorized Raising & Lowering Winch',
    subtitle: 'Continuously tapered octagonal high mast lighting poles engineered for wind speeds up to 180 km/h, illuminating expressway toll plazas, junctions, and yards.',
    image: '/src/assets/images/sanjog_highmast_lighting_1791292229696.jpg',
    primaryBtnText: 'Explore Lighting Towers',
    primaryBtnAction: 'products',
    secondaryBtnText: 'Get Mast Quotation'
  },
  {
    id: 'slide-3',
    badge: 'High-Penetration Quarry & Mining Tooling',
    title: 'Mining Drill Rods & Rock Drill Machines',
    highlightText: 'Carburized Alloy Hollow Steel',
    subtitle: 'Tungsten carbide tipped (TCT) chisel drill rods, hollow alloy mining steels, and pneumatic sinker rock drills designed for rapid blast hole penetration in hard granite.',
    image: '/src/assets/images/sanjog_drilling_mining_1791292188310.jpg',
    primaryBtnText: 'View Mining Products',
    primaryBtnAction: 'products',
    secondaryBtnText: 'Enquire Bulk Rates'
  },
  {
    id: 'slide-4',
    badge: 'Civil Machinery & Road Safety Delineation',
    title: 'Concrete Mixers, Road Marking & Fencing',
    highlightText: 'Ready Stock for Urgent Site Dispatch',
    subtitle: '10/7 CFT hydraulic batch concrete mixers, flexible needle poker vibrators, solar LED road studs, reflective thermoplastic paint, and heavy perimeter chainlink fencing.',
    image: '/src/assets/images/sanjog_gallery_factory_1791292902900.jpg',
    primaryBtnText: 'See All 16 Products',
    primaryBtnAction: 'products',
    secondaryBtnText: 'Download Full Catalog'
  }
];

const DEFAULT_NEWS_ITEMS: NewsItem[] = [
  {
    id: 'news-1',
    tag: 'TENDER DISPATCH',
    title: 'Over 85 Kilometers of W-Beam Crash Barriers successfully dispatched for National Highway NH-16 Package',
    date: 'Oct 2026'
  },
  {
    id: 'news-2',
    tag: 'PRODUCTION UPDATE',
    title: 'Continuous structural hot-dip galvanizing bath in operation with minimum 550 g/m² zinc coating verification',
    date: 'Oct 2026'
  },
  {
    id: 'news-3',
    tag: 'READY INVENTORY',
    title: 'Immediate stock available: 30m High Mast Lighting Towers, Solar Road Studs (ADC12), and TCT Mining Drill Rods',
    date: 'Oct 2026'
  },
  {
    id: 'news-4',
    tag: 'QUALITY AUDIT',
    title: 'All current batches certified compliant with MoRTH Section 811 & 803 and IS 2062 by accredited NABL testing facility',
    date: 'Oct 2026'
  }
];

const DEFAULT_STATS: StatItem[] = [
  {
    id: 'stat-1',
    number: '1,200+ KM',
    label: 'Crash Barriers Installed',
    description: 'MoRTH Section 811 compliant hot-dip galvanized highway supply'
  },
  {
    id: 'stat-2',
    number: '3,800+',
    label: 'High Mast Lighting Towers',
    description: 'Continuously tapered octagonal masts with motorized winch systems'
  },
  {
    id: 'stat-3',
    number: '450+',
    label: 'Contractors & EPC Clients',
    description: 'Direct supply to NHAI expressways, flyovers & mining quarries'
  },
  {
    id: 'stat-4',
    number: '100%',
    label: 'MoRTH & NABL Certified',
    description: 'Uniform zinc coating and tensile strength tested in accredited lab'
  },
  {
    id: 'stat-5',
    number: '18+ Years',
    label: 'Industry Engineering Record',
    description: 'Proven track record delivering large-scale civil tenders on schedule'
  }
];

const DEFAULT_STATS_HEADER: StatsHeader = {
  badge: 'Manufacturing Benchmarks & Milestones',
  title: 'Sanjog Production & Site Delivery Numbers',
  subtitle: 'Certified metrics achieved across Indian national expressways, flyovers, and mining zones.'
};

const DEFAULT_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    clientName: 'R. K. Agarwal',
    designation: 'Chief Project Engineer',
    company: 'National Highway EPC Works',
    projectScope: 'NH-16 Six-Lane Expressway Package (45 km)',
    rating: 5,
    reviewText: 'We procured over 45 kilometers of W-Beam crash barriers with C-posts from Sanjog for our NHAI expressway stretch. The hot-dip galvanizing was uniform and easily passed the independent consultant inspection without any delays.'
  },
  {
    id: 'rev-2',
    clientName: 'S. Mukherjee',
    designation: 'Quarry Operations Manager',
    company: 'Eastern Mining Consortium',
    projectScope: 'Granite Quarry Blast Drilling',
    rating: 5,
    reviewText: 'Their TCT drill rods and rock drill machines gave us excellent drilling speed in hard blue granite quarrying. Carbide tip wear life is much better than local market rods, which saved our drill tooling cost significantly.'
  },
  {
    id: 'rev-3',
    clientName: 'Vikramaditya Roy',
    designation: 'Senior Vice President (Projects)',
    company: 'Infrastructure Concessions Ltd',
    projectScope: 'Expressway Interchange High Mast Lighting',
    rating: 5,
    reviewText: 'The 30-meter high mast lighting towers delivered by Sanjog for our toll junction package were fabricated with high precision. Motorized winch operation is smooth, and wind load engineering passed all safety audits.'
  },
  {
    id: 'rev-4',
    clientName: 'Praveen Sharma',
    designation: 'Project Site In-Charge',
    company: 'Northern Expressway Joint Venture',
    projectScope: 'Bridge Approaches & Thrie-Beam Barriers',
    rating: 5,
    reviewText: 'Prompt trailer dispatch right when our project deadline was critical. Zero material rejection on arrival at site. Sanjog has become our primary highway safety supplier for all upcoming packages.'
  }
];

const DEFAULT_COMPANY_INFO: CompanyInfo = {
  companyName: 'Sanjog',
  tagline: defaultDossier.tagline,
  phone: '+91 98300-12345 / +91 (033) 2450-8900',
  salesPhone: '+91 98300-12345 (Direct WhatsApp / Calls)',
  whatsappNumber: '+91 98300-12345',
  inquiryEmail: defaultDossier.inquiryEmail,
  supportEmail: defaultDossier.supportEmail,
  headquarters: 'Sector V, Salt Lake, Kolkata, West Bengal - 700091',
  regionalOffices: 'Kolkata, Bhubaneswar, Ranchi & Regional Stock Points',
  registrationNo: defaultDossier.registrationNo,
  metricBarriers: '1,200+ km',
  metricHighMasts: '3,800+',
  metricClients: '450+',
  metricStandards: '100% MoRTH & IS',
  mapEmbedUrl: 'https://maps.google.com/maps?q=Sector+V+Salt+Lake+Kolkata+West+Bengal+India&t=&z=13&ie=UTF8&iwloc=&output=embed',
  googleMapQuery: 'Sector V Salt Lake Kolkata West Bengal India'
};

const DEFAULT_FOUNDER_DESK: FounderDeskData = {
  name: 'Suman Sen',
  designation: 'Managing Director & Founder',
  organization: 'Sanjog',
  badge: "Message from Founder's Desk",
  image: '/src/assets/images/sanjog_founder_portrait_1791294725163.jpg',
  quoteTitle: '“Every kilometer of highway crash barrier we manufacture represents human lives protected and India\'s infrastructure advancing forward.”',
  paragraph1: 'When we laid the foundation of Sanjog in 2021, India was entering an unprecedented golden era of expressway, bridge, and high-speed corridor construction under national vision programs like Bharatmala. However, contractors routinely grappled with supply delays, sub-standard zinc coating, and erratic quality from fragmented vendors.',
  paragraph2: 'We established Sanjog to eliminate those compromises. By investing in modern continuous roll-forming mills, dedicated hot-dip galvanizing facilities, and strict NABL testing protocols, we ensure that every single W-Beam, octagonal mast, drill rod, and concrete machine leaving our factory meets the highest MoRTH, IS, and AASHTO benchmarks with complete transparency. We treat every client\'s project schedule with the same urgency as our own.',
  signatureName: 'Suman Sen',
  experienceYears: '18+ Years',
  keyMotto: 'Uncompromising Quality & Pan-India On-Time Site Delivery'
};

const DEFAULT_MAP_HUBS: MapHub[] = [
  {
    id: 'hub-1',
    name: 'Sanjog Kolkata Headquarters & Commercial Center',
    state: 'West Bengal',
    type: 'Corporate Office',
    coordinates: { x: 76, y: 54 },
    capacity: 'Tender Execution, Project Engineering, Client Billing',
    contact: '+91 98300-12345',
    description: 'Central commercial office handling NHAI contracts, state PWD tenders, and nationwide contractor liaison.'
  }
];

const envSupabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const envSupabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

const DEFAULT_CLOUD_CONFIG: CloudDbConfig = {
  provider: (envSupabaseUrl && envSupabaseKey) ? 'supabase' : 'none',
  supabaseUrl: envSupabaseUrl || 'https://xivosnuqyfnpvmapymfq.supabase.co',
  supabaseAnonKey: envSupabaseKey,
  mongoUri: '',
  lastSyncedAt: undefined
};

const CmsContext = createContext<CmsContextType | undefined>(undefined);

export const CmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Sync state tracking
  const isInitialLoadedRef = useRef<boolean>(false);
  const hasUnsavedChangesRef = useRef<boolean>(false);
  const [isInitialLoaded, setIsInitialLoaded] = useState<boolean>(false);

  const markDirty = () => {
    hasUnsavedChangesRef.current = true;
  };

  // Auth state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('sanjog_cms_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [adminCredentials, setAdminCredentials] = useState<{ id: string; pass: string }>(() => {
    try {
      const saved = localStorage.getItem('sanjog_cms_credentials');
      return saved ? JSON.parse(saved) : { id: 'admin', pass: 'sanjog@2026' };
    } catch {
      return { id: 'admin', pass: 'sanjog@2026' };
    }
  });

  const loginAdmin = (id: string, pass: string): boolean => {
    if (id.trim() === adminCredentials.id && pass === adminCredentials.pass) {
      setIsAdminAuthenticated(true);
      try {
        sessionStorage.setItem('sanjog_cms_auth', 'true');
      } catch {}
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('sanjog_cms_auth');
    } catch {}
  };

  const updateAdminPassword = (newPass: string) => {
    const updated = { ...adminCredentials, pass: newPass };
    setAdminCredentials(updated);
    localStorage.setItem('sanjog_cms_credentials', JSON.stringify(updated));
  };

  // Website Icon / Favicon
  const [websiteIcon, setWebsiteIcon] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('sanjog_website_icon');
      return saved || '/src/assets/images/sanjog_logo_3d_1791291627051.jpg';
    } catch {
      return '/src/assets/images/sanjog_logo_3d_1791291627051.jpg';
    }
  });

  const updateWebsiteIcon = (iconUrl: string) => {
    markDirty();
    setWebsiteIcon(iconUrl);
    try {
      localStorage.setItem('sanjog_website_icon', iconUrl);
    } catch {}
  };

  // Dynamically update favicon in document head
  useEffect(() => {
    if (websiteIcon) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.type = 'image/png';
        link.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = websiteIcon;
    }
  }, [websiteIcon]);

  // Catalogue PDF
  const [cataloguePdfUrl, setCataloguePdfUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem('sanjog_catalogue_pdf');
    } catch {
      return null;
    }
  });

  const [cataloguePdfName, setCataloguePdfName] = useState<string>(() => {
    try {
      return localStorage.getItem('sanjog_catalogue_pdf_name') || 'Sanjog_Product_Catalog.pdf';
    } catch {
      return 'Sanjog_Product_Catalog.pdf';
    }
  });

  const uploadCataloguePdf = (pdfDataUrl: string, name: string) => {
    markDirty();
    setCataloguePdfUrl(pdfDataUrl);
    setCataloguePdfName(name);
    try {
      localStorage.setItem('sanjog_catalogue_pdf', pdfDataUrl);
      localStorage.setItem('sanjog_catalogue_pdf_name', name);
    } catch {}
  };

  const removeCataloguePdf = () => {
    markDirty();
    setCataloguePdfUrl(null);
    setCataloguePdfName('Sanjog_Product_Catalog.pdf');
    try {
      localStorage.removeItem('sanjog_catalogue_pdf');
      localStorage.removeItem('sanjog_catalogue_pdf_name');
    } catch {}
  };

  const downloadCatalogue = () => {
    if (cataloguePdfUrl) {
      const link = document.createElement('a');
      link.href = cataloguePdfUrl;
      link.download = cataloguePdfName || 'Sanjog_Product_Catalog.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.print();
    }
  };

  // Corporate Profile & Brochure Document
  const [corporateProfilePdfUrl, setCorporateProfilePdfUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem('sanjog_corporate_profile_pdf');
    } catch {
      return null;
    }
  });

  const [corporateProfilePdfName, setCorporateProfilePdfName] = useState<string>(() => {
    try {
      return localStorage.getItem('sanjog_corporate_profile_pdf_name') || 'Sanjog_Corporate_Profile.pdf';
    } catch {
      return 'Sanjog_Corporate_Profile.pdf';
    }
  });

  const uploadCorporateProfilePdf = (pdfDataUrl: string, name: string) => {
    markDirty();
    setCorporateProfilePdfUrl(pdfDataUrl);
    setCorporateProfilePdfName(name);
    try {
      localStorage.setItem('sanjog_corporate_profile_pdf', pdfDataUrl);
      localStorage.setItem('sanjog_corporate_profile_pdf_name', name);
    } catch {}
  };

  const removeCorporateProfilePdf = () => {
    markDirty();
    setCorporateProfilePdfUrl(null);
    setCorporateProfilePdfName('Sanjog_Corporate_Profile.pdf');
    try {
      localStorage.removeItem('sanjog_corporate_profile_pdf');
      localStorage.removeItem('sanjog_corporate_profile_pdf_name');
    } catch {}
  };

  const downloadCorporateProfile = () => {
    if (corporateProfilePdfUrl) {
      const link = document.createElement('a');
      link.href = corporateProfilePdfUrl;
      link.download = corporateProfilePdfName || 'Sanjog_Corporate_Profile.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Generate textual profile fallback
      const content = `SANJOG - CORPORATE PROFILE (2026)\nEntity: Sanjog\nHeadquarters: Sector V, Salt Lake, Kolkata, West Bengal - 700091\nHelpline: +91 98300-12345\nManufacturing: 14m Galvanizing Bath, Roll Forming Mills (3,500 MT/Mo)\nCertifications: MoRTH Section 811, AASHTO M180, IS 2062`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Sanjog_Corporate_Profile.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Technical Specifications & Drawings Document
  const [technicalSpecsPdfUrl, setTechnicalSpecsPdfUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem('sanjog_tech_specs_pdf');
    } catch {
      return null;
    }
  });

  const [technicalSpecsPdfName, setTechnicalSpecsPdfName] = useState<string>(() => {
    try {
      return localStorage.getItem('sanjog_tech_specs_pdf_name') || 'Sanjog_Technical_Drawings_Specs.pdf';
    } catch {
      return 'Sanjog_Technical_Drawings_Specs.pdf';
    }
  });

  const uploadTechnicalSpecsPdf = (pdfDataUrl: string, name: string) => {
    markDirty();
    setTechnicalSpecsPdfUrl(pdfDataUrl);
    setTechnicalSpecsPdfName(name);
    try {
      localStorage.setItem('sanjog_tech_specs_pdf', pdfDataUrl);
      localStorage.setItem('sanjog_tech_specs_pdf_name', name);
    } catch {}
  };

  const removeTechnicalSpecsPdf = () => {
    markDirty();
    setTechnicalSpecsPdfUrl(null);
    setTechnicalSpecsPdfName('Sanjog_Technical_Drawings_Specs.pdf');
    try {
      localStorage.removeItem('sanjog_tech_specs_pdf');
      localStorage.removeItem('sanjog_tech_specs_pdf_name');
    } catch {}
  };

  const downloadTechnicalSpecs = () => {
    if (technicalSpecsPdfUrl) {
      const link = document.createElement('a');
      link.href = technicalSpecsPdfUrl;
      link.download = technicalSpecsPdfName || 'Sanjog_Technical_Drawings_Specs.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (cataloguePdfUrl) {
      downloadCatalogue();
    } else {
      window.print();
    }
  };

  // MoRTH & IS Quality Compliance Declaration Document
  const [complianceReportPdfUrl, setComplianceReportPdfUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem('sanjog_compliance_report_pdf');
    } catch {
      return null;
    }
  });

  const [complianceReportPdfName, setComplianceReportPdfName] = useState<string>(() => {
    try {
      return localStorage.getItem('sanjog_compliance_report_pdf_name') || 'Sanjog_MoRTH_IS_Compliance_Report.pdf';
    } catch {
      return 'Sanjog_MoRTH_IS_Compliance_Report.pdf';
    }
  });

  const uploadComplianceReportPdf = (pdfDataUrl: string, name: string) => {
    markDirty();
    setComplianceReportPdfUrl(pdfDataUrl);
    setComplianceReportPdfName(name);
    try {
      localStorage.setItem('sanjog_compliance_report_pdf', pdfDataUrl);
      localStorage.setItem('sanjog_compliance_report_pdf_name', name);
    } catch {}
  };

  const removeComplianceReportPdf = () => {
    markDirty();
    setComplianceReportPdfUrl(null);
    setComplianceReportPdfName('Sanjog_MoRTH_IS_Compliance_Report.pdf');
    try {
      localStorage.removeItem('sanjog_compliance_report_pdf');
      localStorage.removeItem('sanjog_compliance_report_pdf_name');
    } catch {}
  };

  const downloadComplianceReport = () => {
    if (complianceReportPdfUrl) {
      const link = document.createElement('a');
      link.href = complianceReportPdfUrl;
      link.download = complianceReportPdfName || 'Sanjog_MoRTH_IS_Compliance_Report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (cataloguePdfUrl) {
      downloadCatalogue();
    } else {
      window.print();
    }
  };

  // Cloud Config (Supabase / MongoDB)
  const [cloudConfig, setCloudConfig] = useState<CloudDbConfig>(() => {
    try {
      const saved = localStorage.getItem('sanjog_cloud_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        const resolvedUrl = (parsed.supabaseUrl || DEFAULT_CLOUD_CONFIG.supabaseUrl || '').trim();
        const resolvedKey = (parsed.supabaseAnonKey || DEFAULT_CLOUD_CONFIG.supabaseAnonKey || '').trim();
        const hasCredentials = Boolean(resolvedUrl && resolvedKey);
        return {
          ...DEFAULT_CLOUD_CONFIG,
          ...parsed,
          supabaseUrl: resolvedUrl,
          supabaseAnonKey: resolvedKey,
          provider: hasCredentials ? 'supabase' : (parsed.provider || 'none')
        };
      }
      return DEFAULT_CLOUD_CONFIG;
    } catch {
      return DEFAULT_CLOUD_CONFIG;
    }
  });

  const updateCloudConfig = async (cfg: CloudDbConfig) => {
    setCloudConfig(cfg);
    try {
      localStorage.setItem('sanjog_cloud_config', JSON.stringify(cfg));
    } catch {}

    // Persist globally to backend server so other devices (mobile, laptop) inherit it
    try {
      await fetch('/api/cms/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg)
      });
    } catch {}

    // If Supabase credentials provided, immediately trigger a sync to Supabase with current state
    if (cfg.provider === 'supabase' && cfg.supabaseUrl && cfg.supabaseAnonKey) {
      try {
        const payload = {
          heroSlides,
          newsItems,
          stats,
          statsHeader,
          reviews,
          products,
          gallery,
          companyInfo,
          founderDesk,
          mapHubs,
          inquiries,
          websiteIcon,
          cataloguePdfName,
          corporateProfilePdfName,
          technicalSpecsPdfName,
          complianceReportPdfName,
          cloudConfig: cfg
        };
        await saveToSupabaseDirectly(cfg.supabaseUrl, cfg.supabaseAnonKey, payload);
      } catch (err) {
        console.warn('Initial Supabase sync on updateCloudConfig error:', err);
      }
    }
  };

  // Hero slides
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() => {
    try {
      const saved = localStorage.getItem('sanjog_cms_hero_slides');
      return saved ? JSON.parse(saved) : DEFAULT_HERO_SLIDES;
    } catch {
      return DEFAULT_HERO_SLIDES;
    }
  });

  // News ticker items
  const [newsItems, setNewsItems] = useState<NewsItem[]>(() => {
    try {
      const saved = localStorage.getItem('sanjog_cms_news');
      return saved ? JSON.parse(saved) : DEFAULT_NEWS_ITEMS;
    } catch {
      return DEFAULT_NEWS_ITEMS;
    }
  });

  // Performance Stats
  const [stats, setStats] = useState<StatItem[]>(() => {
    try {
      const saved = localStorage.getItem('sanjog_cms_stats');
      return saved ? JSON.parse(saved) : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  });

  // SS Part Header (Section Name, Badge, Subtitle)
  const [statsHeader, setStatsHeader] = useState<StatsHeader>(() => {
    try {
      const saved = localStorage.getItem('sanjog_cms_stats_header');
      return saved ? JSON.parse(saved) : DEFAULT_STATS_HEADER;
    } catch {
      return DEFAULT_STATS_HEADER;
    }
  });

  // Customer Reviews
  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    try {
      const saved = localStorage.getItem('sanjog_cms_reviews');
      return saved ? JSON.parse(saved) : DEFAULT_REVIEWS;
    } catch {
      return DEFAULT_REVIEWS;
    }
  });

  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('sanjog_cms_products');
      return saved ? JSON.parse(saved) : defaultProducts;
    } catch {
      return defaultProducts;
    }
  });

  // Gallery
  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    try {
      const saved = localStorage.getItem('sanjog_cms_gallery');
      return saved ? JSON.parse(saved) : defaultGallery;
    } catch {
      return defaultGallery;
    }
  });

  // Company info
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => {
    try {
      const saved = localStorage.getItem('sanjog_cms_company');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.companyName && /sanjog\s+(infra|infrastructure)/i.test(parsed.companyName)) {
          parsed.companyName = 'Sanjog';
        }
        return parsed;
      }
      return DEFAULT_COMPANY_INFO;
    } catch {
      return DEFAULT_COMPANY_INFO;
    }
  });

  // Founder's desk data
  const [founderDesk, setFounderDesk] = useState<FounderDeskData>(() => {
    try {
      const saved = localStorage.getItem('sanjog_cms_founder');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.organization) {
          // Strictly sanitize old brand names like "SANJOG INFRASTRUCTURE & SAFETY SOLUTIONS"
          parsed.organization = parsed.organization
            .replace(/sanjog\s+infrastructure\s*(&\s*safety\s*solutions)?/gi, 'Sanjog')
            .replace(/sanjog\s+infra\b/gi, 'Sanjog');
        }
        return parsed;
      }
      return DEFAULT_FOUNDER_DESK;
    } catch {
      return DEFAULT_FOUNDER_DESK;
    }
  });

  // Interactive map hubs
  const [mapHubs, setMapHubs] = useState<MapHub[]>(() => {
    try {
      const saved = localStorage.getItem('sanjog_cms_map_hubs');
      return saved ? JSON.parse(saved) : DEFAULT_MAP_HUBS;
    } catch {
      return DEFAULT_MAP_HUBS;
    }
  });

  // Inquiries / Leads
  const [inquiries, setInquiries] = useState<InquiryItem[]>(() => {
    try {
      const saved = localStorage.getItem('sanjog_cms_inquiries');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('sanjog_cms_hero_slides', JSON.stringify(heroSlides));
  }, [heroSlides]);

  useEffect(() => {
    localStorage.setItem('sanjog_cms_news', JSON.stringify(newsItems));
  }, [newsItems]);

  useEffect(() => {
    localStorage.setItem('sanjog_cms_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('sanjog_cms_stats_header', JSON.stringify(statsHeader));
  }, [statsHeader]);

  useEffect(() => {
    localStorage.setItem('sanjog_cms_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('sanjog_cms_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sanjog_cms_gallery', JSON.stringify(gallery));
  }, [gallery]);

  useEffect(() => {
    localStorage.setItem('sanjog_cms_company', JSON.stringify(companyInfo));
  }, [companyInfo]);

  useEffect(() => {
    localStorage.setItem('sanjog_cms_founder', JSON.stringify(founderDesk));
  }, [founderDesk]);

  useEffect(() => {
    localStorage.setItem('sanjog_cms_map_hubs', JSON.stringify(mapHubs));
  }, [mapHubs]);

  useEffect(() => {
    localStorage.setItem('sanjog_cms_inquiries', JSON.stringify(inquiries));
  }, [inquiries]);

  // Auto sync to backend storage & Supabase whenever any CMS state changes
  useEffect(() => {
    // CRITICAL: Never auto-sync if initial cloud data hasn't loaded,
    // or if the user is not an authenticated admin, or if no modifications were made!
    if (!isInitialLoadedRef.current || !isAdminAuthenticated || !hasUnsavedChangesRef.current) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const payload = {
          heroSlides,
          newsItems,
          stats,
          statsHeader,
          reviews,
          products,
          gallery,
          companyInfo,
          founderDesk,
          mapHubs,
          inquiries,
          websiteIcon,
          cataloguePdfName,
          corporateProfilePdfName,
          technicalSpecsPdfName,
          complianceReportPdfName,
          cloudConfig
        };

        // 1. Direct Supabase Cloud Sync if configured
        if (cloudConfig.provider === 'supabase' && cloudConfig.supabaseUrl && cloudConfig.supabaseAnonKey) {
          try {
            await saveToSupabaseDirectly(cloudConfig.supabaseUrl, cloudConfig.supabaseAnonKey, payload);
          } catch (supaErr) {
            console.warn('Auto Supabase sync warning:', supaErr);
          }
        }

        // 2. Express Server Sync fallback & server mirror
        await fetch('/api/cms/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});

        hasUnsavedChangesRef.current = false;
      } catch {}
    }, 800);
    return () => clearTimeout(timer);
  }, [
    heroSlides,
    newsItems,
    stats,
    statsHeader,
    reviews,
    products,
    gallery,
    companyInfo,
    founderDesk,
    mapHubs,
    inquiries,
    websiteIcon,
    cataloguePdfName,
    corporateProfilePdfName,
    technicalSpecsPdfName,
    complianceReportPdfName,
    cloudConfig,
    isAdminAuthenticated
  ]);

  // Sync to backend Express server & Supabase Cloud
  const syncToBackend = async (): Promise<boolean> => {
    try {
      const payload = {
        heroSlides,
        newsItems,
        stats,
        statsHeader,
        reviews,
        products,
        gallery,
        companyInfo,
        founderDesk,
        mapHubs,
        inquiries,
        websiteIcon,
        cataloguePdfName,
        corporateProfilePdfName,
        technicalSpecsPdfName,
        complianceReportPdfName,
        cloudConfig
      };

      let directSuccess = false;

      // 1. Direct Supabase sync if enabled
      if (cloudConfig.provider === 'supabase' && cloudConfig.supabaseUrl && cloudConfig.supabaseAnonKey) {
        try {
          const res = await saveToSupabaseDirectly(cloudConfig.supabaseUrl, cloudConfig.supabaseAnonKey, payload);
          if (res.success) {
            directSuccess = true;
          }
        } catch (e) {
          console.warn('Supabase sync direct error:', e);
        }
      }

      // 2. Local Express API sync
      try {
        const response = await fetch('/api/cms/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          directSuccess = true;
        }
      } catch {}

      if (directSuccess) {
        hasUnsavedChangesRef.current = false;
        setCloudConfig(prev => ({
          ...prev,
          lastSyncedAt: new Date().toLocaleTimeString()
        }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Helper to apply incoming CMS data object & persist to local storage for instant mobile reload
  const applyCmsData = (data: any) => {
    if (!data || typeof data !== 'object') return;
    hasUnsavedChangesRef.current = false;

    try {
      if (Array.isArray(data.products) && data.products.length > 0) {
        setProducts(data.products);
        try { localStorage.setItem('sanjog_cms_products', JSON.stringify(data.products)); } catch {}
      }
      if (Array.isArray(data.reviews) && data.reviews.length > 0) {
        setReviews(data.reviews);
        try { localStorage.setItem('sanjog_cms_reviews', JSON.stringify(data.reviews)); } catch {}
      }
      if (Array.isArray(data.stats) && data.stats.length > 0) {
        setStats(data.stats);
        try { localStorage.setItem('sanjog_cms_stats', JSON.stringify(data.stats)); } catch {}
      }
      if (data.statsHeader?.title) {
        setStatsHeader(data.statsHeader);
        try { localStorage.setItem('sanjog_cms_stats_header', JSON.stringify(data.statsHeader)); } catch {}
      }
      if (Array.isArray(data.heroSlides) && data.heroSlides.length > 0) {
        setHeroSlides(data.heroSlides);
        try { localStorage.setItem('sanjog_cms_hero_slides', JSON.stringify(data.heroSlides)); } catch {}
      }
      if (Array.isArray(data.newsItems) && data.newsItems.length > 0) {
        setNewsItems(data.newsItems);
        try { localStorage.setItem('sanjog_cms_news', JSON.stringify(data.newsItems)); } catch {}
      }
      if (Array.isArray(data.gallery) && data.gallery.length > 0) {
        setGallery(data.gallery);
        try { localStorage.setItem('sanjog_cms_gallery', JSON.stringify(data.gallery)); } catch {}
      }
      if (data.companyInfo?.companyName) {
        setCompanyInfo(data.companyInfo);
        try { localStorage.setItem('sanjog_cms_company', JSON.stringify(data.companyInfo)); } catch {}
      }
      if (data.founderDesk?.name) {
        setFounderDesk(data.founderDesk);
        try { localStorage.setItem('sanjog_cms_founder', JSON.stringify(data.founderDesk)); } catch {}
      }
      if (Array.isArray(data.mapHubs) && data.mapHubs.length > 0) {
        setMapHubs(data.mapHubs);
        try { localStorage.setItem('sanjog_cms_map_hubs', JSON.stringify(data.mapHubs)); } catch {}
      }
      if (data.websiteIcon) {
        setWebsiteIcon(data.websiteIcon);
        try { localStorage.setItem('sanjog_website_icon', data.websiteIcon); } catch {}
      }
      if (data.cataloguePdfName) setCataloguePdfName(data.cataloguePdfName);
      if (data.corporateProfilePdfName) setCorporateProfilePdfName(data.corporateProfilePdfName);
      if (data.technicalSpecsPdfName) setTechnicalSpecsPdfName(data.technicalSpecsPdfName);
      if (data.complianceReportPdfName) setComplianceReportPdfName(data.complianceReportPdfName);
      if (data.cloudConfig?.supabaseUrl || data.cloudConfig?.supabaseAnonKey) {
        setCloudConfig(prev => ({ ...prev, ...data.cloudConfig }));
        try { localStorage.setItem('sanjog_cloud_config', JSON.stringify(data.cloudConfig)); } catch {}
      }
    } catch {}
  };

  const lastFetchTimestampRef = useRef<number>(0);

  // High-speed parallel cloud & backend data retrieval (never freezes or slows down mobile site)
  const fetchCloudOrBackendData = async (force: boolean = false): Promise<boolean> => {
    // Avoid re-fetching if fetched less than 15s ago unless forced
    const now = Date.now();
    if (!force && now - lastFetchTimestampRef.current < 15000) {
      return false;
    }
    lastFetchTimestampRef.current = now;

    // 1.8s maximum timeout ensures mobile site is always lightning fast
    const controller = new AbortController();
    const abortTimer = setTimeout(() => controller.abort(), 1800);

    try {
      // 0. Resolve active credentials
      let supaUrl = cloudConfig.supabaseUrl || 'https://xivosnuqyfnpvmapymfq.supabase.co';
      let supaKey = cloudConfig.supabaseAnonKey;

      if (!supaKey) {
        try {
          const savedCfg = localStorage.getItem('sanjog_cloud_config');
          if (savedCfg) {
            const parsed = JSON.parse(savedCfg);
            if (parsed.supabaseUrl) supaUrl = parsed.supabaseUrl;
            if (parsed.supabaseAnonKey) supaKey = parsed.supabaseAnonKey;
          }
        } catch {}
      }

      if (!supaKey) {
        try {
          const cfgRes = await fetch(`/api/cms/config?t=${Date.now()}`, { 
            signal: controller.signal,
            headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
          });
          if (cfgRes.ok) {
            const cfgJson = await cfgRes.json();
            if (cfgJson.config?.supabaseUrl) supaUrl = cfgJson.config.supabaseUrl;
            if (cfgJson.config?.supabaseAnonKey) supaKey = cfgJson.config.supabaseAnonKey;
            if (cfgJson.config) {
              setCloudConfig(prev => ({ ...prev, ...cfgJson.config }));
              try { localStorage.setItem('sanjog_cloud_config', JSON.stringify(cfgJson.config)); } catch {}
            }
          }
        } catch {}
      }

      // Parallel race: query server AND Supabase simultaneously for zero mobile latency
      const requests: Promise<any>[] = [];

      // Request 1: Server built-in storage
      requests.push(
        fetch(`/api/cms/data?t=${Date.now()}`, {
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        })
          .then(async (res) => {
            const ct = res.headers.get('content-type') || '';
            if (res.ok && ct.includes('application/json')) {
              const json = await res.json();
              if (json.data && typeof json.data === 'object') {
                return json.data;
              }
            }
            throw new Error('No server data');
          })
          .catch(() => null)
      );

      // Request 2: Direct Supabase Cloud REST if anon key exists
      if (supaUrl && supaKey) {
        const cleanUrl = supaUrl.trim().replace(/\/+$/, '');
        const cleanKey = supaKey.trim();
        requests.push(
          fetch(`${cleanUrl}/rest/v1/sanjog_cms?id=eq.cms_main&select=data&t=${Date.now()}`, {
            signal: controller.signal,
            headers: {
              'apikey': cleanKey,
              'Authorization': `Bearer ${cleanKey}`,
              'Cache-Control': 'no-cache'
            }
          })
            .then(async (res) => {
              if (res.ok) {
                const rows = await res.json();
                if (Array.isArray(rows) && rows[0]?.data) {
                  return rows[0].data;
                }
              }
              // If table does not exist (400 or 404), fail gracefully
              throw new Error('No supabase data');
            })
            .catch(() => null)
        );
      }

      // Settle whichever returns first with valid non-null data
      const results = await Promise.allSettled(requests);
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value && typeof r.value === 'object') {
          applyCmsData(r.value);
          isInitialLoadedRef.current = true;
          setIsInitialLoaded(true);
          clearTimeout(abortTimer);
          return true;
        }
      }
    } catch {}

    isInitialLoadedRef.current = true;
    setIsInitialLoaded(true);
    clearTimeout(abortTimer);
    return false;
  };

  const refreshFromCloud = async (): Promise<boolean> => {
    return await fetchCloudOrBackendData(true);
  };

  useEffect(() => {
    fetchCloudOrBackendData();

    // Auto-refresh when tab/browser regains focus (debounced to avoid continuous network requests)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        if (now - lastFetchTimestampRef.current > 20000) {
          fetchCloudOrBackendData(true);
        }
      }
    };
    const handleFocus = () => {
      const now = Date.now();
      if (now - lastFetchTimestampRef.current > 20000) {
        fetchCloudOrBackendData(true);
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Hero mutations
  const updateHeroSlide = (slide: HeroSlide) => {
    markDirty();
    setHeroSlides(prev => prev.map(s => s.id === slide.id ? slide : s));
  };

  const addHeroSlide = (slideData: Omit<HeroSlide, 'id'>) => {
    markDirty();
    const newSlide: HeroSlide = {
      ...slideData,
      id: `slide-${Date.now()}`
    };
    setHeroSlides(prev => [...prev, newSlide]);
  };

  const deleteHeroSlide = (id: string) => {
    markDirty();
    setHeroSlides(prev => prev.filter(s => s.id !== id));
  };

  // News ticker mutations
  const updateNewsItem = (item: NewsItem) => {
    markDirty();
    setNewsItems(prev => prev.map(n => n.id === item.id ? item : n));
  };

  const addNewsItem = (itemData: Omit<NewsItem, 'id'>) => {
    markDirty();
    const newItem: NewsItem = {
      ...itemData,
      id: `news-${Date.now()}`
    };
    setNewsItems(prev => [...prev, newItem]);
  };

  const deleteNewsItem = (id: string) => {
    markDirty();
    setNewsItems(prev => prev.filter(n => n.id !== id));
  };

  // Stats mutations
  const updateStat = (stat: StatItem) => {
    markDirty();
    setStats(prev => prev.map(s => s.id === stat.id ? stat : s));
  };

  const addStat = (statData: Omit<StatItem, 'id'>) => {
    markDirty();
    const newStat: StatItem = {
      ...statData,
      id: `stat-${Date.now()}`
    };
    setStats(prev => [...prev, newStat]);
  };

  const deleteStat = (id: string) => {
    markDirty();
    setStats(prev => prev.filter(s => s.id !== id));
  };

  const updateStatsHeader = (header: StatsHeader) => {
    markDirty();
    setStatsHeader(header);
  };

  // Reviews mutations
  const updateReview = (review: CustomerReview) => {
    markDirty();
    setReviews(prev => prev.map(r => r.id === review.id ? review : r));
  };

  const addReview = (reviewData: Omit<CustomerReview, 'id'>) => {
    markDirty();
    const newReview: CustomerReview = {
      ...reviewData,
      id: `rev-${Date.now()}`
    };
    setReviews(prev => [...prev, newReview]);
  };

  const deleteReview = (id: string) => {
    markDirty();
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  // Products mutations
  const updateProduct = (product: Product) => {
    markDirty();
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  };

  const addProduct = (product: Product) => {
    markDirty();
    setProducts(prev => [...prev, product]);
  };

  const deleteProduct = (id: string) => {
    markDirty();
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Gallery mutations
  const updateGalleryItem = (item: GalleryItem) => {
    markDirty();
    setGallery(prev => prev.map(g => g.id === item.id ? item : g));
  };

  const addGalleryItem = (item: GalleryItem) => {
    markDirty();
    setGallery(prev => [...prev, item]);
  };

  const deleteGalleryItem = (id: string) => {
    markDirty();
    setGallery(prev => prev.filter(g => g.id !== id));
  };

  const updateCompanyInfo = (info: CompanyInfo) => {
    markDirty();
    setCompanyInfo(info);
  };

  const updateFounderDesk = (data: FounderDeskData) => {
    markDirty();
    setFounderDesk(data);
  };

  const updateMapHub = (hub: MapHub) => {
    markDirty();
    setMapHubs(prev => prev.map(h => h.id === hub.id ? hub : h));
  };

  const addMapHub = (hub: MapHub) => {
    markDirty();
    setMapHubs(prev => [...prev, hub]);
  };

  const deleteMapHub = (id: string) => {
    markDirty();
    setMapHubs(prev => prev.filter(h => h.id !== id));
  };

  const addInquiry = (inquiryData: Omit<InquiryItem, 'id' | 'ticketId' | 'date' | 'status'>): string => {
    const ticketId = `SNJ-INQ-${Math.floor(100000 + Math.random() * 900000)}`;
    const newInquiry: InquiryItem = {
      ...inquiryData,
      id: `inq-${Date.now()}`,
      ticketId,
      date: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      status: 'New'
    };
    setInquiries(prev => [newInquiry, ...prev]);

    // 1. Send to Supabase directly if configured
    if (cloudConfig.provider === 'supabase' && cloudConfig.supabaseUrl && cloudConfig.supabaseAnonKey) {
      const cleanUrl = cloudConfig.supabaseUrl.trim().replace(/\/+$/, '');
      const cleanKey = cloudConfig.supabaseAnonKey.trim();
      fetch(`${cleanUrl}/rest/v1/sanjog_inquiries`, {
        method: 'POST',
        headers: {
          'apikey': cleanKey,
          'Authorization': `Bearer ${cleanKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          id: newInquiry.id,
          ticket_id: newInquiry.ticketId,
          name: newInquiry.name,
          phone: newInquiry.phone,
          email: newInquiry.email,
          company: newInquiry.company,
          product: newInquiry.product,
          message: newInquiry.message,
          status: 'New'
        })
      }).catch(() => {});
    }

    // 2. Send to backend API asynchronously
    try {
      fetch('/api/cms/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInquiry)
      }).catch(() => {});
    } catch {}

    return ticketId;
  };

  const updateInquiryStatus = (id: string, status: InquiryItem['status']) => {
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  };

  const deleteInquiry = (id: string) => {
    setInquiries(prev => prev.filter(i => i.id !== id));
  };

  const resetToDefaults = () => {
    markDirty();
    setHeroSlides(DEFAULT_HERO_SLIDES);
    setNewsItems(DEFAULT_NEWS_ITEMS);
    setStats(DEFAULT_STATS);
    setReviews(DEFAULT_REVIEWS);
    setProducts(defaultProducts);
    setGallery(defaultGallery);
    setCompanyInfo(DEFAULT_COMPANY_INFO);
    setFounderDesk(DEFAULT_FOUNDER_DESK);
    setMapHubs(DEFAULT_MAP_HUBS);
    removeCataloguePdf();
    localStorage.removeItem('sanjog_cms_hero_slides');
    localStorage.removeItem('sanjog_cms_news');
    localStorage.removeItem('sanjog_cms_stats');
    localStorage.removeItem('sanjog_cms_reviews');
    localStorage.removeItem('sanjog_cms_products');
    localStorage.removeItem('sanjog_cms_gallery');
    localStorage.removeItem('sanjog_cms_company');
    localStorage.removeItem('sanjog_cms_founder');
    localStorage.removeItem('sanjog_cms_map_hubs');
    localStorage.removeItem('sanjog_website_icon');
  };

  return (
    <CmsContext.Provider
      value={{
        heroSlides,
        newsItems,
        products,
        gallery,
        companyInfo,
        founderDesk,
        mapHubs,
        inquiries,
        stats,
        statsHeader,
        updateStatsHeader,
        reviews,
        cloudConfig,
        websiteIcon,
        updateWebsiteIcon,
        cataloguePdfUrl,
        cataloguePdfName,
        uploadCataloguePdf,
        removeCataloguePdf,
        downloadCatalogue,
        corporateProfilePdfUrl,
        corporateProfilePdfName,
        uploadCorporateProfilePdf,
        removeCorporateProfilePdf,
        downloadCorporateProfile,
        technicalSpecsPdfUrl,
        technicalSpecsPdfName,
        uploadTechnicalSpecsPdf,
        removeTechnicalSpecsPdf,
        downloadTechnicalSpecs,
        complianceReportPdfUrl,
        complianceReportPdfName,
        uploadComplianceReportPdf,
        removeComplianceReportPdf,
        downloadComplianceReport,
        updateCloudConfig,
        syncToBackend,
        refreshFromCloud,
        isInitialLoaded,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        updateAdminPassword,
        updateHeroSlide,
        addHeroSlide,
        deleteHeroSlide,
        updateNewsItem,
        addNewsItem,
        deleteNewsItem,
        updateStat,
        addStat,
        deleteStat,
        updateReview,
        addReview,
        deleteReview,
        updateProduct,
        addProduct,
        deleteProduct,
        updateGalleryItem,
        addGalleryItem,
        deleteGalleryItem,
        updateCompanyInfo,
        updateFounderDesk,
        updateMapHub,
        addMapHub,
        deleteMapHub,
        addInquiry,
        updateInquiryStatus,
        deleteInquiry,
        resetToDefaults
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export const useCms = () => {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error('useCms must be used within a CmsProvider');
  }
  return context;
};
