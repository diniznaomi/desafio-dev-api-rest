import { UpdateStatusDto } from '../../../accounts/dtos/update-status.dto';
import { AccountStatus } from '../../../accounts/enums/account-status.enum';

export function makeUpdateStatusDto(
  status: AccountStatus = AccountStatus.ACTIVE,
): UpdateStatusDto {
  return {
    status,
  };
}
