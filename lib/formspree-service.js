/**
 * MRVConsultants - Formspree Email & Enquiry Service Module
 * Dispatches verified and sanitized customer enquiries to Formspree endpoint.
 * Zero external heavy dependencies; uses native fetch.
 */

const { toSingleLine } = require('./security');

function getFormspreeConfig() {
  const formId = (process.env.FORMSPREE_FORM_ID || '').trim();
  const customEndpoint = (process.env.FORMSPREE_ENDPOINT || '').trim();
  const targetEmail = (process.env.FEEDBACK_TO_EMAIL || 'mrvcconsultants@gmail.com').trim();

  // If a full URL is provided in FORMSPREE_ENDPOINT use it, else form https://formspree.io/f/<id>
  let endpoint = '';
  if (customEndpoint) {
    endpoint = customEndpoint;
  } else if (formId) {
    endpoint = `https://formspree.io/f/${formId}`;
  } else {
    // Default fallback or simulated dev endpoint
    endpoint = `https://formspree.io/f/mrvcconsultants`;
  }

  return { formId, endpoint, targetEmail };
}

/**
 * Send enquiry or feedback to Formspree
 * @param {object} sanitizedData 
 * @returns {Promise<{ success: boolean, id?: string }>}
 */
async function sendFormspreeEnquiry(sanitizedData) {
  const { endpoint, targetEmail } = getFormspreeConfig();
  const t = sanitizedData.text || {};

  const plainService = toSingleLine(t.service || 'General Enquiry');
  const plainType = toSingleLine(t.enquiryType || t.category || 'Service Enquiry');
  const subject = `MRVC New Enquiry - ${plainService} - ${plainType}`.slice(0, 200);

  const payload = {
    _replyto: sanitizedData.email,
    _subject: subject,
    _to: targetEmail,
    fullName: t.fullName || t.name || 'Anonymous Visitor',
    email: sanitizedData.email,
    whatsappNumber: t.whatsappNumber || 'N/A',
    callingNumber: t.callingNumber || 'N/A',
    sameCallingNumber: sanitizedData.sameCallingNumber ? 'Yes' : 'No',
    service: plainService,
    enquiryType: plainType,
    destination: t.destination || 'Not specified',
    message: sanitizedData.rawMessage || t.message || '',
    privacyPolicyAccepted: 'Yes',
    policyVersion: t.policyVersion || '2026-10-v1',
    submittedAt: new Date().toISOString(),
    website: 'MRVConsultants'
  };

  // If rating was provided (legacy feedback)
  if (sanitizedData.rating) {
    payload.rating = `${sanitizedData.rating} / 5 Stars`;
  }

  // In test environment or before Formspree form ID is connected, simulate successful delivery
  if (process.env.NODE_ENV === 'test' || !process.env.FORMSPREE_FORM_ID && !process.env.FORMSPREE_ENDPOINT) {
    console.log(`[MRVC Formspree] Submission staged for ${targetEmail} (Subject: ${subject})`);
    return { success: true, simulated: true, id: 'fs_' + Date.now() };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      let errMessage = `Formspree HTTP ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson && errJson.errors && Array.isArray(errJson.errors)) {
          errMessage = errJson.errors.map(e => e.message).join(', ');
        } else if (errJson && errJson.error) {
          errMessage = errJson.error;
        }
      } catch (e) {}
      throw new Error(errMessage);
    }

    const resData = await response.json().catch(() => ({ ok: true }));
    return { success: true, id: resData.id || 'fs_' + Date.now() };
  } catch (error) {
    clearTimeout(timeout);
    throw new Error(error.message || 'Formspree service connection error');
  }
}

// Backwards-compatible aliases
async function sendFeedbackEmail(sanitizedData) {
  return sendFormspreeEnquiry(sanitizedData);
}

async function sendConsultationEmail(sanitizedData) {
  return sendFormspreeEnquiry(sanitizedData);
}

module.exports = {
  sendFormspreeEnquiry,
  sendFeedbackEmail,
  sendConsultationEmail,
  getFormspreeConfig,
  getConfig: getFormspreeConfig
};
