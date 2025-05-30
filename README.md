# GeoGallery

Приложение для добавления и управления пользовательскими маркерами на карте с возможностью прикреплять фотографии к каждой точке.

---

## Оглавление
- [GeoGallery](#geogallery)
  - [Оглавление](#оглавление)
  - [Описание](#описание)
  - [Требования](#требования)
  - [Установка и запуск](#установка-и-запуск)
  - [Тестирование](#тестирование)
    - [Базовое тестирование функциональности](#базовое-тестирование-функциональности)
    - [Тестирование геолокации](#тестирование-геолокации)
    - [Тестирование уведомлений](#тестирование-уведомлений)
  - [Принятые решения при реализации](#принятые-решения-при-реализации)
  - [Структура и архитектура проекта](#структура-и-архитектура-проекта)
  - [Схема базы данных](#схема-базы-данных)
  - [Управление геолокацией и уведомлениями](#управление-геолокацией-и-уведомлениями)
  - [Дополнительные реализованные функции](#дополнительные-реализованные-функции)
  - [Известные проблемы и ограничения](#известные-проблемы-и-ограничения)
  - [Возможные направления для развития](#возможные-направления-для-развития)

  

## Описание

**GeoGallery** — мобильное приложение на базе Expo, позволяющее:
- Добавлять пользовательские точки на карту долгим нажатием.
- Просматривать и редактировать детали каждой точки (название, фотографии).
- Загружать и удалять изображения, связанные с каждой точкой.
- Использовать кастомные маркеры на Android и цветные подписи на iOS.
- Данные маркеров и изображений сохраняются локально с помощью базы данных SQLite, не теряются при перезапуске приложения.
- Возможность удалять маркеры (все связанные изображения также удаляются автоматически).

## Требования

- Node.js (LTS версия)
- Yarn или npm
- Expo SDK 49+ (рекомендуется последняя версия)
- Expo Go на мобильном устройстве для тестирования
- Git (для загрузки/клонирования репозитория)

## Установка и запуск

1. **Клонируйте репозиторий:**

   ```bash
   git clone <ссылка_на_репозиторий>
   cd GeoGallery2
   ```

2. **Установите зависимости:**

   ```bash
   npm install
   ```

3. **Запустите проект:**
   ```bash
   npx expo start
   ```

4. **Сканируйте QR-код с помощью приложения Expo Go** (на Android/iOS) для запуска приложения на мобильном устройстве.

## Тестирование

### Базовое тестирование функциональности
- Долгое нажатие на карту — открывается окно создания точки.
- Введите название, выберите цвет (на iOS) и сохраните точку.
- Нажмите на маркер — перейдёте на экран с деталями.
- Здесь можно добавить и удалить изображения, просмотреть их в полноэкранном режиме.
- Добавьте/Удалите необходимые изображения.
- Удалите маркер и убедитесь, что все связанные изображения тоже удалились.

### Тестирование геолокации
- Разрешите приложению доступ к местоположению при первом запуске (iOS/Android).
- Проверьте отображение вашей позиции на карте (синий маркер, окружность точности).
- Передвигайтесь с телефоном — убедитесь, что позиция обновляется.

### Тестирование уведомлений
- **На iOS:**
  - В Expo Go локальные уведомления работают, если приложение активно (foreground).
  - Проверьте уведомления:
  - Создайте маркер в 40 м от себя.
  - Подойдите к маркеру — должно появиться всплывающее уведомление.
  - Если уведомление не появилось, убедитесь, что разрешения на уведомления выданы (Настройки → Уведомления → Expo Go).
  - Проверьте, что уведомления не дублируются при повторном входе в зону.
  - При удалении точки уведомление сбрасывается.
- **На Android:**
  - В Expo Go уведомления не поддерживаются с SDK 53+.
  - Для проверки используйте development build:
  - Установите EAS CLI:

     ```bash
     npm install -g eas-cli
     ```

  - Соберите dev build:

     ```bash
     eas build --profile development --platform android
     ```
  
  - Установите APK на устройство, откройте проект — уведомления будут работать так же, как на iOS.
- **Тест уведомлений вручную:**
  - В деталях точки есть кнопка "Отправить тестовое уведомление" — проверьте работу всплывающих уведомлений в активном приложении.

## Принятые решения при реализации

- Для навигации между экранами используется **expo-router** с файловой структурой страниц. Это обеспечивает современную, гибкую и масштабируемую маршрутизацию.
- Состояние всех маркеров и связанных с ними данных управляется через React Context (DatabaseContext). Контекст инкапсулирует операции с базой данных и предоставляет асинхронные методы для работы с маркерами и изображениями.
- Для хранения данных используется локальная база данных SQLite через модуль expo-sqlite. Создаются две связанные таблицы: одна для маркеров, вторая для фотографий, связанных с каждым маркером (реализация связей через внешний ключ и каскадное удаление).
- Для выбора изображений используется пакет expo-image-picker с учётом рекомендаций по синтаксису для последних версий Expo SDK.
- Геолокация пользователя реализована через пакет expo-location с обработкой разрешений, ошибок и автоматическим обновлением позиции.
- Для отправки локальных уведомлений используется пакет expo-notifications с кастомным NotificationManager (предотвращение дублей и автоматическая очистка).
- Кастомизация маркеров реализована индивидуально для платформ:
    - На iOS используется цветная надпись, позволяющая выбрать цвет при создании точки.
    - На Android отображается png-иконка из папки assets.
- Все компоненты написаны с использованием TypeScript, что обеспечивает строгую типизацию и упрощает сопровождение кода.
- Модальные окна, выбор цвета и обработка пользовательского ввода реализованы с помощью стандартных компонентов React Native и кастомных стилей для лучшего UX.
- Реализована обработка ошибок для всех ключевых сценариев: выбор изображений, работа с навигацией, обработка данных, взаимодействие с пользователем.
- На карте отображается маркер пользователя и зона точности.
- Пользователь получает уведомление, если приблизился к одной из сохранённых точек.
- Уведомления не дублируются, сбрасываются при удалении точки или при выходе пользователя из радиуса.
- В деталях каждой точки отображается текущее расстояние от пользователя (в метрах или километрах, рассчитывается автоматически).

## Структура и архитектура проекта
- /app/ — основные экраны (карта, детали маркера, роутинг).
- /components/ — переиспользуемые UI-компоненты (MapView, список фотографий и др.).
- /contexts/DatabaseContext.tsx — глобальный React Context для доступа к данным и управления базой.
- /contexts/UserLocationContext.tsx — React Context для получения текущей позиции пользователя.
- /database/ — слой работы с базой данных: определение схемы, миграции, CRUD-операции.
- /services/ — сервисы для работы с геолокацией и локальными уведомлениями.
- /types.ts — все интерфейсы и типы TypeScript.
- /assets/ — изображения и иконки.
- /package.json — все зависимости, включая expo, react-native-maps, expo-image-picker, expo-sqlite и др.

## Схема базы данных

В приложении используется база данных SQLite с двумя связанными таблицами:

- **markers**  
  | Поле       | Тип данных | Описание                      |
  | ---------- | ---------- | ----------------------------- |
  | id         | INTEGER    | Первичный ключ, автонумерация |
  | latitude   | REAL       | Широта                        |
  | longitude  | REAL       | Долгота                       |
  | label      | TEXT       | Название точки                |
  | color      | TEXT       | Цвет маркера                  |
  | created_at | DATETIME   | Дата создания                 |

- **marker_images**  
  | Поле      | Тип данных | Описание                      |
  | --------- | ---------- | ----------------------------- |
  | id        | INTEGER    | Первичный ключ, автонумерация |
  | marker_id | INTEGER    | Внешний ключ на markers(id)   |
  | uri       | TEXT       | Путь к изображению            |
  | added_at  | DATETIME   | Дата добавления изображения   |

- Таблицы связаны по `marker_id` (внешний ключ, каскадное удаление связанных изображений при удалении маркера).

## Управление геолокацией и уведомлениями

- **Геолокация:**
  - Используется пакет expo-location для запроса и отслеживания текущего положения пользователя.
  - Все операции с разрешениями и обработка ошибок реализованы согласно рекомендациям Expo.
  - Геолокация обновляется в реальном времени, используется оптимальный уровень точности и минимальная нагрузка на батарею.
- **Уведомления:**
  - Для локальных уведомлений используется пакет expo-notifications.
  - При приближении к маркеру (менее 40 метров) пользователю отправляется всплывающее уведомление.
  - Для предотвращения дублей реализован собственный NotificationManager (контролирует уже отправленные уведомления).
  - При выходе из радиуса уведомление удаляется.
  - Для корректного отображения уведомлений на экране даже в активном приложении используется настройка Notifications.setNotificationHandler.
  - Для полноценной работы уведомлений на Android требуется запуск через Expo Dev Client (см. ограничения).

## Дополнительные реализованные функции

- **Кастомные маркеры:**
    - На iOS реализованы цветные подписи с выбором цвета для каждой точки.
    - На Android используется кастомная PNG-иконка маркера.
- **Предпросмотр изображений:**  
    - Пользователь может открыть изображение в полноэкранном режиме при нажатии на миниатюру.
- **Улучшенный выбор цвета:**  
    - На iOS для новых маркеров можно выбрать цвет с помощью визуальных цветных кружков.
- **SafeArea:**  
    - Использование `react-native-safe-area-context` для правильного расположения кнопок и элементов интерфейса на устройствах с вырезами и нестандартными рамками.
- **Обработка ошибок:**  
    - Приложение информирует пользователя о проблемах с загрузкой изображений, ошибках навигации, отсутствии доступа и других возможных сбоях.

## Известные проблемы и ограничения

- **Expo Go не поддерживает уведомления на Android:**
  - Для тестирования уведомлений на Android требуется собрать Development Build через EAS.
- **Ограничения работы с файлами:**
  - Expo Go не позволяет работать с файлами вне песочницы приложения, доступны только изображения из медиатеки пользователя.
- **Особенности отображения маркеров:**
  - На некоторых устройствах Android кастомная иконка маркера может отображаться с искажениями из-за особенностей библиотеки react-native-maps.
- **Производительность:**
  - При большом количестве точек и изображений возможно замедление интерфейса.
- **Нет поиска и фильтрации:**
  - В текущей версии нельзя быстро найти точку по названию или описанию.
- **Нет Drag & Drop:**
  - Перемещение маркеров по карте не реализовано.


## Возможные направления для развития

- Экспорт/импорт данных, синхронизация с облаком или Google Диском.
- Масштабируемые списки и оптимизация производительности для большого количества данных.
- Автоматическое резервное копирование базы данных.
- Перемещение маркеров (Drag & Drop) и анимация точек на карте.
- Добавление фильтрации и поиска по точкам.
- Кастомизация тем и улучшение пользовательского интерфейса.
- Поддержка фонового режима и push-уведомлений через собственный сервер.