import { FilterOptions } from './search';

export type RootStackParamList = {
  SearchTab: undefined;
  GalleryTab: { initialFilter?: Partial<FilterOptions> };
  ImageDetail: { mediaId: string };
  IndexingStatus: undefined;
};
