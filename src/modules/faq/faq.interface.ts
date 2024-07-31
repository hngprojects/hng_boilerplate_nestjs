export interface IFaq {
    id: string;
    question: string;
    answer: string;
    category: string;
    createdBy: string;
    created_at: Date;
    updated_at: Date;
}


export interface ICreateFaqResponse {
    status_code: number;
    success: boolean;
    data: IFaq;
}
