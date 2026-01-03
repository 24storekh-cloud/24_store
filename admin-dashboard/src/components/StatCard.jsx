import React from 'react';

const StatCard = ({ label, count, icon, color = "blue" }) => {
  // ការកំណត់ពណ៌ទៅតាមប្រភេទ Stat
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100 shadow-purple-100"
  };

  return (
    <div className={`p-8 rounded-[2.5rem] bg-white border shadow-xl transition-all hover:scale-[1.02] duration-300 relative overflow-hidden group`}>
      {/* Icon Background (រង្វង់ធំនៅពីក្រោយ) */}
      <div className={`absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500 ${colors[color].split(' ')[1]}`}>
        {React.cloneElement(icon, { size: 120 })}
      </div>

      <div className="relative z-10 flex flex-col gap-4">
        {/* Icon តូច */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${colors[color]}`}>
          {icon}
        </div>
        
        <div>
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">
            {label}
          </p>
          <h4 className="text-4xl font-black text-slate-800 tracking-tighter">
            {typeof count === 'number' ? count.toLocaleString() : count}
          </h4>
        </div>
      </div>
    </div>
  );
};

export default StatCard;