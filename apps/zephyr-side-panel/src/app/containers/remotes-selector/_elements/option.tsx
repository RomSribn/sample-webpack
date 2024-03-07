import { HTMLAttributes } from 'react';
import { formatDistanceToNow } from 'date-fns';
// @mui
import { Box } from '@mui/material';

// types
import { ZeAppTagValue, ZeAppVersionItem } from 'zephyr-edge-contract';

interface ParsedZeAppVersionItem extends ZeAppTagValue {
  tagKey: string;
}

interface OptionProps extends HTMLAttributes<HTMLLIElement> {
  option: ZeAppVersionItem | ParsedZeAppVersionItem;
}
/**
 * The option of the application remote select. Includes the versions and tags varioant.
 */
const Option = ({ option, ...listProps }: OptionProps) => (
  <li {...listProps}>
    {'tagKey' in option ? (
      <>
        <Box>
          <div>
            <span className="application-group-select__version">
              {option.version}
            </span>
            <span className="application-group-select__date">
              {formatDistanceToNow(option.createdAt, { addSuffix: true })}
            </span>
          </div>
          <span className="application-group-select__author">
            {option.author}
          </span>
        </Box>
        <span className="tag-label">{option.tagKey}</span>
      </>
    ) : (
      <span className="application-group-select__version">
        {option.version}
      </span>
    )}
  </li>
);

export { Option };
