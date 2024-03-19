import { useContext } from 'react';
// @mui
import { Popper, Autocomplete, TextField } from '@mui/material';
// elements
import { Option } from './option';
// context
import { AppContext } from '../../context/app-context';
// icons
import { ArrowDownIcon } from '../../../assets/icons';
import { ApplicationTag } from '../../hooks/queries/application-tag';

// TODO: remove this when the real data is available.
const DEFAULT_TAG = 'latest';

interface ApplicationTagSelectorProps {
  /**
   * The title of the navigation.
   */
  title: string;
  /**
   * The tags of the application.
   */
  tags: ApplicationTag[];
  /**
   * The callback to handle the application tag change.
   */
  onAppTagChange: (tag: ApplicationTag) => void;
}
/**
 * Application tag root selector.
 */
const ApplicationTagSelector = ({
  title,
  tags,
  onAppTagChange,
}: ApplicationTagSelectorProps) => {
  const { setIsDeployed } = useContext(AppContext);

  const onChange = (_: unknown, newTag: ApplicationTag) => {
    onAppTagChange(newTag);
    setIsDeployed(newTag.id === DEFAULT_TAG);
  };

  return (
    <fieldset name="application-tag">
      <label>{title}</label>
      <Autocomplete
        className="custom-select"
        popupIcon={<ArrowDownIcon width={12} height={12} />}
        PopperComponent={({ ...props }) => (
          <Popper
            {...props}
            className="custom-select__popper application-group-select"
            style={{
              ...props.style,
              height: '4px',
            }}
          />
        )}
        renderGroup={(params) => (
          <li key={params.key}>
            <div>{params.group}</div>
            <div>{params.children}</div>
          </li>
        )}
        disableClearable={true}
        onChange={onChange}
        getOptionLabel={(option) => option.name}
        options={tags}
        renderOption={(props, tag) => (
          <Option {...props} tag={tag} contentEditable="true" />
        )}
        renderInput={({ id, inputProps, InputProps }) => (
          <TextField id={id} inputProps={inputProps} InputProps={InputProps} />
        )}
        key={title}
      />
    </fieldset>
  );
};

export { ApplicationTagSelector };
