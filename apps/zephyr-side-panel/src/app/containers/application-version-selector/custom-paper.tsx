import { Paper, PaperProps } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
// types
import { ApplicationVersion } from '../../hooks/queries/application-version';

interface CustomPaperProps extends PaperProps {
  applicationVersionList: ApplicationVersion[];
  fetchNextAppVersionListPage: () => void;
  applicationVersionListCount: number;
  hasNextAppVersionListPage: boolean;
}

/**
 * Custom Paper component for the MUI Autocomplete with infinite scroll.
 */
const CustomPaper: React.FC<CustomPaperProps> = ({
  applicationVersionList,
  fetchNextAppVersionListPage,
  applicationVersionListCount,
  hasNextAppVersionListPage,
  ...paperProps
}) => (
  <InfiniteScroll
    height={200}
    dataLength={applicationVersionListCount}
    next={fetchNextAppVersionListPage}
    hasMore={hasNextAppVersionListPage}
    loader={
      <p style={{ textAlign: 'center', backgroundColor: '#f9dc01' }}>
        <b>Loading...</b>
      </p>
    }
  >
    <Paper {...paperProps} />
  </InfiniteScroll>
);

export { CustomPaper };
