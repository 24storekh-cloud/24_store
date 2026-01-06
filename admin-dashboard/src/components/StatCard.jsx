import React from 'react';

const StatCard = ({ label, count, icon, color = "blue" }) => {
  // ការកំណត់ពណ៌ឱ្យកាន់តែដិតច្បាស់ និងស្អាត
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-200/50",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-200/50",
    amber: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-200/50",
    purple: "bg-purple-50 text-purple-600 border-purple-100 shadow-purple-200/50",
    rose: "bg-rose-50 text-rose-600 border-rose-100 shadow-rose-200/50" // បន្ថែមពណ៌ផ្កាឈូកសម្រាប់ Error ឬ Low Stock
  };

  return (
    <div className={`p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/60 transition-all hover:scale-[1.03] hover:shadow-blue-200/20 duration-500 relative overflow-hidden group`}>
      
      {/* Icon Background (រង្វង់ធំនៅពីក្រោយ - Watermark effect) */}
      <div className={`absolute -right-6 -bottom-6 opacity-[0.08] group-hover:scale-125 group-hover:-rotate-12 transition-all duration-700 pointer-events-none ${colors[color].split(' ')[1]}`}>
        {React.cloneElement(icon, { size: 140, strokeWidth: 1.5 })}
      </div>

      <div className="relative z-10 flex flex-col gap-6">
        {/* Icon Container (ប្រអប់ Icon តូច) */}
        <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center border-2 shadow-sm transition-transform duration-500 group-hover:rotate-6 ${colors[color]}`}>
          {React.cloneElement(icon, { size: 28, strokeWidth: 2.5 })}
        </div>
        
        <div className="space-y-1">
          <p className="text-slate-400 font-black text-[11px] uppercase tracking-[0.25em] ml-1">
            {label}
          </p>
          <h4 className="text-4xl font-black text-slate-900 tracking-tighter italic">
            {typeof count === 'number' ? count.toLocaleString() : count}
          </h4>
        </div>
      </div>

      {/* បន្ថែមពន្លឺតិចៗនៅខាងក្រោម (Decorative element) */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/0 to-current opacity-[0.03] pointer-events-none`}></div>
    </div>
  );
};

export default StatCard;