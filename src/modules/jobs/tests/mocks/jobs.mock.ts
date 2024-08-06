import { orgMock } from '../../../../modules/organisations/tests/mocks/organisation.mock';
import { JobApplication } from '../../entities/job-application.entity';
import { Job } from '../../entities/job.entity';

// Initial definition of jobsMock without job_application
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
    company_name: 'google',
    is_deleted: false,
    user: orgMock.owner,
    job_application: [], // Placeholder, will be updated later
  },
];

// Define jobApplicationMock with reference to jobsMock
export const jobApplicationMock: JobApplication[] = [
  {
    id: '6f33g674-cf5f-346e-a204-316682aef466',
    created_at: new Date(),
    updated_at: new Date(),
    applicant_name: 'John Doe',
    email: 'johndoe@example.com',
    resume: 'https://example.com/resume.pdf',
    cover_letter: 'Cover letter text here',
    job: jobsMock[0], // Reference the first job in the jobsMock array
  },
];

// Update jobsMock to include jobApplicationMock
jobsMock[0].job_application = jobApplicationMock;
