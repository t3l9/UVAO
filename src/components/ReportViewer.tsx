import React from 'react';
import { useParams } from 'react-router-dom';
import OurCityReport from './OurCityReport';
import MayorMonitorReport from './MayorMonitorReport';
import PrefectReport from './PrefectReport';
import MzhiReport from './MzhiReport';
import MzhiStatisticsReport from './MzhiStatisticsReport';

// Сопоставление типов отчетов с папками
const folderMapping: { [key: string]: string } = {
  'our-city': 'NG',
  'mayor-monitor': 'MM',
  'prefect': 'Pref',
  'mzhi': 'MWI',
  'mzhi-statistics': 'MWIS',
};

function ReportViewer() {
  const { type } = useParams<{ type: string }>();

  // Определяем folderName на основе типа отчета
  const folderName = folderMapping[type || ''] || '';

  const renderReport = () => {
    switch (type) {
      case 'our-city':
        return <OurCityReport folderName={folderName}/>;
      case 'mayor-monitor':
        return <MayorMonitorReport folderName={folderName}/>;
      case 'prefect':
        return <PrefectReport folderName={folderName}/>;
      case 'mzhi':
        return <MzhiReport folderName={folderName}/>;
      case 'mzhi-statistics':
        return <MzhiStatisticsReport folderName={folderName}/>;
      default:
        return <div>Отчет не найден</div>;
    }
  };

  return (
    <div>
      {renderReport()}
    </div>
  );
}

export default ReportViewer;