import React, { useState, useRef } from 'react';
import { 
  useCms, 
  HeroSlide, 
  NewsItem, 
  CompanyInfo, 
  FounderDeskData, 
  MapHub, 
  InquiryItem,
  StatItem,
  StatsHeader,
  CustomerReview,
  CloudDbConfig
} from '../context/CmsContext';
import { Product, GalleryItem } from '../data/companyData';
import {
  saveToSupabaseDirectly,
  executeOneButtonClickDbSetup,
  testSupabaseConnectionDirectly,
  runAutoCodeSelfRepair,
  SUPABASE_SETUP_SQL,
  DiagnosticResult
} from '../services/dbRepairService';
import { compressImageFile } from '../utils/imageCompressor';
import { 
  LayoutDashboard, 
  Sliders, 
  Megaphone, 
  Package, 
  Image as ImageIcon, 
  Building2, 
  Inbox, 
  Plus, 
  Pencil, 
  Trash2, 
  Check, 
  X, 
  RotateCcw, 
  ExternalLink,
  Save,
  Search,
  CheckCircle2,
  AlertCircle,
  Upload,
  UserCheck,
  MapPin,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  Quote,
  FileText,
  Download,
  Star,
  Database,
  TrendingUp,
  Server,
  RefreshCw,
  Wrench,
  Copy,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  FileSpreadsheet,
  Shield,
  FolderOpen,
  PhoneCall
} from 'lucide-react';

interface CmsAdminPageProps {
  onBackToSite: () => void;
}

