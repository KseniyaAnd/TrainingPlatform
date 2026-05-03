# Интеграция Glider.js для карусели курсов

## Что было сделано

Заменена карусель PrimeNG на библиотеку [Glider.js](https://nickpiscitelli.github.io/Glider.js/) на главной странице приложения с использованием **современного подхода Angular на сигналах**.

## Изменения

### 1. Компонент `home.ts`

- Добавлен импорт `Glider` из `glider-js`
- **Использован `viewChild()` вместо `@ViewChild` декоратора** - signal-based подход
- **Использован `effect()` вместо lifecycle hooks** (`AfterViewInit`, `OnDestroy`)
- Удален импорт `CarouselModule` из PrimeNG
- Добавлена инициализация Glider.js с настройками:
  - Адаптивный дизайн (1-4 слайда в зависимости от ширины экрана)
  - Навигация стрелками
  - Точки-индикаторы
  - Поддержка свайпа (draggable)

#### Преимущества signal-based подхода:

- ✅ **Реактивность из коробки** - effect автоматически отслеживает изменения
- ✅ **Автоматическая очистка** - `onCleanup` вызывается автоматически
- ✅ **Меньше кода** - не нужны lifecycle hooks
- ✅ **Лучшая производительность** - более эффективное отслеживание изменений
- ✅ **Современный Angular** - соответствует новым best practices

### 2. Шаблон `home.html`

- Заменена структура `<p-carousel>` на структуру Glider.js:
  - `.glider-container` - контейнер карусели
  - `.glider` - основной элемент карусели
  - `.glider-slide` - отдельные слайды
  - `.glider-prev` / `.glider-next` - кнопки навигации
  - `.glider-dots` - контейнер для точек-индикаторов

### 3. Стили `home.css`

- Удалены стили для PrimeNG карусели
- Добавлены кастомные стили для Glider.js:
  - Стилизация кнопок навигации в цветах teal
  - Стилизация точек-индикаторов
  - Адаптивные стили для мобильных устройств
  - Эффекты hover для интерактивных элементов

### 4. Глобальные стили `styles.css`

- Добавлен импорт `glider-js/glider.min.css`

## Преимущества Glider.js

1. **Легковесность** - меньший размер бандла по сравнению с PrimeNG Carousel
2. **Производительность** - нативная поддержка CSS transforms
3. **Гибкость** - легко кастомизируется
4. **Адаптивность** - встроенная поддержка responsive breakpoints
5. **Доступность** - поддержка ARIA атрибутов

## Настройки карусели

```typescript
{
  slidesToShow: 1,        // По умолчанию 1 слайд
  slidesToScroll: 1,      // Прокрутка по 1 слайду
  draggable: true,        // Поддержка свайпа
  dots: '.glider-dots',   // Селектор для точек
  arrows: {
    prev: '.glider-prev',
    next: '.glider-next'
  },
  responsive: [
    { breakpoint: 768, settings: { slidesToShow: 2 } },
    { breakpoint: 1024, settings: { slidesToShow: 3 } },
    { breakpoint: 1280, settings: { slidesToShow: 4 } }
  ]
}
```

## Signal-based подход

### Вместо старого подхода:

```typescript
@ViewChild('gliderElement', { static: false }) gliderElement?: ElementRef<HTMLElement>;

ngAfterViewInit(): void {
  this.initGlider();
}

ngOnDestroy(): void {
  if (this.glider) {
    this.glider.destroy();
  }
}
```

### Используется современный:

```typescript
private readonly gliderElement = viewChild<ElementRef<HTMLElement>>('gliderElement');

constructor() {
  effect((onCleanup) => {
    const element = this.gliderElement()?.nativeElement;
    const items = this.carouselItems();

    if (element && items.length > 0) {
      const timeoutId = setTimeout(() => this.initGlider(element), 0);

      onCleanup(() => {
        clearTimeout(timeoutId);
        if (this.glider) {
          this.glider.destroy();
          this.glider = undefined;
        }
      });
    }
  });
}
```

## Зависимости

Библиотека уже была установлена в проекте:

- `glider-js`: ^1.7.9
- `@types/glider-js`: ^1.7.12

## Примечания

- Effect автоматически реагирует на изменения `gliderElement()` и `carouselItems()`
- При уничтожении компонента или изменении зависимостей автоматически вызывается `onCleanup`
- Карусель полностью адаптивна и работает на всех устройствах
- Код соответствует современным best practices Angular (signals, effects)
