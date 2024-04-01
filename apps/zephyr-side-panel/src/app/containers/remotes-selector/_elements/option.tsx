import { HTMLAttributes } from 'react';
import { formatDistanceToNow } from 'date-fns';
// @mui
import { Box, Tooltip } from '@mui/material';
// utils
import { getEllipsisString } from '../../../utils/get-ellipsis-string';

import { tagKey, SelectorOptionType } from '../index';

export interface OptionProps extends HTMLAttributes<HTMLLIElement> {
  option: SelectorOptionType;
}
/**
 * The option of the application remote select. Includes the versions and tags varioant.
 */
const Option = ({ option, ...listProps }: OptionProps) => (
  <Tooltip title={option?.version} placement="top">
    <li {...listProps}>
      {tagKey in option ? (
        <>
          <Box>
            <div>
              <span className="application-group-select__version">
                {getEllipsisString(option.version)}
              </span>
              <span className="application-group-select__date">
                {formatDistanceToNow(option.createdAt, { addSuffix: true })}
              </span>
            </div>
            <span className="application-group-select__author">
              {option.author}
            </span>
          </Box>
          <span className="tag-label">
            {getEllipsisString(option.name, 10)}
          </span>
        </>
      ) : (
        <span className="application-group-select__version">
          {option.version}
        </span>
      )}
    </li>
  </Tooltip>
);

export { Option };
