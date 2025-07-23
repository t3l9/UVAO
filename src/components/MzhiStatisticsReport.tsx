import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileSpreadsheet, Download, Clock, AlertCircle, Info, Calendar } from 'lucide-react';

interface MzhiStatisticsReportProps {
  folderName: string;
}

const MzhiStatisticsReport: React.FC<MzhiStatisticsReportProps> = ({ folderName }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [excelUrl, setExcelUrl] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [reportPeriod, setReportPeriod] = useState<string>('');

  // Функция для определения отчетного периода
  const getReportPeriod = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = воскресенье, 1 = понедельник, и т.д.
    
    let startDate: Date;
    let endDate: Date;
    
    if (dayOfWeek === 1) { // Понедельник
      // Показываем прошедшую неделю (понедельник - воскресенье)
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7); // Прошлый понедельник
      
      endDate = new Date(today);
      endDate.setDate(today.getDate() - 1); // Прошлое воскресенье
    } else {
      // Показываем текущую неделю (понедельник этой недели - сегодня)
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Если воскресенье, то 6 дней от понедельника
      
      startDate = new Date(today);
      startDate.setDate(today.getDate() - daysFromMonday); // Понедельник этой недели
      
      endDate = new Date(today); // Сегодня
    }
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  useEffect(() => {
    setReportPeriod(getReportPeriod());
  }, []);

  useEffect(() => {
    if (!folderName) return;

    fetch(`/api/files?folder_name=${folderName}`, {
        method: 'GET',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.pdf) setPdfUrl(`/${folderName}/${data.pdf}`);
        if (data.xlsx) setExcelUrl(`/${folderName}/${data.xlsx}`);
        
        if (data.pdf || data.xlsx) {
            const latestFileName = data.pdf || data.xlsx;
            const match = latestFileName.match(/ (\d{2}\.\d{2}\.\d{4} \d{2}-\d{2})\./);
            if (match) setLastUpdate(match[1]);
        }
    })
    .catch(error => {
        console.error('Ошибка при загрузке файлов:', error);
        setPdfUrl(null);
        setExcelUrl(null);
        setLastUpdate("Ошибка загрузки");
    });
  }, [folderName]);

  if (!folderName) {
    return <div className="text-gray-900 dark:text-white">Название папки не указано.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-800 dark:hover:text-purple-400 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Статистика МЖИ</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Clock size={20} />
            <span>Обновлено: {lastUpdate || 'Неизвестно'}</span>
          </div>
          {excelUrl && (
            <a href={excelUrl} download className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
              <FileSpreadsheet size={20} />
              Скачать Excel
            </a>
          )}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4">
        <div className="flex gap-2">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-700 dark:text-blue-400">
              Отчет содержит статистику по всем нарушениям МЖИ (в работе и устраненные) за отчетный период.
            </p>
            <p className="text-blue-700 dark:text-blue-400 mt-1">
              Отчет обновляется автоматически каждые 2 часа с 8:30 до 22:30.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4">
        <div className="flex gap-2">
          <Calendar className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-400">Отчетный период</p>
            <p className="text-amber-700 dark:text-amber-400 mt-1">
              {reportPeriod}
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-500 mt-2">
              {new Date().getDay() === 1 
                ? "В понедельник отображается статистика за прошедшую неделю"
                : "Отображается статистика с понедельника текущей недели по сегодня"
              }
            </p>
          </div>
        </div>
      </div>

      {/* Блок ошибки */}
      {/* <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6"> */}
        {/* <div className="flex items-center gap-2"> */}
          {/* <AlertCircle className="w-5 h-5 text-red-500" /> */}
          {/* <p className="font-medium text-red-800 dark:text-red-400">Ошибка</p> */}
        {/* </div> */}
        {/* <p className="mt-2 text-red-700 dark:text-red-400"> */}
          {/* Возникла ошибка при выгрузке Excel-файла с портала. Пожалуйста, подождите следующую выгрузку. */}
        {/* </p> */}
      {/* </div> */}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 min-h-[600px]">
        <object data={pdfUrl || ''} type="application/pdf" className="w-full h-[600px]">
          <p className="text-gray-900 dark:text-white">
            PDF не может быть отображен.{' '}
            <a href={pdfUrl || '#'} download className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">
              Скачать PDF
            </a>
          </p>
        </object>
      </div>
    </div>
  );
};

export default MzhiStatisticsReport;