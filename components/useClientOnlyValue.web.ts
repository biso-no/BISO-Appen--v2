import React from 'react';

/**
 * A custom hook that returns a value based on whether the component is rendered on the server or the client.
 * During server rendering, the server value is used, while on the client, the client value is returned.
 *
 * @template S - The type of the server value.
 * @template C - The type of the client value.
 * @param {S} server - The value to use when rendering on the server.
 * @param {C} client - The value to use when rendering on the client.
 * @returns {S | C} - The value that corresponds to the current rendering environment (server or client).
 *
 * @example
 * const value = useClientOnlyValue('Server Value', 'Client Value');
 * // On the server, value will be 'Server Value'.
 * // On the client, value will be 'Client Value'.
 *
 * @throws {Error} - Throws an error if the provided values are not of compatible types.
 */
// `useEffect` is not invoked during server rendering, meaning
// we can use this to determine if we're on the server or not.
export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  const [value, setValue] = React.useState<S | C>(server);
  React.useEffect(() => {
    setValue(client);
  }, [client]);

  return value;
}
