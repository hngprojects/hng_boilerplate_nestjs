import { OrganisationInterface } from '../interfaces/OrganisationInterface';
import { CreateRecordGeneric } from '@shared/helpers/createRecordGeneric';
type CreateOrganisationType = Partial<OrganisationInterface>;
export type CreateOrganisationRecordOptions = CreateRecordGeneric<CreateOrganisationType>;
export default CreateOrganisationType;
