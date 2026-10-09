import React, { useState } from 'react';
import { User, Mail, Phone, ArrowRight, ShieldCheck, Loader2, Check } from 'lucide-react';
import { SpeedoLogo } from './SpeedoLogo';
import { RegistrationFormData } from '../types';

/**
 * Polished, cute Game Onboarding Icon
 * Style: orange (#FF6B00), dark navy (#0F172A), white, rounded, clean, modern, slightly playful
 */
const GameOnboardingIcon: React.FC = () => (
  <div
    id="game-onboarding-icon"
    className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-md shadow-slate-900/10 relative mb-3.5 select-none"
    aria-label="Game Controller Icon"
  >
    {/* Stylized Modern Game Controller SVG */}
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className="w-6.5 h-6.5"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Controller body */}
      <path
        d="M8.5 10C6 10 3.5 12 3.5 15.5C3.5 19.5 5.8 23 8.5 23C10.5 23 11.5 21 13 21H19C20.5 21 21.5 23 23.5 23C26.2 23 28.5 19.5 28.5 15.5C28.5 12 26 10 23.5 10H8.5Z"
        fill="#1E293B"
        stroke="#FF6B00"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* D-Pad in Speedo Orange */}
      <path
        d="M9.5 13.5V17.5M7.5 15.5H11.5"
        stroke="#FF6B00"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Action Buttons in Crisp White */}
      <circle cx="21" cy="14" r="1.15" fill="#FFFFFF" />
      <circle cx="23" cy="16" r="1.15" fill="#FFFFFF" />
      <circle cx="19" cy="16" r="1.15" fill="#FFFFFF" />
      <circle cx="21" cy="18" r="1.15" fill="#FFFFFF" />
      {/* Center status accent */}
      <circle cx="16" cy="15.5" r="1" fill="#FF6B00" />
    </svg>
    {/* Cute playful top badge accent */}
    <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF6B00] rounded-full border-2 border-white ring-1 ring-orange-500/20 shadow-xs" />
  </div>
);

export interface RegistrationScreenProps {
  onSubmit: (formData: RegistrationFormData) => Promise<{ success: boolean; error?: string } | void>;
  isLoading?: boolean;
}

