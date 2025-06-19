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
    return <div>Название папки не указано.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="p-2 text-gray-600 hover:text-purple-800 rounded-full hover:bg-purple-50"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Сообщения МЖИ</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
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

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
        <div className="flex gap-2">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-blue-700">
            Отчет обновляется автоматически каждые 2 часа с 8:30 до 22:30.
          </p>
        </div>
      </div>

      {/* Блок ошибки */}
      {/* <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6"> */}
        {/* <div className="flex items-center gap-2"> */}
          {/* <AlertCircle className="w-5 h-5 text-red-500" /> */}
          {/* <p className="font-medium text-red-800">Ошибка</p> */}
        {/* </div> */}
        {/* <p className="mt-2 text-red-700"> */}
          {/* Возникла ошибка при выгрузке Excel-файла с портала. Пожалуйста, подождите следующую выгрузку. */}
        {/* </p> */}
      {/* </div> */}

      <div className="bg-white rounded-lg shadow-sm p-4 min-h-[600px]">
        <object data={pdfUrl || ''} type="application/pdf" className="w-full h-[600px]">
          <p>
            PDF не может быть отображен.{' '}
            <a href={pdfUrl || '#'} download className="text-purple-600 hover:text-purple-800">
              Скачать PDF
            </a>
          </p>
        </object>
      </div>
    </div>
  );
};

export default MzhiReport;