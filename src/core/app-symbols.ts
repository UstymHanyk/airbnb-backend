// Use Symbols to avoid string-based collisions and improve type safety for DI keys
const AppSymbols = {
    // --- DAL ---
    PrismaClient: Symbol.for('PrismaClient'), // Represents the Prisma client instance
  
    // CSV Reader
    CsvDataReader: Symbol.for('CsvDataReader'), // Interface for reading CSV
  
    // Repositories (Interfaces)
    UserRepository: Symbol.for('UserRepository'),
    PropertyOwnerRepository: Symbol.for('PropertyOwnerRepository'),
    GuestRepository: Symbol.for('GuestRepository'),
    PropertyRepository: Symbol.for('PropertyRepository'),
    PropertyPhotoRepository: Symbol.for('PropertyPhotoRepository'),
    ReviewRepository: Symbol.for('ReviewRepository'),
    ReservationRepository: Symbol.for('ReservationRepository'),
    PaymentRepository: Symbol.for('PaymentRepository'),
  
    // --- BLL ---
    // Services (Interfaces)
    DataLoadingService: Symbol.for('DataLoadingService'),
    // Add other services like UserService, PropertyService later if needed
    PropertyService: Symbol.for('PropertyService'),
    PropertyModel: Symbol.for('PropertyModel'),
  
    // --- PL ---
    // Controllers (Interfaces - Placeholders for later)
    UserController: Symbol.for('UserController'),
    PropertyController: Symbol.for('PropertyController'),
    // ReservationController: Symbol.for('ReservationController'),
  
  };
  
  export default AppSymbols;