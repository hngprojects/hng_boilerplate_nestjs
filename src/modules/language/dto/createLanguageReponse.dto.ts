export class createLanguageResponseDto {
  status_code: string;
  message: string;
  language: {
    id: string;
    code: string;
    name: string;
    native_name: string;
    direction: string;
    created_at: string;
    updated_at: string;
  };
}
