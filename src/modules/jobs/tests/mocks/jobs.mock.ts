import { orgMock } from '../../../../modules/organisations/tests/mocks/organisation.mock';
import { Job } from '../../entities/job.entity';

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
    user: orgMock.owner, // Ensure orgMock.owner is defined in your mock data
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
    job_description:
      'We are looking for a skilled Senior Developer to join our team. The ideal candidate will have a strong background in JavaScript and experience with modern web technologies.',
    benefits: ['Health insurance', '401(k) matching', 'Paid time off'],
    experience_level: 'Senior',
  },
];
