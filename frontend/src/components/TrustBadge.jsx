function TrustBadge({ icon, value, label, dark = false }) {
  return (
    <div className={`flex flex-col items-center justify-center p-6 rounded-3xl transition-all duration-500 hover:scale-105 ${
      dark ? 'bg-white/10 backdrop-blur-md border border-white/20' : 'bg-gray-50 border border-gray-100'
    }`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 ${
        dark ? 'bg-white/20 text-white shadow-xl' : 'bg-primary/10 text-primary shadow-lg'
      }`}>
        {icon}
      </div>
      <p className={`text-2xl font-extrabold mb-1 ${dark ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </p>
      <p className={`text-xs font-bold uppercase tracking-widest ${dark ? 'text-white/60' : 'text-gray-400'}`}>
        {label}
      </p>
    </div>
  );
}

export default TrustBadge;
