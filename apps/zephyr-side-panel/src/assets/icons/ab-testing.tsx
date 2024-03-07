import { Box } from '@mui/material';

interface AbTestingIconProps {
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
 * Two rectangles icon, demonstrating the concept of A/B testing.
 */
const AbTestingIcon = ({
  color = '#EBEFFF',
  width = 24,
  height = '100%',
}: AbTestingIconProps) => (
  <Box width={width} height={height} display={'flex'} alignItems={'center'}>
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <path
        d="M20.1 3H3.9C3.66131 3 3.43239 3.09482 3.2636 3.2636C3.09482 3.43239 3 3.66131 3 3.9V20.1C3 20.3387 3.09482 20.5676 3.2636 20.7364C3.43239 20.9052 3.66131 21 3.9 21H20.1C20.3387 21 20.5676 20.9052 20.7364 20.7364C20.9052 20.5676 21 20.3387 21 20.1V3.9C21 3.66131 20.9052 3.43239 20.7364 3.2636C20.5676 3.09482 20.3387 3 20.1 3ZM11.1 19.2H4.8V4.8H11.1V19.2ZM19.2 19.2H12.9V4.8H19.2V19.2Z"
        fill={color}
      />
    </svg>
  </Box>
);

export { AbTestingIcon };
