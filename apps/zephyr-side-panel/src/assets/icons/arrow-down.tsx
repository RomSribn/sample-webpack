import { Box } from '@mui/material';

interface ArrowDownIconProps {
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
 * Arrow withouth the stem, pointing down icon.
 */
const ArrowDownIcon = ({
  color = '#73768F',
  width = 12,
  height = '100%',
}: ArrowDownIconProps) => (
  <Box width={width} height={height} display={'flex'} alignItems={'center'}>
    <svg
      width={width}
      height={height}
      viewBox="0 0 12 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.9753 1.1675C10.7879 0.981251 10.5345 0.876709 10.2703 0.876709C10.0061 0.876709 9.75265 0.981251 9.56529 1.1675L5.97529 4.7075L2.43529 1.1675C2.24793 0.981251 1.99448 0.876709 1.73029 0.876709C1.4661 0.876709 1.21265 0.981251 1.02529 1.1675C0.931562 1.26046 0.857168 1.37107 0.806399 1.49292C0.75563 1.61478 0.729492 1.74549 0.729492 1.8775C0.729492 2.00951 0.75563 2.14022 0.806399 2.26208C0.857168 2.38394 0.931562 2.49454 1.02529 2.5875L5.26529 6.8275C5.35825 6.92123 5.46885 6.99562 5.59071 7.04639C5.71257 7.09716 5.84328 7.1233 5.97529 7.1233C6.1073 7.1233 6.23801 7.09716 6.35987 7.04639C6.48173 6.99562 6.59233 6.92123 6.68529 6.8275L10.9753 2.5875C11.069 2.49454 11.1434 2.38394 11.1942 2.26208C11.245 2.14022 11.2711 2.00951 11.2711 1.8775C11.2711 1.74549 11.245 1.61478 11.1942 1.49292C11.1434 1.37107 11.069 1.26046 10.9753 1.1675Z"
        fill={color}
      />
    </svg>
  </Box>
);

export { ArrowDownIcon };
