import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileSpreadsheet, Download, Clock, AlertCircle, Info } from 'lucide-react';

interface MzhiReportProps {
  folderName: string;
}

const MzhiReport: React.FC<MzhiReportProps> = ({ folderName }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [excelUrl, setExcelUrl] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    if (!folderName) return;

    fetch(`/api/files?folder_name=${folderName}`, {
        method: 'GET', // Явно указываем GET (можно не писать, т.к. fetch по умолчанию GET)
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Сообщения МЖИ</h1>
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
          <p className="text-blue-700 dark:text-blue-400">
            Отчет обновляется автоматически каждые 2 часа с 8:30 до 22:30.
          </p>
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

export default MzhiReport;