// src/app/(dashboard)/settings/page.jsx

'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Building2, Mail, Phone, MapPin, Globe, Calendar, Upload, Trash2, Save,
  Settings as SettingsIcon, Shield, CreditCard, Bell, Palette, Lock, Database,
  RefreshCw, CheckCircle, Loader2, Download, Facebook, Instagram, Twitter,
  Linkedin, Youtube, Clock, DollarSign, Smartphone, Eye, EyeOff, Moon, Sun
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

import useAuthStore from '@/store/authStore';
import { settingService } from '@/services/settingService';
import PolicyManagement from '@/components/settings/PolicyManagement';
import { cn } from '@/lib/utils';

// Tab configurations
const TABS = [
  { id: 'general', label: 'General Settings', icon: Building2 },
  { id: 'policies', label: 'Policies', icon: Shield },
  { id: 'timings', label: 'Timings', icon: Clock },,
  { id: 'backup', label: 'Backup', icon: Database },
];

export default function SettingsPage() {
  const { 
    user,
    refreshUserData,
    setInstituteSettings, 
    updateSettingSection,
    setInstituteLogo,
    setInstituteName,
    setModuleEnabled,
    instituteSettings,
    academicSettings,
    timingsSettings,
    financeSettings,
    communicationSettings,
    moduleSettings
  } = useAuthStore();
  
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [resettingSection, setResettingSection] = useState(null);

  // Get current values from store
  const currentSettings = instituteSettings();
  const currentLogo = user?.institute?.logo_url || '';
  const currentInstituteName = user?.institute?.name || '';
  const currentModules = moduleSettings();

  // =========================================================
  // Form States
  // =========================================================

  // General Form
  const [generalForm, setGeneralForm] = useState({
    display_name: currentInstituteName,
    tagline: currentSettings.tagline || '',
    description: currentSettings.description || '',
    email: user?.institute?.email || '',
    phone: user?.institute?.phone || '',
    address_line1: currentSettings.address_line1 || '',
    city: currentSettings.city || user?.institute?.city || '',
    country: currentSettings.country || 'Pakistan',
    facebook_url: currentSettings.facebook_url || '',
    instagram_url: currentSettings.instagram_url || '',
    twitter_url: currentSettings.twitter_url || '',
    linkedin_url: currentSettings.linkedin_url || '',
    youtube_url: currentSettings.youtube_url || ''
  });

  // Academic Form
  const [academicForm, setAcademicForm] = useState(academicSettings());

  // Timings Form
  const [timingsForm, setTimingsForm] = useState(timingsSettings());

  // Finance Form
  const [financeForm, setFinanceForm] = useState(financeSettings());

  // Communication Form
  const [communicationForm, setCommunicationForm] = useState(communicationSettings());

  // Appearance Form
  const [appearanceForm, setAppearanceForm] = useState({
    primary_color: currentSettings.appearance?.primary_color || '#10b981',
    secondary_color: currentSettings.appearance?.secondary_color || '#3b82f6',
    accent_color: currentSettings.appearance?.accent_color || '#f59e0b',
    font_family: currentSettings.appearance?.font_family || 'Inter',
    portal_title: currentSettings.appearance?.portal_title || '',
    login_bg_url: currentSettings.appearance?.login_bg_url || '',
    custom_css: currentSettings.appearance?.custom_css || '',
    custom_js: currentSettings.appearance?.custom_js || ''
  });

  // Security Form
  const [securityForm, setSecurityForm] = useState(currentSettings.security || {
    two_factor_auth: false,
    password_expiry_days: 90,
    session_timeout_minutes: 30,
    max_login_attempts: 5,
    ip_whitelist: [],
    allowed_domains: [],
    force_strong_password: true,
    mfa_required_for_admins: false
  });

  // Modules Form
  const [modulesForm, setModulesForm] = useState(currentModules);

  // Update forms when store changes
  useEffect(() => {
    setGeneralForm(prev => ({
      ...prev,
      display_name: currentInstituteName,
      tagline: currentSettings.tagline || '',
      description: currentSettings.description || '',
      email: user?.institute?.email || '',
      phone: user?.institute?.phone || '',
      address_line1: currentSettings.address_line1 || '',
      city: currentSettings.city || user?.institute?.city || '',
      country: currentSettings.country || 'Pakistan',
      facebook_url: currentSettings.facebook_url || '',
      instagram_url: currentSettings.instagram_url || '',
      twitter_url: currentSettings.twitter_url || '',
      linkedin_url: currentSettings.linkedin_url || '',
      youtube_url: currentSettings.youtube_url || ''
    }));
  }, [currentInstituteName, currentSettings, user?.institute]);

  useEffect(() => {
    setAcademicForm(academicSettings());
  }, [academicSettings]);

  useEffect(() => {
    setTimingsForm(timingsSettings());
  }, [timingsSettings]);

  useEffect(() => {
    setFinanceForm(financeSettings());
  }, [financeSettings]);

  useEffect(() => {
    setCommunicationForm(communicationSettings());
  }, [communicationSettings]);

  useEffect(() => {
    setModulesForm(currentModules);
  }, [currentModules]);

  // =========================================================
  // Mutations
  // =========================================================

  const updateGeneralMutation = useMutation({
    mutationFn: (data) => settingService.updateGeneralSettings(data),
    onSuccess: async (response) => {
      // Refresh user data to get updated institute name
      await refreshUserData();
      
      // Update store with new settings
      setInstituteSettings({
        tagline: response.data.tagline,
        description: response.data.description,
        address_line1: response.data.address_line1,
        city: response.data.city,
        country: response.data.country,
        facebook_url: response.data.facebook_url,
        instagram_url: response.data.instagram_url,
        twitter_url: response.data.twitter_url,
        linkedin_url: response.data.linkedin_url,
        youtube_url: response.data.youtube_url
      });
      
      toast.success('General settings updated successfully');
      queryClient.invalidateQueries(['settings']);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update general settings');
    }
  });

  const updateAcademicMutation = useMutation({
    mutationFn: (data) => settingService.updateAcademicSettings(data),
    onSuccess: (response) => {
      updateSettingSection('academic', response.data.academic);
      toast.success('Academic settings updated successfully');
      queryClient.invalidateQueries(['settings']);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update academic settings');
    }
  });

  const updateTimingsMutation = useMutation({
    mutationFn: (data) => settingService.updateTimingsSettings(data),
    onSuccess: (response) => {
      updateSettingSection('timings', response.data.timings);
      toast.success('Timings updated successfully');
      queryClient.invalidateQueries(['settings']);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update timings');
    }
  });

  const updateFinanceMutation = useMutation({
    mutationFn: (data) => settingService.updateFinanceSettings(data),
    onSuccess: (response) => {
      updateSettingSection('finance', response.data.finance);
      toast.success('Finance settings updated successfully');
      queryClient.invalidateQueries(['settings']);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update finance settings');
    }
  });

  const updateCommunicationMutation = useMutation({
    mutationFn: (data) => settingService.updateCommunicationSettings(data),
    onSuccess: (response) => {
      updateSettingSection('communication', response.data.communication);
      toast.success('Communication settings updated successfully');
      queryClient.invalidateQueries(['settings']);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update communication settings');
    }
  });

  const updateAppearanceMutation = useMutation({
    mutationFn: ({ data, logoFile }) => settingService.updateAppearanceSettings(data, logoFile),
    onSuccess: async (response) => {
      // Refresh user data to get updated logo
      await refreshUserData();
      
      if (response.data.appearance?.logo_url) {
        setInstituteLogo(response.data.appearance.logo_url);
      }
      updateSettingSection('appearance', response.data.appearance);
      toast.success('Appearance settings updated successfully');
      setUploadingLogo(false);
      queryClient.invalidateQueries(['settings']);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update appearance');
      setUploadingLogo(false);
    }
  });

  const updateSecurityMutation = useMutation({
    mutationFn: (data) => settingService.updateSecuritySettings(data),
    onSuccess: (response) => {
      updateSettingSection('security', response.data.security);
      toast.success('Security settings updated successfully');
      queryClient.invalidateQueries(['settings']);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update security settings');
    }
  });

  const updateModulesMutation = useMutation({
    mutationFn: (data) => settingService.updateModuleSettings(data),
    onSuccess: (response) => {
      const updatedModules = response.data.modules;
      Object.keys(updatedModules).forEach(moduleName => {
        setModuleEnabled(moduleName, updatedModules[moduleName].enabled);
      });
      toast.success('Module settings updated successfully');
      queryClient.invalidateQueries(['settings']);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update module settings');
    }
  });

  const resetSectionMutation = useMutation({
    mutationFn: (section) => settingService.resetSettingsSection(section),
    onSuccess: async (response) => {
      // Refresh user data to get latest settings
      await refreshUserData();
      
      if (response.data[activeTab]) {
        updateSettingSection(activeTab, response.data[activeTab]);
      }
      toast.success(`${activeTab} settings reset to default`);
      setResettingSection(null);
      queryClient.invalidateQueries(['settings']);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to reset section');
      setResettingSection(null);
    }
  });

  // =========================================================
  // Handlers
  // =========================================================

  const handleGeneralSubmit = (e) => {
    e.preventDefault();
    updateGeneralMutation.mutate(generalForm);
  };

  const handleAcademicSubmit = (e) => {
    e.preventDefault();
    updateAcademicMutation.mutate(academicForm);
  };

  const handleTimingsSubmit = (e) => {
    e.preventDefault();
    updateTimingsMutation.mutate(timingsForm);
  };

  const handleFinanceSubmit = (e) => {
    e.preventDefault();
    updateFinanceMutation.mutate(financeForm);
  };

  const handleCommunicationSubmit = (e) => {
    e.preventDefault();
    updateCommunicationMutation.mutate(communicationForm);
  };

  const handleAppearanceSubmit = (e) => {
    e.preventDefault();
    updateAppearanceMutation.mutate({
      data: appearanceForm,
      logoFile: null
    });
  };

  const handleSecuritySubmit = (e) => {
    e.preventDefault();
    updateSecurityMutation.mutate(securityForm);
  };

  const handleModulesSubmit = (e) => {
    e.preventDefault();
    updateModulesMutation.mutate(modulesForm);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo size should be less than 2MB');
      return;
    }
    setUploadingLogo(true);
    updateAppearanceMutation.mutate({
      data: appearanceForm,
      logoFile: file
    });
  };

  const handleResetSection = (section) => {
    if (confirm(`Are you sure you want to reset ${section} settings to default?`)) {
      setResettingSection(section);
      resetSectionMutation.mutate(section);
    }
  };

  const toggleWorkingDay = (day) => {
    setTimingsForm(prev => ({
      ...prev,
      working_days: prev.working_days?.includes(day)
        ? prev.working_days.filter(d => d !== day)
        : [...(prev.working_days || []), day]
    }));
  };

  const toggleWeeklyOff = (day) => {
    setTimingsForm(prev => ({
      ...prev,
      weekly_off_days: prev.weekly_off_days?.includes(day)
        ? prev.weekly_off_days.filter(d => d !== day)
        : [...(prev.weekly_off_days || []), day]
    }));
  };

  const updateBreak = (index, field, value) => {
    const newBreaks = [...(timingsForm.breaks || [])];
    newBreaks[index] = { ...newBreaks[index], [field]: value };
    setTimingsForm(prev => ({ ...prev, breaks: newBreaks }));
  };

  const toggleModule = (moduleName) => {
    const currentModule = modulesForm[moduleName];
    if (currentModule?.required) {
      toast.info(`${moduleName} module is required and cannot be disabled`);
      return;
    }
    setModulesForm(prev => ({
      ...prev,
      [moduleName]: { ...prev[moduleName], enabled: !prev[moduleName]?.enabled }
    }));
  };

  // =========================================================
  // Render
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your institute settings and configurations
            </p>
          </div>
          {activeTab !== 'policies' && (
            <button
              onClick={() => handleResetSection(activeTab)}
              disabled={resettingSection === activeTab}
              className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
            >
              {resettingSection === activeTab ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              Reset to Default
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-8 space-y-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200",
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    )}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            
            {/* ==================== GENERAL SETTINGS ==================== */}
            {activeTab === 'general' && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Building2 size={20} className="text-primary" />
                    General Settings
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Basic information about your institute</p>
                </div>

                <form onSubmit={handleGeneralSubmit} className="p-6 space-y-6">
                  {/* Logo Upload */}
                  <div className="flex items-center gap-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="relative">
                      {currentLogo ? (
                        <div className="relative group">
                          <Image
                            src={currentLogo}
                            alt="Institute Logo"
                            width={80}
                            height={80}
                            className="rounded-lg object-cover border"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Building2 size={32} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition">
                        <Upload size={16} />
                        {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          disabled={uploadingLogo}
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-2">Recommended: 200x200px, max 2MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Institute Name *</label>
                      <input
                        type="text"
                        value={generalForm.display_name}
                        onChange={(e) => setGeneralForm({ ...generalForm, display_name: e.target.value })}
                        className="input-base w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tagline / Motto</label>
                      <input
                        type="text"
                        value={generalForm.tagline}
                        onChange={(e) => setGeneralForm({ ...generalForm, tagline: e.target.value })}
                        className="input-base w-full"
                        placeholder="Empowering minds, shaping futures"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        value={generalForm.description}
                        onChange={(e) => setGeneralForm({ ...generalForm, description: e.target.value })}
                        className="input-base w-full"
                        rows={3}
                        placeholder="About your institute..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        value={generalForm.email}
                        onChange={(e) => setGeneralForm({ ...generalForm, email: e.target.value })}
                        className="input-base w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone</label>
                      <input
                        type="tel"
                        value={generalForm.phone}
                        onChange={(e) => setGeneralForm({ ...generalForm, phone: e.target.value })}
                        className="input-base w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Address</label>
                      <input
                        type="text"
                        value={generalForm.address_line1}
                        onChange={(e) => setGeneralForm({ ...generalForm, address_line1: e.target.value })}
                        className="input-base w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">City</label>
                      <input
                        type="text"
                        value={generalForm.city}
                        onChange={(e) => setGeneralForm({ ...generalForm, city: e.target.value })}
                        className="input-base w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Country</label>
                      <input
                        type="text"
                        value={generalForm.country}
                        onChange={(e) => setGeneralForm({ ...generalForm, country: e.target.value })}
                        className="input-base w-full"
                      />
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Globe size={18} />
                      Social Media
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                          <Facebook size={16} /> Facebook
                        </label>
                        <input
                          type="url"
                          value={generalForm.facebook_url}
                          onChange={(e) => setGeneralForm({ ...generalForm, facebook_url: e.target.value })}
                          className="input-base w-full"
                          placeholder="https://facebook.com/..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                          <Instagram size={16} /> Instagram
                        </label>
                        <input
                          type="url"
                          value={generalForm.instagram_url}
                          onChange={(e) => setGeneralForm({ ...generalForm, instagram_url: e.target.value })}
                          className="input-base w-full"
                          placeholder="https://instagram.com/..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                          <Twitter size={16} /> Twitter/X
                        </label>
                        <input
                          type="url"
                          value={generalForm.twitter_url}
                          onChange={(e) => setGeneralForm({ ...generalForm, twitter_url: e.target.value })}
                          className="input-base w-full"
                          placeholder="https://twitter.com/..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                          <Linkedin size={16} /> LinkedIn
                        </label>
                        <input
                          type="url"
                          value={generalForm.linkedin_url}
                          onChange={(e) => setGeneralForm({ ...generalForm, linkedin_url: e.target.value })}
                          className="input-base w-full"
                          placeholder="https://linkedin.com/..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                          <Youtube size={16} /> YouTube
                        </label>
                        <input
                          type="url"
                          value={generalForm.youtube_url}
                          onChange={(e) => setGeneralForm({ ...generalForm, youtube_url: e.target.value })}
                          className="input-base w-full"
                          placeholder="https://youtube.com/..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={updateGeneralMutation.isPending}
                      className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50"
                    >
                      {updateGeneralMutation.isPending ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ==================== POLICIES TAB ==================== */}
            {activeTab === 'policies' && <PolicyManagement />}

            {/* ==================== TIMINGS & SCHEDULE ==================== */}
            {activeTab === 'timings' && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-cyan-50 to-sky-50 dark:from-cyan-950/20 dark:to-sky-950/20">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Clock size={20} className="text-primary" />
                    Timings & Schedule
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Configure working hours, breaks, and holidays</p>
                </div>

                <form onSubmit={handleTimingsSubmit} className="p-6 space-y-6">
                  {/* Working Days */}
                  <div>
                    <label className="block text-sm font-medium mb-3">Working Days</label>
                    <div className="flex flex-wrap gap-3">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                        <label key={day} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={timingsForm.working_days?.includes(day) || false}
                            onChange={() => toggleWorkingDay(day)}
                            className="rounded"
                          />
                          <span className="capitalize">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Working Hours */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Regular Start Time</label>
                      <input
                        type="time"
                        value={timingsForm.start_time || '08:00'}
                        onChange={(e) => setTimingsForm({ ...timingsForm, start_time: e.target.value })}
                        className="input-base w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Regular End Time</label>
                      <input
                        type="time"
                        value={timingsForm.end_time || '14:00'}
                        onChange={(e) => setTimingsForm({ ...timingsForm, end_time: e.target.value })}
                        className="input-base w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Friday Start Time</label>
                      <input
                        type="time"
                        value={timingsForm.friday_start_time || '08:00'}
                        onChange={(e) => setTimingsForm({ ...timingsForm, friday_start_time: e.target.value })}
                        className="input-base w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Friday End Time</label>
                      <input
                        type="time"
                        value={timingsForm.friday_end_time || '12:30'}
                        onChange={(e) => setTimingsForm({ ...timingsForm, friday_end_time: e.target.value })}
                        className="input-base w-full"
                      />
                    </div>
                  </div>

                  {/* Breaks */}
                  <div>
                    <label className="block text-sm font-medium mb-3">Break Timings</label>
                    <div className="space-y-3">
                      {(timingsForm.breaks || []).map((breakItem, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <label className="flex items-center gap-2 min-w-[100px]">
                            <input
                              type="checkbox"
                              checked={breakItem.enabled || false}
                              onChange={(e) => updateBreak(index, 'enabled', e.target.checked)}
                              className="rounded"
                            />
                            <span className="font-medium">{breakItem.name}</span>
                          </label>
                          {breakItem.enabled && (
                            <>
                              <input
                                type="time"
                                value={breakItem.start || ''}
                                onChange={(e) => updateBreak(index, 'start', e.target.value)}
                                className="input-base w-32"
                                placeholder="Start"
                              />
                              <span>to</span>
                              <input
                                type="time"
                                value={breakItem.end || ''}
                                onChange={(e) => updateBreak(index, 'end', e.target.value)}
                                className="input-base w-32"
                                placeholder="End"
                              />
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attendance Window */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Attendance Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-1">Attendance Start Time</label>
                        <input
                          type="time"
                          value={timingsForm.attendance_start_time || '07:30'}
                          onChange={(e) => setTimingsForm({ ...timingsForm, attendance_start_time: e.target.value })}
                          className="input-base w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Attendance End Time</label>
                        <input
                          type="time"
                          value={timingsForm.attendance_end_time || '09:00'}
                          onChange={(e) => setTimingsForm({ ...timingsForm, attendance_end_time: e.target.value })}
                          className="input-base w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Late Grace Period (Minutes)</label>
                        <input
                          type="number"
                          value={timingsForm.late_attendance_grace_minutes || 10}
                          onChange={(e) => setTimingsForm({ ...timingsForm, late_attendance_grace_minutes: parseInt(e.target.value) })}
                          className="input-base w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Weekly Off Days */}
                  <div>
                    <label className="block text-sm font-medium mb-3">Weekly Off Days</label>
                    <div className="flex flex-wrap gap-3">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                        <label key={day} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={timingsForm.weekly_off_days?.includes(day) || false}
                            onChange={() => toggleWeeklyOff(day)}
                            className="rounded"
                          />
                          <span className="capitalize">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={updateTimingsMutation.isPending}
                      className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50"
                    >
                      {updateTimingsMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ==================== BACKUP & DATA TAB ==================== */}
            {activeTab === 'backup' && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Database size={20} className="text-primary" />
                    Backup & Data Management
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Manage your data backups and exports</p>
                </div>

                <div className="p-6 space-y-6">
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <p className="text-sm text-amber-800 dark:text-amber-400">
                      <strong>Note:</strong> Backups are automatically created daily. You can also manually create a backup below.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
                    >
                      <RefreshCw size={16} />
                      Create Backup Now
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      <Download size={16} />
                      Export All Data
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}