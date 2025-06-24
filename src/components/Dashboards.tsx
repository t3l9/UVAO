import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, BookOpen, BrainCircuit, HelpCircle, BarChart3, LineChart, Table, Bot, ExternalLink } from 'lucide-react';
import { User } from '../types';

interface DashboardProps {
  user: User;
}

const reportTypes = [
  {
    id: 'our-city',
    title: "Обращения на портале 'Наш город'",
    description: "Мониторинг обращений граждан, поступивших через портал 'Наш город'.",
  },
  {
    id: 'mayor-monitor',
    title: 'Обращения на мониторе мэра',
    description: "Отслеживание обращений с помощью системы мониторинга мэра.",
  },
  {
    id: 'prefect',
    title: 'Сообщения личного кабинета Префекта',
    description: 'Контроль обращений личного кабинета Префекта',
  },
  {
    id: 'mzhi',
    title: 'Сообщения МЖИ',
    description: 'Контроль обращений в работе от МЖИ',
  },
];

const additionalSections = [
  {
    id: 'scripts',
    title: 'Скрипты',
    description: 'Готовые ответы на обращения граждан с удобной системой фильтрации',
    icon: BrainCircuit,
    type: 'internal',
  },
  {
    id: 'knowledge',
    title: 'База знаний',
    description: 'Обучающие материалы и полезная информация по работе с задачами',
    icon: BookOpen,
    type: 'internal',
  },
  {
    id: 'kgh-table',
    title: 'Таблица КГХ Наш город',
    description: 'Табличка показывает ситуацию ежечасно в городе по сообщениям КГХ',
    icon: Table,
    type: 'external',
    url: 'https://example.com', // Замените на вашу ссылку на Google форму
  },
  {
    id: 'transfer-bot',
    title: 'Бот по переносам',
    description: 'Бот, по которому можно согласовывать переносы сроков сообщений',
    icon: Bot,
    type: 'external',
    url: 'https://t.me/example_bot', // Замените на вашу ссылку на Telegram бота
  },
];

const analyticsSections = [
  {
    id: 'archive',
    title: 'Архив отчетов',
    description: 'Доступ к историческим данным отчетов для проведения аналитики и отслеживания динамики изменений',
    icon: BarChart3,
  },
  {
    id: 'dashboard',
    title: 'Дашборд',
    description: 'Визуализация данных и статистика по обращениям граждан в интерактивном формате',
    icon: LineChart,
  },
];

const faqItems = [
  {
    question: 'Как скачать отчет в формате Excel?',
    answer: 'В каждом разделе отчетов есть кнопка "Скачать Excel". Нажмите на нее, чтобы загрузить актуальный отчет.',
  },
  {
    question: 'Как часто обновляются данные?',
    answer: 'Данные обновляются автоматически каждый час или каждые два часа. Время последнего обновления указано в каждом отчете.',
  },
  {
    question: 'Отчет показывает неправильные данные, что делать?',
    answer: 'Отчеты формируются через выгрузку с портала "Наш город" и АРМ Префектур. Если данные неверны, это проблемы с их стороны.',
  },
  {
    question: 'Время обновления отчета было очень давно, почему?',
    answer: "Часто это связано с проблемами, возникающими на стороне АРМ Префектур или портала 'Наш город'. В частности, могут наблюдаться сбои в работе, задержки и другие неполадки.",
  },
  {
    question: "Для чего нужна вкладка 'База знаний'?",
    answer: "База знаний предназначена для ознакомления с различными работами, включая актуализацию парков, создание отчетов и т.д.",
  },
];

function Dashboard({ user }: DashboardProps) {
  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Информационная система Префектуры ЮВАО
        </h1>
        <p className="text-gray-600 max-w-3xl">
          Добро пожаловать в информационную систему Префектуры Юго-Восточного административного округа. Здесь вы можете получить доступ к различным отчетам,
          аналитическим данным и базе знаний, которые помогут вам эффективно работать не только с обращениями граждан, но и с другими задачами.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Отчеты</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportTypes.map((report) => (
            <Link
              key={report.id}
              to={`/report/${report.id}`}
              className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <FileText className="w-8 h-8 text-purple-600" />
                <div>
                  <h3 className="font-medium text-gray-900">{report.title}</h3>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Дополнительные разделы</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {additionalSections.map((section) => {
            if (section.type === 'external') {
              return (
                <button
                  key={section.id}
                  onClick={() => handleExternalLink(section.url!)}
                  className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-left w-full"
                >
                  <div className="flex items-center gap-4">
                    <section.icon className="w-8 h-8 text-purple-600" />
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{section.title}</h3>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600">{section.description}</p>
                    </div>
                  </div>
                </button>
              );
            } else {
              return (
                <Link
                  key={section.id}
                  to={`/${section.id}`}
                  className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <section.icon className="w-8 h-8 text-purple-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">{section.title}</h3>
                      <p className="text-sm text-gray-600">{section.description}</p>
                    </div>
                  </div>
                </Link>
              );
            }
          })}
        </div>
      </div>

      {user.duty === 'Префектура' && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Аналитика</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analyticsSections.map((section) => (
              <Link
                key={section.id}
                to={`/analytics/${section.id}`}
                className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <section.icon className="w-8 h-8 text-purple-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">{section.title}</h3>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-purple-600" />
          Часто задаваемые вопросы
        </h2>
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {faqItems.map((item, index) => (
            <div key={index}>
              <h3 className="font-medium text-gray-900 mb-2">{item.question}</h3>
              <p className="text-gray-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;