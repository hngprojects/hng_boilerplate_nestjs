type JobIdentifierOptionType =
  | {
      identifierType: 'id';
      identifier: string;
    }
  | {
      identifierType: 'title';
      identifier: string;
    }
  | {
      identifierType: 'company';
      identifier: string;
    };

export default JobIdentifierOptionType;