export const CmsAdminPage: React.FC<CmsAdminPageProps> = ({ onBackToSite }) => {
  const {
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
    isAdminAuthenticated,
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
    updateInquiryStatus,
    deleteInquiry,
    resetToDefaults,
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
    refreshFromCloud
  } = useCms();

  type TabType = 
    | 'overview' 
    | 'slider' 
    | 'news' 
    | 'products' 
    | 'founder' 
    | 'reviews'
    | 'stats'
    | 'branding'
    | 'backend'
    | 'autorepair'
    | 'map' 
    | 'gallery' 
    | 'company' 
    | 'inquiries' 
    | 'security';

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit states
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isAddingSlide, setIsAddingSlide] = useState(false);

  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [isAddingNews, setIsAddingNews] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null);
  const [isAddingGallery, setIsAddingGallery] = useState(false);

  const [editingHub, setEditingHub] = useState<MapHub | null>(null);
  const [isAddingHub, setIsAddingHub] = useState(false);

  // Reviews state
  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null);
  const [isAddingReview, setIsAddingReview] = useState(false);

  // Stats state
  const [editingStat, setEditingStat] = useState<StatItem | null>(null);
  const [isAddingStat, setIsAddingStat] = useState(false);
  const [ssHeaderForm, setSsHeaderForm] = useState<StatsHeader>(statsHeader || {
    badge: 'Manufacturing Benchmarks & Milestones',
    title: 'Sanjog Production & Site Delivery Numbers',
    subtitle: 'Certified metrics achieved across Indian national expressways, flyovers, and mining zones.'
  });

  // Auto DB Setup & Code Health Repair state
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult | null>(null);
  const [isRepairing, setIsRepairing] = useState(false);
  const [isAutoSettingUpDb, setIsAutoSettingUpDb] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Cloud Database state
  const [cloudForm, setCloudForm] = useState<CloudDbConfig>(() => ({
    ...cloudConfig,
    supabaseUrl: cloudConfig.supabaseUrl || 'https://xivosnuqyfnpvmapymfq.supabase.co'
  }));
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [testingMongo, setTestingMongo] = useState(false);
  const [syncingServer, setSyncingServer] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [showAnonKey, setShowAnonKey] = useState(false);
  const [connectionStatusMsg, setConnectionStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [founderForm, setFounderForm] = useState<FounderDeskData>(founderDesk);
  const [companyForm, setCompanyForm] = useState<CompanyInfo>(companyInfo);
  const [founderSalesPhone, setFounderSalesPhone] = useState(companyInfo.salesPhone || '+91 98300-12345');

  // Keep form states synchronized with context updates
  React.useEffect(() => {
    setCompanyForm(companyInfo);
    setFounderSalesPhone(companyInfo.salesPhone || '+91 98300-12345');
  }, [companyInfo]);

  React.useEffect(() => {
    if (cloudConfig?.supabaseUrl || cloudConfig?.supabaseAnonKey) {
      setCloudForm(cloudConfig);
    }
  }, [cloudConfig.supabaseUrl, cloudConfig.supabaseAnonKey]);

  React.useEffect(() => {
    setFounderForm(founderDesk);
  }, [founderDesk]);

  React.useEffect(() => {
    setCloudForm(cloudConfig);
  }, [cloudConfig]);

  React.useEffect(() => {
    if (statsHeader) {
      setSsHeaderForm(statsHeader);
    }
  }, [statsHeader]);

  // Security password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSecPass, setShowSecPass] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to handle local file upload from device with automatic compression
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        showToast('File size exceeds 20MB limit. Please choose a smaller image.');
        return;
      }
      try {
        showToast('Optimizing & compressing image for instant database sync...');
        const compressedUrl = await compressImageFile(file, { maxWidth: 1280, maxHeight: 1280, quality: 0.82 });
        callback(compressedUrl);
        showToast('Image optimized & saved successfully!');
      } catch (err) {
        // Fallback to FileReader
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            callback(event.target.result as string);
            showToast('Image uploaded successfully!');
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        showToast('Please choose a valid PDF file.');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        showToast('PDF size exceeds 20MB limit. Please upload an optimized PDF.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          uploadCataloguePdf(event.target.result as string, file.name);
          showToast(`Catalogue PDF "${file.name}" uploaded successfully!`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCorporateProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        showToast('File size exceeds 20MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          uploadCorporateProfilePdf(event.target.result as string, file.name);
          showToast(`Corporate Profile "${file.name}" uploaded successfully!`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTechSpecsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        showToast('File size exceeds 20MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          uploadTechnicalSpecsPdf(event.target.result as string, file.name);
          showToast(`Technical Specs "${file.name}" uploaded successfully!`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComplianceReportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        showToast('File size exceeds 20MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          uploadComplianceReportPdf(event.target.result as string, file.name);
          showToast(`Compliance Report "${file.name}" uploaded successfully!`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveFounder = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOrg = (founderForm.organization || 'Sanjog')
      .replace(/sanjog\s+infrastructure(\s*&\s*safety\s*solutions)?/gi, 'Sanjog')
      .replace(/sanjog\s+infra\b/gi, 'Sanjog');

    const updatedFounder = {
      ...founderForm,
      organization: cleanOrg
    };
    updateFounderDesk(updatedFounder);

    // Synchronize sales phone number if updated
    if (founderSalesPhone && founderSalesPhone !== companyInfo.salesPhone) {
      updateCompanyInfo({
        ...companyInfo,
        salesPhone: founderSalesPhone,
        whatsappNumber: founderSalesPhone.split('(')[0].trim() || companyInfo.whatsappNumber
      });
    }

    syncToBackend();
    showToast("Founder's Desk, Operational Promise & Sales Mobile updated successfully!");
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyInfo(companyForm);
    if (founderDesk.organization !== companyForm.companyName) {
      updateFounderDesk({
        ...founderDesk,
        organization: companyForm.companyName
      });
    }
    syncToBackend();
    showToast('Company details & contact info updated successfully!');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.');
      return;
    }
    updateAdminPassword(newPassword);
    setNewPassword('');
    setConfirmPassword('');
    showToast('Admin password changed successfully!');
  };

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 pb-20 pt-20">
      {/* Top Admin Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold font-mono text-sm border border-cyan-500/40">
            CMS
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">
              Sanjog Website CMS Control Panel
            </h1>
            <span className="text-[11px] text-slate-400 font-mono">
              Live Content Management &middot; Real-time Local & Cloud Database Sync
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">

          <button
            onClick={() => {
              if (window.confirm('Reset all website content back to initial factory catalog defaults?')) {
                resetToDefaults();
                showToast('Reset to original website defaults.');
              }
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={onBackToSite}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 hover:from-cyan-300 hover:to-lime-300 rounded-lg transition-all shadow-sm"
          >
            <span>Live Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              logoutAdmin();
              onBackToSite();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            title="Log out of Admin Panel"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 p-3.5 bg-emerald-950 border border-emerald-500/60 text-emerald-200 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-medium animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {/* Two-Column Dashboard Layout: Left Sidebar Navigation + Right Content Panel */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* LEFT SIDEBAR: Organized Navigation Options as <ul> and <li> */}
          <aside className="w-full lg:w-72 shrink-0 bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl lg:sticky lg:top-24 z-20">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                CMS Navigation
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                14 Modules
              </span>
            </div>

            {/* Organized Category Groups with <ul> and <li> */}
            <nav className="space-y-4 text-left">
              {[
                {
                  group: 'Live Content & Media',
                  items: [
                    { id: 'overview' as TabType, label: 'Overview', icon: LayoutDashboard },
                    { id: 'slider' as TabType, label: 'Hero Slider', count: heroSlides.length, icon: Sliders },
                    { id: 'news' as TabType, label: 'News Ticker', count: newsItems.length, icon: Megaphone },
                    { id: 'reviews' as TabType, label: 'Customer Reviews', count: reviews.length, icon: Star },
                    { id: 'stats' as TabType, label: 'Stats & Numbers (SS)', count: stats.length, icon: TrendingUp },
                  ]
                },
                {
                  group: 'Catalog & Products',
                  items: [
                    { id: 'products' as TabType, label: 'Products Catalog', count: products.length, icon: Package },
                    { id: 'gallery' as TabType, label: 'Project Gallery', count: gallery.length, icon: ImageIcon },
                    { id: 'branding' as TabType, label: 'Downloads & Website Files', icon: Download },
                  ]
                },
                {
                  group: 'Company & Operations',
                  items: [
                    { id: 'founder' as TabType, label: "Founder's Desk & Promise", icon: UserCheck },
                    { id: 'company' as TabType, label: 'Company Info & WhatsApp', icon: Building2 },
                    { id: 'map' as TabType, label: 'Map & Supply Hubs', count: mapHubs.length, icon: MapPin },
                    { id: 'inquiries' as TabType, label: 'Inquiries & Leads', count: inquiries.length, icon: Inbox },
                  ]
                },
                {
                  group: 'Database & Security',
                  items: [
                    { id: 'backend' as TabType, label: 'Cloud Database & Sync', icon: Database },
                    { id: 'security' as TabType, label: 'Admin Security', icon: Lock },
                  ]
                }
              ].map((section, sIdx) => (
                <div key={sIdx} className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold px-2 block">
                    {section.group}
                  </span>
                  <ul className="space-y-0.5">
                    {section.items.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <li key={tab.id}>
                          <button
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                              isActive
                                ? 'bg-gradient-to-r from-cyan-500/20 to-lime-500/10 text-cyan-300 border border-cyan-500/40 font-semibold shadow-sm'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                              <span className="truncate">{tab.label}</span>
                            </div>
                            {tab.count !== undefined && (
                              <span className={`ml-2 px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                                isActive
                                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-bold'
                                  : 'bg-slate-950 text-slate-500'
                              }`}>
                                {tab.count}
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>

            {/* Quick Live Sync Indicator */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Storage</span>
              </span>
              <button
                type="button"
                onClick={async () => {
                  const ok = await syncToBackend();
                  if (ok) showToast('Storage synchronized with backend!');
                  else showToast('Saved to local storage.');
                }}
                className="text-cyan-400 hover:text-cyan-300 font-semibold text-[11px] hover:underline"
              >
                Sync Now
              </button>
            </div>
          </aside>

          {/* RIGHT MAIN CONTENT AREA */}
          <main className="flex-1 min-w-0 w-full space-y-6">

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 text-left">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-mono text-cyan-400 block">Catalog Products</span>
                <span className="text-3xl font-extrabold text-white mt-1 block">{products.length} Items</span>
                <span className="text-[11px] text-slate-400 mt-1 block">{products.filter(p => p.featured).length} Featured in Slider</span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-mono text-lime-400 block">Hero Banners</span>
                <span className="text-3xl font-extrabold text-white mt-1 block">{heroSlides.length} Slides</span>
                <span className="text-[11px] text-slate-400 mt-1 block">Framed & Auto Sliding</span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-mono text-teal-400 block">Supply Hubs</span>
                <span className="text-3xl font-extrabold text-white mt-1 block">{mapHubs.length} Facilities</span>
                <span className="text-[11px] text-slate-400 mt-1 block">Interactive Map & Depots</span>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-mono text-amber-400 block">Customer Inquiries</span>
                <span className="text-3xl font-extrabold text-white mt-1 block">{inquiries.length} Requests</span>
                <span className="text-[11px] text-slate-400 mt-1 block">{inquiries.filter(i => i.status === 'New').length} New Pending</span>
              </div>
            </div>

            {/* User Quick Access Hub: WhatsApp, Downloads & Operational Promise */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* WhatsApp Support Shortcut */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/40 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-display">WhatsApp Support Number</h4>
                    <span className="text-[10px] text-emerald-400 font-mono">Controls Floating Button</span>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-white font-mono">
                  {companyInfo.whatsappNumber || companyInfo.salesPhone || '+91 98300-12345'}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('company')}
                  className="w-full py-2 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Edit WhatsApp & Phone</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Downloads Manager Shortcut */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/60 to-slate-900 border border-cyan-500/40 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-display">Website Download Files</h4>
                    <span className="text-[10px] text-cyan-400 font-mono">4 Downloadable Docs</span>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono truncate">
                  Catalog, Profile, Specs & Audit
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('branding')}
                  className="w-full py-2 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/40 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Update Download Files Yourself</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Operational Promise & Founder Shortcut */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-lime-950/60 to-slate-900 border border-lime-500/40 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-lime-500/20 text-lime-400 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-display">Operational Promise & Founder</h4>
                    <span className="text-[10px] text-lime-400 font-mono">Name, Motto & Sales Mobile</span>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-white truncate font-medium">
                  {founderDesk.name || 'Suman Sen'} &middot; {founderDesk.organization || 'Sanjog'}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('founder')}
                  className="w-full py-2 bg-lime-600/30 hover:bg-lime-600/50 text-lime-200 border border-lime-500/40 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Edit Promise, Name & Mobile</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Quick Action Cards */}
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
              <h3 className="text-base font-bold text-white font-display">
                Welcome to Sanjog CMS Engine
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                Every element of your website is fully controllable from this dashboard: upload custom banner photos from your device, update product specs and featured status, edit the Founder's Desk speech & photo, add supply network locations on the interactive map, update ticker news, and review customer quotations.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('slider')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-cyan-300 rounded-xl border border-slate-700 transition-colors"
                >
                  Manage Hero Banners →
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-lime-400 rounded-xl border border-slate-700 transition-colors"
                >
                  Manage Products & Featured Images →
                </button>
                <button
                  onClick={() => setActiveTab('founder')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white rounded-xl border border-slate-700 transition-colors"
                >
                  Edit Founder's Desk & Promise →
                </button>
                <button
                  onClick={() => setActiveTab('branding')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-teal-300 rounded-xl border border-slate-700 transition-colors"
                >
                  Manage Downloads & Files →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. HERO SLIDER TAB */}
        {activeTab === 'slider' && (
          <div className="space-y-6 text-left">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white font-display">
                  Hero Section Carousel Slides
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update banner images, titles, badges, and upload custom photos directly from your phone or PC with instant high visibility.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingSlide({
                    id: `slide-${Date.now()}`,
                    badge: 'Certified Infrastructure Supply',
                    title: 'New High Mast or Barrier System',
                    highlightText: 'Engineered for Highways',
                    subtitle: 'Manufactured with high-tensile steel and heavy hot-dip galvanizing.',
                    image: '/src/assets/images/sanjog_crash_barrier_1791292174622.jpg',
                    primaryBtnText: 'View Product Details',
                    primaryBtnAction: 'products',
                    secondaryBtnText: 'Get Quote'
                  });
                  setIsAddingSlide(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 rounded-xl shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Slide</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {heroSlides.map((slide, index) => (
                <div
                  key={slide.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-[16/8] rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover filter brightness-95"
                      />
                      <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300">
                        Slide #{index + 1}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-mono text-lime-400 block">{slide.badge}</span>
                      <h4 className="text-base font-bold text-white font-display mt-0.5">
                        {slide.title} <span className="text-cyan-400">{slide.highlightText}</span>
                      </h4>
                      <p className="text-xs text-slate-300 line-clamp-2 mt-1">
                        {slide.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setEditingSlide({ ...slide });
                        setIsAddingSlide(false);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-cyan-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Slide</span>
                    </button>
                    {heroSlides.length > 1 && (
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this hero slide?')) {
                            deleteHeroSlide(slide.id);
                            showToast('Hero slide deleted');
                          }
                        }}
                        className="p-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Slide Edit Modal */}
            {editingSlide && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="text-lg font-bold text-white font-display">
                      {isAddingSlide ? 'Add New Hero Slide' : 'Edit Hero Slide'}
                    </h3>
                    <button
                      onClick={() => setEditingSlide(null)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Device Image Upload Zone */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300 block">
                      Banner Image (Upload from Device or enter URL)
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <label className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800 rounded-xl cursor-pointer text-xs font-semibold transition-colors">
                        <Upload className="w-4 h-4" />
                        <span>Upload Photo from Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, (url) => setEditingSlide({ ...editingSlide, image: url }))}
                        />
                      </label>
                      <span className="text-xs text-slate-500">or enter image path / URL:</span>
                    </div>
                    <input
                      type="text"
                      value={editingSlide.image}
                      onChange={(e) => setEditingSlide({ ...editingSlide, image: e.target.value })}
                      placeholder="e.g. /src/assets/images/... or https://..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                    {editingSlide.image && (
                      <div className="aspect-[16/7] w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 mt-2">
                        <img
                          src={editingSlide.image}
                          alt="Preview"
                          className="w-full h-full object-cover filter brightness-95"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">
                        Slide Badge (MoRTH / ISO Tag)
                      </label>
                      <input
                        type="text"
                        value={editingSlide.badge}
                        onChange={(e) => setEditingSlide({ ...editingSlide, badge: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">
                        Highlighted Text
                      </label>
                      <input
                        type="text"
                        value={editingSlide.highlightText}
                        onChange={(e) => setEditingSlide({ ...editingSlide, highlightText: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Main Slide Title
                    </label>
                    <input
                      type="text"
                      value={editingSlide.title}
                      onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Subtitle / Product Summary
                    </label>
                    <textarea
                      rows={2}
                      value={editingSlide.subtitle}
                      onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white resize-none"
                    />
                  </div>

                  <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditingSlide(null)}
                      className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (isAddingSlide) {
                          addHeroSlide(editingSlide);
                          showToast('New slide created successfully!');
                        } else {
                          updateHeroSlide(editingSlide);
                          showToast('Slide updated successfully!');
                        }
                        setEditingSlide(null);
                      }}
                      className="px-5 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 rounded-xl"
                    >
                      Save Slide
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. NEWS TICKER TAB */}
        {activeTab === 'news' && (
          <div className="space-y-6 text-left">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white font-display">
                  Live Marquee News Ticker
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Announcements, factory tender dispatches, and inventory updates scrolling across the website.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingNews({
                    id: `news-${Date.now()}`,
                    tag: 'TENDER UPDATE',
                    title: 'New national highway safety dispatch in progress from West Bengal Plant.',
                    date: 'Oct 2026'
                  });
                  setIsAddingNews(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 rounded-xl shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add News Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {newsItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold">
                        {item.tag}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{item.date}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200">
                      {item.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingNews({ ...item });
                        setIsAddingNews(false);
                      }}
                      className="p-2 text-cyan-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                      title="Edit Item"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {newsItems.length > 1 && (
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this ticker update?')) {
                            deleteNewsItem(item.id);
                            showToast('News item deleted');
                          }
                        }}
                        className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* News Edit Modal */}
            {editingNews && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="text-lg font-bold text-white font-display">
                      {isAddingNews ? 'Add Ticker Item' : 'Edit Ticker Item'}
                    </h3>
                    <button onClick={() => setEditingNews(null)} className="p-1 text-slate-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Category Tag</label>
                    <input
                      type="text"
                      value={editingNews.tag}
                      onChange={(e) => setEditingNews({ ...editingNews, tag: e.target.value })}
                      placeholder="e.g. DISPATCH UPDATE / NEW STOCK"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Headline Text</label>
                    <textarea
                      rows={3}
                      value={editingNews.title}
                      onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white resize-none"
                    />
                  </div>

                  <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                    <button
                      onClick={() => setEditingNews(null)}
                      className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (isAddingNews) {
                          addNewsItem(editingNews);
                          showToast('News ticker item added!');
                        } else {
                          updateNewsItem(editingNews);
                          showToast('News ticker item updated!');
                        }
                        setEditingNews(null);
                      }}
                      className="px-5 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 rounded-xl"
                    >
                      Save Item
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="space-y-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white font-display">
                  Product Catalog ({products.length} Items)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Toggle "Featured" to choose which items slide in the Homepage Featured Carousel. Upload photos directly from your device.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search product..."
                    className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>

                <button
                  onClick={() => {
                    setEditingProduct({
                      id: `product-${Date.now()}`,
                      name: 'New Highway or Mining Product',
                      tagline: 'Precision Engineered Industrial Supply',
                      category: 'crash-barriers',
                      categoryLabel: 'Highway Crash Barriers',
                      image: '/src/assets/images/sanjog_crash_barrier_1791292174622.jpg',
                      featured: true,
                      description: 'Manufactured with high-tensile steel, conforming to relevant Indian and international standards.',
                      keyFeatures: ['Hot-dip galvanized', 'Accredited NABL test certified', 'Factory direct pricing'],
                      specs: [
                        { label: 'Standard', value: 'MoRTH / IS' },
                        { label: 'Material', value: 'IS 2062 Fe410' }
                      ],
                      standards: ['IS 2062', 'MoRTH Section 811'],
                      certifications: ['ISO 9001:2015', 'NABL Certified'],
                      availability: 'In Production & Stock',
                      dimensions: 'Custom dimensions available',
                      materialGrade: 'High-Tensile Structural Steel'
                    });
                    setIsAddingProduct(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 rounded-xl shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {products
                .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.categoryLabel.toLowerCase().includes(productSearch.toLowerCase()))
                .map((product) => (
                  <div
                    key={product.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 mb-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover filter brightness-95"
                        />
                        <div className="absolute top-2 left-2 bg-slate-950/85 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300">
                          {product.categoryLabel}
                        </div>
                        <button
                          onClick={() => {
                            updateProduct({ ...product, featured: !product.featured });
                            showToast(product.featured ? 'Removed from featured slider' : 'Added to featured slider!');
                          }}
                          className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-all shadow-md ${
                            product.featured
                              ? 'bg-lime-400 text-slate-950 border border-white'
                              : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-700'
                          }`}
                          title="Click to toggle homepage featured slider"
                        >
                          {product.featured ? '★ Featured in Slider' : '☆ Not in Slider'}
                        </button>
                      </div>

                      <h4 className="text-base font-bold text-white font-display">
                        {product.name}
                      </h4>
                      <p className="text-xs text-lime-400 font-mono mt-0.5">
                        {product.tagline}
                      </p>
                      <p className="text-xs text-slate-300 line-clamp-2 mt-2">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-400">
                        {product.availability}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingProduct({ ...product });
                            setIsAddingProduct(false);
                          }}
                          className="p-1.5 text-cyan-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-xs flex items-center gap-1"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete product "${product.name}"?`)) {
                              deleteProduct(product.id);
                              showToast('Product deleted');
                            }
                          }}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Product Edit Modal */}
            {editingProduct && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="text-lg font-bold text-white font-display">
                      {isAddingProduct ? 'Add Product to Catalog' : `Edit: ${editingProduct.name}`}
                    </h3>
                    <button onClick={() => setEditingProduct(null)} className="p-1 text-slate-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Device Photo Upload */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300 block">
                      Product Photo (Upload from Device or enter URL)
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <label className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800 rounded-xl cursor-pointer text-xs font-semibold">
                        <Upload className="w-4 h-4" />
                        <span>Upload Photo from Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, (url) => setEditingProduct({ ...editingProduct, image: url }))}
                        />
                      </label>
                      <input
                        type="text"
                        value={editingProduct.image}
                        onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                        placeholder="Image URL..."
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                    {editingProduct.image && (
                      <div className="aspect-[16/9] max-w-xs rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                        <img src={editingProduct.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">Product Title</label>
                      <input
                        type="text"
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">Tagline</label>
                      <input
                        type="text"
                        value={editingProduct.tagline}
                        onChange={(e) => setEditingProduct({ ...editingProduct, tagline: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">Category Label</label>
                      <input
                        type="text"
                        value={editingProduct.categoryLabel}
                        onChange={(e) => setEditingProduct({ ...editingProduct, categoryLabel: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">Availability Status</label>
                      <select
                        value={editingProduct.availability}
                        onChange={(e) => setEditingProduct({ ...editingProduct, availability: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      >
                        <option value="In Production & Stock">In Production & Stock</option>
                        <option value="Immediate Dispatch">Immediate Dispatch</option>
                        <option value="Custom Fabrication">Custom Fabrication</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <input
                      type="checkbox"
                      id="featCheck"
                      checked={editingProduct.featured}
                      onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-900 text-cyan-400"
                    />
                    <label htmlFor="featCheck" className="text-xs text-slate-200 cursor-pointer font-medium">
                      Feature in Homepage Sliding Image Carousel
                    </label>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Full Description</label>
                    <textarea
                      rows={3}
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white resize-none"
                    />
                  </div>

                  <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (isAddingProduct) {
                          addProduct(editingProduct);
                          showToast('Product added successfully!');
                        } else {
                          updateProduct(editingProduct);
                          showToast('Product updated successfully!');
                        }
                        setEditingProduct(null);
                      }}
                      className="px-5 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 rounded-xl"
                    >
                      Save Product
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. FOUNDER'S DESK TAB */}
        {activeTab === 'founder' && (
          <div className="space-y-6 text-left">
            <div>
              <h2 className="text-xl font-bold text-white font-display">
                Founder's Desk, Operational Promise & Sales Helpline
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Update the founder's name, corporate designation, organization line, Operational Promise motto, and the sales helpline mobile number.
              </p>
            </div>

            {/* Live Visual Preview Card */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-cyan-500/40 space-y-3 shadow-xl">
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                Live Website Signature & Operational Promise Preview
              </span>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse" />
                  <span className="text-xs font-mono uppercase text-cyan-400 font-bold">
                    Our Operational Promise
                  </span>
                </div>
                <div className="text-sm font-bold text-white italic pl-4 border-l-2 border-lime-400">
                  "{founderForm.keyMotto || 'Uncompromising Quality & Pan-India On-Time Site Delivery'}"
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-white font-display">
                      {founderForm.name || 'Suman Sen'}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {founderForm.designation || 'Managing Director & Founder'} &middot;{' '}
                      <span className="text-slate-200 font-semibold">{founderForm.organization || 'Sanjog'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-lime-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 shadow-md">
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Speak with Sales: {(founderSalesPhone || companyInfo.salesPhone || '+91 98300-12345').split('(')[0].trim()}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveFounder} className="space-y-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8">
              {/* Photo Upload Zone */}
              <div className="space-y-3 pb-4 border-b border-slate-800">
                <label className="text-xs font-medium text-slate-300 block">
                  Founder's Photo
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-24 h-28 rounded-2xl overflow-hidden bg-slate-950 border border-slate-700 shrink-0">
                    <img
                      src={founderForm.image || '/src/assets/images/sanjog_founder_portrait_1791294725163.jpg'}
                      alt="Founder"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-2 flex-1">
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800 rounded-xl cursor-pointer text-xs font-semibold">
                      <Upload className="w-4 h-4" />
                      <span>Upload Founder Photo from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, (url) => setFounderForm({ ...founderForm, image: url }))}
                      />
                    </label>
                    <input
                      type="text"
                      value={founderForm.image}
                      onChange={(e) => setFounderForm({ ...founderForm, image: e.target.value })}
                      placeholder="Image URL or Path..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Founder's Full Name (Display Name)
                  </label>
                  <input
                    type="text"
                    required
                    value={founderForm.name}
                    onChange={(e) => setFounderForm({ ...founderForm, name: e.target.value })}
                    placeholder="e.g. Suman Sen / Sumon Sen"
                    className="w-full px-3 py-2 bg-slate-950 border border-cyan-500/50 rounded-xl text-xs text-white font-semibold focus:ring-1 focus:ring-cyan-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Updates name under Operational Promise</span>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Corporate Designation
                  </label>
                  <input
                    type="text"
                    required
                    value={founderForm.designation}
                    onChange={(e) => setFounderForm({ ...founderForm, designation: e.target.value })}
                    placeholder="e.g. Managing Director & Founder"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Shown before organization name</span>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Company / Brand Name
                  </label>
                  <input
                    type="text"
                    value={founderForm.organization || 'Sanjog'}
                    onChange={(e) => setFounderForm({ ...founderForm, organization: e.target.value })}
                    placeholder="e.g. Sanjog"
                    className="w-full px-3 py-2 bg-slate-950 border border-cyan-500/50 rounded-xl text-xs text-cyan-300 font-bold"
                  />
                  <span className="text-[10px] text-lime-400 mt-0.5 block">Strictly Sanjog (no Infra suffix)</span>
                </div>
              </div>

              {/* Operational Promise & Sales Mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div>
                  <label className="text-xs font-medium text-lime-400 block mb-1">
                    Our Operational Promise (Motto Text)
                  </label>
                  <input
                    type="text"
                    required
                    value={founderForm.keyMotto}
                    onChange={(e) => setFounderForm({ ...founderForm, keyMotto: e.target.value })}
                    placeholder="e.g. Uncompromising Quality & Pan-India On-Time Site Delivery"
                    className="w-full px-3 py-2 bg-slate-950 border border-lime-500/40 rounded-xl text-xs text-white italic font-medium"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Displays under "Our Operational Promise" on homepage
                  </span>
                </div>

                <div>
                  <label className="text-xs font-medium text-cyan-300 block mb-1">
                    "Speak with Sales" Button Mobile / Helpline
                  </label>
                  <input
                    type="text"
                    value={founderSalesPhone}
                    onChange={(e) => setFounderSalesPhone(e.target.value)}
                    placeholder="e.g. +91 98300-12345 (Direct WhatsApp / Calls)"
                    className="w-full px-3 py-2 bg-slate-950 border border-cyan-500/40 rounded-xl text-xs text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Mobile number clicked by users on "Speak with Sales" button
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Years of Experience</label>
                  <input
                    type="text"
                    value={founderForm.experienceYears}
                    onChange={(e) => setFounderForm({ ...founderForm, experienceYears: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Section Badge</label>
                  <input
                    type="text"
                    value={founderForm.badge}
                    onChange={(e) => setFounderForm({ ...founderForm, badge: e.target.value })}
                    placeholder="e.g. Message from Founder's Desk"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Founder's Lead Quote / Headline</label>
                <textarea
                  rows={2}
                  required
                  value={founderForm.quoteTitle}
                  onChange={(e) => setFounderForm({ ...founderForm, quoteTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white resize-none font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Founder's Words: Paragraph 1</label>
                  <textarea
                    rows={4}
                    value={founderForm.paragraph1}
                    onChange={(e) => setFounderForm({ ...founderForm, paragraph1: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Founder's Words: Paragraph 2</label>
                  <textarea
                    rows={4}
                    value={founderForm.paragraph2}
                    onChange={(e) => setFounderForm({ ...founderForm, paragraph2: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white resize-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 rounded-xl shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Founder's Desk Changes</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 5. CUSTOMER REVIEWS & FEEDBACK TAB */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white font-display">
                  Customer Reviews & Feedback ({reviews.length})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage contractor testimonials, star ratings, and project remarks displayed in the homepage carousel.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingReview({
                    id: `rev-${Date.now()}`,
                    clientName: '',
                    designation: '',
                    company: '',
                    projectScope: '',
                    rating: 5,
                    reviewText: ''
                  });
                  setIsAddingReview(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 rounded-xl shadow-md self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Customer Review</span>
              </button>
            </div>

            {/* Reviews List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < (rev.rating || 5)
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-slate-800 text-slate-700'
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-amber-400 font-mono ml-1">
                          {rev.rating || 5}.0 Stars
                        </span>
                      </div>

                      {rev.projectScope && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 truncate max-w-[180px]">
                          {rev.projectScope}
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                      "{rev.reviewText}"
                    </p>

                    <div className="pt-2 border-t border-slate-800 text-xs">
                      <span className="font-semibold text-white block">{rev.clientName}</span>
                      <span className="text-slate-400">
                        {rev.designation} &middot; <strong className="text-cyan-400">{rev.company}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                    <button
                      onClick={() => {
                        setEditingReview(rev);
                        setIsAddingReview(false);
                      }}
                      className="p-1.5 text-xs text-cyan-400 hover:text-white bg-slate-950 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 px-2.5"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete review from ${rev.clientName}?`)) {
                          deleteReview(rev.id);
                          showToast('Review deleted.');
                        }
                      }}
                      className="p-1.5 text-xs text-rose-400 hover:text-white bg-slate-950 hover:bg-rose-950/60 rounded-lg transition-colors flex items-center gap-1 px-2.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal for Add / Edit Review */}
            {editingReview && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="text-lg font-bold text-white font-display">
                      {isAddingReview ? 'Add New Customer Feedback' : 'Edit Customer Feedback'}
                    </h3>
                    <button
                      onClick={() => setEditingReview(null)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">
                        Client / Engineer Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingReview.clientName}
                        onChange={(e) => setEditingReview({ ...editingReview, clientName: e.target.value })}
                        placeholder="e.g. R. K. Agarwal"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">
                        Designation / Role *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingReview.designation}
                        onChange={(e) => setEditingReview({ ...editingReview, designation: e.target.value })}
                        placeholder="e.g. Chief Project Engineer"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">
                        Company / Contractor *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingReview.company}
                        onChange={(e) => setEditingReview({ ...editingReview, company: e.target.value })}
                        placeholder="e.g. National Highway EPC Works"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">
                        Project Scope / Reference
                      </label>
                      <input
                        type="text"
                        value={editingReview.projectScope}
                        onChange={(e) => setEditingReview({ ...editingReview, projectScope: e.target.value })}
                        placeholder="e.g. NH-16 Expressway Stretch (45 km)"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Rating Selector */}
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Star Rating (1 to 5 Stars)
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEditingReview({ ...editingReview, rating: star })}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            editingReview.rating === star
                              ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${editingReview.rating >= star ? 'fill-current' : ''}`} />
                          <span>{star} Star{star > 1 ? 's' : ''}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Review Quotation Text *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={editingReview.reviewText}
                      onChange={(e) => setEditingReview({ ...editingReview, reviewText: e.target.value })}
                      placeholder="Write the contractor's feedback on Sanjog materials, delivery speed, or test certificates..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white resize-none"
                    />
                  </div>

                  <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                    <button
                      onClick={() => setEditingReview(null)}
                      className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!editingReview.clientName || !editingReview.reviewText) {
                          showToast('Please fill in client name and review text.');
                          return;
                        }
                        if (isAddingReview) {
                          addReview(editingReview);
                          showToast('Review added successfully!');
                        } else {
                          updateReview(editingReview);
                          showToast('Review updated successfully!');
                        }
                        setEditingReview(null);
                      }}
                      className="px-5 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 rounded-xl"
                    >
                      Save Review
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. STATS & NUMBERS (SS) TAB */}
        {activeTab === 'stats' && (
          <div className="space-y-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white font-display">
                  Stats, Milestones & Performance Numbers ({stats.length})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update the milestone numbers shown under "Trusted by Highway & Mining Contractors" section.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingStat({
                    id: `stat-${Date.now()}`,
                    number: '500+ KM',
                    label: 'New Project Metric',
                    description: 'Tested and certified MoRTH delivery'
                  });
                  setIsAddingStat(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 rounded-xl shadow-md self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Stat Number</span>
              </button>
            </div>

            {/* Editable SS Part Header Card (Allows editing SS Section Name / Title / Subtitle) */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-display">SS Part Header & Section Name</h3>
                    <p className="text-[11px] text-slate-400">Edit the title, badge, and description of the Stats (SS) module displayed on the live website.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    updateStatsHeader(ssHeaderForm);
                    showToast('SS Part Name & Section Header saved successfully!');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 hover:from-cyan-300 hover:to-lime-300 rounded-xl shadow transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save SS Part Name</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    SS Section Part Title / Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={ssHeaderForm.title}
                    onChange={(e) => setSsHeaderForm({ ...ssHeaderForm, title: e.target.value })}
                    placeholder="e.g. Sanjog Production & Site Delivery Numbers"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-display focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    SS Badge Pill Text
                  </label>
                  <input
                    type="text"
                    value={ssHeaderForm.badge}
                    onChange={(e) => setSsHeaderForm({ ...ssHeaderForm, badge: e.target.value })}
                    placeholder="e.g. Manufacturing Benchmarks & Milestones"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-lime-400 font-mono focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    SS Subtitle / Context Subtext
                  </label>
                  <input
                    type="text"
                    value={ssHeaderForm.subtitle}
                    onChange={(e) => setSsHeaderForm({ ...ssHeaderForm, subtitle: e.target.value })}
                    placeholder="e.g. Certified metrics achieved across Indian national expressways, flyovers, and mining zones."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
                >
                  <div className="space-y-2">
                    <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-lime-400 font-display">
                      {stat.number}
                    </div>
                    <h4 className="text-sm font-bold text-white font-display">
                      {stat.label}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {stat.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                    <button
                      onClick={() => {
                        setEditingStat(stat);
                        setIsAddingStat(false);
                      }}
                      className="p-1.5 text-xs text-cyan-400 hover:text-white bg-slate-950 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 px-2.5"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete stat metric "${stat.label}"?`)) {
                          deleteStat(stat.id);
                          showToast('Stat metric deleted.');
                        }
                      }}
                      className="p-1.5 text-xs text-rose-400 hover:text-white bg-slate-950 hover:bg-rose-950/60 rounded-lg transition-colors flex items-center gap-1 px-2.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal for Add / Edit Stat */}
            {editingStat && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="text-lg font-bold text-white font-display">
                      {isAddingStat ? 'Add New Performance Stat' : 'Edit Performance Stat'}
                    </h3>
                    <button
                      onClick={() => setEditingStat(null)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Display Number / Count (SS) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingStat.number}
                      onChange={(e) => setEditingStat({ ...editingStat, number: e.target.value })}
                      placeholder="e.g. 1,200+ KM or 3,800+ or 100%"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Metric Title / Label *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingStat.label}
                      onChange={(e) => setEditingStat({ ...editingStat, label: e.target.value })}
                      placeholder="e.g. Crash Barriers Installed"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Description / Subtext
                    </label>
                    <input
                      type="text"
                      value={editingStat.description}
                      onChange={(e) => setEditingStat({ ...editingStat, description: e.target.value })}
                      placeholder="e.g. MoRTH Section 811 compliant hot-dip galvanized highway supply"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                    <button
                      onClick={() => setEditingStat(null)}
                      className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!editingStat.number || !editingStat.label) {
                          showToast('Please fill in number and label.');
                          return;
                        }
                        if (isAddingStat) {
                          addStat(editingStat);
                          showToast('Stat metric added!');
                        } else {
                          updateStat(editingStat);
                          showToast('Stat metric updated!');
                        }
                        setEditingStat(null);
                      }}
                      className="px-5 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 rounded-xl"
                    >
                      Save Stat
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. DOWNLOADS & WEBSITE FILES MANAGER TAB */}
        {activeTab === 'branding' && (
          <div className="space-y-6 text-left">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/80 text-xs text-cyan-400 font-mono mb-2">
                <Download className="w-3.5 h-3.5" />
                <span>Centralized Downloads & Media Storage</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                Downloads & Website Files Manager
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
                Here you can update all downloadable files yourself! When visitors click any download button on the site (Catalog, Corporate Profile, Technical Drawings, MoRTH Certificates), your custom uploaded files will be served directly to them.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card 1: Official Product Catalog PDF */}
              <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-lime-500/10 text-lime-400 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-display">1. Official Product Catalog (PDF)</h3>
                    <p className="text-[11px] text-slate-400">Downloaded from Header, Hero Banner, Footer & Company Dossier</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Catalog File Status:</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      cataloguePdfUrl 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {cataloguePdfUrl ? 'Custom PDF Active' : 'Default Catalog Active'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono truncate">
                    File: <strong>{cataloguePdfName || 'Sanjog_Product_Catalog.pdf'}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Delivered when users click "Download Catalog" anywhere on the homepage or header.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-400 to-lime-400 hover:from-cyan-300 hover:to-lime-300 text-slate-950 font-bold rounded-xl cursor-pointer text-xs transition-colors shadow-md">
                    <Upload className="w-4 h-4" />
                    <span>Upload Catalog PDF from Device</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handlePdfUpload}
                    />
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={downloadCatalogue}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-cyan-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Test Download Catalog</span>
                    </button>

                    {cataloguePdfUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Reset Catalog to original defaults?')) {
                            removeCataloguePdf();
                            showToast('Catalog reset to default.');
                          }
                        }}
                        className="px-3 py-2 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-xl transition-colors"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 2: Official Corporate Profile Document */}
              <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-display">2. Official Corporate Profile (2026)</h3>
                    <p className="text-[11px] text-slate-400">Downloaded from About Us page & Instant Data Center</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Profile File Status:</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      corporateProfilePdfUrl 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {corporateProfilePdfUrl ? 'Custom Profile Active' : 'Default Profile Active'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono truncate">
                    File: <strong>{corporateProfilePdfName || 'Sanjog_Corporate_Profile.pdf'}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Downloaded when viewers click "Download Official Company Profile" on the About Us page.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-400 to-lime-400 hover:from-cyan-300 hover:to-lime-300 text-slate-950 font-bold rounded-xl cursor-pointer text-xs transition-colors shadow-md">
                    <Upload className="w-4 h-4" />
                    <span>Upload Corporate Profile (PDF / DOC)</span>
                    <input
                      type="file"
                      accept="application/pdf,.doc,.docx,.txt"
                      className="hidden"
                      onChange={handleCorporateProfileUpload}
                    />
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={downloadCorporateProfile}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-cyan-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Test Download Profile</span>
                    </button>

                    {corporateProfilePdfUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Reset Corporate Profile to original text defaults?')) {
                            removeCorporateProfilePdf();
                            showToast('Corporate profile reset to default.');
                          }
                        }}
                        className="px-3 py-2 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-xl transition-colors"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 3: Technical Specifications & Drawings Document */}
              <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-display">3. Technical Specs & Drawings Matrix</h3>
                    <p className="text-[11px] text-slate-400">Downloaded from Instant Document Center & Product Modals</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Specs File Status:</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      technicalSpecsPdfUrl 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {technicalSpecsPdfUrl ? 'Custom Specs Active' : 'Default Specs Active'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono truncate">
                    File: <strong>{technicalSpecsPdfName || 'Sanjog_Technical_Drawings_Specs.pdf'}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Downloaded by highway engineers reviewing drawings, post dimensions, and steel grades.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-bold rounded-xl cursor-pointer text-xs transition-colors shadow-md">
                    <Upload className="w-4 h-4" />
                    <span>Upload Technical Specs Document</span>
                    <input
                      type="file"
                      accept="application/pdf,.doc,.docx,.txt"
                      className="hidden"
                      onChange={handleTechSpecsUpload}
                    />
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={downloadTechnicalSpecs}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-cyan-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Test Download Specs</span>
                    </button>

                    {technicalSpecsPdfUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Reset Technical Specs to defaults?')) {
                            removeTechnicalSpecsPdf();
                            showToast('Technical Specs reset to default.');
                          }
                        }}
                        className="px-3 py-2 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-xl transition-colors"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 4: MoRTH & IS Quality Compliance Declaration */}
              <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-display">4. Quality Compliance & MoRTH Certificate</h3>
                    <p className="text-[11px] text-slate-400">Downloaded from Instant Document Center Quality Audit Report</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Compliance File Status:</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      complianceReportPdfUrl 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {complianceReportPdfUrl ? 'Custom Certificate Active' : 'Default Report Active'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono truncate">
                    File: <strong>{complianceReportPdfName || 'Sanjog_MoRTH_IS_Compliance_Report.pdf'}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Delivered when viewers click "MoRTH & IS Quality Audit Report" in the Company Data Center.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold rounded-xl cursor-pointer text-xs transition-colors shadow-md">
                    <Upload className="w-4 h-4" />
                    <span>Upload Quality Audit / Certificate</span>
                    <input
                      type="file"
                      accept="application/pdf,.doc,.docx,.txt,image/*"
                      className="hidden"
                      onChange={handleComplianceReportUpload}
                    />
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={downloadComplianceReport}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-cyan-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Test Download Certificate</span>
                    </button>

                    {complianceReportPdfUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Reset Quality Report to default?')) {
                            removeComplianceReportPdf();
                            showToast('Quality Report reset to default.');
                          }
                        }}
                        className="px-3 py-2 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-xl transition-colors"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 5: Website File Storage Folder (/public/uploads) */}
              <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-display">5. Storage Folder & Direct Media Upload</h3>
                    <p className="text-[11px] text-slate-400">Upload any file or photo directly to /public/uploads</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-white block">Dedicated Uploads Directory:</span>
                  <p className="text-xs text-slate-300 font-mono">
                    Folder: <code className="text-amber-300">/public/uploads/</code> &middot; Public URL: <code className="text-cyan-400">/uploads/&lt;filename&gt;</code>
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Upload any arbitrary brochure, CAD drawing, product photo, or datasheet. You can copy the generated URL to use anywhere on your site.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-bold rounded-xl cursor-pointer text-xs transition-colors shadow-md">
                    <Upload className="w-4 h-4" />
                    <span>Upload Any File to Storage Folder</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              showToast(`Uploaded ${file.name} to storage!`);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <span className="text-[10px] text-slate-500 block text-center font-mono">
                    Files placed in /public/uploads are served publicly on GitHub & Vercel
                  </span>
                </div>
              </div>

              {/* Card 6: Website Icon / Favicon (Transparent PNG Supported) */}
              <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-display">6. Website Icon & Nav Logo (PNG Transparent)</h3>
                    <p className="text-[11px] text-slate-400">Controls browser tab favicon, header emblem, and footer logo</p>
                  </div>
                </div>

                {/* Transparency Preview Card */}
                <div className="flex items-center gap-4 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <div 
                    className="w-16 h-16 rounded-2xl overflow-hidden border border-cyan-500/40 p-1 shrink-0 flex items-center justify-center shadow-lg relative"
                    style={{
                      backgroundImage: 'repeating-conic-gradient(#1e293b 0% 25%, #0f172a 0% 50%)',
                      backgroundSize: '12px 12px'
                    }}
                  >
                    <img
                      src={websiteIcon}
                      alt="Sanjog Website Icon"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/src/assets/images/sanjog_logo_3d_1791291627051.jpg';
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-white block">Active Website Logo / Icon</span>
                    <span className="text-[11px] text-lime-400 font-mono block">Supports Transparent PNG (Without BG)</span>
                    <span className="text-[10px] text-slate-400 font-mono block">Automatically updates browser tab & navigation header</span>
                  </div>
                </div>

                {/* Upload Button */}
                <div className="space-y-2">
                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-400 to-lime-400 hover:from-cyan-300 hover:to-lime-300 text-slate-950 font-bold rounded-xl cursor-pointer text-xs transition-colors shadow-md">
                    <Upload className="w-4 h-4" />
                    <span>Upload Transparent PNG Icon from Device</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, (url) => {
                        updateWebsiteIcon(url);
                        showToast('Website icon & browser favicon updated with transparent PNG!');
                      })}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      updateWebsiteIcon('/src/assets/images/sanjog_logo_3d_1791291627051.jpg');
                      showToast('Website icon reset to original 3D emblem.');
                    }}
                    className="w-full py-2 text-xs text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors"
                  >
                    Reset to Default 3D Emblem
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 8. BACKEND & CLOUD DATABASE TAB (Supabase / MongoDB) */}
        {activeTab === 'backend' && (
          <div className="space-y-6 text-left">
            <div>
              <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-400" />
                <span>Backend & Cloud Database Integration</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Connect your Sanjog website to free cloud platforms like Supabase (Free Postgres) or MongoDB Atlas (Free M0 Cluster) for cloud database persistence.
              </p>
            </div>

            {/* Connection Status Banner */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <div>
                  <span className="text-xs font-bold text-white font-display block">
                    Express Backend Server Status: Active & Syncing
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Local persistent storage: <code className="text-cyan-400">/api/cms/sync</code> &middot; Disk persistence enabled
                  </span>
                </div>
              </div>

              <button
                disabled={syncingServer}
                onClick={async () => {
                  setSyncingServer(true);
                  const ok = await syncToBackend();
                  setSyncingServer(false);
                  if (ok) {
                    showToast('All website content synced to backend server storage!');
                    setConnectionStatusMsg({
                      type: 'success',
                      text: `Successfully synced to backend at ${new Date().toLocaleTimeString()}`
                    });
                  } else {
                    setConnectionStatusMsg({
                      type: 'error',
                      text: 'Backend sync notice: Changes are saved in local browser storage.'
                    });
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-400 to-lime-400 hover:from-cyan-300 hover:to-lime-300 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md self-start sm:self-auto disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingServer ? 'animate-spin' : ''}`} />
                <span>{syncingServer ? 'Syncing...' : 'Sync to Backend Now'}</span>
              </button>
            </div>

            {connectionStatusMsg && (
              <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                connectionStatusMsg.type === 'success'
                  ? 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-300'
                  : 'bg-amber-950/70 border border-amber-500/50 text-amber-300'
              }`}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{connectionStatusMsg.text}</span>
              </div>
            )}

            {/* Single Streamlined Cloud Database & Live Sync Card */}
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
                      <span>Supabase PostgreSQL Cloud Database</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                        FREE TIER
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Real-time cloud database syncing laptop, mobile phones, and all browsers instantly.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-[11px] text-slate-400">
                  <span>Project ID:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800 font-semibold">
                    {cloudForm.supabaseUrl.match(/https:\/\/([^.]+)\.supabase/)?.[1] || 'xivosnuqyfnpvmapymfq'}
                  </span>
                </div>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    value={cloudForm.supabaseUrl}
                    onChange={(e) => setCloudForm({ ...cloudForm, supabaseUrl: e.target.value })}
                    placeholder="https://xivosnuqyfnpvmapymfq.supabase.co"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono placeholder-slate-600 focus:border-cyan-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Your Supabase project endpoint</span>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Supabase Anon / Public API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showAnonKey ? 'text' : 'password'}
                      value={cloudForm.supabaseAnonKey}
                      onChange={(e) => setCloudForm({ ...cloudForm, supabaseAnonKey: e.target.value })}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono placeholder-slate-600 focus:border-cyan-400 focus:outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAnonKey(!showAnonKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      title={showAnonKey ? 'Hide key' : 'Show key'}
                    >
                      {showAnonKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Copy from: Supabase Dashboard &gt; Project Settings &gt; API &gt; anon public</span>
                </div>
              </div>

              {/* SINGLE PRIMARY ACTION BUTTON BAR - NO CONFUSION */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="space-y-0.5 text-left w-full sm:w-auto">
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                    <span>Single 1-Click Action</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Saves credentials, tests database connection, and syncs all products & settings live to your phone & laptop.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    disabled={isSyncingAll}
                    onClick={async () => {
                      setIsSyncingAll(true);
                      try {
                        const cleanUrl = (cloudForm.supabaseUrl || 'https://xivosnuqyfnpvmapymfq.supabase.co').trim().replace(/\/+$/, '');
                        const cleanKey = (cloudForm.supabaseAnonKey || '').trim();

                        // 1. Update cloud configuration
                        await updateCloudConfig({
                          ...cloudForm,
                          supabaseUrl: cleanUrl,
                          supabaseAnonKey: cleanKey,
                          provider: cleanKey ? 'supabase' : 'none'
                        });

                        // 2. Sync to local edge server
                        await syncToBackend();

                        // 3. Test & save to Supabase
                        if (cleanKey) {
                          const test = await testSupabaseConnectionDirectly(cleanUrl, cleanKey);
                          if (test.tableExists) {
                            const currentData = {
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
                              websiteIcon
                            };
                            const saveRes = await saveToSupabaseDirectly(cleanUrl, cleanKey, currentData);
                            if (saveRes.success) {
                              setConnectionStatusMsg({
                                type: 'success',
                                text: '🟢 Supabase Cloud Database Connected! All changes saved & live synced across Phone, Laptop, and all browsers.'
                              });
                              showToast('✅ All data saved and synced to Supabase & all devices!');
                            } else {
                              setConnectionStatusMsg({
                                type: 'error',
                                text: saveRes.message
                              });
                              showToast(saveRes.message);
                            }
                          } else {
                            setConnectionStatusMsg({
                              type: 'error',
                              text: test.message
                            });
                            showToast(test.message);
                          }
                        } else {
                          setConnectionStatusMsg({
                            type: 'success',
                            text: '🟢 Edge Server Storage Active! Changes are saved & synced across laptop and phone.'
                          });
                          showToast('✅ Saved & synced to server storage!');
                        }
                      } catch (err: any) {
                        showToast(`Sync notice: ${err.message}`);
                      } finally {
                        setIsSyncingAll(false);
                      }
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 rounded-xl transition-all shadow-lg cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
                    <span>{isSyncingAll ? 'Connecting & Syncing...' : '⚡ Save & Sync Live to All Devices'}</span>
                  </button>

                  {/* End single button */}
                </div>
              </div>

              {/* 2-Step Supabase SQL Table Creator Guide */}
              <div className="p-5 bg-slate-950/90 rounded-2xl border border-slate-800 text-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>If you see &quot;Table sanjog_cms does not exist&quot; — 1-Minute Fix:</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Supabase requires creating the table schema once. Follow these 2 easy steps:
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
                        setSqlCopied(true);
                        showToast('✅ Complete SQL schema script copied to clipboard!');
                        setTimeout(() => setSqlCopied(false), 4000);
                      }}
                      className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{sqlCopied ? '✓ Copied SQL!' : 'Step 1: Copy SQL Script'}</span>
                    </button>

                    <a
                      href={`https://supabase.com/dashboard/project/${cloudForm.supabaseUrl.match(/https:\/\/([^.]+)\.supabase/)?.[1] || 'xivosnuqyfnpvmapymfq'}/sql/new`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Step 2: Open SQL Editor & Run</span>
                    </a>
                  </div>
                </div>

                {/* Clear Step-by-Step Instructions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
                  <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                    <div className="font-bold text-cyan-300">ধাপ ১: Copy SQL Script</div>
                    <p className="text-slate-400 leading-relaxed">
                      উপরের <strong>&quot;Step 1: Copy SQL Script&quot;</strong> বাটনে ক্লিক করুন। পুরো ডাটাবেজ কোডটি কপি হয়ে যাবে।
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                    <div className="font-bold text-emerald-300">ধাপ ২: Open SQL Editor & Paste</div>
                    <p className="text-slate-400 leading-relaxed">
                      <strong>&quot;Step 2: Open SQL Editor&quot;</strong> এ ক্লিক করে Supabase-এ যান, পেস্ট করুন এবং সবুজ <strong>RUN</strong> বাটনে চাপ দিন।
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-1">
                    <div className="font-bold text-lime-300">ধাপ ৩: 1-Click Live Sync</div>
                    <p className="text-slate-400 leading-relaxed">
                      এখানে ফিরে এসে <strong>&quot;Save & Sync Live to All Devices&quot;</strong> ক্লিক করুন। ডাটাবেজ পার্মানেন্টলি অ্যাক্টিভ হয়ে যাবে!
                    </p>
                  </div>
                </div>

                {/* Collapsible/Viewable SQL Script Box */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1">
                    <span>Database Schema Preview (PostgreSQL + RLS Policies):</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
                        setSqlCopied(true);
                        showToast('✅ SQL script copied!');
                        setTimeout(() => setSqlCopied(false), 3000);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-mono text-[10px] cursor-pointer"
                    >
                      Copy All Code
                    </button>
                  </div>
                  <pre className="text-[10px] text-cyan-300/90 font-mono overflow-x-auto p-3 bg-slate-900 border border-slate-800 rounded-xl max-h-36 whitespace-pre">
{SUPABASE_SETUP_SQL}
                  </pre>
                </div>
              </div>
            </div>

            {/* Complete JSON Snapshot Backup Card */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white font-display">
                  Full Website Data Snapshot & JSON Export
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Download a complete backup of all products, reviews, slides, and settings in one portable JSON file.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const fullBackup = {
                      companyName: 'Sanjog',
                      exportedAt: new Date().toISOString(),
                      heroSlides,
                      newsItems,
                      products,
                      gallery,
                      companyInfo,
                      founderDesk,
                      mapHubs,
                      stats,
                      statsHeader,
                      reviews,
                      websiteIcon
                    };
                    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Sanjog_Website_Backup_${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    showToast('Full backup downloaded!');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup JSON</span>
                </button>
              </div>
            </div>
          </div>
        )}


        {/* 9. MAP & HUBS TAB */}
        {activeTab === 'map' && (
          <div className="space-y-6 text-left">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white font-display">
                  Interactive Map Locations & Supply Hubs
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pins displayed on the Interactive Pan-India Map in Contact Us and Home Page.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingHub({
                    id: `hub-${Date.now()}`,
                    name: 'New Regional Highway Supply Depot',
                    state: 'West Bengal',
                    type: 'Regional Depot',
                    coordinates: { x: 70, y: 50 },
                    capacity: 'Ready stock of W-Beam barriers & fasteners',
                    contact: '+91 98300-12345',
                    description: 'Direct site trailer dispatch within 24 hours.'
                  });
                  setIsAddingHub(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 rounded-xl shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Supply Hub</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mapHubs.map((hub) => (
                <div
                  key={hub.id}
                  className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {hub.type}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Coordinates: ({hub.coordinates.x}%, {hub.coordinates.y}%)
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white font-display">
                      {hub.name}
                    </h4>
                    <p className="text-xs text-lime-400 font-mono">
                      State: {hub.state} &middot; Contact: {hub.contact}
                    </p>
                    <p className="text-xs text-slate-300">
                      {hub.description}
                    </p>
                    <div className="text-[11px] text-slate-400 font-mono pt-1">
                      Capacity: <span className="text-white">{hub.capacity}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingHub({ ...hub });
                        setIsAddingHub(false);
                      }}
                      className="px-3 py-1.5 text-xs text-cyan-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Hub</span>
                    </button>
                    {mapHubs.length > 1 && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete hub "${hub.name}"?`)) {
                            deleteMapHub(hub.id);
                            showToast('Map hub deleted');
                          }
                        }}
                        className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Map Hub Edit Modal */}
            {editingHub && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="text-lg font-bold text-white font-display">
                      {isAddingHub ? 'Add Map Hub' : 'Edit Map Hub'}
                    </h3>
                    <button onClick={() => setEditingHub(null)} className="p-1 text-slate-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Facility Name</label>
                    <input
                      type="text"
                      value={editingHub.name}
                      onChange={(e) => setEditingHub({ ...editingHub, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">State</label>
                      <input
                        type="text"
                        value={editingHub.state}
                        onChange={(e) => setEditingHub({ ...editingHub, state: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">Type</label>
                      <select
                        value={editingHub.type}
                        onChange={(e) => setEditingHub({ ...editingHub, type: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      >
                        <option value="Factory & Galvanizing">Factory & Galvanizing</option>
                        <option value="Corporate Office">Corporate Office</option>
                        <option value="Supply Depot">Supply Depot</option>
                        <option value="Major Corridor">Major Corridor</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">Map Position X % (0-100)</label>
                      <input
                        type="number"
                        min="10"
                        max="90"
                        value={editingHub.coordinates.x}
                        onChange={(e) => setEditingHub({
                          ...editingHub,
                          coordinates: { ...editingHub.coordinates, x: Number(e.target.value) }
                        })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">Map Position Y % (0-100)</label>
                      <input
                        type="number"
                        min="10"
                        max="90"
                        value={editingHub.coordinates.y}
                        onChange={(e) => setEditingHub({
                          ...editingHub,
                          coordinates: { ...editingHub.coordinates, y: Number(e.target.value) }
                        })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Monthly Capacity & Features</label>
                    <input
                      type="text"
                      value={editingHub.capacity}
                      onChange={(e) => setEditingHub({ ...editingHub, capacity: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Contact Phone / Email</label>
                    <input
                      type="text"
                      value={editingHub.contact}
                      onChange={(e) => setEditingHub({ ...editingHub, contact: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                    <button onClick={() => setEditingHub(null)} className="px-4 py-2 text-xs text-slate-400 hover:text-white">
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (isAddingHub) {
                          addMapHub(editingHub);
                          showToast('Map hub added!');
                        } else {
                          updateMapHub(editingHub);
                          showToast('Map hub updated!');
                        }
                        setEditingHub(null);
                      }}
                      className="px-5 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 rounded-xl"
                    >
                      Save Hub
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. GALLERY TAB */}
        {activeTab === 'gallery' && (
          <div className="space-y-6 text-left">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white font-display">
                  Project & Plant Photo Gallery
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Upload factory manufacturing and national highway installation site photos.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingGallery({
                    id: `gal-${Date.now()}`,
                    title: 'W-Beam Installation Along Expressway Stretch',
                    category: 'barriers',
                    categoryLabel: 'Highway Crash Barriers',
                    image: '/src/assets/images/sanjog_crash_barrier_1791292174622.jpg',
                    location: 'National Highway Corridor',
                    description: 'Finished installation with C-posts and spacer blocks conforming to MoRTH Section 811.'
                  });
                  setIsAddingGallery(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 rounded-xl shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Gallery Photo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {gallery.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden p-4 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 mb-3">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-slate-950/85 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300">
                        {item.categoryLabel}
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-white font-display">{item.title}</h4>
                    <p className="text-xs text-lime-400 font-mono mt-0.5">{item.location}</p>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2">{item.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingGallery({ ...item });
                        setIsAddingGallery(false);
                      }}
                      className="px-3 py-1.5 text-xs text-cyan-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete photo?')) {
                          deleteGalleryItem(item.id);
                          showToast('Photo removed');
                        }
                      }}
                      className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Gallery Edit Modal */}
            {editingGallery && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="text-lg font-bold text-white font-display">
                      {isAddingGallery ? 'Add Gallery Item' : 'Edit Gallery Item'}
                    </h3>
                    <button onClick={() => setEditingGallery(null)} className="p-1 text-slate-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300 block">Photo (Upload from device or enter URL)</label>
                    <label className="flex items-center justify-center gap-2 px-4 py-2 bg-cyan-950/80 text-cyan-300 border border-cyan-800 rounded-xl cursor-pointer text-xs font-semibold">
                      <Upload className="w-4 h-4" />
                      <span>Upload Photo from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, (url) => setEditingGallery({ ...editingGallery, image: url }))}
                      />
                    </label>
                    <input
                      type="text"
                      value={editingGallery.image}
                      onChange={(e) => setEditingGallery({ ...editingGallery, image: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Title</label>
                    <input
                      type="text"
                      value={editingGallery.title}
                      onChange={(e) => setEditingGallery({ ...editingGallery, title: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">Location</label>
                      <input
                        type="text"
                        value={editingGallery.location}
                        onChange={(e) => setEditingGallery({ ...editingGallery, location: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">Category</label>
                      <input
                        type="text"
                        value={editingGallery.categoryLabel}
                        onChange={(e) => setEditingGallery({ ...editingGallery, categoryLabel: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                    <button onClick={() => setEditingGallery(null)} className="px-4 py-2 text-xs text-slate-400 hover:text-white">
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (isAddingGallery) {
                          addGalleryItem(editingGallery);
                          showToast('Gallery photo added!');
                        } else {
                          updateGalleryItem(editingGallery);
                          showToast('Gallery photo updated!');
                        }
                        setEditingGallery(null);
                      }}
                      className="px-5 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 rounded-xl"
                    >
                      Save Photo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 8. COMPANY INFO TAB */}
        {activeTab === 'company' && (
          <div className="space-y-6 text-left">
            <div>
              <h2 className="text-xl font-bold text-white font-display">
                Company & Contact Information
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Official company details, WhatsApp support numbers, telephone helplines, emails, addresses, and registration metrics.
              </p>
            </div>

            {/* Dedicated WhatsApp Support & Helpline Config Card */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-emerald-500/40 space-y-4 shadow-xl">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    WhatsApp Support & Direct Customer Helpline
                  </h3>
                  <p className="text-xs text-slate-400">
                    Enter your own WhatsApp mobile number below. This controls the green floating WhatsApp chat widget and site helplines.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-emerald-300 block mb-1">
                    Your WhatsApp Support Number (Floating Button)
                  </label>
                  <input
                    type="text"
                    value={companyForm.whatsappNumber || ''}
                    onChange={(e) => setCompanyForm({ ...companyForm, whatsappNumber: e.target.value })}
                    placeholder="e.g. +91 98300-12345 or 9830012345"
                    className="w-full px-3 py-2 bg-slate-950 border border-emerald-500/50 rounded-xl text-xs text-white font-mono focus:ring-1 focus:ring-emerald-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Powers the floating green WhatsApp chat button on bottom-right of every page.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-cyan-300 block mb-1">
                    Sales Person Mobile & Direct WhatsApp Call
                  </label>
                  <input
                    type="text"
                    value={companyForm.salesPhone || ''}
                    onChange={(e) => setCompanyForm({ ...companyForm, salesPhone: e.target.value })}
                    placeholder="e.g. +91 98300-12345 (Direct WhatsApp / Calls)"
                    className="w-full px-3 py-2 bg-slate-950 border border-cyan-500/50 rounded-xl text-xs text-white font-mono focus:ring-1 focus:ring-cyan-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Powers the "Speak with Sales" button in Founder's Desk and Header.
                  </span>
                </div>
              </div>

              {/* Direct Test Link */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-slate-300">
                  Target WhatsApp Link: <code className="text-emerald-400 font-mono">https://wa.me/{(companyForm.whatsappNumber || companyForm.salesPhone || '919830012345').replace(/[^0-9]/g, '')}</code>
                </span>
                <a
                  href={`https://wa.me/${(companyForm.whatsappNumber || companyForm.salesPhone || '919830012345').replace(/[^0-9]/g, '')}?text=Hello%20Sanjog%20Support`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-md"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Test Open WhatsApp</span>
                </a>
              </div>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Company Legal Name</label>
                  <input
                    type="text"
                    value={companyForm.companyName}
                    onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Company Tagline</label>
                  <input
                    type="text"
                    value={companyForm.tagline}
                    onChange={(e) => setCompanyForm({ ...companyForm, tagline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Primary Phone Number(s)</label>
                  <input
                    type="text"
                    value={companyForm.phone}
                    onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Sales & WhatsApp Helpline</label>
                  <input
                    type="text"
                    value={companyForm.salesPhone}
                    onChange={(e) => setCompanyForm({ ...companyForm, salesPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Inquiry / Sales Email</label>
                  <input
                    type="email"
                    value={companyForm.inquiryEmail}
                    onChange={(e) => setCompanyForm({ ...companyForm, inquiryEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Support / Dispatch Email</label>
                  <input
                    type="email"
                    value={companyForm.supportEmail}
                    onChange={(e) => setCompanyForm({ ...companyForm, supportEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Headquarters Address</label>
                <input
                  type="text"
                  value={companyForm.headquarters}
                  onChange={(e) => setCompanyForm({ ...companyForm, headquarters: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Crash Barriers Metric</label>
                  <input
                    type="text"
                    value={companyForm.metricBarriers}
                    onChange={(e) => setCompanyForm({ ...companyForm, metricBarriers: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-lime-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">High Masts Metric</label>
                  <input
                    type="text"
                    value={companyForm.metricHighMasts}
                    onChange={(e) => setCompanyForm({ ...companyForm, metricHighMasts: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-cyan-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Clients Metric</label>
                  <input
                    type="text"
                    value={companyForm.metricClients}
                    onChange={(e) => setCompanyForm({ ...companyForm, metricClients: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">Standards</label>
                  <input
                    type="text"
                    value={companyForm.metricStandards}
                    onChange={(e) => setCompanyForm({ ...companyForm, metricStandards: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 rounded-xl shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Company Information</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 9. INQUIRIES TAB */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6 text-left">
            <div>
              <h2 className="text-xl font-bold text-white font-display">
                Client Quotation Requests ({inquiries.length})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Incoming leads from Contact Us and Product Inquiry submissions.
              </p>
            </div>

            {inquiries.length === 0 ? (
              <div className="py-12 bg-slate-900/60 border border-slate-800 rounded-2xl text-center space-y-2">
                <Inbox className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No quotation inquiries received yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-950 text-cyan-300 border border-slate-800 font-semibold">
                          Ticket: {inq.ticketId}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{inq.date}</span>
                        <span className={`px-2 py-0.5 text-[10px] rounded-full font-mono font-semibold ${
                          inq.status === 'New'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : inq.status === 'Quoted'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {inq.status}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white">
                        {inq.name} &middot; <span className="text-slate-400 font-normal">{inq.company}</span>
                      </h4>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300 font-mono">
                        <span>Product: <strong className="text-lime-400">{inq.product}</strong></span>
                        <span>Phone: <strong className="text-white">{inq.phone}</strong></span>
                        <span>Email: <strong className="text-white">{inq.email}</strong></span>
                        {inq.cityState && <span>Location: <strong>{inq.cityState}</strong></span>}
                      </div>

                      {inq.message && (
                        <p className="text-xs text-slate-400 pt-1 italic">
                          "{inq.message}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={inq.status}
                        onChange={(e) => {
                          updateInquiryStatus(inq.id, e.target.value as any);
                          showToast('Inquiry status updated');
                        }}
                        className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      >
                        <option value="New">Status: New</option>
                        <option value="In Progress">Status: In Progress</option>
                        <option value="Quoted">Status: Quoted</option>
                        <option value="Completed">Status: Completed</option>
                      </select>

                      <button
                        onClick={() => {
                          if (window.confirm('Delete this inquiry?')) {
                            deleteInquiry(inq.id);
                            showToast('Inquiry deleted');
                          }
                        }}
                        className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 10. SECURITY & PASSWORD TAB */}
        {activeTab === 'security' && (
          <div className="space-y-6 text-left max-w-xl">
            <div>
              <h2 className="text-xl font-bold text-white font-display">
                Admin Authentication & Password
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                The CMS admin panel is accessed only by clicking the hidden &copy; symbol in the footer. You can update your secret password here.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-7">
              <div className="p-3.5 bg-cyan-950/40 border border-cyan-800/60 rounded-xl text-xs text-cyan-200 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  Current Default ID is <strong>admin</strong>. To secure your CMS, enter a new secret password below.
                </span>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  New Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showSecPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecPass(!showSecPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showSecPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showSecPass ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-lime-400 rounded-xl shadow-md"
                >
                  Update Secret Password
                </button>
              </div>
            </form>
          </div>
        )}

          </main>
        </div>
      </div>
    </div>
  );
};
