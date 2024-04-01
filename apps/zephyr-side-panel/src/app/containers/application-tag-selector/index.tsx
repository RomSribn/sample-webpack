import { useContext, useEffect } from 'react';
// @mui
import { Autocomplete, TextField } from '@mui/material';
// components, elements
import { SelectorSkeleton } from '../../components/selector-skeleton';
import { CustomOption } from './custom-option';
import { CustomPopper } from './custom-popper';
// context
import {
  DataContext,
  PublishDataKeys,
  defaultState,
} from '../../context/data-context';
// icons
import { ArrowDownIcon } from '../../../assets/icons';
import { ApplicationTag } from '../../hooks/queries/application-tag';
// types, states
import { ZeAppVersion } from 'zephyr-edge-contract';

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
  /**
   * Current application version.
   */
  appVersion?: ZeAppVersion;
  /**
   * The loading state of the application version.
   */
  isAppVersionLoading: boolean;
}
/**
 * Application tag root selector.
 */
const ApplicationTagSelector = ({
  title,
  tags,
  onAppTagChange,
  appVersion,
  isAppVersionLoading,
}: ApplicationTagSelectorProps) => {
  const { tag, application, setData } = useContext(DataContext);

  const onChange = (newTag?: ApplicationTag) => {
    if (!newTag) return;

    onAppTagChange(newTag);
    setData(newTag, PublishDataKeys.TAG);
  };

  // set tag on the first load
  useEffect(() => {
    const initialTag = tags.find((tag) => tag.name === appVersion?.tag);
    if (!initialTag || tag.application_uid) return;
    setData(initialTag, PublishDataKeys.TAG);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appVersion?.tag, application, setData, tags]);

  if (isAppVersionLoading) return <SelectorSkeleton />;
  if (!appVersion) return null;

  return (
    <fieldset name="application-tag">
      <label>{title}</label>
      <Autocomplete
        className="custom-select"
        popupIcon={<ArrowDownIcon width={12} height={12} />}
        PopperComponent={CustomPopper}
        renderGroup={(params) => (
          <li key={params.key}>
            <div>{params.group}</div>
            <div>{params.children}</div>
          </li>
        )}
        disableClearable={false}
        getOptionLabel={(option) => option.name}
        options={tags}
        value={tag}
        onInputChange={(event, newInputValue, reason) => {
          if (reason !== 'clear') return;
          setData(defaultState[PublishDataKeys.TAG], PublishDataKeys.TAG);
        }}
        renderOption={(props, tag) => (
          <CustomOption
            {...props}
            handleChange={onChange}
            tag={tag}
            contentEditable="true"
          />
        )}
        renderInput={({ id, inputProps, InputProps }) => (
          <TextField id={id} inputProps={inputProps} InputProps={InputProps} />
        )}
        // reset autocomplete on application change
        key={application.application_uid}
      />
    </fieldset>
  );
};

export { ApplicationTagSelector };
