const BASE_URL = "https://api-acgfund-dev.azurewebsites.net/v1";

/* ===========================================================
    LOGIN API
=========================================================== */
export async function loginUser(email, password) {
  try {
    const payload = {
      Email: email.trim(),
      Password: password.trim(),
    };

    console.log("LOGIN REQUEST:", payload);

    const response = await fetch(`${BASE_URL}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("LOGIN RESPONSE:", data);

    if (!response.ok) {
      const msg =
        data?.message ||
        data?.Message ||
        data?.error ||
        "Login failed, invalid credentials.";
      throw new Error(msg);
    }

    return data;
  } catch (error) {
    console.log(" LOGIN ERROR:", error);
    throw error;
  }
}

/* ===========================================================
    PARSE API RESULTS (COMMON)
=========================================================== */
function parseApiResponse(raw) {
  try {
    const parsed = raw ? JSON.parse(raw) : [];

    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed?.data)) return parsed.data;
    if (Array.isArray(parsed?.result)) return parsed.result;

    return [];
  } catch (e) {
    console.log("⚠️ JSON parse failed:", raw);
    return [];
  }
}

/* ===========================================================
    DONOR BALANCES LIST API
=========================================================== */
export async function fetchDonorBalances(userId, token) {
  try {
    const body = {
      RequestParamType: "DashboardAdminParticipantBalances",
      Filters: { UserID: userId },
    };

    console.log("DONOR BALANCE REQUEST:", body);

    const response = await fetch(`${BASE_URL}/data/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const raw = await response.text();
    const parsed = parseApiResponse(raw);

    return parsed;
  } catch (error) {
    console.log("DONOR BALANCE ERROR:", error);
    return [];
  }
}

/* ===========================================================
    DONOR BALANCE DETAILS API (REQUIRED FOR DETAILS PAGE)
=========================================================== */
export async function fetchDonorBalanceDetails(participantNumber, userId, token) {
  try {
    const body = {
      RequestParamType: "DashboardAdminParticipantBalancesDetails",
      Filters: {
        ParticipantNumber: participantNumber,
        UserID: userId,
      },
    };

    console.log("DONOR BALANCE DETAILS REQUEST:", body);

    const response = await fetch(`${BASE_URL}/data/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const raw = await response.text();
    const parsed = parseApiResponse(raw);

    console.log("DONOR BALANCE DETAILS RESPONSE:", parsed);

    return parsed;
  } catch (error) {
    console.log("DONOR BALANCE DETAILS ERROR:", error);
    return [];
  }
}

/* ===========================================================
    USERS SCREEN API
=========================================================== */

export async function fetchUserAccessList(userId, token) {
  try {
    const body = {
      RequestParamType: "DashboardParticipantUserAccessList",
      Filters: { UserID: userId },
    };

    const response = await fetch(
      `${BASE_URL}/data/search`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    const raw = await response.text();
    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.log("User Access Error:", error);
    return [];
  }
}


/* ----------------------------------------------------
   ADVISOR BALANCES API
---------------------------------------------------- */
export async function fetchAdvisorBalances(userId, token) {
  try {
    const body = {
      RequestParamType: "DashboardAdminAdvisorBalances",
      Filters: { UserID: userId },
    };

    console.log("ADVISOR BALANCE REQUEST:", body);

    const response = await fetch(
      `${BASE_URL}/data/search`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    const raw = await response.text();
    let parsed;

    try {
      parsed = raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.log("⚠️ JSON parse failed, raw:", raw);
      return [];
    }

    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed?.data)) return parsed.data;
    if (Array.isArray(parsed?.result)) return parsed.result;

    return [];

  } catch (error) {
    console.log("ADVISOR BALANCES ERROR:", error);
    return [];
  }
}

/* ----------------------------------------------------
   ADVISOR BALANCE DETAILS API
---------------------------------------------------- */
export async function fetchAdvisorBalanceDetails(agentNumber, userId, token) {
  try {
    const body = {
      RequestParamType: "DashboardAdminAdvisorBalancesDetails",
      Filters: {
        AgentNumber: agentNumber,
        UserID: userId,
      },
    };

    console.log("ADVISOR DETAILS REQUEST:", body);

    const response = await fetch(`${BASE_URL}/data/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const raw = await response.text();
    let parsed;

    try {
      parsed = raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.log("⚠️ JSON parse failed:", raw);
      return [];
    }

    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed?.data)) return parsed.data;
    if (Array.isArray(parsed?.result)) return parsed.result;

    return [];
  } catch (error) {
    console.log("ADVISOR DETAILS ERROR:", error);
    return [];
  }
}


// fetchCustomReportsList and fetchCustomReportData
export async function fetchCustomReportsList(userId, token) {
  try {
    const body = {
      RequestParamType: 'GetDashboardAdminCustomReportsList',
      Filters: { UserID: userId }
    };
    const res = await fetch('https://api-acgfund-dev.azurewebsites.net/v1/data/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    const raw = await res.text();
    let parsed;
    try { parsed = raw ? JSON.parse(raw) : []; } catch (e) { parsed = raw; }
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed?.data)) return parsed.data;
    if (Array.isArray(parsed?.result)) return parsed.result;
    return [];
  } catch (err) {
    console.error('[API] fetchCustomReportsList error:', err);
    return [];
  }
}

export async function fetchCustomReportData(userId, reportId, token, beginDate = '', endDate = '') {
  try {
    const filters = { UserID: userId, AdminCustomReportID: reportId };
    if (beginDate) filters.BeginDate = beginDate;
    if (endDate) filters.EndDate = endDate;

    const res = await fetch('https://api-acgfund-dev.azurewebsites.net/v1/data/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        RequestParamType: 'GetDashboardAdminCustomReports',
        Filters: filters
      })
    });

    const raw = await res.text();
    let parsed;
    try { parsed = raw ? JSON.parse(raw) : []; } catch (e) { parsed = raw; }
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed?.data)) return parsed.data;
    if (Array.isArray(parsed?.result)) return parsed.result;
    return [];
  } catch (err) {
    console.error('[API] fetchCustomReportData error:', err);
    return [];
  }
}
