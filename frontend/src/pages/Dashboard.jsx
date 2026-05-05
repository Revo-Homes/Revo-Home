import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProperty } from '../contexts/PropertyContext';
import { motion } from 'framer-motion';

const CHART_DATA = [40, 25, 60, 30, 85, 45, 90];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function AnimatedBar({ height, day, index }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100 + index * 80);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
      <div className="w-full relative bg-gray-50 rounded-t-xl group-hover:bg-primary/5 transition-colors overflow-hidden" style={{ height: '100%' }}>
        <div
          className="absolute bottom-0 w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-xl opacity-80 group-hover:opacity-100 transition-all duration-700 ease-out"
          style={{ height: animated ? `${height}%` : '0%', transition: 'height 0.7s ease-out' }}
        />
        {/* Hover tooltip */}
        <div className="absolute bottom-[102%] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-gray-900 text-white text-[10px] font-black px-2 py-1 rounded-lg whitespace-nowrap shadow-xl">
            {height} views
          </div>
        </div>
      </div>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{day}</span>
    </div>
  );
}

function StatCard({ stat, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: 'easeOut' }}
    >
      <Link
        to={stat.path}
        className="group relative bg-white rounded-3xl border border-gray-100 p-8 shadow-xl shadow-gray-200/40 hover:border-primary hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
      >
        {/* Background icon watermark */}
        <div className="absolute bottom-4 right-4 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity scale-[3] origin-bottom-right">
          {stat.icon}
        </div>
        {/* Colored accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 to-primary rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-primary bg-primary/10 group-hover:bg-primary group-hover:text-white transition-colors duration-300`}>
          {stat.icon}
        </div>
        <p className={`${stat.label === 'Subscription' && !stat.isSubscribed ? 'text-2xl' : 'text-4xl'} font-black text-gray-900 mb-1 group-hover:text-primary transition-colors`}>{stat.value}</p>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
        <div className="mt-4 flex items-center text-[10px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 duration-300">
          {stat.label === 'Subscription' ? 'Manage Plan' : 'View All'}
          <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </Link>
    </motion.div>
  );
}

function Dashboard() {
  const { user, isSubscribed } = useAuth();
  const { properties, savedIds, enquiries, fetchMyProperties } = useProperty();
  const [myPropertiesCount, setMyPropertiesCount] = useState(0);

  useEffect(() => {
    const loadCounts = async () => {
      const myProps = await fetchMyProperties();
      setMyPropertiesCount(myProps.length);
    };
    loadCounts();
  }, [fetchMyProperties, properties]);

  const stats = [
    {
      label: 'My Properties',
      value: myPropertiesCount,
      path: '/dashboard/properties',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      label: 'Saved',
      value: savedIds.size,
      path: '/dashboard/saved',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      label: 'Enquiries',
      value: enquiries.filter(e => e.ownerEmail === user?.email || e.userEmail === user?.email).length,
      path: '/dashboard/enquiries',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )
    },
    {
      label: 'Subscription',
      value: isSubscribed ? 'Active' : 'Get Pro',
      isSubscribed,
      path: '/subscription',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  ];

  const activities = [
    { type: 'enquiry', title: 'New Enquiry Received', time: '2 hours ago', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', color: 'bg-blue-50 text-blue-500 group-hover:bg-blue-100' },
    { type: 'save', title: 'Property favorited', time: '5 hours ago', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: 'bg-rose-50 text-rose-500 group-hover:bg-rose-100' },
    { type: 'view', title: 'Profile viewed 12 times', time: '1 day ago', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', color: 'bg-purple-50 text-purple-500 group-hover:bg-purple-100' },
  ];

  return (
    <div>
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
            {(user?.name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900">
              Welcome back{user?.name ? `, ${user.name}` : user?.email ? `, ${user.email.split('@')[0]}` : ''}!
            </h1>
            <p className="text-gray-400 font-medium text-sm">Here's your real estate overview for today.</p>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((s, i) => (
          <StatCard key={s.label} stat={s} index={i} />
        ))}
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Views Chart */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-8 shadow-xl shadow-gray-200/40"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-gray-900">Profile Views</h2>
              <p className="text-sm font-bold text-gray-400 mt-0.5">Last 7 days performance</p>
            </div>
            <span className="text-sm font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-widest border border-gray-100">
              This Week
            </span>
          </div>

          <div className="h-56 flex items-end gap-2 sm:gap-4 border-b border-gray-100 pb-2">
            {CHART_DATA.map((height, i) => (
              <AnimatedBar key={i} height={height} day={DAYS[i]} index={i} />
            ))}
          </div>

          {/* Summary row */}
          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-50">
            <div>
              <p className="text-2xl font-black text-gray-900">375</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Views</p>
            </div>
            <div className="h-8 w-px bg-gray-100" />
            <div>
              <p className="text-2xl font-black text-green-500">↑ 12%</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">vs Last Week</p>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl shadow-gray-200/40 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-gray-900">Recent Activity</h2>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>

          <div className="flex-1 flex flex-col gap-1">
            {activities.map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="group flex gap-4 items-start p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-default"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${activity.color}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={activity.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 leading-tight mb-0.5">{activity.title}</h3>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <button className="w-full mt-6 py-3 bg-gray-50 hover:bg-primary/5 text-gray-500 hover:text-primary font-bold rounded-2xl transition-colors text-sm uppercase tracking-wider border border-gray-100 hover:border-primary/20">
            View All Activity
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;