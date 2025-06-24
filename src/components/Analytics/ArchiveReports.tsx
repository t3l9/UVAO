import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
  const [filteredReports, setFilteredReports] = useState<Report[]>([]); // Отфильтрованные отчеты
  const [currentPage, setCurrentPage] = useState<number>(1); // Текущая страница пагинации
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState<boolean>(false); // Открыто ли выпадающее меню типов отчетов
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set()); // Состояние развернутых дат
  const [loading, setLoading] = useState<boolean>(false); // Состояние загрузки
  const [error, setError] = useState<string>(''); // Состояние ошибки
  
  // Состояния для фильтрации по датам
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  // Состояние для просмотра PDF
  const [viewingPdf, setViewingPdf] = useState<{ url: string; title: string } | null>(null);

  const reportsPerPage = 10; // Количество отчетов на странице

  // Загрузка данных при изменении типа отчета
  useEffect(() => {
    if (selectedType && user.duty === 'Префектура') {
      const folder = reportTypes.find(type => type.id === selectedType)?.folder;
      if (folder) {
        setLoading(true);
        setError('');
        
        fetch(`/api/archive?folder=${folder}`)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Ошибка сервера: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            console.log('Полученные данные архива:', data);
            setReports(data || []);
            setFilteredReports(data || []); // Изначально показываем все отчеты
            setError('');
          })
          .catch(error => {
            console.error('Ошибка при загрузке архива:', error);
            setError(`Ошибка загрузки данных: ${error.message}`);
            setReports([]);
            setFilteredReports([]);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, [selectedType, user.duty]);

  // Фильтрация отчетов по датам
  useEffect(() => {
    if (!startDate && !endDate) {
      setFilteredReports(reports);
      return;
    }

    const filtered = reports.filter(report => {
      const reportDate = parseDate(report.date);
      if (!reportDate) return false;

      const isAfterStart = !startDate || reportDate >= startDate;
      const isBeforeEnd = !endDate || reportDate <= endDate;
      
      return isAfterStart && isBeforeEnd;
    });

    setFilteredReports(filtered);
    setCurrentPage(1); // Сбрасываем на первую страницу при фильтрации
  }, [startDate, endDate, reports]);

  // Функция для парсинга даты из строки формата "DD.MM.YYYY"
  const parseDate = (dateString: string): Date | null => {
    const parts = dateString.split('.');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Месяцы в JS начинаются с 0
    const year = parseInt(parts[2], 10);
    
    return new Date(year, month, day);
  };

  // Функция для сброса фильтров
  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
  };

  // Функция для просмотра PDF
  const viewPdf = (file: File, reportDate: string) => {
    const folder = reportTypes.find(type => type.id === selectedType)?.folder;
    if (folder && file.type === 'pdf') {
      const url = `/api/archive/download?folder=${folder}&file=${encodeURIComponent(file.name)}`;
      console.log('Открываем PDF по URL:', url);
      setViewingPdf({
        url,
        title: `${reportDate} - ${file.datetime.split(' ')[1]}`
      });
    }
  };

  // Если пользователь не имеет доступа
  if (user.duty !== 'Префектура') {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4">
        <p className="text-red-700 dark:text-red-400">
          У вас нет доступа к этому разделу.
        </p>
      </div>
    );
  }

  // Пагинация
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

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
      {/* Модальное окно для просмотра PDF */}
      {viewingPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{viewingPdf.title}</h3>
              <button
                onClick={() => setViewingPdf(null)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 p-4">
              <iframe
                src={viewingPdf.url}
                className="w-full h-full border-0"
                title={viewingPdf.title}
              >
                <p className="text-gray-900 dark:text-white">
                  PDF не может быть отображен.{' '}
                  <a
                    href={viewingPdf.url}
                    download
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
                  >
                    Скачать PDF
                  </a>
                </p>
              </iframe>
            </div>
          </div>
        </div>
      )}

      {/* Шапка страницы */}
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-800 dark:hover:text-purple-400 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Архив отчетов</h1>
      </div>

      {/* Описание страницы */}
      <p className="text-gray-600 dark:text-gray-400">
        Архив предоставляет доступ к файлам выбранного отчета. 
        Файлы группируются по датам, а также показывается точное время создания.
      </p>

      {/* Выбор типа отчета и фильтры */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Выбор типа отчета */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Тип отчета
            </label>
            <div
              className="flex items-center justify-between p-2 border border-gray-300 dark:border-gray-600 rounded cursor-pointer bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
            >
              <span>{reportTypes.find(type => type.id === selectedType)?.title || 'Выберите тип отчета'}</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            {isTypeDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg">
                {reportTypes.map(type => (
                  <div
                    key={type.id}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-white"
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

          {/* Фильтр по начальной дате */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Дата с
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              dateFormat="dd.MM.yyyy"
              placeholderText="Выберите дату"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              isClearable
            />
          </div>

          {/* Фильтр по конечной дате */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Дата по
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date)}
              dateFormat="dd.MM.yyyy"
              placeholderText="Выберите дату"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              isClearable
              minDate={startDate}
            />
          </div>
        </div>

        {/* Кнопка сброса фильтров */}
        {(startDate || endDate) && (
          <div className="mb-6">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Сбросить фильтры
            </button>
          </div>
        )}

        {/* Состояние загрузки */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Загрузка данных...</p>
          </div>
        )}

        {/* Ошибка загрузки */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Информация о количестве найденных отчетов */}
        {selectedType && !loading && !error && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Найдено отчетов: {filteredReports.length} из {reports.length}
          </div>
        )}

        {/* Список отчетов */}
        {selectedType && !loading && !error && currentReports.length > 0 ? (
          <div className="space-y-4">
            {currentReports.map((report) => (
              <div key={report.date} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-2">
                {/* Заголовок с датой */}
                <div
                  className="flex justify-between items-center text-lg font-medium cursor-pointer text-gray-900 dark:text-white"
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
                      <div key={index} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        {/* Время создания файла */}
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{file.datetime.split(' ')[1]}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{file.name}</span>
                        </div>

                        {/* Кнопки просмотра и скачивания */}
                        <div className="flex gap-2">
                          {file.type === 'pdf' && (
                            <>
                              <button
                                onClick={() => viewPdf(file, report.date)}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                              >
                                <Eye size={14} />
                                Просмотр
                              </button>
                              <a
                                href={`/api/archive/download?folder=${reportTypes.find(type => type.id === selectedType)?.folder}&file=${encodeURIComponent(file.name)}`}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                PDF
                              </a>
                            </>
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
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-800 dark:hover:text-purple-400 disabled:text-gray-400 dark:disabled:text-gray-600"
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
                        : 'text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-800 dark:hover:text-purple-400 disabled:text-gray-400 dark:disabled:text-gray-600"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        ) : selectedType && !loading && !error ? (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            {filteredReports.length === 0 && reports.length > 0 
              ? 'Отчеты за выбранный период не найдены'
              : 'Отчеты не найдены'
            }
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ArchiveReports;