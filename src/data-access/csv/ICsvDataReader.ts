export interface ICsvDataReader {
    /**
     * Reads data from a CSV file and attempts to parse it into an array of objects.
     * @param filePath The path to the CSV file.
     * @returns A promise that resolves with an array of objects representing the CSV rows.
     * @template T The expected type of the objects in the array.
     */
    readData<T>(filePath: string): Promise<T[]>;
}