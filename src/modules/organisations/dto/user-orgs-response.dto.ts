import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { OrganisationRequestDto } from "./organisation.dto";
import { OrganisationRole } from "../../organisation-role/entities/organisation-role.entity"

class MemberOrgDto {
    @ApiProperty({
        description: "List of User's Role in Organisation"
    })
    role: Omit<Partial<OrganisationRole>, 'description, organisation, organisationMembers'>;

    @ApiProperty({
        description: "Organisation details"
    })
    organisation: OrganisationRequestDto;
}

class DataDto{
    @ApiProperty({
        description: "List of User's Created Organisations"
    })
    created_organisations: OrganisationRequestDto[];

    @ApiProperty({
        description: "List of User's Owned Organisations"
    })
    owned_organisations: OrganisationRequestDto[];

    @ApiProperty({
        description: "List of User's Member Organisations"
    })
    member_organisations: MemberOrgDto[];
}

export class UserOrganizationResponseDto{
    @ApiProperty({
        description: "Response message",
        example: "Organisations successfully retrieved"
    })
    @IsString()
    message: string;

    @ApiProperty({
        description: "Response status"
    })
    status: number;

    @ApiProperty({
        description: "List of all the user's organisations"
    })
    data: DataDto
}

export class UserOrganizationErrorResponseDto{
    @ApiProperty({
        description: "Response message",
        example: "User has no organisations"
    })
    @IsString()
    message: string;

    @ApiProperty({
        description: "Error response status code"
    })
    status: number;
}