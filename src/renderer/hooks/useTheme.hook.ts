import { useStore } from '../store';
import { selectThemeState } from '../store/selectors';

export const useTheme = () => {
  return useStore(selectThemeState);
};
