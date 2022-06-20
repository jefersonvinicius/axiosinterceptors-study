import { Store } from 'pullstate';

type User = { token: string; cartId: string };
type State = { user: User | null };

export const state = new Store<State>({
  user: null,
});
