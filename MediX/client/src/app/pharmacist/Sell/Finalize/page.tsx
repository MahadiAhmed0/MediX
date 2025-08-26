'use client';

import Header from '@/components/pharmacist/header';
import SubHeader from '@/components/pharmacist/subHeader';
import Footer from '@/components/footer';

import Invoice from '@/components/pharmacist/invoice';
import { useEffect, useState } from 'react';

export default function FinalizeInvoicePage() {
  const [invoiceData, setInvoiceData] = useState({
    invoiceDate: '',
    invoiceItems: [],
    customerName: '',
    phoneNumber: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('pharmacist_invoice');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setInvoiceData(parsed);
        } catch (e) {
          // fallback to blank
        }
      }
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    alert('To enable PDF downloads, you can integrate html2pdf or jsPDF.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-black print:bg-white print:text-black">
      <div className="print:hidden">
        <Header />
        <SubHeader />
      </div>

      <main className="flex flex-col items-center justify-start flex-grow mt-10 px-4">
        <div className="w-full max-w-5xl">
          <section id="invoice" className="mb-10 print:mb-0">
            <h2 className="text-2xl font-bold mb-4 print:hidden">Finalized Invoice</h2>
            <Invoice
              date={invoiceData.invoiceDate}
              items={invoiceData.invoiceItems}
              customerName={invoiceData.customerName}
              phoneNumber={invoiceData.phoneNumber}
            />
          </section>

          <div className="flex gap-6 justify-center mb-12 print:hidden">
            <button
              onClick={handleDownloadPDF}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Save as PDF
            </button>
            <button
              onClick={handlePrint}
              className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
            >
              Print
            </button>
          </div>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
