import React from 'react';
import { EarlyRiskIntelligenceView } from './EarlyRiskIntelligenceView';
import { NavView } from '../layout/Sidebar';
import { FieldRecord } from '../../types/agri';
import { AppLanguage } from '../../locales';

interface EarlyWarningViewProps {
  setActiveView?: (view: NavView) => void;
  fields?: FieldRecord[];
  onNavigateToScan?: () => void;
  onNavigateToFields?: () => void;
  language?: AppLanguage;
  onShowToast?: (msg: string) => void;
}

export const EarlyWarningView: React.FC<EarlyWarningViewProps> = (props) => {
  return (
    <EarlyRiskIntelligenceView
      fields={props.fields}
      onNavigateToScan={props.onNavigateToScan}
      onNavigateToFields={props.onNavigateToFields}
      language={props.language}
      onShowToast={props.onShowToast}
    />
  );
};
