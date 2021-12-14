import { JSONPath } from 'jsonpath-plus';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import DetailsViewPluginRenderer from '../../helpers/renderHelpers';
import { ApiError } from '../../lib/k8s/apiProxy';
import CRD, { KubeCRD, makeCustomResourceClass } from '../../lib/k8s/crd';
import { localeDate } from '../../lib/util';
import { HoverInfoLabel, NameValueTableRow, SectionBox } from '../common';
import Empty from '../common/EmptyContent';
import Loader from '../common/Loader';
import { ConditionsTable, MainInfoSection, PageGrid } from '../common/Resource';

export default function CustomResourceDetails() {
  const {
    crd: crdName,
    namespace: ns,
    crName,
  } = useParams<{
    crd: string;
    crName: string;
    namespace: string;
  }>();
  const [crd, setCRD] = React.useState<CRD | null>(null);
  const [error, setError] = React.useState<ApiError | null>(null);
  const [item, setItem] = React.useState<KubeCRD | null>(null);
  const [detailsError, setDetailsError] = React.useState<ApiError | null>(null);

  const namespace = ns === '-' ? undefined : ns;

  React.useEffect(() => {
    if (!crd) return;

    const versions: [string, string, string][] = (crd.jsonData as KubeCRD).spec.versions.map(
      versionInfo => [crd.spec.group, versionInfo.name, crd.spec.names.plural]
    );

    const CRClass = makeCustomResourceClass(versions, !!namespace);
    CRClass.useApiGet(setItem, crName, namespace, setDetailsError);
  }, [crd]);

  CRD.useApiGet(setCRD, crdName, undefined, setError);

  return (
    <PureCustomResourceDetails
      crd={crd}
      crName={crName}
      crdName={crdName}
      item={item}
      error={error}
      detailsError={detailsError}
    />
  );
}

type AdditionalPrinterColumns = KubeCRD['spec']['versions'][0]['additionalPrinterColumns'];

function getExtraColumns(crd: CRD, apiVersion: string) {
  const version = (crd.jsonData as KubeCRD).spec.versions.find(
    version => version.name === apiVersion
  );
  return version?.additionalPrinterColumns;
}

function getExtraInfo(extraInfoSpec: AdditionalPrinterColumns, item: KubeCRD) {
  const extraInfo: NameValueTableRow[] = [];
  extraInfoSpec.forEach(spec => {
    // Skip creation date because we already show it by default
    if (spec.jsonPath === '.metadata.creationTimestamp') {
      return;
    }

    let value: string | undefined;
    try {
      // Extract the value from the json item
      value = JSONPath({ path: '$' + spec.jsonPath, json: item });
    } catch (err) {
      console.error(`Failed to get value from JSONPath ${spec.jsonPath} on CR item ${item}`);
      return;
    }

    if (spec.type === 'date' && !!value) {
      value = localeDate(new Date(value));
    } else {
      // Make sure the value will be represented in string form (to account for
      // e.g. cases where we may get an array).
      value = value?.toString();
    }

    const desc = spec.description;

    extraInfo.push({
      name: spec.name,
      value: !!desc ? <HoverInfoLabel label={value || ''} hoverInfo={desc} /> : value,
      hide: value === '' || value === undefined,
    });
  });

  return extraInfo;
}

export interface PureCustomResourceDetailsProps {
  crd: CRD | null;
  crName: string;
  crdName: string;
  item: KubeCRD | null;
  error: ApiError | null;
  detailsError: ApiError | null;
}

export function PureCustomResourceDetails(props: PureCustomResourceDetailsProps) {
  const { crd, crName, crdName, item, error, detailsError } = props;

  console.log('asdf', JSON.stringify(props));
  const { t } = useTranslation('glossary');

  if (!crd) {
    return !!error ? (
      <Empty color="error">
        {t(`crd|Error getting custom resource definition ${crdName}: ${error.message}`)}
      </Empty>
    ) : (
      <Loader title={t('crd|Loading custom resource details')} />
    );
  }

  const apiVersion = item?.jsonData.apiVersion?.split('/')[1] || '';
  const extraColumns: AdditionalPrinterColumns = getExtraColumns(crd, apiVersion) || [];

  return !item ? (
    !!detailsError ? (
      <Empty color="error">
        {t(`crd|Error getting custom resource1 ${crName}: ${detailsError.message}`)}
      </Empty>
    ) : (
      <Loader title={t('crd|Loading custom resource details')} />
    )
  ) : (
    <PageGrid>
      <MainInfoSection
        resource={item}
        backLink={crd.detailsRoute}
        extraInfo={getExtraInfo(extraColumns, item!.jsonData)}
      />
      {item!.jsonData.status?.conditions && (
        <SectionBox>
          <ConditionsTable resource={item.jsonData} showLastUpdate={false} />
        </SectionBox>
      )}
      <DetailsViewPluginRenderer resource={item} />
    </PageGrid>
  );
}
