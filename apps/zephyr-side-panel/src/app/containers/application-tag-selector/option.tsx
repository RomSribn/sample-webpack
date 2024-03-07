import { HTMLAttributes } from 'react';
import { formatDistanceToNow } from 'date-fns';
// @mui
import { Box, Tooltip } from '@mui/material';
// types
import { type ApplicationTag } from '../../hooks/queries';

const TAG_ID_LIMIT = 5;
const getLimitedTagId = (tagId: string) =>
  tagId.length > TAG_ID_LIMIT ? `${tagId.slice(0, 12)}…` : tagId;

interface OptionProps extends HTMLAttributes<HTMLLIElement> {
  tag?: ApplicationTag;
}
/**
 * The option of the application remote select. Includes the versions and tags varioant.
 */
const Option = ({ tag, ...listProps }: OptionProps) => (
  <Tooltip
    title={tag?.id && tag.id.length > TAG_ID_LIMIT && tag.id}
    placement="top"
  >
    <li {...listProps}>
      {tag ? (
        <>
          <Box>
            <div>
              <span className="application-group-select__version">
                {getLimitedTagId(tag.id)}
              </span>
              <span className="application-group-select__date">
                {
                  formatDistanceToNow(new Date(), {
                    addSuffix: true,
                  }) /* TODO: replace with real data */
                }
              </span>
            </div>
            <span className="application-group-select__author">
              {'Name Surname' /* TODO: replace with real data */}
            </span>
          </Box>
          <span className="tag-label">{tag.name}</span>
        </>
      ) : (
        <span className="application-group-select__version">No options</span>
      )}
    </li>
  </Tooltip>
);

export { Option };
