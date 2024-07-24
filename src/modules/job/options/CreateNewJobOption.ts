import JobInterface from '../interfaces/JobInterface';

type CreateNewJobOption = Pick<
  JobInterface,
  'title' | 'description' | 'organisation' | 'location' | 'salary' | 'job_type'
>;

export default CreateNewJobOption;
