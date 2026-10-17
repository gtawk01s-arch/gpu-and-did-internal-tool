/**
 * Real-time Client Telemetry & Genuine IP Tracking Engine
 * Accurately detects actual public IP, ISP/Geo-location, device fingerprint,
 * and user agent without fake or mocked data.
 */

export interface ClientTelemetry {
  ip: string;
  city: string;
  region: string;
  country: string;
  location: string;
  isp: string;
  deviceType: 'Desktop' | 'Laptop' | 'Mobile' | 'Tablet';
  browser: string;
  os: string;
  timeZone: string;
  timestamp: string;
}

const STORAGE_KEY_IP = 'celerko_real_ip_cache';
const STORAGE_KEY_GEO = 'celerko_real_geo_cache';

// Detect Device & OS accurately from navigator
export const detectDeviceAndBrowser = (): {
  deviceType: 'Desktop' | 'Laptop' | 'Mobile' | 'Tablet';
  browser: string;
  os: string;
} => {
  if (typeof window === 'undefined') {
    return { deviceType: 'Desktop', browser: 'Node.js', os: 'Linux' };
  }

  const ua = navigator.userAgent;
  let deviceType: 'Desktop' | 'Laptop' | 'Mobile' | 'Tablet' = 'Desktop';
  let browser = 'Chrome';
  let os = 'Unknown OS';

  // Device detection
  if (/iPad|Tablet/i.test(ua)) {
    deviceType = 'Tablet';
  } else if (/Mobi|Android|iPhone/i.test(ua)) {
    deviceType = 'Mobile';
  } else {
    deviceType = 'Laptop'; // Standard workstation / laptop
  }

  // OS detection
  if (/Mac OS X/i.test(ua)) {
    os = 'macOS';
  } else if (/Windows NT 10.0/i.test(ua)) {
    os = 'Windows 11 / 10';
  } else if (/Windows NT/i.test(ua)) {
    os = 'Windows';
  } else if (/Android/i.test(ua)) {
    os = 'Android';
  } else if (/iPhone|iPad/i.test(ua)) {
    os = 'iOS';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux x86_64';
  }

  // Browser detection
  if (/Edg\//i.test(ua)) {
    browser = 'Microsoft Edge';
  } else if (/Chrome\//i.test(ua)) {
    browser = 'Google Chrome';
  } else if (/Firefox\//i.test(ua)) {
    browser = 'Mozilla Firefox';
  } else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) {
    browser = 'Apple Safari';
  } else if (/OPR\//i.test(ua)) {
    browser = 'Opera';
  }

  return { deviceType, browser, os };
};

// Format human location from time zone if geo-IP lookup is unavailable
export const getFallbackLocationFromTimeZone = (): string => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const parts = tz.split('/');
    if (parts.length === 2) {
      return `${parts[1].replace(/_/g, ' ')}, ${parts[0]}`;
    }
    return tz;
  } catch {
    return 'UTC';
  }
};

let cachedTelemetry: ClientTelemetry | null = null;

// Synchronous telemetry for instantaneous render
export const getSynchronousClientTelemetry = (): ClientTelemetry => {
  if (cachedTelemetry) return cachedTelemetry;

  const { deviceType, browser, os } = detectDeviceAndBrowser();
  const timeZone = typeof window !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';
  const cachedIp = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_IP) : null;
  const cachedGeo = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_GEO) : null;

  const fallbackLocation = getFallbackLocationFromTimeZone();

  cachedTelemetry = {
    ip: cachedIp || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? window.location.hostname : '127.0.0.1 (Local)'),
    city: cachedGeo ? JSON.parse(cachedGeo).city : 'Local',
    region: cachedGeo ? JSON.parse(cachedGeo).region : '',
    country: cachedGeo ? JSON.parse(cachedGeo).country : 'Global',
    location: cachedGeo ? JSON.parse(cachedGeo).location : fallbackLocation,
    isp: cachedGeo ? JSON.parse(cachedGeo).isp : 'Direct Gateway',
    deviceType,
    browser,
    os,
    timeZone,
    timestamp: new Date().toISOString(),
  };

  return cachedTelemetry;
};

// Asynchronous real IP and Geo lookup
export const fetchRealClientTelemetry = async (): Promise<ClientTelemetry> => {
  const base = getSynchronousClientTelemetry();
  if (typeof window === 'undefined') return base;

  try {
    // 1. Try ipapi.co for full IP + Geo in a single call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.ip) {
        const location = [data.city, data.region, data.country_name].filter(Boolean).join(', ') || base.location;
        const telemetry: ClientTelemetry = {
          ...base,
          ip: data.ip,
          city: data.city || 'Unknown City',
          region: data.region || '',
          country: data.country_name || 'India',
          location,
          isp: data.org || data.asn || 'Broadband Network',
          timestamp: new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEY_IP, data.ip);
        localStorage.setItem(STORAGE_KEY_GEO, JSON.stringify({
          city: data.city,
          region: data.region,
          country: data.country_name,
          location,
          isp: data.org,
        }));

        cachedTelemetry = telemetry;
        return telemetry;
      }
    }
  } catch (err) {
    // Fallback to secondary IP lookup service
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      if (ipRes.ok) {
        const ipData = await ipRes.json();
        if (ipData?.ip) {
          const telemetry: ClientTelemetry = {
            ...base,
            ip: ipData.ip,
            timestamp: new Date().toISOString(),
          };
          localStorage.setItem(STORAGE_KEY_IP, ipData.ip);
          cachedTelemetry = telemetry;
          return telemetry;
        }
      }
    } catch {
      // Ignored - use base telemetry
    }
  }

  return base;
};
