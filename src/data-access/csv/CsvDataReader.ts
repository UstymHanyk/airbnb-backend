import { injectable } from 'tsyringe';
import fs from 'fs';
import csv from 'csv-parser';
import { ICsvDataReader } from './ICsvDataReader';
import path from 'path';

@injectable()
export class CsvDataReader implements ICsvDataReader {

    async readData<T>(filePath: string): Promise<T[]> {
        const absolutePath = path.resolve(filePath); // Ensure absolute path
        console.log(`Attempting to read CSV from: ${absolutePath}`);

        return new Promise((resolve, reject) => {
            const results: T[] = [];

            if (!fs.existsSync(absolutePath)) {
                 console.error(`CSV file not found at path: ${absolutePath}`);
                 return reject(new Error(`CSV file not found at path: ${absolutePath}`));
            }

            fs.createReadStream(absolutePath)
                .pipe(csv({
                    mapHeaders: ({ header }) => header.trim() // Trim whitespace from headers
                }))
                .on('data', (data: any) => {
                    // Basic type cleanup - remove empty strings, keep nulls/actual values
                    // More complex type conversions (dates, numbers, booleans) are better handled
                    // in the BLL (DataLoadingService) based on context.
                    const cleanedData: any = {};
                    for (const key in data) {
                        if (Object.prototype.hasOwnProperty.call(data, key) && data[key] !== '') {
                             cleanedData[key.trim()] = data[key]; // Trim key again just in case
                        } else {
                            // Optionally keep null or undefined if the column truly is empty
                             cleanedData[key.trim()] = null; // Represent empty cells as null explicitly?
                        }
                    }
                    results.push(cleanedData as T);
                 })
                .on('end', () => {
                    console.log(`Successfully finished reading ${results.length} rows from ${absolutePath}`);
                    resolve(results);
                })
                .on('error', (error) => {
                    console.error(`Error reading or parsing CSV file ${absolutePath}:`, error);
                    reject(error);
                });
        });
    }
}