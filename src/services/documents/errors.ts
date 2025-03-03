
/**
 * Custom error classes for document operations
 */

export class StorageUploadError extends Error {
  constructor(message: string, public originalError: any) {
    super(message);
    this.name = "StorageUploadError";
  }
}

export class DatabaseError extends Error {
  constructor(message: string, public originalError: any) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class DocumentNotFoundError extends Error {
  constructor(documentId: string) {
    super(`Document with ID ${documentId} not found`);
    this.name = "DocumentNotFoundError";
  }
}

export class AuthenticationError extends Error {
  constructor() {
    super("User is not authenticated");
    this.name = "AuthenticationError";
  }
}
