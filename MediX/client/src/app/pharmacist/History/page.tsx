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
}

export default function PharmacistHistoryPage() {
  const [bills, setBills] = useState<BillHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:8080/api/bills/history');
        if (!res.ok) throw new Error('Failed to fetch bill history');
        const data = await res.json();
        setBills(data);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, []);

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
                  {bills.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">No bills found.</td>
                    </tr>
                  ) : (
                    bills.map((bill) => (
                      <tr key={bill.billId} className="text-center border-b hover:bg-green-50">
                        <td className="p-2 border">{bill.date}</td>
                        <td className="p-2 border">{bill.prescriptionId ?? '-'}</td>
                        <td className="p-2 border">{bill.patientId ?? '-'}</td>
                        <td className="p-2 border">{/* Patient name not provided in API */}-</td>
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
