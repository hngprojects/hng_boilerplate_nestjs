import { orgMock } from '../../../../modules/organisations/tests/mocks/organisation.mock';
import { JobApplication } from '../../entities/job-application.entity';
import { Job } from '../../entities/job.entity';

// Initial definition of jobsMock without job_application
export const jobsMock: Job[] = [
  {
    id: '6f33f664-cf5f-441e-a204-316682aef466',
    created_at: new Date(),
    updated_at: new Date(),
    title: 'Senior Developer',
    description: 'JavaScript senior developer role with extensive experience in building scalable applications.',
    location: 'London',
    deadline: '2024-07-30T12:34:56.000Z',
    salary_range: '30k_to_50k',
    job_type: 'full-time',
    job_mode: 'remote',
    company_name: 'Google',
    is_deleted: false,
    user: orgMock.owner,
    qualifications: [
      "Bachelor's Degree in Computer Science or related field",
      '5+ years of experience in software development',
      'Strong proficiency in JavaScript and modern frameworks',
    ],
    key_responsibilities: [
      'Develop and maintain web applications',
      'Collaborate with cross-functional teams',
      'Write clean, scalable code',
    ],
    benefits: ['Health insurance', '401(k) matching', 'Paid time off'],
    experience_level: 'Senior',
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
    job: jobsMock[0],
  },
];

jobsMock[0].job_application = jobApplicationMock;
