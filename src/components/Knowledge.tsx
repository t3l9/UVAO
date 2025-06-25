import React, { useState } from 'react';
import { FileText, Video, Download, Eye, ChevronRight } from 'lucide-react';
import { User } from '../types';

interface KnowledgeProps {
  user: User;
}

interface Resource {
  title: string;
  description: string;
  type: 'pdf' | 'video';
  filename: string;
  excelFilename?: string;
  viewInBrowser?: boolean; // Можно ли просматривать в браузере
}

interface Section {
  id: string;
  title: string;
  description: string;
  resources: Resource[];
  allowedOrganizations: string[]; // Список организаций, которые могут видеть этот раздел
}

const knowledgeSections: Section[] = [
  {
    id: 'reports',
    title: 'Отчеты',
    description: 'Инструкции по созданию различных отчетов',
    allowedOrganizations: ['Префектура', 'Управа'], // Пример разграничения прав
    resources: [
      {
        title: 'Руководство по созданию отчета "Ответы в работе"',
        description: 'Подробная инструкция по созданию отчета "Ответы в работе" для мониторинга сообщений на портале "Наш город"',
        type: 'pdf',
        filename: 'otvetyvrabote.pdf',
        excelFilename: 'our-city-shablon.xlsx',
        viewInBrowser: true,
      },
    ],
  },
  {
    id: 'portal-work',
    title: 'Работа с порталом',
    description: 'Обучающие материалы по работе с различными порталами',
    allowedOrganizations: ['Префектура'], // Только префектура видит этот раздел
    resources: [
      {
        title: 'Видеоинструкция: Выход техники',
        description: 'Обучающее видео по формированию отчета о работе техники на ДТ и ОДХ с использованием фиксаграммы',
        type: 'video',
        filename: 'vihod.mp4',
        excelFilename: 'shablon_vihoda_tehniki.xlsx',
      },
      {
        title: 'Видеоинструкция: Снятие просрока с заявки',
        description: 'Обучающее видео по снятию просрока с заявки на АРМ Префектур. Если заявка просрочена по необъективным причинам, вы можете предоставить аргументы и снять просрочку.',
        type: 'video',
        filename: 'delete_monitor.mp4',
      },
    ],
  },
  // Добавьте здесь дополнительные разделы по необходимости
];

function Knowledge({ user }: KnowledgeProps) {
  const [activeSection, setActiveSection] = useState<string>('');
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);

  // Фильтруем разделы по правам доступа
  const availableSections = knowledgeSections.filter(section =>
    section.allowedOrganizations.includes(user.organization)
  );

  const handleViewResource = (resource: Resource) => {
    if (resource.viewInBrowser && resource.type === 'pdf') {
      setViewingResource(resource);
    } else {
      // Для видео или файлов без просмотра в браузере - скачиваем
      const link = document.createElement('a');
      link.href = `/baza/${resource.filename}`;
      link.download = resource.filename;
      link.click();
    }
  };

  const closeViewer = () => {
    setViewingResource(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">База знаний</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Обучающие материалы и документация для изучения внутренней работы округа.
          Выберите раздел для просмотра доступных материалов.
        </p>
      </div>

      {/* Просмотр PDF в браузере */}
      {viewingResource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{viewingResource.title}</h3>
              <div className="flex gap-2">
                <a
                  href={`/baza/${viewingResource.filename}`}
                  download
                  className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  Скачать
                </a>
                <button
                  onClick={closeViewer}
                  className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Закрыть
                </button>
              </div>
            </div>
            <div className="flex-1 p-4">
              <object
                data={`/baza/${viewingResource.filename}`}
                type="application/pdf"
                className="w-full h-full"
              >
                <p className="text-gray-900 dark:text-white">
                  PDF не может быть отображен.{' '}
                  <a
                    href={`/baza/${viewingResource.filename}`}
                    download
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
                  >
                    Скачать PDF
                  </a>
                </p>
              </object>
            </div>
          </div>
        </div>
      )}

      {/* Список разделов */}
      <div className="grid grid-cols-1 gap-6">
        {availableSections.map((section) => (
          <div key={section.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div
              className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setActiveSection(activeSection === section.id ? '' : section.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{section.title}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{section.description}</p>
                </div>
                <ChevronRight
                  className={`w-6 h-6 text-gray-400 dark:text-gray-500 transition-transform ${
                    activeSection === section.id ? 'rotate-90' : ''
                  }`}
                />
              </div>
            </div>

            {/* Ресурсы раздела */}
            {activeSection === section.id && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-6 space-y-4">
                {section.resources.map((resource, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-start gap-4"
                  >
                    {resource.type === 'pdf' ? (
                      <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
                    ) : (
                      <Video className="w-8 h-8 text-blue-500 flex-shrink-0" />
                    )}
                    <div className="flex-grow">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">{resource.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{resource.description}</p>
                      <div className="flex items-center gap-4 flex-wrap">
                        {/* Кнопка просмотра/скачивания основного файла */}
                        <button
                          onClick={() => handleViewResource(resource)}
                          className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 bg-white dark:bg-gray-600 px-3 py-1 rounded border border-purple-200 dark:border-purple-600 hover:border-purple-300 dark:hover:border-purple-500 transition-colors"
                        >
                          {resource.viewInBrowser && resource.type === 'pdf' ? (
                            <>
                              <Eye size={16} />
                              Просмотреть {resource.type === 'pdf' ? 'PDF' : 'видео'}
                            </>
                          ) : (
                            <>
                              <Download size={16} />
                              Скачать {resource.type === 'pdf' ? 'PDF' : 'видео'}
                            </>
                          )}
                        </button>

                        {/* Кнопка скачивания дополнительного файла (если есть) */}
                        {resource.excelFilename && (
                          <a
                            href={`/baza/${resource.excelFilename}`}
                            download
                            className="inline-flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 bg-white dark:bg-gray-600 px-3 py-1 rounded border border-green-200 dark:border-green-600 hover:border-green-300 dark:hover:border-green-500 transition-colors"
                          >
                            <Download size={16} />
                            Скачать шаблон Excel
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Блок помощи */}
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-purple-900 dark:text-purple-400 mb-4">
          Нужна помощь?
        </h2>
        <p className="text-purple-800 dark:text-purple-300 mb-4">
          Если у вас возникли вопросы по работе с системой или вам нужна дополнительная информация,
          обратитесь в службу поддержки:
        </p>
        <ul className="list-disc list-inside text-purple-800 dark:text-purple-300">
          <li>Email: SobirovTT@puvao.mos.ru</li>
          <li>Время работы: Пн-Пт, 9:00 - 17:00</li>
        </ul>
      </div>
    </div>
  );
}

export default Knowledge;