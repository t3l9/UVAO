import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from 'recharts';
import Modal from './Modal';

interface RegionIds {
  [key: string]: string;
}

interface ArchiveReportsProps {
    user: {
      duty: string;
    };
  }

interface ChartData {
  date: string;
  [key: string]: number | string;
}

interface Issue {
  id: string;
  region_id: string;
  status?: {
    title: string;
  };
  theme?: {
    title: string;
  };
}

interface RegionFilterProps {
  regions: RegionIds;
  selectedRegions: string[];
  onChange: (regions: string[]) => void;
}

const REGION_IDS: RegionIds = {
  "104": "Выхино-Жулебино",
  "87": "Капотня",
  "22": "Кузьминки",
  "21": "Лефортово",
  "89": "Люблино",
  "5": "Марьино",
  "71": "Некрасовка",
  "34": "Нижегородский",
  "41": "Печатники",
  "124": "Рязанский",
  "53": "Текстильщики",
  "105": "Южнопортовый"
};

const COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe",
  "#00c49f", "#ffbb28", "#ff8042", "#a4de6c", "#d0ed57",
  "#83a6ed", "#8dd1e1", "#a4262c"
];

const RegionFilter: React.FC<RegionFilterProps> = ({ regions, selectedRegions, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        className="inline-flex justify-center w-full rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        Выбрать районы ({selectedRegions.includes("all") ? "Все" : selectedRegions.length})
        <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-lg shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-600 focus:outline-none z-10">
          <div className="py-1 max-h-60 overflow-auto">
            <div className="flex items-center px-4 py-2">
              <input
                id="filter-all"
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded"
                checked={selectedRegions.includes("all")}
                onChange={() => {
                  if (selectedRegions.includes("all")) {
                    onChange([]);
                  } else {
                    onChange(["all", ...Object.keys(regions)]);
                  }
                }}
              />
              <label htmlFor="filter-all" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                Весь округ
              </label>
            </div>
            {Object.entries(regions).map(([regionId, regionName]) => (
              <div key={regionId} className="flex items-center px-4 py-2">
                <input
                  id={`filter-${regionId}`}
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded"
                  checked={selectedRegions.includes(regionId)}
                  onChange={() => {
                    const newSelectedRegions = selectedRegions.includes(regionId)
                      ? selectedRegions.filter(id => id !== regionId && id !== "all")
                      : [...selectedRegions.filter(id => id !== "all"), regionId];
                    onChange(newSelectedRegions);
                  }}
                />
                <label htmlFor={`filter-${regionId}`} className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                  {regionName}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function Dashboard({ user }: ArchiveReportsProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(["all", ...Object.keys(REGION_IDS)]);
  const [showOverdue, setShowOverdue] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/chart_data'); 
  
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }
  
        const data = await response.json();
        processDataWithFilters(data, selectedRegions, showOverdue);
        setError(null);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        setError(error instanceof Error ? error.message : 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedRegions, showOverdue]);

  const processDataWithFilters = (data: any[], regionFilters: string[], includeOverdue = false) => {
    const processedData = data.reduce((acc: ChartData[], item) => {
      const [year, month, day] = item.date.split("-");
      const formattedDate = `${day}.${month}.${year.slice(2)}`;
      
      const dateData: ChartData = {
        date: formattedDate,
        total: 0
      };

      item.issues.forEach((issue: any) => {
        const regionId = issue.region_id?.toString();
        if (regionId && (regionFilters.includes(regionId) || regionFilters.includes("all"))) {
          dateData[regionId] = (dateData[regionId] as number || 0) + 1;
          dateData.total = (dateData.total as number) + 1;
        }
      });

      acc.push(dateData);
      return acc;
    }, []);

    setChartData(processedData);
  };

   // Если пользователь не имеет доступа
   if (user.duty !== 'Префектура') {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4">
        <p className="text-red-700 dark:text-red-400">
          У вас нет доступа к этому разделу. Раздел доступен только для сотрудников Префектуры.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-400">
                Ошибка загрузки данных: {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-800 dark:hover:text-purple-400 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Дашборд</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Количество обращений по дням
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <input
                id="show-overdue"
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded"
                checked={showOverdue}
                onChange={(e) => setShowOverdue(e.target.checked)}
              />
              <label htmlFor="show-overdue" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Показать просроченные
              </label>
            </div>
            <RegionFilter
              regions={REGION_IDS}
              selectedRegions={selectedRegions}
              onChange={setSelectedRegions}
            />
          </div>
        </div>

        <div ref={chartContainerRef} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {selectedRegions.includes("all") && (
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#000000"
                  strokeWidth={2}
                  name="Всего"
                />
              )}
              {Object.keys(REGION_IDS).map((regionId, index) => (
                selectedRegions.includes(regionId) && (
                  <Line
                    key={regionId}
                    type="monotone"
                    dataKey={regionId}
                    stroke={COLORS[index % COLORS.length]}
                    name={REGION_IDS[regionId]}
                  />
                )
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {selectedIssue && (
        <Modal onClose={() => setSelectedIssue(null)}>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Детали обращения
            </h3>
            <div className="space-y-2">
              <p className="text-gray-900 dark:text-white"><span className="font-medium">ID:</span> {selectedIssue.id}</p>
              <p className="text-gray-900 dark:text-white"><span className="font-medium">Район:</span> {REGION_IDS[selectedIssue.region_id]}</p>
              <p className="text-gray-900 dark:text-white"><span className="font-medium">Статус:</span> {selectedIssue.status?.title}</p>
              <p className="text-gray-900 dark:text-white"><span className="font-medium">Тема:</span> {selectedIssue.theme?.title}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Dashboard;