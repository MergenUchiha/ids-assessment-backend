import { IsBoolean, IsOptional } from 'class-validator';

export class CreateRunDto {
  /**
   * A baseline run carries no attack, so any alert it triggers is a false
   * positive. It is what makes the false-positive rate measurable.
   */
  @IsOptional()
  @IsBoolean()
  isBaseline?: boolean;
}
