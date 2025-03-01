import { EntityManager } from 'typeorm';

export interface CreateRecordGeneric<RecordType> {
  createPayload: RecordType;
  dbTransaction:
    | {
        useTransaction: false;
      }
    | {
        useTransaction: true;
        transactionManager: EntityManager;
      };
}
