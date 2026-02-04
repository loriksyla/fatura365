import { Amplify } from 'aws-amplify';
import amplifyOutputs from '../amplify_outputs.json';

let configured = false;

export const configureAmplify = (): boolean => {
  if (configured) {
    return true;
  }

  if (!amplifyOutputs || Object.keys(amplifyOutputs).length === 0) {
    return false;
  }

  Amplify.configure(amplifyOutputs);
  configured = true;
  return true;
};
