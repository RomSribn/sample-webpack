import { useContext, useEffect, useRef, useCallback, useMemo } from 'react';
// @mui
import { TextField, Autocomplete } from '@mui/material';
// components
import { SelectorSkeleton } from '../../components/selector-skeleton';
import { CustomOption } from './custom-option';
import { CustomPopper } from './custom-popper';
// context
import { DataContext, PublishDataKeys } from '../../context/data-context';
// icons
import { ArrowDownIcon } from '../../../assets/icons';
// types, states
import { ZeAppVersionResponse } from 'zephyr-edge-contract';
import { ApplicationVersion } from '../../hooks/queries/application-version';

interface ApplicationVersionProps {
  applicationVersionList: ApplicationVersion[];
  fetchNextAppVersionListPage: () => void;
  hasNextAppVersionListPage: boolean;
  onAppVersionChange: (applicationVersion: ApplicationVersion) => void;
  appVersion?: ZeAppVersionResponse;
  isAppVersionLoading: boolean;
}
export function ApplicationVersionSelector({
  applicationVersionList,
  fetchNextAppVersionListPage,
  hasNextAppVersionListPage,
  onAppVersionChange,
  appVersion,
  isAppVersionLoading,
}: Readonly<ApplicationVersionProps>) {
  const { application, version, setData } = useContext(DataContext);
  const observer = useRef<IntersectionObserver>();

  const lastOption = useMemo(
    () => applicationVersionList[applicationVersionList.length - 1],
    [applicationVersionList],
  );

  const lastOptionElementRef = useCallback(
    (node: Element) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting && hasNextAppVersionListPage) {
          fetchNextAppVersionListPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [fetchNextAppVersionListPage, hasNextAppVersionListPage],
  );

  const _onAppVersionChange = (newVersion: ApplicationVersion) => {
    onAppVersionChange(newVersion);
    setData(newVersion, PublishDataKeys.VERSION);
  };

  // set version on the first load
  useEffect(() => {
    const initialVersion = applicationVersionList.find(
      (item) => item.version === appVersion?.version,
    );
    if (!initialVersion) return;
    setData(initialVersion, PublishDataKeys.VERSION);
  }, [applicationVersionList, version, appVersion, setData]);

  useEffect(() => observer.current?.disconnect(), []);

  if (isAppVersionLoading) return <SelectorSkeleton />;
  if (!appVersion) return null;

  return (
    <fieldset name="application-version">
      <label>Version</label>
      <Autocomplete
        className="custom-select"
        popupIcon={<ArrowDownIcon width={12} height={12} />}
        PopperComponent={CustomPopper}
        disableClearable={true}
        options={applicationVersionList}
        getOptionLabel={(option) => option.name}
        value={version}
        renderOption={(props, option, state, ownerState) => (
          <CustomOption
            renderOptionProps={[
              { ...props, contentEditable: true },
              option,
              state,
              ownerState,
            ]}
            handleChange={_onAppVersionChange}
            isLastElement={
              lastOption.snapshot_id === option.snapshot_id &&
              hasNextAppVersionListPage
            }
            optionRef={lastOptionElementRef}
          />
        )}
        renderInput={(params) => (
          <TextField
            id={params.id}
            inputProps={params.inputProps}
            InputProps={params.InputProps}
          />
        )}
        key={application.name}
      />
    </fieldset>
  );
}
