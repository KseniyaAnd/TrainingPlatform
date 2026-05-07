import { describe, expect, it } from 'vitest';
import {
  createLoadingState,
  resetLoadingState,
  setLoadingError,
  setLoadingSuccess,
} from './loading-state.js';

describe('Loading State Utils', () => {
  describe('createLoadingState', () => {
    it('should create loading state with null data by default', () => {
      const state = createLoadingState<string>();

      expect(state.data()).toBeNull();
      expect(state.loading()).toBe(true);
      expect(state.error()).toBeNull();
    });

    it('should create loading state with initial data', () => {
      const initialData = { id: '1', name: 'Test' };
      const state = createLoadingState(initialData);

      expect(state.data()).toEqual(initialData);
      expect(state.loading()).toBe(true);
      expect(state.error()).toBeNull();
    });

    it('should create independent state instances', () => {
      const state1 = createLoadingState<string>();
      const state2 = createLoadingState<string>();

      state1.data.set('test1');
      state2.data.set('test2');

      expect(state1.data()).toBe('test1');
      expect(state2.data()).toBe('test2');
    });

    it('should work with different data types', () => {
      const stringState = createLoadingState<string>('initial');
      const numberState = createLoadingState<number>(42);
      const arrayState = createLoadingState<string[]>(['a', 'b']);
      const objectState = createLoadingState<{ key: string }>({ key: 'value' });

      expect(stringState.data()).toBe('initial');
      expect(numberState.data()).toBe(42);
      expect(arrayState.data()).toEqual(['a', 'b']);
      expect(objectState.data()).toEqual({ key: 'value' });
    });
  });

  describe('resetLoadingState', () => {
    it('should reset state to loading', () => {
      const state = createLoadingState<string>();
      state.loading.set(false);
      state.error.set('Some error');
      state.data.set('Some data');

      resetLoadingState(state);

      expect(state.loading()).toBe(true);
      expect(state.error()).toBeNull();
      expect(state.data()).toBe('Some data'); // data не сбрасывается
    });

    it('should clear previous error', () => {
      const state = createLoadingState<string>();
      state.error.set('Previous error');

      resetLoadingState(state);

      expect(state.error()).toBeNull();
    });

    it('should set loading to true even if already true', () => {
      const state = createLoadingState<string>();
      expect(state.loading()).toBe(true);

      resetLoadingState(state);

      expect(state.loading()).toBe(true);
    });
  });

  describe('setLoadingSuccess', () => {
    it('should set data and clear loading/error', () => {
      const state = createLoadingState<string>();
      const data = 'Success data';

      setLoadingSuccess(state, data);

      expect(state.data()).toBe(data);
      expect(state.loading()).toBe(false);
      expect(state.error()).toBeNull();
    });

    it('should replace previous data', () => {
      const state = createLoadingState<string>('old data');

      setLoadingSuccess(state, 'new data');

      expect(state.data()).toBe('new data');
    });

    it('should clear previous error', () => {
      const state = createLoadingState<string>();
      state.error.set('Previous error');

      setLoadingSuccess(state, 'data');

      expect(state.error()).toBeNull();
    });

    it('should work with complex data types', () => {
      interface User {
        id: string;
        name: string;
      }
      const state = createLoadingState<User>();
      const userData: User = { id: '1', name: 'John' };

      setLoadingSuccess(state, userData);

      expect(state.data()).toEqual(userData);
      expect(state.loading()).toBe(false);
    });

    it('should handle null data', () => {
      const state = createLoadingState<string | null>();

      setLoadingSuccess(state, null);

      expect(state.data()).toBeNull();
      expect(state.loading()).toBe(false);
      expect(state.error()).toBeNull();
    });
  });

  describe('setLoadingError', () => {
    it('should set error and stop loading', () => {
      const state = createLoadingState<string>();
      const errorMessage = 'Failed to load';

      setLoadingError(state, errorMessage);

      expect(state.error()).toBe(errorMessage);
      expect(state.loading()).toBe(false);
    });

    it('should not clear existing data', () => {
      const state = createLoadingState<string>('existing data');

      setLoadingError(state, 'Error occurred');

      expect(state.data()).toBe('existing data');
    });

    it('should replace previous error', () => {
      const state = createLoadingState<string>();
      state.error.set('Old error');

      setLoadingError(state, 'New error');

      expect(state.error()).toBe('New error');
    });

    it('should handle empty error message', () => {
      const state = createLoadingState<string>();

      setLoadingError(state, '');

      expect(state.error()).toBe('');
      expect(state.loading()).toBe(false);
    });
  });

  describe('loading state workflow', () => {
    it('should handle complete success workflow', () => {
      const state = createLoadingState<string>();

      // Initial state
      expect(state.loading()).toBe(true);
      expect(state.data()).toBeNull();
      expect(state.error()).toBeNull();

      // Success
      setLoadingSuccess(state, 'loaded data');
      expect(state.loading()).toBe(false);
      expect(state.data()).toBe('loaded data');
      expect(state.error()).toBeNull();
    });

    it('should handle complete error workflow', () => {
      const state = createLoadingState<string>();

      // Initial state
      expect(state.loading()).toBe(true);

      // Error
      setLoadingError(state, 'Load failed');
      expect(state.loading()).toBe(false);
      expect(state.error()).toBe('Load failed');
    });

    it('should handle retry workflow', () => {
      const state = createLoadingState<string>();

      // First attempt - error
      setLoadingError(state, 'First error');
      expect(state.loading()).toBe(false);
      expect(state.error()).toBe('First error');

      // Retry
      resetLoadingState(state);
      expect(state.loading()).toBe(true);
      expect(state.error()).toBeNull();

      // Second attempt - success
      setLoadingSuccess(state, 'Success data');
      expect(state.loading()).toBe(false);
      expect(state.data()).toBe('Success data');
      expect(state.error()).toBeNull();
    });

    it('should handle multiple data updates', () => {
      const state = createLoadingState<number>();

      setLoadingSuccess(state, 1);
      expect(state.data()).toBe(1);

      resetLoadingState(state);
      setLoadingSuccess(state, 2);
      expect(state.data()).toBe(2);

      resetLoadingState(state);
      setLoadingSuccess(state, 3);
      expect(state.data()).toBe(3);
    });
  });
});
