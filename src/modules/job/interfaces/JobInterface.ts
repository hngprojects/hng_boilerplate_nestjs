interface JobInterface {
  id: string;

  title: string;

  description: string;

  organisation: string;

  location: string;

  job_type: string;

  salary: string;

  created_at: Date;

  updated_at: Date;
}

export default JobInterface;
