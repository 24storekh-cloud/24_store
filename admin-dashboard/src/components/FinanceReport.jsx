import React, { useState, useMemo } from 'react';
import { 
  ArrowUpCircle, ArrowDownCircle, DollarSign, 
  Calendar, Activity, List, FileText, Share2 
} from 'lucide-react';

// ១. ការ Import បែបនេះដើម្បីដោះស្រាយបញ្ហា autoTable is not a function
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; 
import * as XLSX from 'xlsx';

const FinanceReport = ({ orders = [], products = [] }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [viewMode, setViewMode] = useState('all');

  // រៀបចំទិន្នន័យសម្រាប់ Report
  const report = useMemo(() => {
    const monthlyOrders = orders.filter(o => {
      const oDate = o.date || (o.orderId ? new Date(Number(o.orderId)).toISOString().split('T')[0] : "");
      return oDate.startsWith(selectedMonth);
    });

    const totalIn = monthlyOrders
      .filter(o => o.status?.toLowerCase() === 'completed')
      .reduce((sum, o) => sum + Number(o.total || 0), 0);

    const totalOut = monthlyOrders
      .filter(o => o.status?.toLowerCase() === 'completed')
      .reduce((sum, o) => {
        const product = products.find(p => p.name === o.productName);
        const unitCost = product?.cost || 0;
        return sum + (unitCost * Number(o.quantity || 1));
      }, 0);

    return { 
      orders: monthlyOrders, 
      income: totalIn, 
      expense: totalOut, 
      profit: totalIn - totalOut 
    };
  }, [orders, products, selectedMonth]);

  // ======= មុខងារ Export ជា PDF (Fixed doc.autoTable Error) =======
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // បង្កើត Logo រាងមូលពណ៌ខៀវ
    doc.setFillColor(37, 99, 235); 
    doc.circle(25, 20, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("STORE", 19, 21);

    // ព័ត៌មានក្រុមហ៊ុន
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("MONTHLY FINANCE REPORT", 40, 18);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Month: ${selectedMonth}`, 40, 25);
    doc.text(`Exported: ${new Date().toLocaleDateString()}`, 140, 25);

    // រៀបចំទិន្នន័យក្នុងតារាង
    const tableData = report.orders.map(o => {
      const cost = (products.find(p => p.name === o.productName)?.cost || 0) * (o.quantity || 1);
      return [
        o.date || 'N/A', 
        o.productName, 
        o.status, 
        `$${Number(o.total).toLocaleString()}`, 
        `$${cost.toLocaleString()}`
      ];
    });

    // ហៅប្រើ autoTable ជា Static Function (វិធីដែលត្រឹមត្រូវបំផុត)
    autoTable(doc, {
      startY: 35,
      head: [['Date', 'Product Name', 'Status', 'Income ($)', 'Cost ($)']],
      body: tableData,
      foot: [[
        '', 'SUMMARY TOTAL:', '', 
        `$${report.income.toLocaleString()}`, 
        `$${report.expense.toLocaleString()}`
      ]],
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
      footStyles: { fillColor: [241, 245, 249], textColor: [30, 41, 59], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4 },
      theme: 'grid'
    });

    // បន្ថែមលទ្ធផលចំណេញសុទ្ធខាងក្រោមតារាង
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`NET PROFIT: $${report.profit.toLocaleString()}`, 14, finalY);

    doc.save(`Finance_Report_${selectedMonth}.pdf`);
  };

  // ======= មុខងារ Export ជា Excel =======
  const exportToExcel = () => {
    const excelData = report.orders.map(o => ({
      Date: o.date,
      Product: o.productName,
      Status: o.status,
      'Income ($)': o.total,
      'Cost ($)': (products.find(p => p.name === o.productName)?.cost || 0) * (o.quantity || 1)
    }));
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Finance Data");
    XLSX.writeFile(wb, `Finance_Report_${selectedMonth}.xlsx`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Activity size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 uppercase italic">Financial Hub</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">គ្រប់គ្រង និងតាមដានរបាយការណ៍លុយកាក់</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-3 bg-slate-50 border-none rounded-xl font-black text-xs text-slate-600 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={exportToPDF} className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200">
            <FileText size={14}/> Export PDF
          </button>
          <button onClick={exportToExcel} className="flex items-center gap-2 px-5 py-3 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-200">
            <Share2 size={14}/> Export Excel
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatBox label="Income" value={report.income} color="emerald" icon={<ArrowUpCircle />} />
        <StatBox label="Expense" value={report.expense} color="red" icon={<ArrowDownCircle />} />
        <StatBox label="Net Profit" value={report.profit} color="blue" icon={<DollarSign />} isDark />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-50 overflow-hidden">
        <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
          <h4 className="text-xs font-black text-slate-500 uppercase italic tracking-widest">Recent Transactions</h4>
          <div className="flex bg-white p-1 rounded-xl shadow-inner border border-slate-200">
            {['all', 'in', 'out'].map(m => (
              <button 
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${viewMode === m ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white">
                <th className="p-6 text-[10px] font-black uppercase text-slate-400">Date</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-400">Product</th>
                {(viewMode === 'all' || viewMode === 'in') && <th className="p-6 text-right text-[10px] font-black uppercase text-emerald-600">In ($)</th>}
                {(viewMode === 'all' || viewMode === 'out') && <th className="p-6 text-right text-[10px] font-black uppercase text-red-500">Out ($)</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {report.orders.length > 0 ? report.orders.map((o, i) => {
                const cost = (products.find(p => p.name === o.productName)?.cost || 0) * (o.quantity || 1);
                return (
                  <tr key={i} className="hover:bg-blue-50/30 transition-all group">
                    <td className="p-6 text-xs font-bold text-slate-400">{o.date || 'N/A'}</td>
                    <td className="p-6 text-xs font-black text-slate-700 uppercase group-hover:text-blue-600 transition-colors">{o.productName}</td>
                    {(viewMode === 'all' || viewMode === 'in') && <td className="p-6 text-right font-black text-emerald-600 text-base italic">${Number(o.total || 0).toLocaleString()}</td>}
                    {(viewMode === 'all' || viewMode === 'out') && <td className="p-6 text-right font-black text-red-400 text-base italic">${cost.toLocaleString()}</td>}
                  </tr>
                );
              }) : (
                <tr><td colSpan="4" className="p-20 text-center font-black text-slate-200 uppercase italic">No Data Available</td></tr>
              )}
            </tbody>
            {/* Table Footer */}
            <tfoot className="bg-slate-900 text-white">
              <tr>
                <td colSpan="2" className="p-6 text-xs font-black uppercase italic tracking-widest text-blue-400">Monthly Summary Total</td>
                {(viewMode === 'all' || viewMode === 'in') && <td className="p-6 text-right font-black text-emerald-400 text-xl tracking-tighter">${report.income.toLocaleString()}</td>}
                {(viewMode === 'all' || viewMode === 'out') && <td className="p-6 text-right font-black text-red-400 text-xl tracking-tighter">${report.expense.toLocaleString()}</td>}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

// Component តូចសម្រាប់បង្ហាញ Card
const StatBox = ({ label, value, color, icon, isDark }) => (
  <div className={`p-8 rounded-[2.5rem] shadow-xl border-b-8 transition-transform hover:-translate-y-1 ${isDark ? 'bg-slate-900 border-blue-500 text-white shadow-blue-900/10' : 'bg-white border-'+color+'-500 border-opacity-50'}`}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-500 text-white' : 'bg-'+color+'-50 text-'+color+'-600'}`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
    </div>
    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isDark ? 'text-blue-400' : 'text-slate-400'}`}>{label}</p>
    <h4 className={`text-4xl font-black italic tracking-tighter ${!isDark && 'text-slate-800'}`}>${value.toLocaleString()}</h4>
  </div>
);

export default FinanceReport;