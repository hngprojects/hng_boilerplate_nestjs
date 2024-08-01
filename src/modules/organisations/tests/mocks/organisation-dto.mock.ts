import { OrganisationRequestDto } from '../../dto/organisation.dto';

export const createMockOrganisationRequestDto = (
  overrides?: Partial<OrganisationRequestDto>
): OrganisationRequestDto => {
  const defaultMock: OrganisationRequestDto = {
    name: 'John & Co',
    email: 'johnCo@example.com',
    industry: 'Import',
    type: 'General',
    country: 'Nigeria',
    address: 'Street 101 Building 26',
    state: 'Lagos',
  };

  return { ...defaultMock, ...overrides };
};

export const OrgRequestMockDto = createMockOrganisationRequestDto();
