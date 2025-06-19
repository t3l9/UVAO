import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

// Интерфейсы для типизации данных
interface File {
  name: string;
  type: 'pdf' | 'xlsx';
  datetime: string; // Полная дата и время (например, "24.04.2025 14:30")
}

interface Report {
  date: string; // Только дата (например, "24.04.2025")
  files: File[]; // Массив файлов за эту дату
}

interface ArchiveReportsProps {
  user: {
    duty: string;
  };
}

// Типы отчетов
const reportTypes = [
  {
    id: 'our-city',
    title: "Обращения на портале 'Наш город'",
    folder: 'NG',
  },
  {
    id: 'mayor-monitor',
    title: 'Обращения на мониторе мэра',
    folder: 'MM',
  },
  {
    id: 'prefect',
    title: 'Сообщения личного кабинета Префекта',
    folder: 'Pref',
  },
  {
    id: 'mzhi',
    title: 'Сообщения МЖИ',
    folder: 'MWI',
  },
];

function ArchiveReports({ user }: ArchiveReportsProps) {
  // Состояния компонента
  const [selectedType, setSelectedType] = useState<string>(''); // Выбранный тип отчета
  const [reports, setReports] = useState<Report[]>([]); // Список отчетов
  const [currentPage, setCurrentPage] = useState<number>(1); // Текущая страница пагинации
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState<boolean>(false); // Открыто ли выпадающее меню типов отчетов
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set()); // Состояние развернутых дат

  const reportsPerPage = 10; // Количество отчетов на странице

  // Загрузка данных при изменении типа отчета
  useEffect(() => {
    if (selectedType && user.duty === 'Префектура') {
      const folder = reportTypes.find(type => type.id === selectedType)?.folder;
      if (folder) {
        fetch(`/api/archive?folder=${folder}`)
          .then(response => response.json())
          .then(data => setReports(data))
          .catch(error => console.error('Error fetching archive:', error));
      }
    }
  }, [selectedType, user.duty]);

  // Если пользователь не имеет доступа
  if (user.duty !== 'Префектура') {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <p className="text-red-700">
          У вас нет доступа к этому разделу.
        </p>
      </div>
    );
  }

  // Пагинация
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = reports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(reports.length / reportsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Переключение состояния развернутой даты
  const toggleDate = (date: string) => {
    const newExpandedDates = new Set(expandedDates);
    if (newExpandedDates.has(date)) {
      newExpandedDates.delete(date);
    } else {
      newExpandedDates.add(date);
    }
    setExpandedDates(newExpandedDates);
  };

  return (
    <div className="space-y-6">
      {/* Шапка страницы */}
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="p-2 text-gray-600 hover:text-purple-800 rounded-full hover:bg-purple-50"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Архив отчетов</h1>
      </div>

      {/* Описание страницы */}
      <p className="text-gray-600">
        Архив предоставляет доступ к файлам выбранного отчета. 
        Файлы группируются по датам, а также показывается точное время создания.
      </p>

      {/* Выбор типа отчета */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тип отчета
            </label>
            <div
              className="flex items-center justify-between p-2 border border-gray-300 rounded cursor-pointer"
              onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
            >
              <span>{reportTypes.find(type => type.id === selectedType)?.title || 'Выберите тип отчета'}</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            {isTypeDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg">
                {reportTypes.map(type => (
                  <div
                    key={type.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedType(type.id);
                      setIsTypeDropdownOpen(false);
                    }}
                  >
                    {type.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Список отчетов */}
        {selectedType && currentReports.length > 0 ? (
          <div className="space-y-4">
            {currentReports.map((report) => (
              <div key={report.date} className="border border-gray-200 rounded-lg p-4 space-y-2">
                {/* Заголовок с датой */}
                <div
                  className="flex justify-between items-center text-lg font-medium cursor-pointer"
                  onClick={() => toggleDate(report.date)}
                >
                  <span>{report.date}</span>
                  {expandedDates.has(report.date) ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </div>

                {/* Список файлов */}
                {expandedDates.has(report.date) && (
                  <div className="space-y-2">
                    {report.files.map((file, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        {/* Время создания файла */}
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{file.datetime.split(' ')[1]}</span>
                          <span className="font-medium">{file.name}</span>
                        </div>

                        {/* Кнопки скачивания */}
                        <div className="flex gap-2">
                            {file.type === 'pdf' && (
                                <a
                                    href={`/api/archive/download?folder=${reportTypes.find(type => type.id === selectedType)?.folder}&file=${encodeURIComponent(file.name)}`}
                                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    PDF
                                </a>
                            )}
                            {file.type === 'xlsx' && (
                                <a
                                    href={`/api/archive/download?folder=${reportTypes.find(type => type.id === selectedType)?.folder}&file=${encodeURIComponent(file.name)}`}
                                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Excel
                                </a>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Пагинация */}
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 text-gray-600 hover:text-purple-800 disabled:text-gray-400"
              >
                <ChevronLeft size={20} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded ${
                    currentPage === page
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-600 hover:bg-purple-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-600 hover:text-purple-800 disabled:text-gray-400"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        ) : selectedType ? (
          <div className="text-center py-8 text-gray-600">
            Отчеты не найдены
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ArchiveReports;