import UserInterface from '../../user/interfaces/UserInterface';

export class OrganisationMembersResponseDto {
  status_code: number;
  data: Omit<Partial<UserInterface>, 'password'>[];
  message: string;
}
