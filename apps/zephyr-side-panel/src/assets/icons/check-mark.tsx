import { Box } from '@mui/material';

interface CheckMarkIconProps {
  className?: string;
  /**
   * color of the icon
   */
  color?: string;
  /**
   * width of the icon
   */
  width?: number;
  /**
   * height of the icon
   */
  height?: number | string;
}
/**
 * Simple check mark icon.
 */
const CheckMarkIcon = ({
  className,
  color = '#F3F6FF',
  width = 15,
  height = '100%',
}: CheckMarkIconProps) => (
  <Box width={width} height={height} display={'flex'} alignItems={'center'}>
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 15 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 6L5.91305 9.67388L13.5 2"
        stroke={color}
        stroke-width="2.08696"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </Box>
);

export { CheckMarkIcon };
