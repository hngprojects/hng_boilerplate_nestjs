export class TeamMemberResponseDto {
  id: string;
  name: string;
  title: string;
  description: string;
  image: string;
  socials: {
    facebook: string;
    twitter: string;
    instagram: string;
  };
}
