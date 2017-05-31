'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * jquery.formstyler-modern - JQuery HTML form styling plugin
 * @version v2.0.0
 * @link https://github.com/ange007/JQueryFormStyler-Modern
 * @license MIT
 * @author Borisenko Vladimir
 */

;(function (factory) {
	// AMD
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	}
	// CommonJS
	else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
			module.exports = factory($ || require('jquery'));
		}
		// 
		else {
				factory(jQuery);
			}
})(function ($) {
	'use strict';

	/* Имя плагина. Используется для вызова плагина, 
 * а так-же в качестве класса для 
  * стилизации без "псевдо-компонентов" */

	var pluginName = 'styler';

	// Суффикс - который подставляется к ID "псевдо-компонента"
	var idSuffix = '-' + pluginName;

	// Параметры по умолчанию
	var defaults = {
		locale: navigator.browserLanguage || navigator.language || navigator.userLanguage || 'en-US',

		select: {
			search: {
				limit: 10

			},
			triggerHTML: '<div class="jq-selectbox__trigger-arrow"></div>',
			visibleOptions: 0,
			smartPosition: true,
			onOpened: function onOpened() {},
			onClosed: function onClosed() {}
		},
		checkbox: {
			indeterminate: false
		},
		password: {
			switchHTML: '<button type="button" class="' + pluginName + '"></button>'
		},

		onFormStyled: function onFormStyled() {}
	};

	// Локализация
	var locales = {
		// English
		'en-US': {
			file: {
				placeholder: 'No file selected',
				browse: 'Browse...',
				counter: 'Selected files: %s'
			},
			select: {
				placeholder: 'Select...',
				search: {
					notFound: 'No matches found',
					placeholder: 'Search...'
				}
			},
			password: {
				show: '&#10687;',
				hide: '&#10686;'
			}
		},

		// Русский
		'ru-RU': {
			file: {
				placeholder: 'Файл не выбран',
				browse: 'Обзор...',
				counter: 'Выбрано файлов: %s'
			},
			select: {
				placeholder: 'Выберите...',
				search: {
					notFound: 'Совпадений не найдено',
					placeholder: 'Поиск...'
				}
			}
		},

		// Українська
		'uk-UA': {
			file: {
				placeholder: 'Файл не обрано',
				browse: 'Огляд...',
				counter: 'Обрано файлів: %s'
			},
			select: {
				placeholder: 'Виберіть...',
				search: {
					notFound: 'Збігів не знайдено',
					placeholder: 'Пошук...'
				}
			}
		}
	};

	// Добавляем синонимы языковых кодов
	locales['en'] = locales['en-US'];
	locales['ru'] = locales['ru-RU'];
	locales['ua'] = locales['uk-UA'];

	// Атрибуты елемента
	function Attributes(element) {
		if (element.attr('id') !== undefined && element.attr('id') !== '') {
			this.id = element.attr('id') + idSuffix;
		}

		this.title = element.attr('title');
		this.classes = element.attr('class');
		this.data = element.data();
	}

	// Конструктор плагина
	function Plugin(element, options) {
		// Запоминаем єлемент
		this.element = element;
		this.customElement = undefined;

		// Настройки
		this.options = $.extend(true, {}, defaults, options);

		// Расширяем английскую локализацию - выборанной локализацией из параметров
		var mainLocale = $.extend(true, {}, locales['en-US'], locales[this.options.locale]);

		// Расширяем полученный словарь словами переданными через настройки
		this.locales = $.extend(true, {}, mainLocale, this.options.locales);

		// Инициаплизация
		this.init();
	}

	// Расширение функционала плагина
	Plugin.prototype = {
		// Инициализация
		init: function init() {
			var context = this,
			    element = $(this.element);

			// Определение мобильного браузера
			var iOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/i) && !navigator.userAgent.match(/(Windows\sPhone)/i),
			    Android = navigator.userAgent.match(/Android/i) && !navigator.userAgent.match(/(Windows\sPhone)/i);

			// Чекбокс
			if (element.is(':checkbox')) {
				var CheckBox = function () {
					var CheckBox = function CheckBox(element, options, locale) {
						//
						this.element = element;
						this.options = options;
						this.locale = locale;

						//
						var attr = new Attributes(this.element);

						//
						this.checkbox = $('<div class="jq-checkbox"><div class="jq-checkbox__div"></div></div>').attr({ 'id': attr.id, 'title': attr.title, 'unselectable': 'on' }).addClass(attr.classes).data(attr.data);

						// Прячем оригинальный чекбокс
						this.element.addClass('jq-hidden').after(this.checkbox).prependTo(this.checkbox);

						//
						this.setEvents().repaint();
					};

					CheckBox.prototype = {
						// Обработка событий
						setEvents: function setEvents() {
							var context = this,
							    options = this.options,
							    element = this.element,
							    checkbox = this.checkbox;

							// Необходимо "перерисовать" контрол 
							checkbox.on('repaint', function () {
								context.repaint();
							})
							// Клик по псевдоблоку ( смена состояния )
							.on('click', function (e) {
								e.preventDefault();

								// Обрабатываем только активный псевдобокс
								if (!checkbox.is('.disabled')) {
									// Текущее состояние: "Отмечено"
									if (element.is(':checked') || element.is(':indeterminate')) {
										// ... если работаем через 3 состояния - отмечаем "не определено",  или просто снимаем отметку
										element.prop('checked', options.indeterminate && element.is(':indeterminate'));

										// "Неопределено" в любом случае снимаем
										element.prop('indeterminate', false);
									}
									// Текущее состояние: "Не отмечено"
									else {
											// ... если работаем через 3 состояния - отмечаем "не определено"
											if (options.indeterminate) {
												element.prop('checked', false).prop('indeterminate', true);
											}
											// ... или просто отмечаем
											else {
													element.prop('checked', true).prop('indeterminate', false);
												}
										}

									// Фокусируем и изменяем вызываем состояние изменения
									element.focus().trigger('change').triggerHandler('click');
								}
							});

							// Клик по label привязанному к данному checkbox
							element.closest('label').add('label[for="' + this.element.attr('id') + '"]').on('click.' + pluginName, function (e) {
								if (!$(e.target).is('a') && !$(e.target).closest(checkbox).length) {
									checkbox.triggerHandler('click');
									e.preventDefault();
								}
							});

							// Обработка изменений
							element.on('change.' + pluginName, function () {
								checkbox.triggerHandler('repaint');
							})
							// Обработка переключения при помощи клавиатуры
							.on('keydown.' + pluginName, function (e) {
								if (e.which === 32) {
									e.preventDefault();
									checkbox.triggerHandler('click');
								}
							})
							// Обработка наведения фокуса
							.on('focus.' + pluginName, function () {
								if (!checkbox.is('.disabled')) {
									checkbox.addClass('focused');
								}
							})
							// Обработка снятия фокуса
							.on('blur.' + pluginName, function () {
								checkbox.removeClass('focused');
							});

							return this;
						},

						// Перерисовка
						repaint: function repaint() {
							var element = this.element,
							    checkbox = this.checkbox;

							// Отмечено
							if (element.is(':checked') || element.is(':indeterminate')) {
								if (element.is(':indeterminate')) {
									checkbox.removeClass('checked').addClass('indeterminate');
								} else {
									checkbox.removeClass('indeterminate').addClass('checked');
								}
							}
							// Не отмечено
							else {
									checkbox.removeClass('indeterminate').removeClass('checked');
								}

							// Активация/деактивация
							checkbox.toggleClass('disabled', element.is(':disabled'));

							return this;
						},

						// Уничтожение
						destroy: function destroy() {
							var element = this.element;

							//
							element.off('.' + pluginName + ', refresh').removeAttr('style').parent().before(element).remove();

							//
							element.closest('label').add('label[for="' + element.attr('id') + '"]').off('.' + pluginName);

							return this;
						}
					};

					return CheckBox;
				}();

				// Стилизируем компонент
				this.customElement = new CheckBox(element, this.options.checkbox, this.locales.checkbox);
			}
			// Радиокнопка
			else if (element.is(':radio')) {
					var Radio = function () {
						var Radio = function Radio(element, options, locale) {
							//
							this.element = element;
							this.options = options;
							this.locale = locale;

							//
							var attr = new Attributes(this.element);

							//
							this.radio = $('<div class="jq-radio"><div class="jq-radio__div"></div></div>').attr({ 'id': attr.id, 'title': attr.title, 'unselectable': 'on' }).addClass(attr.classes).data(attr.data);

							// Прячем оригинальную радиокнопку
							this.element.addClass('jq-hidden').after(this.radio).prependTo(this.radio);

							//
							this.setEvents().repaint();
						};

						Radio.prototype = {
							// Обработка событий
							setEvents: function setEvents() {
								var context = this,
								    element = this.element,
								    radio = this.radio;

								// Необходимо "перерисовать" контрол 
								radio.on('repaint', function () {
									context.repaint();
								})
								// Клик по псевдоблоку
								.on('click', function (e) {
									//
									e.preventDefault();

									// Обрабатываем только активную радиокнопку
									if (!radio.is('.disabled')) {
										// 
										var name = element.attr('name');

										// Ищем нужный нам елемент по родителям
										var findElement = radio.closest('#' + name).find('input[name="' + name + '"]:radio');

										// ... или же по всему документу
										if (findElement.length <= 0) {
											findElement = $('body').find('input[name="' + name + '"]:radio');
										}

										// Снимаем отметку с найденного блока
										findElement.prop('checked', false).parent().removeClass('checked');

										// Передаём фокус и вызываем событие - изменения
										element.prop('checked', true).focus().trigger('change').triggerHandler('click');
									}
								});

								// Обработка изменений
								element.on('change.' + pluginName, function (e) {
									radio.triggerHandler('repaint');
								})
								// Обработка переключения при помощи клавиатуры
								.on('keydown.' + pluginName, function (e) {
									if (e.which === 32) {
										e.preventDefault();
										radio.trigger('click');
									}
								})
								// Обработка наведения фокуса
								.on('focus.' + pluginName, function () {
									if (!radio.is('.disabled')) {
										radio.addClass('focused');
									}
								})
								// Обработка снятия фокуса
								.on('blur.' + pluginName, function () {
									radio.removeClass('focused');
								});

								// Клик на label
								element.closest('label').add('label[for="' + element.attr('id') + '"]').on('click.' + pluginName, function (e) {
									if (!$(e.target).is('a') && !$(e.target).closest(radio).length) {
										radio.triggerHandler('click');
										e.preventDefault();
									}
								});

								return this;
							},

							// Перерисовка
							repaint: function repaint() {
								var element = this.element,
								    radio = this.radio;

								// Отметка
								element.parent().toggleClass('checked', element.is(':checked'));

								// Активация/деактивация
								radio.toggleClass('disabled', element.is(':disabled'));

								return this;
							},

							// Уничтожение
							destroy: function destroy() {
								var element = this.element;

								//
								element.off('.' + pluginName + ', refresh').removeAttr('style').parent().before(element).remove();

								//
								element.closest('label').add('label[for="' + element.attr('id') + '"]').off('.' + pluginName);

								return this;
							}
						};

						return Radio;
					}();

					// Стилизируем компонент
					this.customElement = new Radio(element, this.options.radio, this.locales.radio);
				}
				// Выбор файла
				else if (element.is(':file')) {
						var File = function () {
							var File = function File(element, options, locale) {
								//
								this.element = element;
								this.options = options;
								this.locale = locale;

								//
								this.placeholderText = this.element.data('placeholder') || locale['placeholder'];
								this.browseText = this.element.data('browse') || locale['browse'];

								// Формируем компонент
								var att = new Attributes(this.element);

								//
								this.file = $('<div class="jq-file">' + '<div class="jq-file__name">' + this.placeholderText + '</div>' + '<div class="jq-file__browse">' + this.browseText + '</div>' + '</div>').attr({ 'id': att.id, 'title': att.title }).addClass(att.classes).data(att.data);

								// Прячем оригинальное поле
								this.element.addClass('jq-hidden').after(this.file).appendTo(this.file);

								//
								this.setEvents().repaint();
							};

							File.prototype = {
								// Обработка событий
								setEvents: function setEvents() {
									var context = this,
									    element = this.element,
									    file = this.file;

									// Необходимо "перерисовать" контрол 
									file.on('repaint', function () {
										context.repaint();
									});

									// Обработка "изменения" состояния
									element.on('change.' + pluginName, function () {
										file.triggerHandler('repaint');
									})
									// Работа с "фокусировкой"
									.on('focus.' + pluginName, function () {
										file.addClass('focused');
									}).on('blur.' + pluginName, function () {
										file.removeClass('focused');
									}).on('click.' + pluginName, function () {
										file.removeClass('focused');
									});

									return this;
								},

								// Перерисовка
								repaint: function repaint() {
									var element = this.element,
									    file = this.file,
									    options = this.options,
									    name = $('div.jq-file__name', file);

									//
									var value = element.val();

									// Если необходим множественный выбор
									if (element.is('[multiple]')) {
										var fileCount = element[0].files.length;

										if (fileCount > 0) {
											value = (element.data('number') || options.counter).replace('%s', fileCount);
										} else {
											value = '';
										}
									}

									// Выводим название файлов или примечание
									name.text(value.replace(/.+[\\\/]/, '') || this.placeholderText);

									// Активация/деактивация
									file.toggleClass('changed', value !== '').toggleClass('disabled', element.is(':disabled'));

									return this;
								},

								// Уничтожение
								destroy: function destroy() {
									var element = this.element;

									element.off('.' + pluginName + ', refresh').removeAttr('style').parent().before(element).remove();

									return this;
								}
							};

							return File;
						}();

						// Стилизируем компонент
						this.customElement = new File(element, this.options.file, this.locales.file);
					}
					// Номер
					else if (element.is('input[type="number"]')) {
							var _Number = function () {
								var Number = function Number(element, options, locale) {
									//
									this.element = element;
									this.options = options;
									this.locale = locale;

									//
									var attr = new Attributes(this.element);

									//
									this.number = $('<div class="jq-number">' + '<div class="jq-number__spin minus"></div>' + '<div class="jq-number__spin plus"></div>' + '</div>').attr({ 'id': attr.id, 'title': attr.title }).addClass(attr.classes).data(attr.data);

									// Прячем оригинальную радиокнопку
									this.element.after(this.number).prependTo(this.number).wrap('<div class="jq-number__field"></div>');

									//
									this.setEvents().repaint();
								};

								Number.prototype = {
									// Обработка событий
									setEvents: function setEvents() {
										var context = this,
										    element = this.element,
										    number = this.number;

										var timeout = null,
										    interval = null;

										// Необходимо "перерисовать" контрол
										number.on('repaint', function () {
											context.repaint();
										})
										//
										.on('mousedown', 'div.jq-number__spin', function () {
											if (element.is(':disabled')) {
												return;
											}

											var spin = $(this);
											context.changeValue(spin);

											timeout = setTimeout(function () {
												interval = setInterval(function () {
													context.changeValue(spin);
												}, 40);
											}, 350);
										})
										//
										.on('mouseup mouseout', 'div.jq-number__spin', function () {
											if (element.is(':disabled')) {
												return;
											}

											clearTimeout(timeout);
											clearInterval(interval);
										});

										// Фокусировка
										element.on('focus.' + pluginName, function () {
											number.addClass('focused');
										})
										// Расфокусировка
										.on('blur.' + pluginName, function () {
											number.removeClass('focused');
										});

										return this;
									},

									// Перерисовка
									repaint: function repaint() {
										var element = this.element,
										    number = this.number;

										number.toggleClass('disabled', element.is(':disabled'));

										return this;
									},

									//
									changeValue: function changeValue(button) {
										var element = this.element,
										    number = this.number;

										//
										var min = element.attr('min') || undefined,
										    max = element.attr('max') || undefined,
										    step = window.Number(element.attr('step')) || 1;

										//
										var value = $.isNumeric(element.val()) ? element.val() : 0,
										    newValue = window.Number(value) + (button.is('.plus') ? step : -step);

										// Определяем количество десятичных знаков после запятой в step
										var decimals = (step.toString().split('.')[1] || []).length.prototype;
										var multiplier = '1';

										if (decimals > 0) {
											while (multiplier.length <= decimals) {
												multiplier = multiplier + '0';
											}

											// Избегаем появления лишних знаков после запятой
											newValue = Math.round(newValue * multiplier) / multiplier;
										}

										if ($.isNumeric(min) && $.isNumeric(max)) {
											if (newValue >= min && newValue <= max) {
												element.val(newValue).change();
											}
										} else if ($.isNumeric(min) && !$.isNumeric(max)) {
											if (newValue >= min) {
												element.val(newValue).change();
											}
										} else if (!$.isNumeric(min) && $.isNumeric(max)) {
											if (newValue <= max) {
												element.val(newValue).change();
											}
										} else {
											element.val(newValue).change();
										}
									},

									// Уничтожение
									destroy: function destroy() {
										var element = this.element;

										element.off('.' + pluginName + ', refresh').closest('.jq-number').before(element).remove();

										return this;
									}
								};

								return Number;
							}();

							// Стилизируем компонент
							this.customElement = new _Number(element, this.options.number, this.locales.number);
						}
						// Пароль
						else if (element.is('input[type="password"]') && this.options.password.switchHTML !== undefined && this.options.password.switchHTML !== 'none') {
								var Password = function () {
									var Password = function Password(element, options, locale) {
										//
										this.element = element;
										this.options = options;
										this.locale = locale;

										//
										var customButton = $('<div class="jq-password__switch">' + (this.options.switchHTML || '') + '</div>');

										//
										this.password = $('<div class="jq-password">').append(customButton), this.button = customButton.children('button').length > 0 ? customButton.children('button') : customButton;

										// Есть ли текст в блоке, и нужно ли его ставить
										if (this.button.html() === '' && locale['show'] !== '') {
											this.button.html(locale['show']);

											// Если был вставлен только текст
											if (customButton.children('button').length <= 0) {
												customButton.addClass('jq-password__switch-text');
											}
										}

										//
										this.element.after(this.password).prependTo(this.password);

										//
										this.setEvents().repaint();
									};

									Password.prototype = {
										setEvents: function setEvents() {
											var locale = this.locale,
											    element = this.element,
											    password = this.password,
											    button = this.button;

											// Необходимо "перерисовать" контрол
											password.on('repaint', function () {
												// Активация/деактивация
												password.toggleClass('disabled', element.is(':disabled'));

												// Активация/деактивация кнопки
												button.prop('disabled', element.is(':disabled'));
											})
											// Реакция на клик по кнопке
											.on('click', '.jq-password__switch', function () {
												var switcher = $(this),
												    wrapper = switcher.closest('.jq-password'),
												    seen = wrapper.is('.jq-password_seen');

												// Добавление/удаление класса
												wrapper.toggleClass('jq-password_seen', !seen);

												// Меняем текст
												if (locale['show'] !== '' && locale['hide'] !== '') {
													button.html(seen ? locale['show'] : locale['hide']);
												}

												//
												element.attr('type', seen ? 'password' : 'text');
											});

											// Фокусировка
											element.on('focus.' + pluginName, function () {
												password.addClass('focused');
											})
											// Расфокусировка
											.on('blur.' + pluginName, function () {
												password.removeClass('focused');
											});

											return this;
										},

										// Перерисовка
										repaint: function repaint() {
											var element = this.element,
											    password = this.password,
											    button = this.button;

											// Активация/деактивация
											password.toggleClass('disabled', element.is(':disabled'));

											// Активация/деактивация кнопки
											button.prop('disabled', element.is(':disabled'));

											return this;
										},

										// Уничтожение
										destroy: function destroy() {
											var element = this.element;

											element.off('.' + pluginName + ', refresh').closest('.jq-password').before(element).remove();

											return this;
										}
									};

									return Password;
								}();

								// Стилизируем компонент
								this.customElement = new Password(element, this.options.password, this.locales.password);
							}
							// Скрытое поле
							else if (element.is('input[type="hidden"]')) {
									return false;
								}
								// Список
								else if (element.is('select')) {
										var selectboxOutput = function selectboxOutput(el) {
											// Параметры компонента
											var params = this.options.select || {},
											    locale = this.locales.select || {};

											//
											var optionList = $('option', el);

											// Запрещаем прокрутку страницы при прокрутке селекта
											function preventScrolling(selector) {
												var scrollDiff = selector.prop('scrollHeight') - selector.outerHeight();

												//
												var wheelDelta = null,
												    scrollTop = null;

												// 
												selector.off('mousewheel DOMMouseScroll').on('mousewheel DOMMouseScroll', function (e) {
													wheelDelta = e.originalEvent.detail < 0 || e.originalEvent.wheelDelta > 0 ? 1 : -1; // Направление прокрутки (-1 вниз, 1 вверх)
													scrollTop = selector.scrollTop(); // Позиция скролла

													if (scrollTop >= scrollDiff && wheelDelta < 0 || scrollTop <= 0 && wheelDelta > 0) {
														e.stopPropagation();
														e.preventDefault();
													}
												});
											}

											// Формируем список селекта
											function makeList(opList) {
												var list = $('<ul>');

												// Перебираем список элементов
												for (var i = 0; i < opList.length; i++) {
													var op = opList.eq(i),
													    id = (op.attr('id') || '') !== '' ? op.attr('id') + idSuffix : '',
													    title = op.attr('title');

													var liClass = op.attr('class') || '';

													if (op.is(':selected')) {
														liClass += (liClass !== '' ? ' ' : '') + 'selected sel';
													}

													if (op.is(':disabled')) {
														liClass += (liClass !== '' ? ' ' : '') + 'disabled';
													}

													// Параметры по умолчанию
													var defaultAttr = { 'title': title,
														'data': op.data(),
														'html': op.html() };

													// Добавляем к пункту идентификатор если он есть
													if (id !== '') {
														defaultAttr['id'] = id;
													}

													// Если есть optgroup
													if (op.parent().is('optgroup')) {
														var optGroupClass = '';

														//
														if (op.parent().attr('class') !== undefined) {
															optGroupClass = ' ' + op.parent().attr('class');
														}

														// Заголовок группы
														if (op.is(':first-child')) {
															$('<li>', { 'class': 'optgroup' + optGroupClass,
																'html': op.parent().attr('label') }).appendTo(list);
														}

														// Создаём пункт для группы
														$('<li>', $.extend(defaultAttr, { 'class': 'option' })).addClass(liClass).addClass(optGroupClass).data('jqfs-class', op.attr('class')).appendTo(list);
													} else {
														// Создаём пункт
														$('<li>', defaultAttr).addClass(liClass).data('jqfs-class', op.attr('class')).appendTo(list);
													}
												}

												return list;
											}

											// Одиночный селект
											function doSelect(el) {
												//
												var att = new Attributes(el),
												    ulList = makeList(optionList),
												    optionSelected = optionList.filter(':selected'),
												    selectPlaceholder = el.data('placeholder') || params.placeholder,
												    selectSearch = el.data('search') || (params.search ? true : false),
												    selectSearchLimit = el.data('search-limit') || (params.search || {}).limit,
												    selectSmartPosition = el.data('smart-position') || params.smartPosition,
												    selectSearchNotFound = el.data('search-not-found') || locale.search['notFound'],
												    selectSearchPlaceholder = el.data('search-placeholder') || locale.search['placeholder'];

												// Поле поиска
												var searchHTML = !selectSearch ? '' : '<div class="jq-selectbox__search"><input type="search" autocomplete="off" placeholder="' + selectSearchPlaceholder + '"></div>' + '<div class="jq-selectbox__not-found">' + selectSearchNotFound + '</div>';

												// Выпадающий список
												var dropdown = $('<div class="jq-selectbox__dropdown" style="position: absolute">' + searchHTML || '' + '</div>').append(ulList);

												// Формируем компонент
												var selectbox = $('<div class="jq-selectbox jqselect">' + '<div class="jq-selectbox__select">' + '<div class="jq-selectbox__select-text"></div>' + '<div class="jq-selectbox__trigger">' + params.triggerHTML || '' + '</div>' + '</div></div>').attr({ 'id': att.id, 'title': att.title }).data(att.data).addClass(att.classes).append(dropdown);

												// Вставляем оригинальный элемент в псевдоблок
												el.after(selectbox).prependTo(selectbox);

												// Разбираем на составляющие 
												var divSelect = $('div.jq-selectbox__select', selectbox),
												    divText = $('div.jq-selectbox__select-text', selectbox);

												// Разбираем на составляющие выпадающий список
												var menu = $('ul', dropdown),
												    li = $('li', dropdown).css({ 'display': 'inline-block' }),
												    search = $('input', dropdown),
												    notFound = $('div.jq-selectbox__not-found', dropdown).hide();

												var liWidthInner = 0,
												    liWidth = 0;

												//
												if (li.length < selectSearchLimit) {
													search.parent().hide();
												}

												// Расчитываем максимальную ширину
												li.each(function () {
													var item = $(this);

													if (item.innerWidth() > liWidthInner) {
														liWidthInner = item.innerWidth();
														liWidth = item.width();
													}
												});

												// Убираем инлайновый стиль
												li.css({ 'display': '' });

												// Подстраиваем ширину свернутого селекта в зависимости
												// от ширины плейсхолдера или самого широкого пункта
												if (divText.is('.placeholder') && divText.width() > liWidthInner) {
													divText.width(divText.width());
												} else {
													// Клонируем селектор и устанавливаем ему размер "авто"
													var selClone = selectbox.clone().appendTo('body').width('auto');

													// Записываем размер клона
													var selCloneWidth = selClone.outerWidth();

													// Удаляем клон
													selClone.remove();

													// 
													if (selCloneWidth === selectbox.outerWidth()) {
														divText.width(liWidth);
													}
												}

												// Подстраиваем ширину выпадающего списка в зависимости от самого широкого пункта
												if (liWidthInner > selectbox.width()) {
													dropdown.width(liWidthInner);
												}

												// Прячем 1-ю пустую опцию, если она есть и если атрибут data-placeholder не пустой
												// если все же нужно, чтобы первая пустая опция отображалась, то указываем у селекта: data-placeholder=""
												if (optionList.first().text() === '' && el.data('placeholder') !== '') {
													li.first().hide();
												}

												// Прячем оригинальный селект
												el.addClass('jq-hidden');

												//
												var liSelected = li.filter('.selected'),
												    selectHeight = selectbox.outerHeight(true) || 0,
												    searchHeight = search.parent().outerHeight(true) || 0,
												    isMaxHeight = menu.css('max-height') || 0,
												    position = selectHeight || 0;

												if (li.data('li-height') === undefined) {
													li.data('li-height', li.outerHeight());
												}

												if (dropdown.css('left') === 'auto') {
													dropdown.css({ left: 0 });
												}

												if (dropdown.css('top') === 'auto') {
													dropdown.css({ top: selectHeight });
												}

												// 
												dropdown.hide();

												// Если выбран не дефолтный пункт
												if (liSelected.length) {
													// Добавляем класс, показывающий изменение селекта
													if (optionList.first().text() !== optionSelected.text()) {
														selectbox.addClass('changed');
													}

													// Передаем селекту класс выбранного пункта
													selectbox.data('jqfs-class', liSelected.data('jqfs-class'));
													selectbox.addClass(liSelected.data('jqfs-class'));
												}

												// Необходимо "перерисовать" контрол
												selectbox.on('repaint', function () {
													//
													var selectedItems = optionList.filter(':selected'),
													    disabledItems = optionList.filter(':disabled');

													// Выводим в тексте выбранный элемент
													if (selectedItems.val() === '') {
														divText.html(selectPlaceholder).addClass('placeholder');
													} else {
														divText.html(selectedItems.text()).removeClass('placeholder');
													}

													// Удаляем ранее установленный "спец. класс"
													if (selectbox.data('jqfs-class')) {
														selectbox.removeClass(selectbox.data('jqfs-class'));
													}

													// Передаем селекту класс выбранного пункта
													selectbox.data('jqfs-class', selectedItems.attr('class'));
													selectbox.addClass(selectedItems.attr('class'));

													// Ставим класс отметки
													li.removeClass('selected sel').not('.optgroup').eq(el[0].selectedIndex).addClass('selected sel');

													// Отметка деактивации на пунктах
													li.removeClass('disabled').not('.optgroup').filter(function (index) {
														return optionList.eq(index).is(':disabled');
													}).addClass('disabled');

													// Добавляем класс, показывающий изменение селекта
													selectbox.toggleClass('changed', optionList.first().text() !== li.filter('.selected').text());

													// Активация/деактивация
													selectbox.toggleClass('disabled', el.is(':disabled'));
												});

												// Клик по псевдоблоку
												divSelect.on('click', function () {
													// Клик должен срабатывать только при активном контроле
													if (el.is(':disabled')) {
														return;
													}

													// Колбек при закрытии селекта
													if ($('div.jq-selectbox').filter('.opened').length) {
														params.onClosed.call($('div.jq-selectbox').filter('.opened'));
													}

													// Фокусируем
													el.focus();

													// Если iOS, то не показываем выпадающий список,
													// т.к. отображается нативный и неизвестно, как его спрятать
													if (iOS) {
														return;
													}

													// Умное позиционирование - переменные
													var liHeight = li.data('li-height') || 0;

													// Умное позиционирование - константы
													var win = $(window),
													    topOffset = selectbox.offset().top || 0,
													    bottomOffset = win.height() - selectHeight - (topOffset - win.scrollTop()),
													    visible = el.data('visible-options') || params.visibleOptions,
													    newHeight = visible === 0 ? 'auto' : liHeight * visible,
													    minHeight = visible > 0 && visible < 6 ? newHeight : liHeight * 5;

													// Выпадающее вниз меню
													// @todo: Как-то тут много "магии"
													var dropDown = function dropDown(menu) {
														//
														var maxHeightBottom = function maxHeightBottom() {
															menu.css('max-height', Math.floor((bottomOffset - searchHeight - liHeight) / liHeight) * liHeight);
														};

														// Сначала высчитываем максимальную высоту
														maxHeightBottom();

														// Если есть конкретная высота - выставляем её
														menu.css('max-height', isMaxHeight !== 'none' && isMaxHeight > 0 ? isMaxHeight : newHeight);

														// Если высота больше чем нужно - снова ставим максммальную
														if (bottomOffset < dropdown.outerHeight() + liHeight) {
															maxHeightBottom();
														}
													};

													// Выпадающее вверх меню
													// @todo: Как-то тут много "магии"
													var dropUp = function dropUp(menu) {
														//
														var maxHeightTop = function maxHeightTop() {
															menu.css('max-height', Math.floor((topOffset - win.scrollTop() - liHeight - searchHeight) / liHeight) * liHeight);
														};

														// Сначала высчитываем максимальную высоту
														maxHeightTop();

														// Если есть конкретная высота - выставляем её
														menu.css('max-height', isMaxHeight !== 'none' && isMaxHeight > 0 ? isMaxHeight : newHeight);

														// Если высота больше чем нужно - снова ставим максммальную
														if (topOffset - win.scrollTop() - liHeight < dropdown.outerHeight() + liHeight) {
															maxHeightTop();
														}
													};

													//
													if (selectSmartPosition) {
														// Раскрытие вниз
														if (bottomOffset > minHeight + searchHeight + 20) {
															dropDown(menu);

															selectbox.removeClass('dropup').addClass('dropdown');
														}
														// Раскрытие вверх
														else {
																dropUp(menu);

																selectbox.removeClass('dropdown').addClass('dropup');
															}
													} else {
														// Раскрытие вниз
														if (bottomOffset > minHeight + searchHeight + 20) {
															dropDown(menu);

															selectbox.removeClass('dropup').addClass('dropdown');
														}
													}

													// Если выпадающий список выходит за правый край окна браузера,
													// то меняем позиционирование с левого на правое
													if (selectbox.offset().left + dropdown.outerWidth() > win.width()) {
														dropdown.css({ left: 'auto', right: 0 });
													}

													// 
													$('div.jqselect').removeClass('opened');

													//
													if (dropdown.is(':hidden')) {
														$('div.jq-selectbox__dropdown:visible').hide();

														// Отображаем список
														dropdown.show();

														// Добавляем классы
														selectbox.addClass('opened focused');

														// Колбек при открытии селекта
														params.onOpened.call(selectbox);
													} else {
														// Скрываем список
														dropdown.hide();

														// Удаляем классы
														selectbox.removeClass('opened dropup dropdown');

														// Колбек при закрытии селекта
														if ($('div.jq-selectbox').filter('.opened').length) {
															params.onClosed.call(selectbox);
														}
													}

													// Поисковое поле
													if (search.length) {
														// Сбрасываем значение и начинаем поиск
														search.val('').focus().keyup();

														// Прячем блок "не найдено"
														notFound.hide();

														// Начинаем поиск после "отжатия кнопки"
														search.keyup(function () {
															var query = $(this).val();

															// Проходим по содержимому
															li.each(function () {
																var find = $(this).html().match(new RegExp('.*?' + query + '.*?', 'i'));

																//
																$(this).toggle(find ? true : false);
															});

															// Прячем 1-ю пустую опцию
															if (optionList.first().text() === '' && el.data('placeholder') !== '') {
																li.first().hide();
															}

															// Видимость блока "не найдено"
															notFound.toggle(li.filter(':visible').length < 1);
														});
													}

													// Прокручиваем до выбранного пункта при открытии списка
													if (li.filter('.selected').length) {
														if (el.val() === '') {
															menu.scrollTop(0);
														} else {
															// Если нечетное количество видимых пунктов,
															// то высоту пункта делим пополам для последующего расчета
															if (menu.innerHeight() / liHeight % 2 !== 0) {
																liHeight = liHeight / 2;
															}

															menu.scrollTop(menu.scrollTop() + li.filter('.selected').position().top - menu.innerHeight() / 2 + liHeight);
														}
													}

													preventScrolling(menu);
												});

												// 
												var selectedText = li.filter('.selected').text();

												// При наведении курсора на пункт списка
												li.on('hover', function () {
													$(this).siblings().removeClass('selected');
												})
												// При клике на пункт визуального списка
												.on('click', function () {
													var selected = $(this);

													// Если пункт не активен или заголовок - не пускаем дальше
													if (selected.is('.disabled, .optgroup')) {
														return;
													}

													// Фокусируем
													el.focus();

													//
													if (!selected.is('.selected')) {
														var index = selected.index();
														index -= selected.prevAll('.optgroup').length;

														//
														optionList.prop('selected', false).eq(index).prop('selected', true);

														//
														el.change();
													}

													// Прячем список
													dropdown.hide();
													selectbox.removeClass('opened dropup dropdown');

													// Колбек при закрытии селекта
													params.onClosed.call(selectbox);
												});

												//
												dropdown.on('mouseout', function () {
													$('li.sel', dropdown).addClass('selected');
												});

												// Реакция на смену пункта оригинального селекта
												el.on('change.' + pluginName, function () {
													selectbox.triggerHandler('repaint');
												})
												// Фокусировка
												.on('focus.' + pluginName, function () {
													selectbox.addClass('focused');

													$('div.jqselect').not('.focused').removeClass('opened dropup dropdown').find('div.jq-selectbox__dropdown').hide();
												})
												// Расфокусировка
												.on('blur.' + pluginName, function () {
													selectbox.removeClass('focused');
												})
												// Изменение селекта с клавиатуры
												.on('keydown.' + pluginName + ' keyup.' + pluginName, function (e) {
													var liHeight = li.data('li-height');

													// Вверх, влево, Page Up, Home
													if (e.which === 38 || e.which === 37 || e.which === 33 || e.which === 36) {
														if (el.val() === '') {
															menu.scrollTop(0);
														} else {
															menu.scrollTop(menu.scrollTop() + li.filter('.selected').position().top);
														}
													}
													// Вниз, вправо, Page Down, End
													if (e.which === 40 || e.which === 39 || e.which === 34 || e.which === 35) {
														menu.scrollTop(menu.scrollTop() + li.filter('.selected').position().top - menu.innerHeight() + liHeight);
													}

													// Закрываем выпадающий список при нажатии Enter
													if (e.which === 13) {
														e.preventDefault();
														dropdown.hide();
														selectbox.removeClass('opened dropup dropdown');

														// Колбек при закрытии селекта
														params.onClosed.call(selectbox);
													}
												})
												//
												.on('keydown.' + pluginName, function (e) {
													// Открываем выпадающий список при нажатии Space
													if (e.which === 32) {
														e.preventDefault();
														divSelect.trigger('click');
													}
												});

												// Прячем выпадающий список при клике за пределами селекта
												if (!onDocumentClick.registered) {
													$(document).on('click', onDocumentClick);
													onDocumentClick.registered = true;
												}

												// Мы установили стиль, уведомляем об изменении
												selectbox.triggerHandler('repaint');
											}

											// Мультиселект
											function doMultipleSelect(el) {
												var att = new Attributes(el),
												    ulList = makeList(optionList),
												    selectbox = $('<div class="jq-select-multiple jqselect"></div>').attr({ 'id': att.id, 'title': att.title }).addClass(att.classes).data(att.data).append(ulList);

												// Формируем псевдоблок
												el.after(selectbox).prependTo(selectbox);

												//
												var ul = $('ul', selectbox),
												    li = $('li', selectbox).attr('unselectable', 'on'),
												    size = el.attr('size') || 4,
												    ulHeight = ul.outerHeight() || 0,
												    liHeight = li.outerHeight() || 0;

												//
												ul.css({ 'height': liHeight * size });

												// 
												if (ulHeight > selectbox.height()) {
													ul.css('overflowY', 'scroll');
													preventScrolling(ul);

													// Прокручиваем до выбранного пункта
													if (li.filter('.selected').length) {
														ul.scrollTop(ul.scrollTop() + li.filter('.selected').position().top);
													}
												}

												// Прячем оригинальный селект
												el.addClass('jq-hidden');

												// Необходимо "перерисовать" контрол
												selectbox.on('repaint', function () {
													var arrIndexes = [];
													optionList.filter(':selected').each(function () {
														arrIndexes.push($(this).data('optionIndex'));
													});

													//
													li.removeClass('selected').not('.optgroup')
													// .filter( function( index ) { return optionList.eq( index ).is( ':selected' ); } )
													.filter(function (i) {
														return $.inArray(i, arrIndexes) > -1;
													}).addClass('selected');

													// Отметка деактивации на пунктах
													li.removeClass('disabled').not('.optgroup').filter(function (index) {
														return optionList.eq(index).is(':disabled');
													}).addClass('disabled');

													// Активация/деактивация
													selectbox.toggleClass('disabled', el.is(':disabled'));
												});

												// При клике на пункт списка
												li.click(function (e) {
													var selected = $(this);

													// Клик должен срабатывать только при активном контроле
													if (el.is(':disabled') || selected.is('.disabled, .optgroup')) {
														return;
													}

													// Фокусируем
													el.focus();

													//
													if (!e.ctrlKey && !e.metaKey) {
														selected.addClass('selected');
													}

													//
													if (!e.shiftKey) {
														selected.addClass('first');
													}

													//
													if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
														selected.siblings().removeClass('selected first');
													}

													// Выделение пунктов при зажатом Ctrl
													if (e.ctrlKey || e.metaKey) {
														selected.toggleClass('selected first', !selected.is('.selected'));
														selected.siblings().removeClass('first');
													}

													// Выделение пунктов при зажатом Shift
													if (e.shiftKey) {
														var prev = false,
														    next = false;

														//
														selected.siblings().removeClass('selected').siblings('.first').addClass('selected');

														//
														selected.prevAll().each(function () {
															prev = prev || $(this).is('.first');
														});
														selected.nextAll().each(function () {
															next = next || $(this).is('.first');
														});

														//
														if (prev) {
															selected.prevAll().each(function () {
																if ($(this).is('.selected')) {
																	return false;
																} else {
																	$(this).not('.disabled, .optgroup').addClass('selected');
																}
															});
														}

														//
														if (next) {
															selected.nextAll().each(function () {
																if ($(this).is('.selected')) {
																	return false;
																} else {
																	$(this).not('.disabled, .optgroup').addClass('selected');
																}
															});
														}

														if (li.filter('.selected').length === 1) {
															selected.addClass('first');
														}
													}

													// Отмечаем выбранные мышью
													optionList.prop('selected', false);

													//
													li.filter('.selected').each(function () {
														var item = $(this),
														    index = item.index() - (item.is('.option') ? item.prevAll('.optgroup').length : 0);

														optionList.eq(index).prop('selected', true);
													});

													//
													el.change();
												});

												// Отмечаем выбранные с клавиатуры
												optionList.each(function (i) {
													$(this).data('optionIndex', i);
												});

												// Реакция на смену пункта оригинального селекта
												el.on('change.' + pluginName, function () {
													selectbox.triggerHandler('repaint');
												})
												// Фокусировка
												.on('focus.' + pluginName, function () {
													selectbox.addClass('focused');
												})
												// Расфокусировка
												.on('blur.' + pluginName, function () {
													selectbox.removeClass('focused');
												});

												// Прокручиваем с клавиатуры
												if (ulHeight > selectbox.height()) {
													el.on('keydown.' + pluginName, function (e) {
														// вверх, влево, PageUp
														if (e.which === 38 || e.which === 37 || e.which === 33) {
															ul.scrollTop(ul.scrollTop() + li.filter('.selected').position().top - liHeight);
														}
														// вниз, вправо, PageDown
														if (e.which === 40 || e.which === 39 || e.which === 34) {
															ul.scrollTop(ul.scrollTop() + li.filter('.selected:last').position().top - ul.innerHeight() + liHeight * 2);
														}
													});
												}

												// Мы установили стиль, уведомляем об изменении
												selectbox.triggerHandler('repaint');
											}

											if (el.is('[multiple]')) {
												// если Android или iOS, то мультиселект не стилизуем
												// причина для Android: в стилизованном селекте нет возможности выбрать несколько пунктов
												// причина для iOS: в стилизованном селекте неправильно отображаются выбранные пункты
												if (Android || iOS) {
													return;
												}

												doMultipleSelect(el);
											} else {
												if (el.attr('size') > 1) {
													doMultipleSelect(el);
												} else {
													doSelect(el);
												}
											}
										};

										// Стилизируем компонент
										selectboxOutput.call(this, element);
									}
									// Другие компоненты
									else if (element.is('input') || element.is('textarea') || element.is('button') || element.is('a.button')) {
											element.addClass(pluginName);
										}
										// Кнопка сброса
										else if (element.is(':reset')) {
												element.on('click', function () {
													setTimeout(function () {
														element.closest('form').children().trigger('repaint');
													}, 1);
												});
											}

			// Переинициализация
			element.on('refresh reinitialize', function () {
				context.reinitialize();
			});
		},

		// Убрать стилизацию елемент(а/ов) 
		destroy: function destroy(reinitialize) {
			var el = $(this.element);

			// Если происходит уничтожение для переинициализации - data удалять не нужно
			if (!reinitialize) {
				el.removeData('_' + pluginName);
			}

			// Убираем "невидимлсть" елемента
			el.removeClass('jq-hidden');

			// Дополнительная пост-обработка checkbox и radio
			if (this.customElement !== undefined) {
				this.customElement.destroy();
			}
			// Дополнительная пост-обработка file и select
			else if (el.is('select')) {
					el.off('.' + pluginName + ', refresh').removeAttr('style').parent().before(el).remove();
				}
		},

		// Переинициализация стилизованного элемента - с изменёнными параметрами
		reinitialize: function reinitialize(options) {
			// Убираем стилизацию елементов
			this.destroy(true);

			// Перезаписываем настройки
			$.extend(this.options, options);

			// Расширяем текущий словарь словами переданными через настройки
			$.extend(this.locales, this.options.locales);

			// Снова инициализируем стилизацию
			this.init();
		}
	};

	// Прописываем плагин в JQuery
	$.fn[pluginName] = function (options) {
		var args = arguments;

		// Если параметры это объект
		if (options === undefined || (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
			// Проходим по компоненам
			this.each(function () {
				if (!$.data(this, '_' + pluginName)) {
					$.data(this, '_' + pluginName, new Plugin(this, options));
				} else {
					$(this).styler('reinitialize');
				}
			})
			// Ожидаем полного прохода
			.promise()
			// Колбек после выполнения плагина
			.done(function () {
				var opt = $(this[0]).data('_' + pluginName);

				if (opt) {
					opt.options.onFormStyled.call();
				}
			});

			return this;
		}
		// Если параметры это строка
		else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
				var returns = undefined;

				//
				this.each(function () {
					var instance = $.data(this, '_' + pluginName);

					if (instance instanceof Plugin && typeof instance[options] === 'function') {
						returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
					}
				});

				return returns !== undefined ? returns : this;
			}
	};

	// Определяем общего родителя у радиокнопок с одинаковым name
	// http://stackoverflow.com/a/27733847
	$.fn.commonParents = function () {
		var cachedThis = this;

		return cachedThis.first().parents().filter(function () {
			return $(this).find(cachedThis).length === cachedThis.length;
		});
	};

	$.fn.commonParent = function () {
		return $(this).commonParents().first();
	};

	// Прячем выпадающий список при клике за пределами селекта
	function onDocumentClick(e) {
		// e.target.nodeName != 'OPTION' - добавлено для обхода бага в Opera на движке Presto
		// (при изменении селекта с клавиатуры срабатывает событие onclick)
		if (!$(e.target).parents().hasClass('jq-selectbox') && e.target.nodeName !== 'OPTION') {
			if ($('div.jq-selectbox.opened').length) {
				//
				var selectbox = $('div.jq-selectbox.opened'),
				    search = $('div.jq-selectbox__search input', selectbox),
				    dropdown = $('div.jq-selectbox__dropdown', selectbox),
				    opt = selectbox.find('select').data('_' + pluginName).options.select || {};

				// колбек при закрытии селекта
				opt.onClosed.call(selectbox);

				//
				if (search.length) {
					search.val('').keyup();
				}

				//
				dropdown.hide().find('li.sel').addClass('selected');

				//
				selectbox.removeClass('focused opened dropup dropdown');
			}
		}
	}

	onDocumentClick.registered = false;
});