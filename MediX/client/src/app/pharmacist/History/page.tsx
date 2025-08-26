'use client';

import Header from '@/components/pharmacist/header';
import SubHeader from '@/components/pharmacist/subHeader';
import Footer from '@/components/footer';

import { useEffect, useState } from 'react';


interface BillHistory {
  billId: number;
  date: string;
  prescriptionId: number | null;
  patientId: number | null;
  patientPhone: string;
  sellType: boolean;
  total: number;
  patientName?: string; // for future use if API provides
}

export default function PharmacistHistoryPage() {
  const [bills, setBills] = useState<BillHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter/search state
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sellTypeFilter, setSellTypeFilter] = useState('');

  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:8080/api/bills/history');
        if (!res.ok) throw new Error('Failed to fetch bill history');
        const data = await res.json();
        // Fetch patient names for bills with patientId, and for quick sells fetch name by phone
        const billsWithNames = await Promise.all(
          data.map(async (bill: BillHistory) => {
            if (bill.patientId) {
              try {
                const patientRes = await fetch(`http://localhost:8080/api/patients/${bill.patientId}`);
                if (patientRes.ok) {
                  const patientData = await patientRes.json();
                  return { ...bill, patientName: patientData.name || '-' };
                }
              } catch {}
            } else if (!bill.sellType && bill.patientPhone) {
              // Quick sell: fetch name by phone
              try {
                const quickRes = await fetch(`http://localhost:8080/api/bills/phone/${encodeURIComponent(bill.patientPhone)}`);
                if (quickRes.ok) {
                  const quickData = await quickRes.json();
                  // Try to get the name from the first bill with a name
                  const found = Array.isArray(quickData)
                    ? quickData.find((b: any) => b.customerName && b.customerName.trim() !== '')
                    : null;
                  if (found && found.customerName) {
                    return { ...bill, patientName: found.customerName };
                  }
                }
              } catch {}
            }
            return { ...bill, patientName: '-' };
          })
        );
        setBills(billsWithNames);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, []);

  // Date filter helpers
  const today = new Date();
  const getDateString = (d: Date) => d.toISOString().slice(0, 10);
  const isToday = (dateStr: string) => dateStr === getDateString(today);
  const isThisWeek = (dateStr: string) => {
    const d = new Date(dateStr);
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay());
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
    return d >= firstDayOfWeek && d <= lastDayOfWeek;
  };
  const isThisMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
  };

  // Filtering logic
  const filteredBills = bills.filter((bill) => {
    // Search by prescriptionId, patientId, patientName, patientPhone
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !searchLower ||
      (bill.prescriptionId && bill.prescriptionId.toString().includes(searchLower)) ||
      (bill.patientId && bill.patientId.toString().includes(searchLower)) ||
      (bill.patientName && bill.patientName.toLowerCase().includes(searchLower)) ||
      (bill.patientPhone && bill.patientPhone.toLowerCase().includes(searchLower));
    // Date filter
    let matchesDate = true;
    if (dateFilter === 'today') matchesDate = isToday(bill.date);
    else if (dateFilter === 'week') matchesDate = isThisWeek(bill.date);
    else if (dateFilter === 'month') matchesDate = isThisMonth(bill.date);
    // Sell type filter
    const matchesSellType =
      !sellTypeFilter ||
      (sellTypeFilter === 'normal' && bill.sellType) ||
      (sellTypeFilter === 'quick' && !bill.sellType);
    return matchesSearch && matchesDate && matchesSellType;
  });

  // Unique dates for dropdown
  const uniqueDates = Array.from(new Set(bills.map((b) => b.date)));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-green-100 text-black">
      <Header />
      <SubHeader />
      <main className="flex flex-col items-center flex-grow mt-8 px-2 sm:px-4">
        <div className="w-full max-w-6xl shadow-2xl p-6 sm:p-8 rounded-2xl bg-white/90 border border-green-100 relative">
          <h2 className="text-2xl font-bold mb-6 text-green-800 flex items-center gap-2">
            <span className="inline-block w-2 h-6 bg-green-600 rounded-full mr-2"></span>
            Bill History
          </h2>
          {/* Filter/Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
            <input
              type="text"
              className="border border-green-400 rounded-lg px-4 py-2 w-full sm:w-96 focus:outline-none focus:ring-2 focus:ring-green-300"
              placeholder="Search by Prescription ID, Patient Name, or Patient"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="border border-green-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <select
              className="border border-green-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
              value={sellTypeFilter}
              onChange={(e) => setSellTypeFilter(e.target.value)}
            >
              <option value="">All Sell Types</option>
              <option value="normal">Normal Sell (Patient)</option>
              <option value="quick">Quick Sell (General)</option>
            </select>
          </div>
          <div className="text-sm text-gray-600 mb-2">
            Showing {filteredBills.length} of {bills.length} records
          </div>
          {loading ? (
            <div className="text-center py-8 text-lg">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-green-200 rounded-xl bg-white">
                <thead className="bg-green-900 text-white">
                  <tr>
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Prescription ID</th>
                    <th className="p-2 border">Patient ID</th>
                    <th className="p-2 border">Patient Name</th>
                    <th className="p-2 border">Patient Phone</th>
                    <th className="p-2 border">Sell Type</th>
                    <th className="p-2 border">Total Bill</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">No bills found.</td>
                    </tr>
                  ) : (
                    filteredBills.map((bill) => (
                      <tr key={bill.billId} className="text-center border-b hover:bg-green-50">
                        <td className="p-2 border">{bill.date}</td>
                        <td className="p-2 border">{bill.prescriptionId ?? '-'}</td>
                        <td className="p-2 border">{bill.patientId ?? '-'}</td>
                        <td className="p-2 border">{bill.patientName ?? '-'}</td>
                        <td className="p-2 border">{bill.patientPhone}</td>
                        <td className="p-2 border">{bill.sellType ? 'Normal Sell (Patient)' : 'Quick Sell (General)'}</td>
                        <td className="p-2 border font-semibold">৳{bill.total.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
      <Footer />
    </div>
  );
}
