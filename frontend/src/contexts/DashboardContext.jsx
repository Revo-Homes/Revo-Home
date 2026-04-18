import { createContext, useContext, useState, useCallback } from 'react';
import { enquiryApi, visitApi, userApi } from '../services/api';

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const [enquiries, setEnquiries] = useState([]);
  const [visits, setVisits] = useState([]);
  const [myProperties, setMyProperties] = useState([]);
  const [savedProperties, setSavedProperties] = useState([]);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ properties: 0, saved: 0, enquiries: 0, visits: 0 });
  const [loading, setLoading] = useState(false);

  const fetchEnquiries = useCallback(async () => {
    try {
      const res = await enquiryApi.myEnquiries();
      const list = res.data || res.enquiries || res || [];
      setEnquiries(list);
      return list;
    } catch (_) {
      setEnquiries([]);
      return [];
    }
  }, []);

  const fetchVisits = useCallback(async () => {
    try {
      const res = await visitApi.myVisits();
      const list = res.data || res.visits || res || [];
      setVisits(list);
      return list;
    } catch (_) {
      setVisits([]);
      return [];
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await userApi.getProfile();
      const p = res.data || res.user || res;
      setProfile(p);
      return p;
    } catch (_) {
      setProfile(null);
      return null;
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    const res = await userApi.updateProfile(data);
    const p = res.data || res.user || res;
    if (p) setProfile(p);
    return res;
  }, []);

  const createEnquiry = useCallback(async (propertyId, data) => {
    return enquiryApi.create(propertyId, data);
  }, []);

  const scheduleVisit = useCallback(async (propertyId, data) => {
    return visitApi.schedule(propertyId, data);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await userApi.getProfile();
      const d = res.data || res;
      setStats({
        properties: d.propertiesCount ?? 0,
        saved: d.savedCount ?? 0,
        enquiries: d.enquiriesCount ?? 0,
        visits: d.visitsCount ?? 0,
      });
      return res;
    } catch (_) {
      return null;
    }
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        enquiries,
        visits,
        myProperties,
        savedProperties,
        profile,
        stats,
        loading,
        fetchEnquiries,
        fetchVisits,
        fetchProfile,
        updateProfile,
        createEnquiry,
        scheduleVisit,
        fetchStats,
        setMyProperties,
        setSavedProperties,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  return (
    context || {
      enquiries: [],
      visits: [],
      myProperties: [],
      savedProperties: [],
      profile: null,
      stats: {},
      loading: false,
      fetchEnquiries: async () => [],
      fetchVisits: async () => [],
      fetchProfile: async () => null,
      updateProfile: async () => null,
      createEnquiry: async () => null,
      scheduleVisit: async () => null,
      fetchStats: async () => null,
      setMyProperties: () => {},
      setSavedProperties: () => {},
    }
  );
}
