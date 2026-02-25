'use client';

import React, { useState } from 'react';
import { Download, CheckCircle, AlertCircle, Loader2, Hospital, Activity, FlaskConical, Scissors } from 'lucide-react';

export default function AIROCFillerPage() {
  const [branches, setBranches] = useState('1');
  const [medical, setMedical] = useState({ product: 'Radiation Oncology', units: '100', price: '5000' });
  const [diagnostics, setDiagnostics] = useState({ product: 'Pet CT', units: '50', price: '3500' });
  const [surgery, setSurgery] = useState({ product: 'General Surgery', units: '30', price: '15000' });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setStatus('Generating Multi-Product AIROC Business Plan...');
    try {
      const payload = {
        branches,
        medical,
        diagnostics,
        surgery
      };

      const response = await fetch('/api/fill-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AIROC_Comprehensive_Plan.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setStatus('✅ Success! AIROC Comprehensive Plan downloaded.');
    } catch (error) {
      console.error(error);
      setStatus('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="main-card">
        <header className="header">
          <Hospital className="icon-main" size={48} />
          <h1>AIROC Hospitals</h1>
          <p>Comprehensive Financial Plan Automation</p>
        </header>

        <section className="global-section">
          <div className="input-field">
            <label>Master Branch Count</label>
            <input
              type="number"
              value={branches}
              onChange={(e) => setBranches(e.target.value)}
              className="large-input"
            />
          </div>
        </section>

        <div className="grid">
          {/* Medical Section */}
          <div className="sub-card">
            <div className="sub-header">
              <Activity className="icon-med" size={24} />
              <h2>Medical Services</h2>
            </div>
            <div className="group">
              <label>Service Name</label>
              <input type="text" value={medical.product} onChange={(e) => setMedical({ ...medical, product: e.target.value })} />
            </div>
            <div className="group">
              <label>Monthly Units</label>
              <input type="number" value={medical.units} onChange={(e) => setMedical({ ...medical, units: e.target.value })} />
            </div>
            <div className="group">
              <label>Price</label>
              <input type="number" value={medical.price} onChange={(e) => setMedical({ ...medical, price: e.target.value })} />
            </div>
          </div>

          {/* Diagnostics Section */}
          <div className="sub-card">
            <div className="sub-header">
              <FlaskConical className="icon-diag" size={24} />
              <h2>Diagnostics</h2>
            </div>
            <div className="group">
              <label>Service Name</label>
              <input type="text" value={diagnostics.product} onChange={(e) => setDiagnostics({ ...diagnostics, product: e.target.value })} />
            </div>
            <div className="group">
              <label>Monthly Units</label>
              <input type="number" value={diagnostics.units} onChange={(e) => setDiagnostics({ ...diagnostics, units: e.target.value })} />
            </div>
            <div className="group">
              <label>Price</label>
              <input type="number" value={diagnostics.price} onChange={(e) => setDiagnostics({ ...diagnostics, price: e.target.value })} />
            </div>
          </div>

          {/* Surgery Section */}
          <div className="sub-card">
            <div className="sub-header">
              <Scissors className="icon-surg" size={24} />
              <h2>Surgical (Phase II)</h2>
            </div>
            <div className="group">
              <label>Service Name</label>
              <input type="text" value={surgery.product} onChange={(e) => setSurgery({ ...surgery, product: e.target.value })} />
            </div>
            <div className="group">
              <label>Monthly Units</label>
              <input type="number" value={surgery.units} onChange={(e) => setSurgery({ ...surgery, units: e.target.value })} />
            </div>
            <div className="group">
              <label>Price</label>
              <input type="number" value={surgery.price} onChange={(e) => setSurgery({ ...surgery, price: e.target.value })} />
            </div>
          </div>
        </div>

        <button className="generate-btn" onClick={handleGenerate} disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <><Download /> Generate Complete Plan</>}
        </button>

        {status && <div className={`status ${status.includes('❌') ? 'err' : 'ok'}`}>{status}</div>}
      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;
          background: #f8fafc;
          padding: 40px 20px;
          font-family: 'Inter', sans-serif;
        }
        .main-card {
          max-width: 1000px;
          margin: 0 auto;
          background: white;
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.05);
        }
        .header { text-align: center; margin-bottom: 40px; }
        .header h1 { font-size: 32px; color: #1e293b; margin: 15px 0 5px; }
        .header p { color: #64748b; font-size: 16px; }
        .icon-main { color: #2563eb; }
        
        .global-section {
          background: #f1f5f9;
          padding: 20px;
          border-radius: 16px;
          margin-bottom: 30px;
          display: flex;
          justify-content: center;
        }
        .large-input {
          width: 200px;
          padding: 15px;
          font-size: 24px;
          text-align: center;
          font-weight: bold;
          border: 3px solid #cbd5e1;
          border-radius: 12px;
          color: #1e293b;
        }
        .large-input:focus { border-color: #2563eb; outline: none; }
        
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        
        .sub-card {
          padding: 25px;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .sub-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
        
        .sub-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
        .sub-header h2 { font-size: 18px; color: #334155; margin: 0; }
        .icon-med { color: #ef4444; }
        .icon-diag { color: #8b5cf6; }
        .icon-surg { color: #059669; }
        
        .group { margin-bottom: 15px; }
        .group label { display: block; font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 5px; text-transform: uppercase; }
        .group input { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 15px; }
        
        .generate-btn {
          width: 100%;
          padding: 20px;
          background: #1e293b;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: background 0.2s;
        }
        .generate-btn:hover { background: #0f172a; }
        
        .status { margin-top: 25px; padding: 15px; border-radius: 10px; text-align: center; font-weight: 500; }
        .err { background: #fee2e2; color: #991b1b; }
        .ok { background: #dcfce7; color: #166534; }
        
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