export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [businessOwner, setBusinessOwner] = useState<boolean | null>(null);
  const [instagram, setInstagram] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    businessOwner?: string;
    instagram?: string;
    contactNumber?: string;
  }>({});
  const [touched, setTouched] = useState<{
    name?: boolean;
    email?: boolean;
    businessOwner?: boolean;
    instagram?: boolean;
    contactNumber?: boolean;
  }>({});

  // Email regex validation
  const isValidEmail = (val: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim());
  };

  // Optional phone number validation (if provided)
  const isValidPhone = (val: string): boolean => {
    if (!val.trim()) return true;
    // Allow +, digits, spaces, hyphens, parentheses; minimum 7 digits
    const digitsOnly = val.replace(/\D/g, '');
    return digitsOnly.length >= 7 && digitsOnly.length <= 15;
  };

  // Validate fields
  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanContact = contactNumber.trim();

    if (!cleanName) {
      newErrors.name = 'Please enter your name.';
    }

    if (!cleanEmail) {
      newErrors.email = 'Please enter a valid email.';
    } else if (!isValidEmail(cleanEmail)) {
      newErrors.email = 'Please enter a valid email.';
    }

    if (businessOwner === null) {
      newErrors.businessOwner = 'Please select Yes or No.';
    }

    if (cleanContact && !isValidPhone(cleanContact)) {
      newErrors.contactNumber = 'Please enter a valid contact number or leave it blank.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission handler
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setTouched({
      name: true,
      email: true,
      businessOwner: true,
      instagram: true,
      contactNumber: true,
    });

    if (!validate()) {
      return;
    }

    setSubmitError(null);
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanIg = instagram.trim().replace(/^@+/, '');
    const cleanContact = contactNumber.trim() ? contactNumber.trim() : null;

    try {
      const result = await onSubmit({
        name: cleanName,
        email: cleanEmail,
        businessOwner: Boolean(businessOwner),
        instagramId: cleanIg,
        contactNumber: cleanContact,
      });

      if (result && !result.success) {
        setSubmitError(
          result.error ||
            'Unable to save your registration. Please check your connection and try again.'
        );
      }
    } catch {
      setSubmitError('Unable to save your registration. Please check your connection and try again.');
    }
  };

  // Check if form is ready to submit (compulsory fields satisfied: Name, valid Email, Business/Startup)
  const isFormValid =
    name.trim().length > 0 &&
    isValidEmail(email) &&
    businessOwner !== null &&
    isValidPhone(contactNumber);

  return (
    <div
      id="speedo-registration-screen"
      className="w-full flex-1 flex flex-col items-center justify-center px-3 py-4 sm:py-6 max-w-md mx-auto"
    >
      <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs">
        {/* Speedo Express Header with Card */}
        <div className="text-center mb-5 flex flex-col items-center">
          <SpeedoLogo size="md" withCard={true} className="mb-3.5" />

          {/* Polished Game Controller Icon */}
          <GameOnboardingIcon />

          {/* Main Heading */}
          <h1
            id="registration-screen-title"
            className="text-2xl sm:text-3xl font-black text-[#0F172A] font-heading tracking-tight uppercase"
          >
            GAMERS ONBOARD!
          </h1>

          {/* Subheading */}
          <p className="text-xs sm:text-sm font-extrabold text-[#FF6B00] font-heading uppercase tracking-wider mt-1">
            Ready to build your network?
          </p>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-xs mx-auto">
            Enter your details and get ready to take the challenge.
          </p>
        </div>

        {/* Failure / Retry Banner */}
        {submitError && (
          <div
            id="reg-error-banner"
            className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex flex-col gap-2.5"
          >
            <div className="flex items-start gap-2">
              <span className="font-bold shrink-0 mt-0.5">⚠️</span>
              <span className="font-semibold leading-relaxed">{submitError}</span>
            </div>
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isLoading}
              className="self-end px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black rounded-lg text-xs transition-all cursor-pointer font-heading tracking-wider"
            >
              RETRY
            </button>
          </div>
        )}

        {/* Form Fields in strict order */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* FIELD 1: FULL NAME * */}
          <div>
            <label
              htmlFor="reg-name-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              FULL NAME <span className="text-[#FF6B00]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="reg-name-input"
                type="text"
                required
                maxLength={80}
                autoComplete="name"
                inputMode="text"
                value={name}
                onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                onChange={(e) => {
                  setName(e.target.value);
                  setSubmitError(null);
                  if (errors.name) {
                    setErrors((prev) => ({ ...prev, name: undefined }));
                  }
                }}
                placeholder="e.g. Mimansa Saini"
                className={`w-full pl-10 pr-3.5 py-3 rounded-xl border text-slate-900 placeholder:text-slate-400 text-[16px] sm:text-sm focus:outline-none transition-colors bg-white ${
                  touched.name && errors.name
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                    : 'border-slate-300 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20'
                }`}
                disabled={isLoading}
              />
            </div>
            {touched.name && errors.name && (
              <p className="text-[11px] font-semibold text-rose-600 mt-1 pl-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* FIELD 2: EMAIL * */}
          <div>
            <label
              htmlFor="reg-email-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              EMAIL <span className="text-[#FF6B00]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="reg-email-input"
                type="email"
                required
                maxLength={120}
                autoComplete="email"
                inputMode="email"
                value={email}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSubmitError(null);
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                placeholder="e.g. mimansa@email.com"
                className={`w-full pl-10 pr-3.5 py-3 rounded-xl border text-slate-900 placeholder:text-slate-400 text-[16px] sm:text-sm focus:outline-none transition-colors bg-white ${
                  touched.email && errors.email
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                    : 'border-slate-300 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20'
                }`}
                disabled={isLoading}
              />
            </div>
            {touched.email && errors.email && (
              <p className="text-[11px] font-semibold text-rose-600 mt-1 pl-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* FIELD 3: DO YOU OWN A BUSINESS OR STARTUP? * */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              DO YOU OWN A BUSINESS OR STARTUP? <span className="text-[#FF6B00]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {/* YES BUTTON */}
              <button
                id="business-owner-yes-btn"
                type="button"
                onClick={() => {
                  setBusinessOwner(true);
                  setSubmitError(null);
                  setTouched((prev) => ({ ...prev, businessOwner: true }));
                  setErrors((prev) => ({ ...prev, businessOwner: undefined }));
                }}
                disabled={isLoading}
                className={`min-h-[48px] h-12 py-3 px-4 rounded-xl font-extrabold font-heading text-sm sm:text-base flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  businessOwner === true
                    ? 'bg-[#FF6B00] text-white shadow-md shadow-orange-500/25 border border-transparent'
                    : 'bg-white text-[#0F172A] border border-slate-200 hover:border-orange-300 hover:bg-orange-50/40'
                }`}
              >
                {businessOwner === true && <Check className="w-4 h-4 stroke-[3]" />}
                <span>YES</span>
              </button>

              {/* NO BUTTON */}
              <button
                id="business-owner-no-btn"
                type="button"
                onClick={() => {
                  setBusinessOwner(false);
                  setSubmitError(null);
                  setTouched((prev) => ({ ...prev, businessOwner: true }));
                  setErrors((prev) => ({ ...prev, businessOwner: undefined }));
                }}
                disabled={isLoading}
                className={`min-h-[48px] h-12 py-3 px-4 rounded-xl font-extrabold font-heading text-sm sm:text-base flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  businessOwner === false
                    ? 'bg-[#FF6B00] text-white shadow-md shadow-orange-500/25 border border-transparent'
                    : 'bg-white text-[#0F172A] border border-slate-200 hover:border-orange-300 hover:bg-orange-50/40'
                }`}
              >
                {businessOwner === false && <Check className="w-4 h-4 stroke-[3]" />}
                <span>NO</span>
              </button>
            </div>
            {touched.businessOwner && errors.businessOwner && (
              <p className="text-[11px] font-semibold text-rose-600 mt-1 pl-1">
                {errors.businessOwner}
              </p>
            )}
          </div>

          {/* FIELD 4: INSTAGRAM ID (OPTIONAL) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="reg-instagram-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                INSTAGRAM ID
              </label>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                OPTIONAL
              </span>
            </div>
            <div
              className="flex rounded-xl border border-slate-300 bg-white overflow-hidden transition-colors focus-within:border-[#FF6B00] focus-within:ring-2 focus-within:ring-[#FF6B00]/20"
            >
              {/* Separate @ prefix badge */}
              <span className="inline-flex items-center px-3.5 bg-slate-50 border-r border-slate-200 text-slate-600 font-black text-sm select-none font-heading">
                @
              </span>
              <input
                id="reg-instagram-input"
                type="text"
                maxLength={60}
                autoComplete="off"
                inputMode="text"
                value={instagram}
                onChange={(e) => {
                  // Automatically strip any typed @ prefix so user never has double @@
                  const cleaned = e.target.value.replace(/^@+/, '');
                  setInstagram(cleaned);
                }}
                placeholder="username"
                className="w-full px-3 py-3 text-slate-900 placeholder:text-slate-400 text-[16px] sm:text-sm focus:outline-none bg-transparent"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* FIELD 5: CONTACT NO. (OPTIONAL) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="reg-contact-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                CONTACT NO.
              </label>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                OPTIONAL
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="reg-contact-input"
                type="tel"
                maxLength={25}
                autoComplete="tel"
                inputMode="tel"
                value={contactNumber}
                onBlur={() => setTouched((prev) => ({ ...prev, contactNumber: true }))}
                onChange={(e) => {
                  setContactNumber(e.target.value);
                  setSubmitError(null);
                  if (errors.contactNumber) {
                    setErrors((prev) => ({ ...prev, contactNumber: undefined }));
                  }
                }}
                placeholder="e.g. +91 98765 43210"
                className={`w-full pl-10 pr-3.5 py-3 rounded-xl border text-slate-900 placeholder:text-slate-400 text-[16px] sm:text-sm focus:outline-none transition-colors bg-white ${
                  touched.contactNumber && errors.contactNumber
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10'
                    : 'border-slate-300 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20'
                }`}
                disabled={isLoading}
              />
            </div>
            {touched.contactNumber && errors.contactNumber && (
              <p className="text-[11px] font-semibold text-rose-600 mt-1 pl-1">
                {errors.contactNumber}
              </p>
            )}
          </div>

          {/* PRIMARY CTA BUTTON (min 44px touch target) */}
          <div className="pt-2">
            <button
              id="btn-submit-registration"
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full min-h-[50px] h-12 sm:h-13 bg-[#FF6B00] hover:bg-[#E55A00] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#FF6B00] disabled:active:scale-100 text-white font-extrabold text-sm sm:text-base rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer font-heading tracking-wide"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Connecting to Speedo Hub...</span>
                </>
              ) : (
                <>
                  <span>LET&apos;S PLAY</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security & Fast Play Notice */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-slate-400 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Quick play session • No password or account required</span>
        </div>
      </div>
    </div>
  );
};

