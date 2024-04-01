import { HTMLAttributes } from 'react';
import { formatDistanceToNow } from 'date-fns';
// @mui
import { Box, Tooltip } from '@mui/material';
import { ApplicationTag } from '../../hooks/queries/application-tag';
// utils
import { getEllipsisString } from '../../utils/get-ellipsis-string';

interface OptionProps extends HTMLAttributes<HTMLLIElement> {
  tag?: ApplicationTag;
  handleChange: (tag?: ApplicationTag) => void;
}

/**
 * The Option component of the application remote select. Includes the versions and tags varioant.
 */
const CustomOption = ({ tag, handleChange, ...listProps }: OptionProps) => (
  <Tooltip title={tag?.version} placement="top">
    <Box
      {...listProps}
      onClick={(e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
        listProps.onClick?.(e);
        handleChange(tag);
      }}
      component="li"
      contentEditable={true}
    >
      {tag ? (
        <>
          <Box>
            <div>
              <span className="application-group-select__version">
                {getEllipsisString(tag.version)}
              </span>
              <span className="application-group-select__date">
                {formatDistanceToNow(tag.createdAt, { addSuffix: true })}
              </span>
            </div>
            <span className="application-group-select__author">
              {tag.author}
            </span>
          </Box>
          <span className="tag-label">{getEllipsisString(tag.name, 10)}</span>
        </>
      ) : (
        <span className="application-group-select__version">No options</span>
      )}
    </Box>
  </Tooltip>
);

export { CustomOption };
