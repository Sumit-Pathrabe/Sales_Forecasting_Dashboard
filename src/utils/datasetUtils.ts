import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../config/firebase';
import Papa from 'papaparse';
import type { SalesData } from '../types';

export const parseCSVData = (file: File): Promise<SalesData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data as any[];
          
          // Validate required columns
          if (data.length === 0) {
            throw new Error('CSV file is empty');
          }

          const firstRow = data[0];
          const requiredColumns = ['date', 'revenue', 'units'];
          const missingColumns = requiredColumns.filter(col => !(col in firstRow));
          
          if (missingColumns.length > 0) {
            throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
          }

          // Transform and validate data
          const salesData: SalesData[] = data.map((row, index) => {
            const date = new Date(row.date);
            if (isNaN(date.getTime())) {
              throw new Error(`Invalid date format in row ${index + 1}: ${row.date}`);
            }

            const revenue = parseFloat(row.revenue);
            const units = parseInt(row.units);

            if (isNaN(revenue) || revenue < 0) {
              throw new Error(`Invalid revenue value in row ${index + 1}: ${row.revenue}`);
            }

            if (isNaN(units) || units < 0) {
              throw new Error(`Invalid units value in row ${index + 1}: ${row.units}`);
            }

            return {
              date: date.toISOString().slice(0, 10),
              revenue: Math.round(revenue),
              units: units,
              month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            };
          });

          // Sort by date
          salesData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          resolve(salesData);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      }
    });
  });
};

export const uploadDataset = async (file: File, data: SalesData[]): Promise<string> => {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const filename = `datasets/${timestamp}_${file.name}`;
    
    // Upload file to Firebase Storage
    const storageRef = ref(storage, filename);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Save metadata to Firestore
    const docRef = await addDoc(collection(db, 'datasets'), {
      filename: file.name,
      originalName: file.name,
      uploadedAt: serverTimestamp(),
      downloadURL,
      recordCount: data.length,
      dateRange: {
        start: data[0]?.date,
        end: data[data.length - 1]?.date
      },
      totalRevenue: data.reduce((sum, record) => sum + record.revenue, 0),
      totalUnits: data.reduce((sum, record) => sum + record.units, 0)
    });

    return docRef.id;
  } catch (error) {
    console.error('Error uploading dataset:', error);
    throw new Error('Failed to upload dataset to Firebase');
  }
};

export const validateDatasetStructure = (data: any[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!Array.isArray(data) || data.length === 0) {
    errors.push('Dataset must contain at least one record');
    return { isValid: false, errors };
  }

  const requiredFields = ['date', 'revenue', 'units'];
  const firstRecord = data[0];
  
  requiredFields.forEach(field => {
    if (!(field in firstRecord)) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Check data types and ranges
  data.forEach((record, index) => {
    const date = new Date(record.date);
    if (isNaN(date.getTime())) {
      errors.push(`Invalid date in record ${index + 1}: ${record.date}`);
    }

    const revenue = parseFloat(record.revenue);
    if (isNaN(revenue) || revenue < 0) {
      errors.push(`Invalid revenue in record ${index + 1}: ${record.revenue}`);
    }

    const units = parseInt(record.units);
    if (isNaN(units) || units < 0) {
      errors.push(`Invalid units in record ${index + 1}: ${record.units}`);
    }
  });

  return { isValid: errors.length === 0, errors };
};

export const generateSampleCSV = (): string => {
  const headers = ['date', 'revenue', 'units'];
  const sampleData = [
    ['2023-01-01', '45000', '562'],
    ['2023-02-01', '48000', '600'],
    ['2023-03-01', '52000', '650'],
    ['2023-04-01', '49000', '612'],
    ['2023-05-01', '55000', '687']
  ];

  return [headers, ...sampleData].map(row => row.join(',')).join('\n');
};