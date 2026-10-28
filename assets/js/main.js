/**
 * MRVConsultants - Core Frontend Script
 * Multilingual Translation (EN, TA, SI), Formspree Enquiry Form Handling,
 * Dynamic Sync, Accessible Modals, and Lightbox Gallery.
 */

// Comprehensive 3-language translations dictionary
const I18N = {
  'en-US': {
    brandTagline: 'Your Future • Our Guidance',
    navHome: 'Home',
    navAbout: 'About Us',
    navServices: 'Services',
    navDestinations: 'Study Destinations',
    navGallery: 'Professional Images',
    navContact: 'Contact Us',
    navEnquireBtn: 'Enquire Now →',
    
    // Form Labels & Placeholders
    formTitle: 'Service Enquiry & Feedback',
    formSubtitle: 'MRVConsultants · Contact Us',
    formDesc: 'Interested in our services or have a question? Send us your enquiry and our team can contact you using the details provided.',
    labelFullName: 'Full Name *',
    phFullName: 'Enter your full name',
    labelEmail: 'Email Address *',
    phEmail: 'Enter your email address',
    contactNumbersTitle: 'Client Contact Numbers',
    labelWhatsapp: 'WhatsApp Number *',
    phWhatsapp: '+94 77 123 4567',
    sameNumberCheckbox: 'My calling number is the same as my WhatsApp number',
    labelCalling: 'Calling Number *',
    phCalling: '+94 76 123 4567',
    phoneHelpText: 'Include the country code, for example +94 for Sri Lanka.',
    labelService: 'Select a Service *',
    phService: 'Choose your service',
    labelDestination: 'Interested Study Destination (Optional)',
    phDestination: 'Select destination',
    labelEnquiryType: 'Enquiry Type *',
    phEnquiryType: 'Select enquiry type',
    labelMessage: 'Your Message / Enquiry *',
    phMessage: 'Tell us what you need help with or share your feedback...',
    privacyConsentText: 'I have read and agree to the Privacy Policy and consent to MRVConsultants using my contact information to respond to my enquiry. *',
    
    // Services
    srvLanguage: 'Language Classes',
    srvCounselling: 'Student Counselling',
    srvCourse: 'Course Selection',
    srvUniversity: 'University Selection',
    srvAdmission: 'Admission Assistance',
    srvVisa: 'Student Visa Guidance',
    srvDocs: 'Documentation Support',
    srvFinance: 'Financial Guidance',
    srvInterview: 'Interview Preparation',
    srvPreDeparture: 'Pre-departure Guidance',

    // Enquiry Types
    typeEnquiry: 'Service Enquiry',
    typeQuestion: 'General Question',
    typeFeedback: 'Feedback',
    typeConsultation: 'Request a Consultation',
    typeOther: 'Other',

    // Buttons & Status
    btnSubmit: 'Submit Enquiry',
    btnSubmitting: 'Submitting your enquiry...',
    msgSuccess: 'Thank you! Your enquiry has been submitted successfully.',
    msgError: 'Unable to submit your enquiry. Please try again.',
    errName: 'Please enter your full name (2–100 characters).',
    errEmail: 'Please enter a valid email address.',
    errWhatsapp: 'Please enter your WhatsApp number with country code.',
    errCalling: 'Please enter your calling number with country code.',
    errService: 'Please select a service from the list.',
    errMessage: 'Please enter your message (at least 10 characters).',
    errConsent: 'You must agree to the Privacy Policy to submit your enquiry.'
  },

  'ta-LK': {
    brandTagline: 'உங்கள் எதிர்காலம் • எங்கள் வழிகாட்டல்',
    navHome: 'முகப்பு',
    navAbout: 'எங்களை பற்றி',
    navServices: 'சேவைகள்',
    navDestinations: 'படிப்பு நாடுகள்',
    navGallery: 'புகைப்படங்கள்',
    navContact: 'தொடர்புகொள்ள',
    navEnquireBtn: 'விசாரிக்க →',

    // Form
    formTitle: 'சேவை விசாரணை & பின்னூட்டம்',
    formSubtitle: 'MRVConsultants · தொடர்பு கொள்ளவும்',
    formDesc: 'எங்கள் சேவைகளில் ஆர்வமா அல்லது ஏதேனும் கேள்விகள் உள்ளதா? உங்கள் விசாரணையை அனுப்புங்கள், எங்கள் குழு உங்களை தொடர்பு கொள்ளும்.',
    labelFullName: 'முழு பெயர் *',
    phFullName: 'உங்கள் முழு பெயரை உள்ளிடவும்',
    labelEmail: 'மின்னஞ்சல் முகவரி *',
    phEmail: 'உங்கள் மின்னஞ்சலை உள்ளிடவும்',
    contactNumbersTitle: 'தொடர்பு எண்கள்',
    labelWhatsapp: 'WhatsApp எண் *',
    phWhatsapp: '+94 77 123 4567',
    sameNumberCheckbox: 'எனது அழைப்பு எண் எனது WhatsApp எண்ணைப் போன்றதே',
    labelCalling: 'அழைப்பு எண் (Calling Number) *',
    phCalling: '+94 76 123 4567',
    phoneHelpText: 'நாட்டின் குறியீட்டை சேர்க்கவும், எ.கா. இலங்கைக்கு +94.',
    labelService: 'சேவையைத் தேர்ந்தெடுக்கவும் *',
    phService: 'உங்கள் சேவையைத் தேர்ந்தெடுக்கவும்',
    labelDestination: 'விரும்பும் படிப்பு நாடு (விருப்பமானது)',
    phDestination: 'நாட்டைத் தேர்ந்தெடுக்கவும்',
    labelEnquiryType: 'விசாரணை வகை *',
    phEnquiryType: 'வகையைத் தேர்ந்தெடுக்கவும்',
    labelMessage: 'உங்கள் செய்தி / விசாரணை *',
    phMessage: 'உங்களுக்கு என்ன உதவி தேவை என்பதை விவரிக்கவும் அல்லது கருத்துக்களைப் பகிரவும்...',
    privacyConsentText: 'நான் தனியுரிமைக் கொள்கையைப் படித்து ஒப்புக்கொள்கிறேன், எனது விசாரணைக்கு பதிலளிக்க எனது தகவலை MRVConsultants பயன்படுத்த சம்மதிக்கிறேன். *',

    // Services
    srvLanguage: 'மொழிப் பயிற்சிகள் (Language Classes)',
    srvCounselling: 'மாணவர் ஆலோசனை (Student Counselling)',
    srvCourse: 'பாடநெறித் தெரிவு (Course Selection)',
    srvUniversity: 'பல்கலைக்கழகத் தெரிவு (University Selection)',
    srvAdmission: 'சேர்க்கை உதவி (Admission Assistance)',
    srvVisa: 'மாணவர் விசா வழிகாட்டல் (Student Visa Guidance)',
    srvDocs: 'ஆவணப்படுத்தல் ஆதரவு (Documentation Support)',
    srvFinance: 'நிதி வழிகாட்டல் (Financial Guidance)',
    srvInterview: 'நேர்காணல் தயாரிப்பு (Interview Preparation)',
    srvPreDeparture: 'புறப்படுவதற்கு முந்தைய வழிகாட்டல் (Pre-departure Guidance)',

    // Enquiry Types
    typeEnquiry: 'சேவை விசாரணை',
    typeQuestion: 'பொதுவான கேள்வி',
    typeFeedback: 'பின்னூட்டம்',
    typeConsultation: 'ஆலோசனை கோரிக்கை',
    typeOther: 'மற்றவை',

    // Buttons & Status
    btnSubmit: 'விசாரணையை சமர்ப்பிக்கவும்',
    btnSubmitting: 'சமர்ப்பிக்கப்படுகிறது...',
    msgSuccess: 'நன்றி! உங்கள் விசாரணை வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது.',
    msgError: 'விசாரணையை சமர்ப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
    errName: 'தயவுசெய்து உங்கள் முழு பெயரை உள்ளிடவும்.',
    errEmail: 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.',
    errWhatsapp: 'நாட்டுக்குறியீட்டுடன் WhatsApp எண்ணை உள்ளிடவும்.',
    errCalling: 'நாட்டுக்குறியீட்டுடன் அழைப்பு எண்ணை உள்ளிடவும்.',
    errService: 'பட்டியலில் இருந்து ஒரு சேவையைத் தேர்ந்தெடுக்கவும்.',
    errMessage: 'தயவுசெய்து உங்கள் செய்தியை உள்ளிடவும் (குறைந்தது 10 எழுத்துக்கள்).',
    errConsent: 'தனியுரிமைக் கொள்கையை ஏற்றுக்கொள்வது கட்டாயமாகும்.'
  },

  'si-LK': {
    brandTagline: 'ඔබේ අනාගතය • අපේ මඟපෙන්වීම',
    navHome: 'මුල් පිටුව',
    navAbout: 'අප ගැන',
    navServices: 'සේවාවන්',
    navDestinations: 'අධ්‍යාපන රටවල්',
    navGallery: 'ඡායාරූප',
    navContact: 'සම්බන්ධ වන්න',
    navEnquireBtn: 'විමසන්න →',

    // Form
    formTitle: 'සේවා විමසීම් සහ ප්‍රතිපෝෂණ',
    formSubtitle: 'MRVConsultants · අප හා සම්බන්ධ වන්න',
    formDesc: 'අපගේ සේවාවන් පිළිබඳව විමසීමට හෝ ප්‍රශ්නයක් ඇත්නම්, ඔබගේ විමසීම එවන්න. අපගේ කණ්ඩායම ඔබ හා සම්බන්ධ වනු ඇත.',
    labelFullName: 'සම්පූර්ණ නම *',
    phFullName: 'ඔබගේ සම්පූර්ණ නම ඇතුළත් කරන්න',
    labelEmail: 'විද්‍යුත් තැපෑල *',
    phEmail: 'ඔබගේ විද්‍යුත් තැපෑල ඇතුළත් කරන්න',
    contactNumbersTitle: 'සම්බන්ධතා දුරකථන අංක',
    labelWhatsapp: 'WhatsApp අංකය *',
    phWhatsapp: '+94 77 123 4567',
    sameNumberCheckbox: 'මගේ ඇමතුම් අංකය WhatsApp අංකයම වේ',
    labelCalling: 'ඇමතුම් අංකය *',
    phCalling: '+94 76 123 4567',
    phoneHelpText: 'රටේ කේතය ඇතුළත් කරන්න (උදා: ශ්‍රී ලංකාව සඳහා +94).',
    labelService: 'සේවාව තෝරන්න *',
    phService: 'ඔබේ සේවාව තෝරන්න',
    labelDestination: 'අධ්‍යයනයට කැමති රට (විකල්ප)',
    phDestination: 'රට තෝරන්න',
    labelEnquiryType: 'විමසීම් වර්ගය *',
    phEnquiryType: 'වර්ගය තෝරන්න',
    labelMessage: 'ඔබගේ පණිවිඩය / විමසීම *',
    phMessage: 'ඔබට අවශ්‍ය සහය හෝ ප්‍රතිපෝෂණය මෙහි සටහන් කරන්න...',
    privacyConsentText: 'මම රහස්‍යතා ප්‍රතිපත්තිය කියවා එකඟ වන අතර, මගේ විමසීමට පිළිතුරු දීමට MRVConsultants වෙත මගේ තොරතුරු භාවිතා කිරීමට කැමැත්තෙමි. *',

    // Services
    srvLanguage: 'භාෂා පන්ති (Language Classes)',
    srvCounselling: 'ශිෂ්‍ය උපදේශනය (Student Counselling)',
    srvCourse: 'පාඨමාලා තේරීම (Course Selection)',
    srvUniversity: 'විශ්වවිද්‍යාල තේරීම (University Selection)',
    srvAdmission: 'ඇතුළත් වීමේ සහය (Admission Assistance)',
    srvVisa: 'ශිෂ්‍ය වීසා මඟපෙන්වීම (Student Visa Guidance)',
    srvDocs: 'ලේඛන සහය (Documentation Support)',
    srvFinance: 'මූල්‍ය මඟපෙන්වීම (Financial Guidance)',
    srvInterview: 'සම්මුඛ පරීක්ෂණ සූදානම (Interview Preparation)',
    srvPreDeparture: 'පිටත්වීමට පෙර මඟපෙන්වීම (Pre-departure Guidance)',

    // Enquiry Types
    typeEnquiry: 'සේවා විමසීම',
    typeQuestion: 'සාමාන්‍ය ප්‍රශ්නයක්',
    typeFeedback: 'ප්‍රතිපෝෂණය',
    typeConsultation: 'උපදේශනයක් ඉල්ලීම',
    typeOther: 'වෙනත්',

    // Buttons & Status
    btnSubmit: 'විමසීම යොමු කරන්න',
    btnSubmitting: 'යොමු වෙමින් පවතී...',
    msgSuccess: 'ස්තූතියි! ඔබගේ විමසීම සාර්ථකව යොමු කරන ලදී.',
    msgError: 'විමසීම යොමු කිරීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.',
    errName: 'කරුණාකර ඔබගේ සම්පූර්ණ නම ඇතුළත් කරන්න.',
    errEmail: 'කරුණාකර නිවැරදි විද්‍යුත් තැපැල් ලිපිනයක් ඇතුළත් කරන්න.',
    errWhatsapp: 'කරුණාකර රටේ කේතය සමඟ WhatsApp අංකය ඇතුළත් කරන්න.',
    errCalling: 'කරුණාකර රටේ කේතය සමඟ ඇමතුම් අංකය ඇතුළත් කරන්න.',
    errService: 'ලැයිස්තුවෙන් සේවාවක් තෝරන්න.',
    errMessage: 'කරුණාකර ඔබගේ පණිවිඩය ඇතුළත් කරන්න (අවම වශයෙන් අකුරු 10 ක්).',
    errConsent: 'රහස්‍යතා ප්‍රතිපත්තියට එකඟ වීම අනිවාර්ය වේ.'
  }
};

