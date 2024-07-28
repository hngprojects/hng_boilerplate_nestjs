export class OrganisationDto {
  id: string;
  created_at: Date;
  updated_at: Date;
  name: string;
  description: string;
  email: string;
  industry: string;
  type: string;
  country: string;
  address: string;
  state: string;
  isDeleted: boolean;
  owner: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}
