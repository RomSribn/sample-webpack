import { useMemo } from 'react';

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

export interface RemoteDescriptor {
  // "name": "valorkin-zephyr-mono-team-blue",
  name: string;
  // "url": "http://valorkin-zephyr-mono-team-blue_valorkin_535.edge.local:8787/remoteEntry.js",
  url: string;
  // "versions": [
  //   {
  //     "name": "valorkin-zephyr-mono-team-blue_valorkin_535",
  //     "url": "valorkin-zephyr-mono-team-blue_valorkin_535.edge.local"
  //   }
  // ],
  versions: { name: string; url: string }[];
  // "fallback": "http://localhost:4300/remoteEntry.js",
  fallback: string;
  // "latest": "http://valorkin-zephyr-mono-team-blue.edge.local:8787/remoteEntry.js",
  latest: string;
  // "version": "valorkin-zephyr-mono-team-blue_valorkin_535"
  version: string;
}

interface ApplicationSelectorProps {
  remoteKey: string;
  version: string;
  remote: RemoteDescriptor;
  onChange: (
    appName:
      | { key: string; version: string; url: string; name: string }
      | undefined
  ) => void;
}

export function RemotesSelector({
  remoteKey,
  version,
  remote,
  onChange: onRemoteChange,
}: ApplicationSelectorProps) {
  console.log('🖼️ RemotesSelector', remoteKey, version, remote);
  const options = useMemo(
    () => remote?.versions?.map((version) => version.name),
    [remote]
  );

  const onChange = (event: unknown, newValue: string) => {
    if (version === newValue) return;

    const _remote = remote?.versions.find(
      (version) => version.name === newValue
    );
    if (!_remote) return;
    const _url = new URL(remote.url);
    _url.hostname = _remote.url;

    onRemoteChange({
      key: remoteKey,
      version: newValue,
      url: _url.toString(),
      name: _remote.name,
    });
  };

  return (
    <fieldset name={remote.version}>
      <label>{remote.name}</label>
      <Autocomplete
        disableClearable={true}
        defaultValue={version}
        onChange={onChange}
        options={options}
        renderInput={(params) => <TextField {...params} />}
        key={remote.version}
      />
    </fieldset>
  );
}