// Normalize language codes to 'en', 'ta', or 'si'
function normalizeLang(code) {
  if (!code) return 'en';
  const c = code.toLowerCase();
  if (c.startsWith('ta')) return 'ta';
  if (c.startsWith('si')) return 'si';
  return 'en';
}

// Google Translate callback handler
window.googleTranslateElementInit = function() {
  if (window.google && window.google.translate) {
    new window.google.translate.TranslateElement({
      pageLanguage: 'en',
      includedLanguages: 'en,ta,si',
      layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
      autoDisplay: false
    }, 'google_translate_element');
  }
};

// Language options metadata matching LanguageSwitcher.tsx
const LANGUAGE_OPTIONS = [
  {
    code: 'en',
    name: 'English (US)',
    desktopLabel: 'English',
    mobileLabel: 'EN',
    flag: '🇺🇸',
    locale: 'en-US'
  },
  {
    code: 'si',
    name: 'සිංහල',
    desktopLabel: 'සිංහල',
    mobileLabel: 'SI',
    flag: '🇱🇰',
    locale: 'si-LK'
  },
  {
    code: 'ta',
    name: 'தமிழ்',
    desktopLabel: 'தமிழ்',
    mobileLabel: 'TA',
    flag: '🇱🇰',
    locale: 'ta-LK'
  }
];

