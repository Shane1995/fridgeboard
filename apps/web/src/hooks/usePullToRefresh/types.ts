export type PullToRefreshOptions = {
  onRefresh: () => Promise<unknown>;
  enabled: boolean;
};

export type PullToRefreshState = {
  distance: number;
  isRefreshing: boolean;
  isReady: boolean;
};
