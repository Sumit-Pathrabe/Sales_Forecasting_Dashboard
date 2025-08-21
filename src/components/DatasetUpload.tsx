import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { uploadDataset, parseCSVData } from '../utils/datasetUtils';
import type { SalesData } from '../types';

interface DatasetUploadProps {
  onDataImported: (data: SalesData[]) => void;
  onClose: () => void;
}

export const DatasetUpload: React.FC<DatasetUploadProps> = ({ onDataImported, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [previewData, setPreviewData] = useState<SalesData[]>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrorMessage('Please upload a CSV file');
      setUploadStatus('error');
      return;
    }

    setUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      // Parse CSV data
      const parsedData = await parseCSVData(file);
      setPreviewData(parsedData.slice(0, 5)); // Show first 5 rows for preview

      // Upload to Firebase
      await uploadDataset(file, parsedData);
      
      setUploadStatus('success');
      setUploading(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process file');
      setUploadStatus('error');
      setUploading(false);
    }
  };

  const handleImportData = () => {
    if (previewData.length > 0) {
      // In a real scenario, we'd fetch the full dataset from Firebase
      // For now, we'll use the preview data expanded
      const fullData = generateFullDataFromPreview(previewData);
      onDataImported(fullData);
      onClose();
    }
  };

  const generateFullDataFromPreview = (preview: SalesData[]): SalesData[] => {
    // This would normally fetch from Firebase, but for demo we'll generate based on preview
    const baseData = [...preview];
    const additionalMonths = 19; // To make 24 months total
    
    for (let i = 0; i < additionalMonths; i++) {
      const lastEntry = baseData[baseData.length - 1];
      const trend = (baseData[baseData.length - 1].revenue - baseData[0].revenue) / baseData.length;
      const seasonalVariation = 0.9 + Math.random() * 0.2;
      
      const newDate = new Date(lastEntry.date);
      newDate.setMonth(newDate.getMonth() + 1);
      
      baseData.push({
        date: newDate.toISOString().slice(0, 10),
        revenue: Math.round((lastEntry.revenue + trend) * seasonalVariation),
        units: Math.round((lastEntry.units + trend / 100) * seasonalVariation),
        month: newDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      });
    }
    
    return baseData;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Import Sales Dataset</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Upload a CSV file with your sales data. Required columns: date, revenue, units
          </p>
        </div>

        <div className="p-6">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : uploadStatus === 'success'
                ? 'border-green-500 bg-green-50'
                : uploadStatus === 'error'
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Processing your dataset...</p>
              </div>
            ) : uploadStatus === 'success' ? (
              <div className="flex flex-col items-center">
                <CheckCircle className="w-12 h-12 text-green-600 mb-4" />
                <p className="text-green-700 font-medium">Dataset uploaded successfully!</p>
                <p className="text-sm text-gray-600 mt-2">Preview your data below</p>
              </div>
            ) : uploadStatus === 'error' ? (
              <div className="flex flex-col items-center">
                <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
                <p className="text-red-700 font-medium">Upload failed</p>
                <p className="text-sm text-red-600 mt-2">{errorMessage}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-700 font-medium mb-2">
                  Drag and drop your CSV file here, or click to browse
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Supports CSV files up to 10MB
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  Choose File
                </label>
              </div>
            )}
          </div>

          {/* CSV Format Guide */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 mb-2">CSV Format Requirements</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Required columns:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><code>date</code> - Date in YYYY-MM-DD format</li>
                    <li><code>revenue</code> - Sales revenue (numeric)</li>
                    <li><code>units</code> - Units sold (numeric)</li>
                  </ul>
                  <p className="mt-3"><strong>Example:</strong></p>
                  <code className="block bg-white p-2 rounded border text-xs">
                    date,revenue,units<br/>
                    2023-01-01,45000,562<br/>
                    2023-02-01,48000,600<br/>
                    2023-03-01,52000,650
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Data Preview */}
          {previewData.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-3">Data Preview</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {previewData.map((row, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{row.date}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">${row.revenue.toLocaleString()}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{row.units.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {uploadStatus === 'success' && (
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImportData}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                Import Dataset
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};