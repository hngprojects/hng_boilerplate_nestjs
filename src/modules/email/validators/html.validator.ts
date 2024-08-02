import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsHtml(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isHtml',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const htmlRegex = /<\/?[a-z][\s\S]*>/i;
          return typeof value === 'string' && htmlRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be valid HTML`;
        },
      },
    });
  };
}