// Determine initial language from localStorage ('language' or 'mrvc_lang') or googtrans cookie
function getSavedLanguage() {
  try {
    const savedPrimary = localStorage.getItem('language');
    if (savedPrimary) {
      return normalizeLang(savedPrimary);
    }
    const savedLegacy = localStorage.getItem('mrvc_lang');
    if (savedLegacy) {
      return normalizeLang(savedLegacy);
    }
  } catch (_) {}

  const match = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([a-zA-Z\-]+)/);
  if (match && match[1]) {
    return normalizeLang(match[1]);
  }
  return 'en';
}

let currentLang = getSavedLanguage();

// Apply dictionary translations
function applyTranslations(lang) {
  const norm = normalizeLang(lang);
  const dictKey = norm === 'ta' ? 'ta-LK' : (norm === 'si' ? 'si-LK' : 'en-US');
  const dict = I18N[dictKey] || I18N['en-US'];

  document.documentElement.setAttribute('lang', dictKey);

  // Update text elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(elem => {
    const key = elem.getAttribute('data-i18n');
    if (dict[key]) {
      elem.textContent = dict[key];
    }
  });

  // Update placeholders with data-i18n-ph
  document.querySelectorAll('[data-i18n-ph]').forEach(elem => {
    const key = elem.getAttribute('data-i18n-ph');
    if (dict[key]) {
      elem.setAttribute('placeholder', dict[key]);
    }
  });
}

