import { orgMock } from '../../../../modules/organisations/tests/mocks/organisation.mock';
import { Job } from '../../entities/job.entity';

export const jobsMock: Job[] = [
  {
    id: '6f33f664-cf5f-441e-a204-316682aef466',
    created_at: new Date(),
    updated_at: new Date(),
    title: 'senior dev',
    description: 'JavaScript senior dev',
    location: 'london',
    deadline: '2024-07-30T12:34:56.000Z',
    salary_range: '30k_to_50k',
    job_type: 'full-time',
    job_mode: 'remote',
    company_name: 'googlge',
    is_deleted: false,
    user: orgMock.owner,
  },
];
