import { screenWidth } from './constants';

export const useResponsiveStyles = () => {
  const isSmallScreen = screenWidth < 375;
  const isLargeScreen = screenWidth >= 414;

  return {
    titleSize: isSmallScreen ? 'text-xl' : isLargeScreen ? 'text-3xl' : 'text-2xl',
    subtitleSize: isSmallScreen ? 'text-sm' : 'text-base',
    modalTitleSize: isSmallScreen ? 'text-lg' : 'text-xl',
    inputTextSize: isSmallScreen ? 'text-sm' : 'text-base',
    vehicleTextSize: isSmallScreen ? 'text-xs' : 'text-sm',
    priceTextSize: isSmallScreen ? 'text-sm' : 'text-base',
    containerPadding: isSmallScreen ? 'px-4' : 'px-5',
    modalPadding: isSmallScreen ? 'p-4' : 'p-5',
    inputPadding: isSmallScreen ? 'p-2' : 'p-3',
    buttonPadding: isSmallScreen ? 'p-3' : 'p-4',
    iconSize: isSmallScreen ? 20 : 24,
    largeIconSize: isSmallScreen ? 24 : 28,
    modalWidth: isSmallScreen ? 'w-11/12' : 'w-10/12',
    modalMaxHeight: isSmallScreen ? 'max-h-3/4' : 'max-h-4/5',
    vehicleMinWidth: isSmallScreen ? 'min-w-[48%]' : 'min-w-[45%]',
    vehiclePadding: isSmallScreen ? 'p-2' : 'p-3',
    vehicleIconSize: isSmallScreen ? 20 : 24,
  };
};