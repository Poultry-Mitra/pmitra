// src/firebase/errors.ts
export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  constructor(public readonly context: SecurityRuleContext) {
    const { path, operation, requestResourceData } = context;

    const message = [
      'FirestoreError: Missing or insufficient permissions.',
      `The following request was denied by Firestore Security Rules:`,
      JSON.stringify(
        {
          operation,
          path,
          ...(requestResourceData && { requestResourceData }),
        },
        null,
        2
      ),
    ].join('\n\n');

    super(message);
    this.name = 'FirestorePermissionError';
  }
}
