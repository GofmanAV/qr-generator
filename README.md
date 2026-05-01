# Генератор QR кодов

Простой и удобный онлайн-генератор QR кодов. Введите ссылку — QR код обновится автоматически.

**[Открыть приложение](https://gofmanav.github.io/qr-generator/)**

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

## Возможности

- **Мгновенная генерация** — QR код обновляется при каждом нажатии клавиши
- **Настройка размера** — от 128 до 1024 px
- **Уровень коррекции ошибок** — L / M / Q / H с пояснением для каждого
- **Кастомные цвета** — выбор цвета точек и фона
- **Скачивание** — сохранение в PNG или JPEG
- **Автопроверка** — содержимое QR кода автоматически распознаётся в браузере при каждом изменении

## Технологии

| Слой         | Решение                                                                 |
|--------------|-------------------------------------------------------------------------|
| Разметка     | HTML5                                                                   |
| Стили        | Vanilla CSS                                                             |
| Логика       | JavaScript (ES6+)                                                       |
| QR движок    | [qr-code-styling](https://github.com/kozakdenys/qr-code-styling) — генерация QR кодов |
| QR декодер   | [jsQR](https://github.com/cozmo/jsQR) — распознавание QR кодов                        |

> Проект не требует сборки, бандлера или Node.js — достаточно открыть `index.html` в браузере.

## Структура проекта

```
├── index.html          # Главная страница
├── style.css           # Стили
├── app.js              # Логика генерации QR кода
└── vendor/
    ├── qr-code-styling.js  # Библиотека генерации QR кодов
    └── jsQR.js             # Библиотека распознавания QR кодов
```

## Запуск

1. Склонируйте репозиторий:
   ```bash
   git clone https://github.com/GofmanAV/qr-generator.git
   ```
2. Откройте `index.html` в браузере — готово.

## Лицензия

MIT