// Update the floating LanguageSwitcher UI state to reflect the active language
function updateLanguageSwitcherUI(langCode) {
  const norm = normalizeLang(langCode);
  const activeOpt = LANGUAGE_OPTIONS.find(o => o.code === norm) || LANGUAGE_OPTIONS[0];

  document.querySelectorAll('.mrvc-lang-switcher').forEach(switcher => {
    const desktopLbl = switcher.querySelector('.mrvc-lang-label-desktop');
    const mobileLbl = switcher.querySelector('.mrvc-lang-label-mobile');
    const triggerBtn = switcher.querySelector('.mrvc-lang-trigger');

    if (desktopLbl) desktopLbl.textContent = activeOpt.desktopLabel;
    if (mobileLbl) mobileLbl.textContent = activeOpt.mobileLabel;
    if (triggerBtn) {
      triggerBtn.setAttribute(
        'aria-label',
        `Current language: ${activeOpt.name}. Click to change language`
      );
    }

    switcher.querySelectorAll('.mrvc-lang-option').forEach(optBtn => {
      const code = optBtn.getAttribute('data-lang-code');
      const isSelected = code === norm;
      optBtn.classList.toggle('is-active', isSelected);
      optBtn.setAttribute('aria-selected', isSelected ? 'true' : 'false');

      let checkEl = optBtn.querySelector('.mrvc-lang-check');
      if (isSelected && !checkEl) {
        checkEl = document.createElement('span');
        checkEl.className = 'mrvc-lang-check';
        checkEl.setAttribute('aria-hidden', 'true');
        checkEl.textContent = '✔';
        optBtn.appendChild(checkEl);
      } else if (!isSelected && checkEl) {
        checkEl.remove();
      }
    });
  });
}

