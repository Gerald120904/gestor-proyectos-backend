import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import {
  CountryCode,
  isSupportedCountry,
  parsePhoneNumberFromString,
} from 'libphonenumber-js';

export function IsInternationalPhone(
  countryField: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isInternationalPhone',
      target: object.constructor,
      propertyName,
      constraints: [countryField],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [relatedCountryField] = args.constraints;
          const dto = args.object as Record<string, unknown>;

          const country = dto[relatedCountryField];
          const phone = value;

          if (typeof country !== 'string') return false;
          if (typeof phone !== 'string') return false;

          const countryUpper = country.trim().toUpperCase();

          if (!isSupportedCountry(countryUpper as CountryCode)) {
            return false;
          }

          const cleanPhone = phone.replace(/\s+/g, '');

          const parsedPhone = parsePhoneNumberFromString(
            cleanPhone,
            countryUpper as CountryCode,
          );

          return Boolean(parsedPhone && parsedPhone.isValid());
        },

        defaultMessage(args: ValidationArguments) {
          const [relatedCountryField] = args.constraints;
          const dto = args.object as Record<string, unknown>;
          const country = dto[relatedCountryField];

          return `El teléfono no es válido para el país seleccionado (${country}).`;
        },
      },
    });
  };
}
