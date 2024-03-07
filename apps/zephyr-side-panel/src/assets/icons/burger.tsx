import { Box } from '@mui/material';

interface BurgerIconProps {
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
 * Burger icon with 3 lines, last line is a bit shorter than the first two.
 */
const BurgerIcon = ({
  className,
  color = '#53576C',
  width = 24,
  height = '100%',
}: BurgerIconProps) => (
  <Box width={width} height={height} display={'flex'} alignItems={'center'}>
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 7H21C21.2652 7 21.5196 6.89464 21.7071 6.70711C21.8946 6.51957 22 6.26522 22 6C22 5.73478 21.8946 5.48043 21.7071 5.29289C21.5196 5.10536 21.2652 5 21 5H3C2.73478 5 2.48043 5.10536 2.29289 5.29289C2.10536 5.48043 2 5.73478 2 6C2 6.26522 2.10536 6.51957 2.29289 6.70711C2.48043 6.89464 2.73478 7 3 7ZM21 11H3C2.73478 11 2.48043 11.1054 2.29289 11.2929C2.10536 11.4804 2 11.7348 2 12C2 12.2652 2.10536 12.5196 2.29289 12.7071C2.48043 12.8946 2.73478 13 3 13H21C21.2652 13 21.5196 12.8946 21.7071 12.7071C21.8946 12.5196 22 12.2652 22 12C22 11.7348 21.8946 11.4804 21.7071 11.2929C21.5196 11.1054 21.2652 11 21 11ZM13 17H3.26522C3 17 2.74565 17.1054 2.55811 17.2929C2.37057 17.4804 2.26522 17.7348 2.26522 18C2.26522 18.2652 2.37057 18.5196 2.55811 18.7071C2.74565 18.8946 3 19 3.26522 19H13C13.2652 19 13.5196 18.8946 13.7071 18.7071C13.8946 18.5196 14 18.2652 14 18C14 17.7348 13.8946 17.4804 13.7071 17.2929C13.5196 17.1054 13.2652 17 13 17Z"
        fill={color}
      />
    </svg>
  </Box>
);

export { BurgerIcon };
