import { useState, useEffect } from 'react';
import { userApi, propertyApi, adminApi, organizationApi } from '../services/api';

const TABS = [
  { id: 'properties', label: 'Property Approval' },
  { id: 'organizations', label: 'Organizations' },
  { id: 'users', label: 'User Management' },
  { id: 'agents', label: 'Agent Management' },
  { id: 'analytics', label: 'Property Analytics' },
  { id: 'enquiries', label: 'Enquiry Management' },
];

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('properties');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      let result;
      switch (activeTab) {
        case 'properties':
          result = await adminApi.pendingProperties();
          setData(result);
          break;
        case 'organizations':
          result = await organizationApi.list();
          setData(result.data || result);
          break;
        case 'users':
          result = await userApi.list();
          setData(result.data || result);
          break;
        case 'agents':
          result = await userApi.getByRole('agent');
          setData(result.data || result);
          break;
        case 'analytics':
          result = await adminApi.analytics();
          setData(result);
          const sRes = await userApi.stats();
          setStats(sRes);
          break;
        case 'enquiries':
          result = await adminApi.enquiries();
          setData(result);
          break;
        default: break;
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProperty = async (id) => {
    try {
      await adminApi.approveProperty(id, 'approved');
      fetchData();
    } catch (err) {
      alert('Action failed: ' + err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await userApi.delete(id);
      fetchData();
    } catch (err) {
      alert('Action failed: ' + err.message);
    }
  };

  const handleVerifyUser = async (id, type) => {
    try {
      if (type === 'email') await userApi.verifyEmail(id);
      else await userApi.verifyPhone(id);
      fetchData();
    } catch (err) {
      alert('Action failed: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-accent">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your platform with real-time data</p>
        </div>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 font-medium">Crunching your platform data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-center">
            <p className="text-red-600 font-medium mb-2">{error}</p>
            <button onClick={fetchData} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold">Retry</button>
          </div>
        ) : (
          <>
            {activeTab === 'properties' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals ({data.length})</h2>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Property</th>
                        <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Owner</th>
                        <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Submitted</th>
                        <th className="text-right px-6 py-3 text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-bold text-gray-900">{p.title}</td>
                          <td className="px-6 py-4 text-gray-600">{p.owner_name || p.owner}</td>
                          <td className="px-6 py-4 text-gray-500 text-sm">{new Date(p.created_at || p.submitted).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => handleApproveProperty(p.id)} className="text-green-600 font-bold mr-4 text-xs">APPROVE</button>
                            <button className="text-red-600 font-bold text-xs">REJECT</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'organizations' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Organizations ({data.length})</h2>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Organization</th>
                        <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Type</th>
                        <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Location</th>
                        <th className="text-right px-6 py-3 text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.map((o) => (
                        <tr key={o.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-900">{o.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">{o.slug}</p>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{o.type || 'Agency'}</td>
                          <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">{o.city}, {o.state}</td>
                          <td className="px-6 py-4 text-right">
                             <button className="text-primary font-bold text-xs uppercase">View Members</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {data.length === 0 && (
                    <div className="p-20 text-center text-gray-400 italic">No organizations found.</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Users</h2>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Name</th>
                        <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Email/Role</th>
                        <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Status</th>
                        <th className="text-right px-6 py-3 text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {data.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-900">{u.first_name} {u.last_name}</p>
                            <p className="text-[10px] text-gray-400 font-bold">{u.phone || 'No phone'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-600 text-sm">{u.email}</p>
                            <span className="text-[10px] text-primary font-bold uppercase">{u.role}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {u.status || 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                             <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 font-bold text-[10px] uppercase">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'agents' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Agents</h2>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <table className="w-full">
                    <tbody className="divide-y divide-gray-200">
                      {data.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-900">{u.first_name} {u.last_name}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <button className="text-primary font-bold text-xs">VIEW PROFILE</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Total Users', value: stats?.total_users || '0' },
                    { label: 'Active Agents', value: stats?.active_agents || '0' },
                    { label: 'Pending Properties', value: stats?.pending_approvals || '0' },
                    { label: 'New Enquiries', value: stats?.new_enquiries || '156' },
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-6">
                      <p className="text-2xl font-bold text-primary">{s.value}</p>
                      <p className="text-gray-500 text-sm mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'enquiries' && (
              <div>
                 <h2 className="text-lg font-semibold text-gray-900 mb-4">Latest Enquiries</h2>
                 <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
                   {data.length > 0 ? data.map((e) => (
                     <div key={e.id} className="p-4 flex items-center justify-between">
                        <div>
                           <p className="text-gray-900 font-bold">ENQ#{e.id} - {e.property_title || 'Property Enquiry'}</p>
                           <p className="text-xs text-gray-500">From: {e.user_name} ({e.user_email})</p>
                        </div>
                        <button className="text-primary font-bold text-xs">Respond</button>
                     </div>
                   )) : (
                     <div className="p-12 text-center text-gray-400">No enquiries found.</div>
                   )}
                 </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