// Change site language across UI dictionary, localStorage, and Google Translate engine
function changeSiteLanguage(targetLang) {
  const norm = normalizeLang(targetLang);
  const prevLang = currentLang;

  try {
    localStorage.setItem('language', norm);
    localStorage.setItem('mrvc_lang', norm);
  } catch (_) {}

  currentLang = norm;

  // Set Google Translate cookie
  const hostname = window.location.hostname;
  const cookieValue = `/en/${norm}`;
  document.cookie = `googtrans=${cookieValue}; path=/;`;
  if (hostname && hostname !== 'localhost') {
    document.cookie = `googtrans=${cookieValue}; domain=.${hostname}; path=/;`;
    document.cookie = `googtrans=${cookieValue}; domain=${hostname}; path=/;`;
  }

  // Update any legacy select elements and the floating LanguageSwitcher UI
  document.querySelectorAll('#lang-select, .lang-select').forEach(sel => {
    sel.value = norm;
  });
  updateLanguageSwitcherUI(norm);

  // Apply instant text translations for core components
  applyTranslations(norm);

  // Trigger Google Translate engine combo if available
  const combo = document.querySelector('.goog-te-combo');
  if (combo) {
    combo.value = norm;
    combo.dispatchEvent(new Event('change'));
  } else if (prevLang !== norm && norm !== 'en') {
    // If Google Translate combo is still loading for non-English full-page translation
    window.location.reload();
  } else if (prevLang !== 'en' && norm === 'en' && document.documentElement.classList.contains('translated-ltr')) {
    window.location.reload();
  }
}

window.changeSiteLanguage = changeSiteLanguage;

// Mount the reusable LanguageSwitcher component across all pages
function initLanguageSwitcher() {
  let dock = document.getElementById('floating-lang-dock');
  if (!dock) {
    dock = document.createElement('div');
    dock.id = 'floating-lang-dock';
    document.body.appendChild(dock);
  }

  dock.className = 'mrvc-lang-switcher';
  dock.setAttribute('aria-label', 'Language selector');

  const activeOpt = LANGUAGE_OPTIONS.find(o => o.code === currentLang) || LANGUAGE_OPTIONS[0];

  dock.innerHTML = `
    <div id="mrvc-lang-dropdown" class="mrvc-lang-dropdown" role="listbox" aria-label="Select Website Language" aria-hidden="true">
      <div class="mrvc-lang-dropdown-header">
        <span class="mrvc-lang-globe" aria-hidden="true">🌐</span>
        <span>Select Language</span>
      </div>
      <div class="mrvc-lang-options-list">
        ${LANGUAGE_OPTIONS.map(opt => {
          const isSelected = opt.code === currentLang;
          return `
            <button
              type="button"
              role="option"
              data-lang-code="${opt.code}"
              aria-selected="${isSelected ? 'true' : 'false'}"
              tabindex="-1"
              class="mrvc-lang-option${isSelected ? ' is-active' : ''}"
            >
              <span class="mrvc-lang-option-left">
                <span class="mrvc-lang-flag" aria-hidden="true">${opt.flag}</span>
                <span class="mrvc-lang-name">${opt.name}</span>
              </span>
              ${isSelected ? '<span class="mrvc-lang-check" aria-hidden="true">✔</span>' : ''}
            </button>
          `;
        }).join('')}
      </div>
    </div>
    <button
      type="button"
      class="mrvc-lang-trigger"
      aria-haspopup="listbox"
      aria-expanded="false"
      aria-controls="mrvc-lang-dropdown"
      aria-label="Current language: ${activeOpt.name}. Click to change language"
    >
      <span class="mrvc-lang-globe" aria-hidden="true">🌐</span>
      <span class="mrvc-lang-label-desktop">${activeOpt.desktopLabel}</span>
      <span class="mrvc-lang-label-mobile">${activeOpt.mobileLabel}</span>
      <span class="mrvc-lang-caret" aria-hidden="true">▼</span>
    </button>
  `;

  const triggerBtn = dock.querySelector('.mrvc-lang-trigger');
  const dropdown = dock.querySelector('.mrvc-lang-dropdown');
  const optionBtns = Array.from(dock.querySelectorAll('.mrvc-lang-option'));
  let isOpen = false;
  let focusedIndex = Math.max(0, LANGUAGE_OPTIONS.findIndex(o => o.code === currentLang));

  function setDropdownOpen(nextOpen, restoreFocus = false) {
    isOpen = nextOpen;
    dock.classList.toggle('is-open', isOpen);
    dropdown?.classList.toggle('is-open', isOpen);
    dropdown?.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    triggerBtn?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

    optionBtns.forEach(btn => {
      btn.setAttribute('tabindex', isOpen ? '0' : '-1');
    });

    if (isOpen) {
      focusedIndex = Math.max(0, LANGUAGE_OPTIONS.findIndex(o => o.code === currentLang));
      requestAnimationFrame(() => {
        optionBtns[focusedIndex]?.focus();
      });
    } else if (restoreFocus) {
      triggerBtn?.focus();
    }
  }

  triggerBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownOpen(!isOpen);
  });

  optionBtns.forEach((btn, idx) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const selectedCode = btn.getAttribute('data-lang-code') || 'en';
      focusedIndex = idx;
      setDropdownOpen(false, true);
      changeSiteLanguage(selectedCode);
    });
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (isOpen && !dock.contains(e.target)) {
      setDropdownOpen(false, false);
    }
  });

  // Full keyboard navigation (ArrowUp, ArrowDown, Escape, Home, End, Tab)
  dock.addEventListener('keydown', (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setDropdownOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setDropdownOpen(false, true);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusedIndex = (focusedIndex + 1) % optionBtns.length;
      optionBtns[focusedIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusedIndex = (focusedIndex - 1 + optionBtns.length) % optionBtns.length;
      optionBtns[focusedIndex]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusedIndex = 0;
      optionBtns[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      focusedIndex = optionBtns.length - 1;
      optionBtns[focusedIndex]?.focus();
    } else if (e.key === 'Tab') {
      setDropdownOpen(false, false);
    }
  });
}

