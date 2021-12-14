import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';
import { ApiError } from '../../lib/k8s/apiProxy';
import { PureCustomResourceDetails, PureCustomResourceDetailsProps } from './CustomResourceDetails';

export default {
  title: 'crd/CustomResourceDetails',
  component: PureCustomResourceDetails,
  argTypes: {},
  decorators: [Story => <Story />],
} as Meta;

const Template: Story<PureCustomResourceDetailsProps> = args => (
  <PureCustomResourceDetails {...args} />
);

export const ErrorGettingCRD = Template.bind({});
ErrorGettingCRD.args = {
  crd: null,
  crName: '',
  crdName: '',
  item: null,
  error: Error('An error happened') as ApiError,
  detailsError: null,
};

export const LoadingCRD = Template.bind({});
LoadingCRD.args = {
  crd: null,
  crName: '',
  crdName: '',
  item: null,
  error: null,
  detailsError: null,
};

export const LoadingDetails = Template.bind({});
LoadingDetails.args = {
  crd: null, //todo
  crName: '',
  crdName: '',
  item: null,
  error: null,
  detailsError: null,
};

export const ErrorGettingDetails = Template.bind({});
ErrorGettingDetails.args = {
  crd: null, //todo
  crName: '',
  crdName: '',
  item: null, //todo
  error: null,
  detailsError: Error('An error happened') as ApiError,
};

export const NoError = Template.bind({});
NoError.args = {
  crd: null, //todo
  crName: '',
  crdName: '',
  item: null, //todo
  error: null,
  detailsError: null,
};
