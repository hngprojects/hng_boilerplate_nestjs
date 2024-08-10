export interface IFaq {
  id: string;
  question: string;
  answer: string;
  category: string;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateFaqResponse {
  status_code: number;
  message: string;
  data: IFaq;
}
