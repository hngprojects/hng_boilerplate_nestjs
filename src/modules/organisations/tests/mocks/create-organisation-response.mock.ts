import { orgMock } from './organisation.mock';

const OganisationResponseDtoMock = {
  status: 'success',
  message: 'organisation created successfully',
  data: {
    id: orgMock.id,
    name: orgMock.name,
    description: orgMock.description,
    owner: orgMock.owner,
    creator: orgMock.creator,
    email: orgMock.email,
    industry: orgMock.industry,
    type: orgMock.type,
    country: orgMock.country,
    address: orgMock.address,
    state: orgMock.state,
    created_at: new Date(),
    updated_at: new Date(),
  },
  status_code: 201,
};

export { OganisationResponseDtoMock };
