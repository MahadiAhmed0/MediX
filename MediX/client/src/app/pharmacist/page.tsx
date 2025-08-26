"use client";
import Header from "@/components/pharmacist/header";
import SubHeader from "@/components/pharmacist/subHeader";
import Footer from "@/components/footer";
import { useState, useEffect } from "react";



const dummySales = [
  { name: "Napa", sold: 40 },
  { name: "Seclo", sold: 25 },
  { name: "Ace", sold: 18 },
  { name: "Amoxil", sold: 12 },
  { name: "Ciprocin", sold: 10 },
];

interface BillHistory {
  billId: number;
  date: string;
  prescriptionId: number | null;
  patientId: number | null;
  patientPhone: string;
  sellType: boolean;
  total: number;
  patientName?: string;
}


export default function PharmacistHome() {
  const [topSelling, setTopSelling] = useState(dummySales);
  const [expiryAlert, setExpiryAlert] = useState<{ name: string; expiry: string; daysLeft: number }[]>([]);
  const [stockAlert, setStockAlert] = useState<{ name: string; quantity: number }[]>([]);

  const [revenue, setRevenue] = useState({ today: 0, week: 0, month: 0 });
  const [selectedRevenue, setSelectedRevenue] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    // Fetch bill history and compute revenue
    const fetchRevenue = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/bills/history');
        if (!res.ok) throw new Error('Failed to fetch bill history');
        const bills: BillHistory[] = await res.json();
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
        let todaySum = 0, weekSum = 0, monthSum = 0;
        for (const bill of bills) {
          if (isToday(bill.date)) todaySum += bill.total;
          if (isThisWeek(bill.date)) weekSum += bill.total;
          if (isThisMonth(bill.date)) monthSum += bill.total;
        }
        setRevenue({ today: todaySum, week: weekSum, month: monthSum });
      } catch {
        setRevenue({ today: 0, week: 0, month: 0 });
      }
    };
    fetchRevenue();
  }, []);

  useEffect(() => {
    // Fetch medicines from backend and compute alerts
    const fetchMedicines = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/medicines');
        if (!response.ok) throw new Error('Failed to fetch medicines');
        const data = await response.json();
        // Compute expiry alert (expiring within 30 days)
        const today = new Date();
        const expiryList = data
          .filter((med: any) => med.expiryDate)
          .map((med: any) => {
            const expiry = new Date(med.expiryDate);
            const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return {
              name: med.medicineName,
              expiry: med.expiryDate,
              daysLeft,
            };
          })
          .filter((med: any) => med.daysLeft >= 0 && med.daysLeft <= 30)
          .sort((a: any, b: any) => a.daysLeft - b.daysLeft);
        setExpiryAlert(expiryList);

        // Compute low stock alert (quantity < 30)
        const stockList = data
          .filter((med: any) => med.quantity < 30)
          .map((med: any) => ({
            name: med.medicineName,
            quantity: med.quantity,
          }));
        setStockAlert(stockList);
      } catch (error) {
        setExpiryAlert([]);
        setStockAlert([]);
      }
    };
    fetchMedicines();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-green-100 text-gray-900 flex flex-col">
      <Header />
      <SubHeader />
      <main className="flex-grow p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {/* 3-Box Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
            {/* Revenue Card */}
            <div className="bg-gradient-to-br from-green-100 via-green-50 to-green-100 rounded-3xl p-8 shadow-2xl border-t-4 border-green-600 hover:shadow-xl transition-all duration-300 ease-in-out flex flex-col items-center justify-between h-full min-h-[320px] transform hover:scale-105">
              <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-green-600 rounded-full"></span>
                Revenue Overview
              </h2>
              <div className="flex gap-2 mb-4">
                <button
                  className={`px-4 py-2 rounded-xl font-semibold transition-all border-2 ${selectedRevenue === 'today' ? 'bg-green-700 text-white border-green-700' : 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100'}`}
                  onClick={() => setSelectedRevenue('today')}
                >Today</button>
                <button
                  className={`px-4 py-2 rounded-xl font-semibold transition-all border-2 ${selectedRevenue === 'week' ? 'bg-blue-700 text-white border-blue-700' : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'}`}
                  onClick={() => setSelectedRevenue('week')}
                >This Week</button>
                <button
                  className={`px-4 py-2 rounded-xl font-semibold transition-all border-2 ${selectedRevenue === 'month' ? 'bg-purple-700 text-white border-purple-700' : 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'}`}
                  onClick={() => setSelectedRevenue('month')}
                >This Month</button>
              </div>
              <div className="text-4xl font-extrabold text-green-800 mb-2">
                ৳ {selectedRevenue === 'today' ? revenue.today.toLocaleString() : selectedRevenue === 'week' ? revenue.week.toLocaleString() : revenue.month.toLocaleString()}
              </div>
              <div className="text-gray-500 text-sm">
                {selectedRevenue === 'today' && 'Total revenue generated today'}
                {selectedRevenue === 'week' && 'Total revenue generated this week'}
                {selectedRevenue === 'month' && 'Total revenue generated this month'}
              </div>
            </div>

            {/* Redesigned Stock Alert */}
            <div className="bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 rounded-3xl p-8 shadow-2xl border-t-4 border-yellow-500 hover:shadow-xl transition-all duration-300 ease-in-out flex flex-col h-full min-h-[320px] transform hover:scale-105">
              <div className="flex items-center mb-4">
                <span className="inline-flex items-center justify-center w-10 h-10 bg-yellow-400 text-white rounded-full shadow-lg mr-3">
                  <svg xmlns='http://www.w3.org/2000/svg' className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </span>
                <h2 className="text-2xl font-bold text-yellow-700">Stock Alert</h2>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                {stockAlert.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-green-700 text-lg font-semibold">All stocks healthy</span>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {stockAlert.map((med, i) => (
                      <li key={i} className="flex items-center justify-between bg-yellow-100 rounded-xl px-4 py-3 shadow hover:bg-yellow-200 transition-colors duration-200">
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span className="font-semibold text-yellow-900 text-lg">{med.name}</span>
                        </div>
                        <span className="text-red-600 font-bold text-lg">{med.quantity} left</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mt-6 text-sm text-yellow-700 text-center">
                {stockAlert.length > 0 ? 'Please restock these medicines soon to avoid shortages.' : 'No action needed.'}
              </div>
            </div>

            {/* Medicine Expiry Alert */}
            <div className="bg-gradient-to-br from-red-100 via-red-50 to-red-100 rounded-3xl p-8 shadow-2xl border-t-4 border-red-500 hover:shadow-xl transition-all duration-300 ease-in-out h-full min-h-[320px] transform hover:scale-105">
              <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span>
                Expiry Alert
              </h2>
              <ul className="space-y-3">
                {expiryAlert.length === 0 ? <li className="text-green-700">No expiry soon</li> : expiryAlert.map((med, idx) => (
                  <li key={idx} className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-2 shadow-sm hover:bg-red-100 transition-colors duration-200">
                    <span className="font-semibold text-lg text-red-900">{med.name}</span>
                    <span className="text-red-700 font-bold">{med.daysLeft} days left</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
