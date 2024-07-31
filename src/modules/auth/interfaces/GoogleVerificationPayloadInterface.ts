export interface GoogleVerificationPayloadInterface {
  iss: string;

  azp: string;

  aud: string;

  sub: string;

  email: string;

  email_verified: true;

  at_hash: string;

  name: string;

  picture: string;

  given_name: string;

  family_name: string;

  iat: number;

  exp: number;
}
