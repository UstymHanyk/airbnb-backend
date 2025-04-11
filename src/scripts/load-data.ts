import 'reflect-metadata';
import dotenv from 'dotenv';
import path from 'path';
import { container } from '../core/di-container'
import AppSymbols from '../core/app-symbols';
import { IDataLoadingService } from '../domain/interfaces/IDataLoadingService';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const CSV_FILE_PATH = path.join(__dirname, '../../data/airbnb_data.csv');

async function main() {
    console.log("--- Starting Data Loading Script ---");
    console.log(`Attempting to load data from: ${CSV_FILE_PATH}`);
    console.log(`Using Database URL: ${process.env.DATABASE_URL ? 'Loaded (details hidden)' : 'NOT FOUND in .env!'}`);

    if (!process.env.DATABASE_URL) {
        console.error("FATAL: DATABASE_URL environment variable not set. Please check your .env file.");
        process.exit(1);
    }

    let dataLoadingService: IDataLoadingService;
    try {
        dataLoadingService = container.resolve<IDataLoadingService>(AppSymbols.DataLoadingService);
        console.log("DataLoadingService resolved successfully.");
    } catch (error) {
        console.error("Failed to resolve DataLoadingService from DI container:", error);
        process.exit(1);
    }


    try {
        await dataLoadingService.loadDataFromCsv(CSV_FILE_PATH);
        console.log("--- Data Loading Script Finished Successfully ---");
        // process.exit(0); // Exit cleanly - Prisma shutdown hook in di-container handles DB disconnect
    } catch (error) {
        console.error("--- Data Loading Script Failed ---");
        process.exit(1);
    }
}

main();