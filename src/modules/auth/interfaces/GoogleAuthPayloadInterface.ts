export default interface GoogleAuthPayload {
  access_token: string;

  expires_in: number;

  refresh_token: string;

  scope: string;

  token_type: string;

  id_token: string;

  expires_at: number;

  provider: string;

  type: string;

  providerAccountId: string;
}
