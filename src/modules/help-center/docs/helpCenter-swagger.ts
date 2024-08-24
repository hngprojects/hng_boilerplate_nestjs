import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiOperation } from '@nestjs/swagger';

export function CreateHelpCenterDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new help center topic' }),
    ApiResponse({ status: 201, description: 'The topic has been successfully created.' }),
    ApiResponse({ status: 400, description: 'Invalid input data.' }),
    ApiResponse({ status: 400, description: 'This question already exists.' })
  );
}

export function GetAllHelpCenterDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all help center topics' }),
    ApiResponse({ status: 200, description: 'The found records' })
  );
}

export function GetByIdHelpCenterDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a help center topic by ID' }),
    ApiResponse({ status: 200, description: 'The found record' }),
    ApiResponse({ status: 404, description: 'Topic not found' })
  );
}

export function SearchHelpCenterDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Search help center topics' }),
    ApiResponse({ status: 200, description: 'The found records' }),
    ApiResponse({ status: 422, description: 'Invalid search criteria.' })
  );
}

export function UpdateHelpCenterDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a help center topic by id' }),
    ApiResponse({ status: 200, description: 'Topic updated successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized, please provide valid credentials' }),
    ApiResponse({ status: 403, description: 'Access denied, only authorized users can access this endpoint' }),
    ApiResponse({ status: 404, description: 'Topic not found, please check and try again' }),
    ApiResponse({ status: 500, description: 'Internal Server Error' })
  );
}

export function DeleteHelpCenterDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a help center topic by id' }),
    ApiResponse({ status: 200, description: 'Topic deleted successfully' }),
    ApiResponse({ status: 401, description: 'Unauthorized, please provide valid credentials' }),
    ApiResponse({ status: 403, description: 'Access denied, only authorized users can access this endpoint' }),
    ApiResponse({ status: 404, description: 'Topic not found, please check and try again' }),
    ApiResponse({ status: 500, description: 'Internal Server Error' })
  );
}
