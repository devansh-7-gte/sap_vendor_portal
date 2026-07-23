// Verifies a vendor's declared GSTIN and PAN, either against a mocked check
// (default) or a live third-party verification API, depending on
// GSTIN_PAN_VERIFY_MOCK_MODE. This is the single source of truth for whether
// a vendor's GSTIN/PAN are considered verified — controllers must not set
// gstinVerified/panVerified any other way.

const GSTIN_REGEX = /^[0-9]{2}[A-Z0-9]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
const PAN_REGEX = /^[A-Z0-9]{5}[0-9]{4}[A-Z]{1}$/i;

const isMockMode = () => process.env.GSTIN_PAN_VERIFY_MOCK_MODE !== 'false';

// Mock check: validates format and confirms the PAN is embedded in the GSTIN
// (GSTIN characters 3-12 are always the taxpayer's PAN), the same
// cross-check a real verification provider would perform.
const verifyMock = async (gstin, pan) => {
  const gstinValid = GSTIN_REGEX.test(gstin || '');
  const panValid = PAN_REGEX.test(pan || '');
  const panMatchesGstin = gstinValid && panValid && gstin.slice(2, 12).toUpperCase() === pan.toUpperCase();

  return {
    provider: 'MOCK',
    gstinValid,
    panValid: panValid && panMatchesGstin,
    checkedAt: new Date().toISOString()
  };
};

const verifyLive = async (gstin, pan) => {
  const apiUrl = process.env.GSTIN_PAN_VERIFY_API_URL;
  const apiKey = process.env.GSTIN_PAN_VERIFY_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error('GSTIN/PAN verification API is not configured (GSTIN_PAN_VERIFY_API_URL / GSTIN_PAN_VERIFY_API_KEY)');
  }

  const response = await fetch(`${apiUrl}?gstin=${encodeURIComponent(gstin)}&pan=${encodeURIComponent(pan)}`, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });

  if (!response.ok) {
    throw new Error(`GSTIN/PAN verification API returned status ${response.status}`);
  }

  const data = await response.json();
  return {
    provider: 'LIVE',
    gstinValid: !!data.gstinValid,
    panValid: !!data.panValid,
    checkedAt: new Date().toISOString()
  };
};

// Returns { gstinValid, panValid, provider, checkedAt } and never throws —
// a failed/misconfigured lookup is reported as unverified rather than
// crashing the caller, so approval stays blocked by default.
const verifyGstinPan = async (gstin, pan) => {
  try {
    return isMockMode() ? await verifyMock(gstin, pan) : await verifyLive(gstin, pan);
  } catch (error) {
    return {
      provider: isMockMode() ? 'MOCK' : 'LIVE',
      gstinValid: false,
      panValid: false,
      checkedAt: new Date().toISOString(),
      error: error.message
    };
  }
};

module.exports = { verifyGstinPan };
