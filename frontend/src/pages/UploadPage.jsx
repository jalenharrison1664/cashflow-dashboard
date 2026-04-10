import { useEffect, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { uploadCsvFile } from '../utils/api';

function UploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'LedgerFlow Upload';
  }, []);

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
    <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900 md:p-8">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Upload Financial Data</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">CSV columns required: `date`, `income`, `expenses`</p>

      <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition-colors duration-300 dark:border-slate-600 dark:bg-slate-800">
        <UploadCloud className="mx-auto text-slate-500 dark:text-slate-300" size={32} />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Drag and drop or choose a CSV file</p>
        <input
          type="file"
          accept=".csv,text/csv"
          className="mt-4 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition-colors duration-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
        />
      </div>

      {selectedFile && <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Selected: {selectedFile.name}</p>}

      <button
        onClick={onUpload}
        disabled={loading}
        className="mt-6 inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
      >
        {loading ? 'Uploading...' : 'Upload CSV'}
      </button>

      {message && <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">{message}</p>}
      {error && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">{error}</p>}
    </div>
  );
}

export default UploadPage;