// Ensure Google Translate container and script are injected
function ensureGoogleTranslateLoaded() {
  if (!document.getElementById('google_translate_element')) {
    const el = document.createElement('div');
    el.id = 'google_translate_element';
    el.style.display = 'none';
    document.body.appendChild(el);
  }

  if (!document.getElementById('google-translate-script')) {
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.type = 'text/javascript';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Dynamic copyright year
  const yearElem = document.getElementById('current-year');
  if (yearElem) {
    yearElem.textContent = new Date().getFullYear();
  }

  // 2. Mobile Menu Toggle
  const menuToggle = document.getElementById('menu-toggle') || document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav') || document.getElementById('nav-list');
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const willOpen = !mainNav.classList.contains('is-open');
      mainNav.classList.toggle('is-open', willOpen);
      menuToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });

    mainNav.querySelectorAll('.nav-link, a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close when tapping outside the mobile menu
    document.addEventListener('click', (e) => {
      if (mainNav.classList.contains('is-open') && !mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
        mainNav.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Reset mobile menu state on desktop resize or Escape key
    window.addEventListener('resize', () => {
      if (window.innerWidth > 992 && mainNav.classList.contains('is-open')) {
        mainNav.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
        mainNav.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 3. Header Scroll Effect
  const siteHeader = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      siteHeader?.classList.add('scrolled');
    } else {
      siteHeader?.classList.remove('scrolled');
    }
  }, { passive: true });

  // 4. Initialize Google Translate Script and Multilingual Switcher
  try {
    localStorage.setItem('language', currentLang);
    localStorage.setItem('mrvc_lang', currentLang);
  } catch (_) {}

  initLanguageSwitcher();
  ensureGoogleTranslateLoaded();

  document.querySelectorAll('#lang-select, .lang-select').forEach(sel => {
    sel.value = currentLang;
    sel.addEventListener('change', (e) => {
      changeSiteLanguage(e.target.value);
    });
  });

  applyTranslations(currentLang);

  // 5. Contact Numbers WhatsApp <-> Calling sync checkbox
  const whatsappInput = document.getElementById('enquiry-whatsapp');
  const callingInput = document.getElementById('enquiry-calling');
  const sameNumberCheckbox = document.getElementById('same-calling-number');

  if (sameNumberCheckbox && whatsappInput && callingInput) {
    sameNumberCheckbox.addEventListener('change', () => {
      if (sameNumberCheckbox.checked) {
        callingInput.value = whatsappInput.value;
        callingInput.setAttribute('readonly', 'true');
        callingInput.classList.add('synced-input');
      } else {
        callingInput.removeAttribute('readonly');
        callingInput.classList.remove('synced-input');
      }
    });

    whatsappInput.addEventListener('input', () => {
      if (sameNumberCheckbox.checked) {
        callingInput.value = whatsappInput.value;
      }
    });
  }

  // 6. Direct Service Selection from buttons across pages
  document.querySelectorAll('[data-select-service]').forEach(btn => {
    btn.addEventListener('click', () => {
      const serviceName = btn.getAttribute('data-select-service');
      const serviceSelect = document.getElementById('enquiry-service') || document.getElementById('consult-service');
      if (serviceSelect && serviceName) {
        serviceSelect.value = serviceName;
      }
    });
  });

  // 7. Service Enquiry & Feedback Form Handling
  const enquiryForm = document.getElementById('enquiry-form') || document.getElementById('consultation-form');
  const submitBtn = document.getElementById('enquiry-submit-btn') || document.getElementById('consult-submit-btn');
  const alertBox = document.getElementById('enquiry-alert') || document.getElementById('consult-alert');

  if (enquiryForm) {
    enquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearFormErrors(enquiryForm);
      hideAlert(alertBox);

      const t = I18N[currentLang] || I18N['en-US'];

      const fullName = enquiryForm.querySelector('#enquiry-name')?.value.trim() || '';
      const email = enquiryForm.querySelector('#enquiry-email')?.value.trim() || '';
      const whatsapp = enquiryForm.querySelector('#enquiry-whatsapp')?.value.trim() || '';
      const sameCalling = enquiryForm.querySelector('#same-calling-number')?.checked || false;
      const calling = sameCalling ? whatsapp : (enquiryForm.querySelector('#enquiry-calling')?.value.trim() || '');
      const service = enquiryForm.querySelector('#enquiry-service')?.value || '';
      const destination = enquiryForm.querySelector('#enquiry-destination')?.value || '';
      const enquiryType = enquiryForm.querySelector('#enquiry-type')?.value || 'Service Enquiry';
      const message = enquiryForm.querySelector('#enquiry-message')?.value.trim() || '';
      const consent = enquiryForm.querySelector('#enquiry-consent')?.checked || false;
      const honeypot = enquiryForm.querySelector('#enquiry-website')?.value || '';

      let hasError = false;

      // Validation
      if (!fullName || fullName.length < 2) {
        showFieldError('enquiry-name', t.errName);
        hasError = true;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        showFieldError('enquiry-email', t.errEmail);
        hasError = true;
      }

      const phoneRegex = /^\+?[0-9\s\-().]{7,20}$/;
      if (!whatsapp || !phoneRegex.test(whatsapp)) {
        showFieldError('enquiry-whatsapp', t.errWhatsapp);
        hasError = true;
      }

      if (!calling || !phoneRegex.test(calling)) {
        showFieldError('enquiry-calling', t.errCalling);
        hasError = true;
      }

      if (!service) {
        showFieldError('enquiry-service', t.errService);
        hasError = true;
      }

      if (!message || message.length < 10) {
        showFieldError('enquiry-message', t.errMessage);
        hasError = true;
      }

      if (!consent) {
        showFieldError('enquiry-consent', t.errConsent);
        hasError = true;
      }

      if (hasError) {
        showAlert(alertBox, t.errMessage ? 'Please correct the highlighted fields before submitting.' : 'Error', 'error');
        return;
      }

      // Turnstile CAPTCHA token if present
      const turnstileInput = enquiryForm.querySelector('[name="cf-turnstile-response"]');
      const turnstileToken = turnstileInput ? turnstileInput.value : '';

      const payload = {
        fullName,
        email,
        whatsappNumber: whatsapp,
        callingNumber: calling,
        sameCallingNumber: sameCalling,
        service,
        destination,
        enquiryType,
        message,
        consent,
        policyVersion: '2026-10-v1',
        lang: currentLang,
        website_url: honeypot
      };

      if (turnstileToken) {
        payload.cf_turnstile_response = turnstileToken;
      }

      setButtonLoading(submitBtn, true, t.btnSubmitting);

      // Silently drop spam bots filling the hidden honeypot field
      if (honeypot) {
        showAlert(alertBox, t.msgSuccess, 'success');
        enquiryForm.reset();
        setButtonLoading(submitBtn, false, t.btnSubmit);
        return;
      }

      const formspreeEndpoint = enquiryForm.getAttribute('action') || 'https://formspree.io/f/xoeewaan';
      const formspreePayload = {
        _subject: `MRVC New Enquiry - ${service} - ${enquiryType}`,
        _replyto: email,
        fullName,
        email,
        whatsappNumber: whatsapp,
        callingNumber: calling,
        sameCallingNumber: sameCalling ? 'Yes' : 'No',
        service,
        destination: destination || 'Not specified',
        enquiryType,
        message,
        privacyPolicyAccepted: consent ? 'Yes' : 'No',
        policyVersion: '2026-10-v1',
        lang: currentLang,
        submittedAt: new Date().toISOString()
      };

      try {
        let submittedOk = false;
        let errorMessage = t.msgError;

        // If running on static host (e.g. GitHub Pages), send directly to Formspree;
        // otherwise try local/serverless /api/feedback first and fall back to Formspree if unavailable.
        const isStaticHost = window.location.hostname.endsWith('github.io') || window.location.protocol === 'file:';

        if (!isStaticHost) {
          try {
            const apiRes = await fetch('/api/feedback', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(payload)
            });

            if (apiRes.status !== 404 && apiRes.status !== 405) {
              const apiData = await apiRes.json().catch(() => ({}));
              if (apiRes.ok && apiData.success) {
                submittedOk = true;
              } else if (apiData.error) {
                errorMessage = apiData.error;
              }
            }
          } catch (_) {
            // Fall through to direct Formspree submission
          }
        }

        if (!submittedOk) {
          const fsRes = await fetch(formspreeEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(formspreePayload)
          });

          const fsData = await fsRes.json().catch(() => ({}));
          if (fsRes.ok) {
            submittedOk = true;
          } else if (fsData && Array.isArray(fsData.errors) && fsData.errors.length > 0) {
            errorMessage = fsData.errors.map(err => err.message).join(', ');
          }
        }

        if (submittedOk) {
          showAlert(alertBox, t.msgSuccess, 'success');
          enquiryForm.reset();
          if (callingInput) {
            callingInput.removeAttribute('readonly');
            callingInput.classList.remove('synced-input');
          }
        } else {
          showAlert(alertBox, errorMessage, 'error');
        }
      } catch (networkErr) {
        showAlert(alertBox, t.msgError, 'error');
      } finally {
        setButtonLoading(submitBtn, false, t.btnSubmit);
      }
    });
  }

  // 8. Gallery Filters & Fullscreen Lightbox Modal (for gallery.html)
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  let currentGalleryList = [];
  let currentActiveIndex = 0;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter') || 'all';

      galleryItems.forEach(item => {
        const itemCat = item.getAttribute('data-category') || '';
        if (filter === 'all' || itemCat === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
      updateCurrentGalleryList();
    });
  });

  function updateCurrentGalleryList() {
    currentGalleryList = Array.from(galleryItems).filter(item => item.style.display !== 'none');
  }
  updateCurrentGalleryList();

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      updateCurrentGalleryList();
      currentActiveIndex = currentGalleryList.indexOf(item);
      openLightbox(currentActiveIndex);
    });
  });

  function openLightbox(index) {
    if (!lightbox || index < 0 || index >= currentGalleryList.length) return;
    const targetItem = currentGalleryList[index];
    const imgElem = targetItem.querySelector('img');
    const captionElem = targetItem.querySelector('.gallery-caption') || targetItem.querySelector('p');

    if (lightboxImg && imgElem) {
      lightboxImg.src = imgElem.src;
      lightboxImg.alt = imgElem.alt || 'MRVConsultants Gallery Image';
    }
    if (lightboxCaption && captionElem) {
      lightboxCaption.textContent = captionElem.textContent;
    }
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
      lightbox?.classList.remove('is-open');
      lightbox?.setAttribute('aria-hidden', 'true');
    });
  }

  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentGalleryList.length === 0) return;
      currentActiveIndex = (currentActiveIndex - 1 + currentGalleryList.length) % currentGalleryList.length;
      openLightbox(currentActiveIndex);
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentGalleryList.length === 0) return;
      currentActiveIndex = (currentActiveIndex + 1) % currentGalleryList.length;
      openLightbox(currentActiveIndex);
    });
  }

  // 9. Study Destinations Details Modal (for destinations.html)
  const destModal = document.getElementById('dest-modal');
  const destModalClose = document.getElementById('dest-modal-close');
  const destModalTitle = document.getElementById('dest-modal-title');
  const destModalBody = document.getElementById('dest-modal-body');

  document.querySelectorAll('[data-open-dest]').forEach(btn => {
    btn.addEventListener('click', () => {
      const destKey = btn.getAttribute('data-open-dest');
      const card = btn.closest('.dest-card');
      if (destModal && card) {
        const title = card.querySelector('.dest-title')?.textContent || 'Destination Details';
        const desc = card.querySelector('.dest-desc')?.textContent || '';
        const details = card.querySelector('.dest-extra-details')?.innerHTML || desc;

        if (destModalTitle) destModalTitle.textContent = title;
        if (destModalBody) destModalBody.innerHTML = details;

        destModal.classList.add('is-open');
        destModal.setAttribute('aria-hidden', 'false');
      }
    });
  });

  if (destModalClose) {
    destModalClose.addEventListener('click', () => {
      destModal?.classList.remove('is-open');
      destModal?.setAttribute('aria-hidden', 'true');
    });
  }

  // Close modals on Esc or backdrop click
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      lightbox?.classList.remove('is-open');
      destModal?.classList.remove('is-open');
    }
  });

  [lightbox, destModal].forEach(modal => {
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('is-open');
      }
    });
  });

  // Helper UI functions
  function setButtonLoading(btn, isLoading, text) {
    if (!btn) return;
    btn.disabled = isLoading;
    if (isLoading) {
      btn.innerHTML = `<span class="spinner" aria-hidden="true"></span> <span>${text}</span>`;
    } else {
      btn.innerHTML = text;
    }
  }

  function showAlert(alertElem, message, type) {
    if (!alertElem) return;
    alertElem.className = `form-alert alert-${type}`;
    alertElem.textContent = message;
    alertElem.style.display = 'flex';
    alertElem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideAlert(alertElem) {
    if (!alertElem) return;
    alertElem.style.display = 'none';
  }

  function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
      field.classList.add('is-invalid');
      const errElem = document.getElementById(`${fieldId}-error`);
      if (errElem) {
        errElem.textContent = message;
        errElem.classList.add('active');
      }
    }
  }

  function clearFormErrors(form) {
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    form.querySelectorAll('.field-error').forEach(el => {
      el.classList.remove('active');
      el.textContent = '';
    });
  }
});

