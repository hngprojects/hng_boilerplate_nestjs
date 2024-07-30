import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          const hasUppercase = /[A-Z]/.test(value);
          const hasLowercase = /[a-z]/.test(value);
          const hasNumber = /[0-9]/.test(value);
          const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(value);
          return hasUppercase && hasLowercase && hasNumber && hasSpecialCharacter;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
        },
      },
    });
  };
}
