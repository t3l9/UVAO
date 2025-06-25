import { useState, useEffect, useMemo } from 'react';
import { read, utils } from 'xlsx';
import { Script, ScriptFilter, ExcelRow } from '../types';
import { Filter, Search, AlertCircle, ChevronDown } from 'lucide-react';

function Scripts() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [filteredScripts, setFilteredScripts] = useState<Script[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [filters, setFilters] = useState<ScriptFilter>({
    controlObject: '',
    status: '',
    problem: '',
    work: '',
  });

  const [dropdownOpen, setDropdownOpen] = useState({
    controlObject: false,
    status: false,
    problem: false,
    work: false,
  });

  const [searchTerms, setSearchTerms] = useState({
    controlObject: '',
    status: '',
    problem: '',
    work: '',
  });

  // Получаем уникальные значения для каждого фильтра
  const filterOptions = useMemo(() => {
    const controlObjects = [...new Set(scripts.map(item => item.controlObject))].filter(Boolean);
    
    let statuses = [];
    if (filters.controlObject) {
      statuses = [...new Set(
        scripts
          .filter(script => script.controlObject === filters.controlObject)
          .map(script => script.status)
      )].filter(Boolean);
    } else {
      statuses = [...new Set(scripts.map(item => item.status))].filter(Boolean);
    }
    
    let problems = [];
    if (filters.status) {
      problems = [...new Set(
        scripts
          .filter(script => 
            (filters.controlObject ? script.controlObject === filters.controlObject : true) &&
            script.status === filters.status
          )
          .map(script => script.problem)
      )].filter(Boolean);
    } else {
      problems = [...new Set(scripts.map(item => item.problem))].filter(Boolean);
    }
    
    let works = [];
    if (filters.problem) {
      works = [...new Set(
        scripts
          .filter(script => 
            (filters.controlObject ? script.controlObject === filters.controlObject : true) &&
            (filters.status ? script.status === filters.status : true) &&
            script.problem === filters.problem
          )
          .map(script => script.work)
      )].filter(Boolean);
    } else {
      works = [...new Set(scripts.map(item => item.work))].filter(Boolean);
    }

    return {
      controlObjects,
      statuses,
      problems,
      works,
    };
  }, [scripts, filters.controlObject, filters.status, filters.problem]);

  // Фильтруем опции по поисковым терминам
  const filteredOptions = {
    controlObjects: filterOptions.controlObjects.filter(option =>
      option.toLowerCase().includes(searchTerms.controlObject.toLowerCase())
    ),
    statuses: filterOptions.statuses.filter(option =>
      option.toLowerCase().includes(searchTerms.status.toLowerCase())
    ),
    problems: filterOptions.problems.filter(option =>
      option.toLowerCase().includes(searchTerms.problem.toLowerCase())
    ),
    works: filterOptions.works.filter(option =>
      option.toLowerCase().includes(searchTerms.work.toLowerCase())
    ),
  };

  useEffect(() => {
    const loadScripts = async () => {
      try {
        const response = await fetch('/files/f1scripta.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = read(arrayBuffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = utils.sheet_to_json<ExcelRow>(worksheet, { raw: false });
        
        const formattedData = data.map(row => ({
          id: row['ID заявки'],
          controlObject: row['Объект контроля'],
          category: row['Категория'],
          problem: row['Проблема'],
          status: row['Статус'],
          work: row['Работы на объекте'],
          response: row['Текст ответа ОИВ'],
          documents: row['Документы/акты'],
          notes: row['Примечания'],
        }));

        setScripts(formattedData);
      } catch (error) {
        console.error('Error loading scripts:', error);
      }
    };

    loadScripts();
  }, []);

  const toggleDropdown = (key: keyof typeof dropdownOpen) => {
    setDropdownOpen(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleFilterChange = (key: keyof ScriptFilter, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value,
    };

    // Сбрасываем последующие фильтры при изменении текущего
    const filterOrder: (keyof ScriptFilter)[] = ['controlObject', 'status', 'problem', 'work'];
    const currentIndex = filterOrder.indexOf(key);
    for (let i = currentIndex + 1; i < filterOrder.length; i++) {
      newFilters[filterOrder[i]] = '';
      setSearchTerms(prev => ({ ...prev, [filterOrder[i]]: '' }));
    }

    setFilters(newFilters);
    setShowResults(false);
    setDropdownOpen(prev => ({ ...prev, [key]: false }));
  };

  const handleSearchTermChange = (key: keyof typeof searchTerms, value: string) => {
    setSearchTerms(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    let filtered = [...scripts];

    if (filters.controlObject) {
      filtered = filtered.filter(script => script.controlObject === filters.controlObject);
    }
    if (filters.status) {
      filtered = filtered.filter(script => script.status === filters.status);
    }
    if (filters.problem) {
      filtered = filtered.filter(script => script.problem === filters.problem);
    }
    if (filters.work) {
      filtered = filtered.filter(script => script.work === filters.work);
    }

    setFilteredScripts(filtered);
    setShowResults(true);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Скрипты ответов</h1>
        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <p className="font-medium text-amber-800 dark:text-amber-400">Важно</p>
          </div>
          <p className="mt-2 text-amber-700 dark:text-amber-400">
            Внимательно ознакомьтесь с содержанием ответа, поскольку названия документов, адресов и т.д. заменены на общие (например, "ООО Ромашка" и т.д.).
          </p>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Используйте фильтры для поиска готовых ответов на обращения граждан.
          Выбирайте параметры последовательно и нажмите "Найти" для получения результатов.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Фильтры</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Объект контроля */}
          <div className="relative">
            <div 
              className="flex items-center justify-between p-2 border border-gray-300 dark:border-gray-600 rounded cursor-pointer bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              onClick={() => toggleDropdown('controlObject')}
            >
              <span>{filters.controlObject || "Объект контроля"}</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            {dropdownOpen.controlObject && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg">
                <input
                  type="text"
                  value={searchTerms.controlObject}
                  onChange={(e) => handleSearchTermChange('controlObject', e.target.value)}
                  placeholder="Поиск..."
                  className="w-full p-2 border-b border-gray-300 dark:border-gray-600 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  autoFocus
                />
                <div className="max-h-60 overflow-y-auto">
                  <div 
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-white"
                    onClick={() => handleFilterChange('controlObject', '')}
                  >
                    Все объекты
                  </div>
                  {filteredOptions.controlObjects.map(option => (
                    <div 
                      key={option} 
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-white"
                      onClick={() => handleFilterChange('controlObject', option)}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Статус */}
          <div className="relative">
            <div 
              className={`flex items-center justify-between p-2 border border-gray-300 dark:border-gray-600 rounded cursor-pointer ${!filters.controlObject ? 'bg-gray-100 dark:bg-gray-600' : 'bg-white dark:bg-gray-700'} text-gray-900 dark:text-white`}
              onClick={() => filters.controlObject && toggleDropdown('status')}
            >
              <span>{filters.status || "Статус"}</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            {dropdownOpen.status && filters.controlObject && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg">
                <input
                  type="text"
                  value={searchTerms.status}
                  onChange={(e) => handleSearchTermChange('status', e.target.value)}
                  placeholder="Поиск..."
                  className="w-full p-2 border-b border-gray-300 dark:border-gray-600 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  autoFocus
                />
                <div className="max-h-60 overflow-y-auto">
                  <div 
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-white"
                    onClick={() => handleFilterChange('status', '')}
                  >
                    Все статусы
                  </div>
                  {filteredOptions.statuses.map(option => (
                    <div 
                      key={option} 
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-white"
                      onClick={() => handleFilterChange('status', option)}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Проблема */}
          <div className="relative">
            <div 
              className={`flex items-center justify-between p-2 border border-gray-300 dark:border-gray-600 rounded cursor-pointer ${!filters.status ? 'bg-gray-100 dark:bg-gray-600' : 'bg-white dark:bg-gray-700'} text-gray-900 dark:text-white`}
              onClick={() => filters.status && toggleDropdown('problem')}
            >
              <span>{filters.problem || "Проблема"}</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            {dropdownOpen.problem && filters.status && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg">
                <input
                  type="text"
                  value={searchTerms.problem}
                  onChange={(e) => handleSearchTermChange('problem', e.target.value)}
                  placeholder="Поиск..."
                  className="w-full p-2 border-b border-gray-300 dark:border-gray-600 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  autoFocus
                />
                <div className="max-h-60 overflow-y-auto">
                  <div 
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-white"
                    onClick={() => handleFilterChange('problem', '')}
                  >
                    Все проблемы
                  </div>
                  {filteredOptions.problems.map(option => (
                    <div 
                      key={option} 
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-white"
                      onClick={() => handleFilterChange('problem', option)}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Работы на объекте */}
          <div className="relative">
            <div 
              className={`flex items-center justify-between p-2 border border-gray-300 dark:border-gray-600 rounded cursor-pointer ${!filters.problem ? 'bg-gray-100 dark:bg-gray-600' : 'bg-white dark:bg-gray-700'} text-gray-900 dark:text-white`}
              onClick={() => filters.problem && toggleDropdown('work')}
            >
              <span>{filters.work || "Работы на объекте"}</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            {dropdownOpen.work && filters.problem && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg">
                <input
                  type="text"
                  value={searchTerms.work}
                  onChange={(e) => handleSearchTermChange('work', e.target.value)}
                  placeholder="Поиск..."
                  className="w-full p-2 border-b border-gray-300 dark:border-gray-600 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  autoFocus
                />
                <div className="max-h-60 overflow-y-auto">
                  <div 
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-white"
                    onClick={() => handleFilterChange('work', '')}
                  >
                    Все работы
                  </div>
                  {filteredOptions.works.map(option => (
                    <div 
                      key={option} 
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-900 dark:text-white"
                      onClick={() => handleFilterChange('work', option)}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={applyFilters}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Search className="w-5 h-5" />
            Найти
          </button>
        </div>
      </div>

      {showResults && (
        <div className="grid grid-cols-1 gap-6">
          {filteredScripts.length > 0 ? (
            filteredScripts.map((script) => (
              <div key={script.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-4">Информация о проблеме</h3>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm text-gray-600 dark:text-gray-400">ID заявки</dt>
                        <dd className="font-medium text-gray-900 dark:text-white">{script.id}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-600 dark:text-gray-400">Объект контроля</dt>
                        <dd className="font-medium text-gray-900 dark:text-white">{script.controlObject}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-600 dark:text-gray-400">Категория</dt>
                        <dd className="font-medium text-gray-900 dark:text-white">{script.category}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-600 dark:text-gray-400">Проблема</dt>
                        <dd className="font-medium text-gray-900 dark:text-white">{script.problem}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-600 dark:text-gray-400">Статус</dt>
                        <dd className="font-medium text-gray-900 dark:text-white">{script.status}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-gray-600 dark:text-gray-400">Работы на объекте</dt>
                        <dd className="font-medium text-gray-900 dark:text-white">{script.work}</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-4">Ответ и документация</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm text-gray-600 dark:text-gray-400">Текст ответа ОИВ</h4>
                        <p className="mt-1 text-gray-800 dark:text-gray-300 whitespace-pre-wrap">{script.response}</p>
                      </div>
                      <div>
                        <h4 className="text-sm text-gray-600 dark:text-gray-400">Документы/акты</h4>
                        <p className="mt-1 text-gray-800 dark:text-gray-300 whitespace-pre-wrap">{script.documents}</p>
                      </div>
                      {script.notes && (
                        <div>
                          <h4 className="text-sm text-gray-600 dark:text-gray-400">Примечания</h4>
                          <p className="mt-1 text-gray-800 dark:text-gray-300 whitespace-pre-wrap">{script.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <p className="text-gray-600 dark:text-gray-400">По выбранным фильтрам ничего не найдено</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Scripts;