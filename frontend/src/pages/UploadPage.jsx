import { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { uploadCsvFile } from '../utils/api';

function UploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onUpload = async () => {
    if (!selectedFile) {
      setError('Please select a CSV file first.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await uploadCsvFile(selectedFile);
      setMessage(response?.message || 'CSV uploaded successfully.');
      setSelectedFile(null);
    } catch (err) {
      setError(err?.response?.data?.error || 'Upload failed. Please check CSV format and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-xl font-semibold text-slate-900">Upload Financial Data</h2>
      <p className="mt-1 text-sm text-slate-500">CSV columns required: `date`, `income`, `expenses`</p>

      <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <UploadCloud className="mx-auto text-slate-500" size={32} />
        <p className="mt-3 text-sm text-slate-600">Drag and drop or choose a CSV file</p>
        <input
          type="file"
          accept=".csv,text/csv"
          className="mt-4 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
        />
      </div>

      {selectedFile && <p className="mt-4 text-sm text-slate-600">Selected: {selectedFile.name}</p>}

      <button
        onClick={onUpload}
        disabled={loading}
        className="mt-6 inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Uploading...' : 'Upload CSV'}
      </button>

      {message && <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
      {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
    </div>
  );
}

export default UploadPage;
