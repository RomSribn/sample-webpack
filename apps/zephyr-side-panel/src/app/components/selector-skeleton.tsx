import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

export function SelectorSkeleton() {
  return (
    <Stack spacing={1} marginTop={2}>
      <Skeleton animation={'wave'} variant="text" width={100} />
      <Skeleton
        animation={'wave'}
        height={58}
        width={'100%'}
        variant="rounded"
        sx={{ borderRadius: 2 }}
      />
    </Stack>
  );
}
