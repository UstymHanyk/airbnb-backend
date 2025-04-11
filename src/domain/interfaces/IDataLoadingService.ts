export interface IDataLoadingService {
    /**
     * Reads data from a specified CSV file, processes it, and loads it into the database.
     * Ensures data integrity and handles relationships between entities.
     * @param filePath The path to the CSV file to load.
     */
    loadDataFromCsv(filePath: string): Promise<void>;
}
