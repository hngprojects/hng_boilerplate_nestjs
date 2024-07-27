export const mockJobService = {
  getAllJobs: jest.fn().mockResolvedValue({
    message: 'Job listings retrieved successfully.',
    data: [
      {
        title: 'Software Engineer',
        description: 'Develop software applications',
        location: 'Remote',
        salary: '$100k',
        job_type: 'Full-time',
      },
    ],
    pagination: {
      current_page: 1,
      total_pages: 1,
      page_size: 10,
      total_items: 1,
    },
  }),
};
