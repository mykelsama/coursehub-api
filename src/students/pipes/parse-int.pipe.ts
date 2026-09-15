import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const parsed = Number(value);
    if (Number.isNaN(parsed) || !Number.isInteger(parsed)) {
      throw new BadRequestException(
        `El parámetro "${metadata.data}" debe ser un número entero`,
      );
    }
    return parsed;
  }
}