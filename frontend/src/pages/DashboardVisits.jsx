import { useProperty } from '../contexts/PropertyContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

function DashboardVisits() {
  const { visits } = useProperty();
  const { user } = useAuth();

  const myVisits = visits.filter(v => v.ownerEmail === user?.email || v.userEmail === user?.email);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Scheduled Visits</h1>
          <p className="text-gray-500 font-medium">
            {myVisits.length === 0 
              ? "No visits scheduled yet." 
              : `You have ${myVisits.length} visits scheduled for your properties`}
          </p>
        </div>
      </div>

      {myVisits.length === 0 ? (
        <div className="bg-gray-50 rounded-[32px] p-16 text-center border-2 border-dashed border-gray-200">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mx-auto mb-8">
            <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No visits scheduled</h2>
          <p className="text-gray-500 max-w-sm mx-auto font-medium">When potential buyers or tenants schedule a site visit, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {myVisits.map((v, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={v.id} 
              className="bg-white rounded-[24px] border border-gray-100 p-8 shadow-xl shadow-gray-200/30 hover:border-primary/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
                    v.status === 'Scheduled' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                  }`}>
                    {v.status}
                  </span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">ID: #{v.id.toString().slice(-4)}</span>
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-primary transition-colors">{v.propertyTitle}</h3>
                <div className="flex items-center gap-6 mt-4">
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-primary">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <span className="text-sm font-bold text-gray-700">{v.date}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-primary">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <span className="text-sm font-bold text-gray-700">{v.time}</span>
                   </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-sm text-gray-500 font-bold">
                   <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">
                      {v.userEmail[0].toUpperCase()}
                   </div>
                   Visitor: <span className="text-gray-900">{v.userEmail}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                 <button className="px-6 py-3 bg-gray-900 text-white font-black rounded-xl hover:shadow-lg transition-all">
                    Reschedule
                 </button>
                 <button className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-red-500 rounded-xl transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
                 </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DashboardVisits;
