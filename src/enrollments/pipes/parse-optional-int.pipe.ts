import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseOptionalIntPipe
  implements PipeTransform<string | undefined, number | undefined>
{
  transform(value: string | undefined, metadata: ArgumentMetadata): number | undefined {
    if (value === undefined || value === '') return undefined;

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException(
        `El parámetro "${metadata.data}" debe ser un entero positivo`,
      );
    }
    return parsed;
  }
}