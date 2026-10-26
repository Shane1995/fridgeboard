export type PullToRefreshProps = {
  onRefresh: () => Promise<unknown>;
  enabled: boolean;
};
