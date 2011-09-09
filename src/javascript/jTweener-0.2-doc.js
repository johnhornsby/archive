/**
 * Документация к jTweener и его фасаду
 * @author Sergey Chikuyonok (sc@design.ru)
 * @copyright Art.Lebedev Studio (http://www.artlebedev.ru)
 */

/**
 * Класс для пакетной анимации кучи объектов и их свойств.
 * В большинстве случаев для создания анимации нужно всего лишь
 * вызвать метод <code>jTweener.addTween()</code>
 */
var jTweener = {
	/**
	 * Добавить анимацию для объекта <b>obj</b>, в котором нужно анимировать
	 * свойства <b>options</b>. Анимируемые свойства должны быть числами,
	 * но могут быть и строками, в которых указывается <i>относительное</i>
	 * изменение параметра. Например, передав свойство <code>{left: '+=200'}</code>
	 * мы попросим jTweener изменить свойство left на 200 единиц относительно
	 * начального значения этого свойства. Принимаются значения '+' и '-'.
	 * Есть ряд предопределенных параметров в переменной <b>options</b>:<br><br>
	 * <b>time</b>: Number — продолжительность анимации, секунд. По умолчанию: 1<br><br>
	 * <b>transition</b>: String, Function — алгоритм анимации
	 * (см. <code>jTweener.easingFunctions</code>). По умолчанию: 'easeoutexpo'<br><br>
	 * <b>delay</b>: Number — задержка перед началом анимации, секунд. По умолчанию: 0<br><br>
	 * <b>onStart</b>: Function — функция, которую нужно выполнить во время
	 * начала анимации<br><br>
	 * <b>onStartParams</b>: Array — параметры для функции <code>onStart</code><br><br>
	 * <b>onUpdate</b>: Function — функция, выполняемая с каждым проходом
	 * анимации<br><br>
	 * <b>onUpdateParams</b>: Array — параметры для функции <code>onUpdate</code><br><br>
	 * <b>onComplete</b>: Function — функция, которую нужно выполнить после
	 * окончания анимации<br><br>
	 * <b>onCompleteParams</b>: Array — параметры для функции <code>onComplete</code><br><br>
	 * <b>namespace</b>: String — пространство имен, в котором должна отрабатываться
	 * анимация. Пространство имен подразумевает, что какие-то анимации
	 * (с одинаковым пространствои имен) работают как единый процесс,
	 * который можно в любой момент остановить либо вызвать после его завершения
	 * какую-то функцию. См. <code>jTweener.addNSAction</code><br><br>
	 * Важно помнить, что в этом фреймворке используется следующее соглашение:
	 * если анимируемое свойство является функцией, то оно используется как
	 * getter/setter. Если в эту функцию не передается никакое значение,
	 * значит, она используется как getter, если передается — используется
	 * как setter.
	 * @type {Function}
	 * @param {Object, Array} obj Объект или массив объектов, свойства
	 * которых нужно анимировать.
	 * @param {Object} options Параметры анимации
	 */
	addTween: function(obj, options) {},

	/**
	 * Вспомогательная функция для создания анимаций, где требуется менять
	 * значение свойства в диапазоне от 0 до 1 (по сути, менять значение
	 * в процентном, а не в абсолютном выражении). Отличается от
	 * <code>jTweener.addTween</code> тем, что не требует наличия 
	 * анимируемых объектов: можно предавать только параметры анимации, 
	 * предполагая, что все анимируемые свойства будут записаны 
	 * в <b>setter</b> нотации (то есть будут функциями, в которую будет 
	 * приходить значение от 0 до 1; функция не используется как 
	 * <b>getter</b>). Если все же передали объекты анимаций, то 
	 * setter-функции будут выполняться в контексте этих объектов 
	 * (то есть <code>this</code> внутри этих функций будет указывать на 
	 * анимируемый объект). Важно помнить, что сколько анимируемых объектов
	 * было передано, столько раз будет вызываться setter-функция.<br>
	 * <br>
	 * <b>Варианты использования:</b><br>
	 * jTweener.addPercent(<code>options</code> : Object)<br>
	 * jTweener.addPercent(<code>anim_obj</code> : Array|Object, <code>options</code> : Object)
	 * @example
	 * jTweener.addPecent({
	 * 	anim_param: function(value) {
	 * 		// значение value от 0 до 1
	 * 		var angle = Math.PI * 2;
	 * 		some_object.style.left = Math.sin(angle * value) + 'px';
	 * 		some_object.style.top = Math.cos(angle * value) + 'px';
	 * 	},
	 * 	time: 0.5,
	 * 	transition: 'easeinoutcubic'
	 * });
	 * @param {Object} options Параметры анимации
	 * @see jTweener#addTween
	 * @return {Object} Внутренний объект, созданный при добавлении анимации. Его можно использовать в <code>jTweener.removeTween()</code>
	 */
	addPercent: function(options){},

	/**
	 * Добавляет функции, которые нужно выполнить при завершении
	 * шага анимации конкретного нэймспэйса. Принимаются следующие свойства
	 * аргумента actions: <code>onUpdate</code>, <code>onUpdateParams</code>,
	 * <code>onComplete</code>, <code>onCompleteParams</code>.
	 * Описания этих свойств такие же, как и в <code>jTweener.addTween</code>.
	 * @param {Object} actions Действия
	 * @param {String} [ns] Нэймспэйс, которому нужно добавить действия
	 * (по умолчанию: 'default')
	 */
	addNSAction: function(actions, ns){},

	/**
	 * Удалить действия у нэймспэйса<br><br>
	 * <b>Варианты использования:</b><br><br>
	 * <code>removeNSActions()</code> — удалит все действия из всех
	 * нэймспэйсов<br>
	 * <code>removeNSActions(namespace : String)</code> — удалит все действия
	 * из нэймспэйса 'namespace'<br>
	 * <code>removeNSActions(namespace : String, action1 : String,
	 * action2 : String, ..., actionN : String)</code> — удалит действия
	 * action1—N из нэймспэйса 'namespace'
	 */
	removeNSActions: function(){},

	/**
	 * Удаляет анимации<br><br>
	 * <b>Варианты использования:</b><br><br>
	 * <code>removeTween()</code> — удаляет абсолютно все анимации<br>
	 * <code>removeTween(namespace : String)</code> — удаляет все анимации
	 * у нэймспэйса 'namespace'<br>
	 * <code>removeTween(namespace : String, obj : Object, Array)</code> —
	 * удаляет анимации у объекта (или массива объектов) 'obj' из нэймспэйса
	 * 'namespace'<br>
	 * <code>removeTween(obj : Object, Array)</code> — удаляет все анимации
	 * у объекта (или массива объектов) 'obj'
	 */
	removeTween: function(){}
};

/**
 * Утилиты для анимаций
 */
jTweener.Utils = {
	/**
	 * @param {Number} t Время
	 * @param {Number} p0 Начальная точка
	 * @param {Number} p1 Контрольная точка
	 * @param {Number} p2 Конечная точка
	 * @return {Number}
	 */
	bezier2: function(t, p0, p1, p2) {},
	/**
	 * @param {Number} t Время
	 * @param {Number} p0 Начальная точка
	 * @param {Number} p1 Контрольная точка 1
	 * @param {Number} p2 Контрольная точка 2
	 * @param {Number} p3 Конечная точка
	 * @return {Number}
	 */
	bezier3: function(t, p0, p1, p2, p3) {},
	
	/**
	 * Объединяет несколько объектов-хэшей в один
	 * @param {Object} ... Объекты, которые нужно объединить
	 * @return {Object}
	 */
	mergeObjects: function(){},
	
	/**
	 * Разбирает строку и возвращает объект, содержащий цветовые компоненты.
	 * Понимает следующие форматы:<br>
	 * <b>rgb(120,50,255)</b><br>
	 * <b>rgb(88%,100%,39%)</b><br>
	 * <b>#a0b1c2</b><br>
	 * <b>#fff</b><br>
	 * Если строка не может быть разобрана — возвращается черный цвет
	 * @author Blair Mitchelmore (http://jquery.offput.ca/highlightFade/)
	 * @param {String} color Строка с цветом.
	 * @return jTweener.Util.Color
	 */
	getRGB: function(color) {}
};

/**
 * @class
 * Вспомогательный класс для работы с цветом
 * @param {Number} r Красная компонента (0—255)
 * @param {Number} g Зеленая компонента (0—255)
 * @param {Number} b Синяя компонента (0—255)
 */
jTweener.Utils.Color = function(r, g, b){};

/**
 * Смешивает два цвета в указанной пропорции.
 * @param {jTweener.Utils.Color} color1 Первичный цвет
 * @param {jTweener.Utils.Color} color2 Вторичный цвет
 * @param {Number} ratio Пропорция, в которой нужно смешать цвет (0 — чистый первичный цвет, 1 — чистый вторичный цвет).
 * @return {jTweener.Utils.Color}
 */
jTweener.Utils.Color.blend = function(color1, color2, ratio){};

jTweener.Utils.Color.prototype = {
	/** Красная компонента цвета */
	r: 0,

	/** Зеленая компонента цвета */
	g: 0,

	/** Синяя компонента цвета */
	b: 0,
	/**
	 * Возвращает цвет в формате RGB, например, 'rgb(129,250,0)'
	 * @return {String}
	 */
	toString: function(){}
}

 /**
 * Создает вспомогательный объект для создания анимаций через 
 * <code>jTweener</code>. Этот объет удобен тем, что хранит в себе
 * ссылки на анимируемые объекты, что сокращает объем кода, необходимый
 * для работы с <code>jTweener</code>. В том числе удобен тем, что
 * позволяет хранить и передавть несколько хэшей с параметрами анимаций,
 * что позволяет, например, создать хэш со стандартными параметрами, которые
 * будут применяться при анимации разных объектов.
 * @param {Element|Object|Array|jQuery} Объект или набор объектов, которые нужно анимировать
 * @param {Object|Array} [options] Хэш (или массив хэшей) опций, которые будут применяться ко всем анимациям по умолчанию. Можно указать несколько аргументов с опициями
 * @return {$tObj}
 * 
 * @example
 * var common_params = {
 * 	time: 1,
 * 	transition: 'easeoutcubic'
 * };
 * 
 * var my_tween = $t(document.getElementById('sample'), common_params).tween({left: 100});
 * my_tween.stop();
 */
function $t(obj, options){return new $tObj();}

/**
 * Вспомогательный элемент, используется <i>только</i> для code assist. 
 * Такого объекта в jTweener не существует в принципе  
 * @private 
 */
function $tObj(){};

$tObj.prototype = {
	/**
	 * Запуск анимации. Принимает неограниченное количество аргументов,
	 * каждый из которых является набором параметров анимаций. Все эти опции
	 * (включая те, которые были указаны при создании объекта) объединяются
	 * в один набор в том порядке, в котором они были указаны.
	 * @param {Object} [options] Один или несколько наборов параметров анимации
	 * @return {$t}
	 * @example
	 * var common_params = {
	 * 	time: 0.4, 
	 * 	transition: 'linear'
	 * };
	 * $t(anim_obj).tween({left: 100, top: 10}, common_params);
	 */
	tween: function(options){},
	
	/**
	 * Создает особый вид анимации — процентную (см. <code>jTweener.addPercent</code>).
	 * От обычной она отличется тем, что все анимируемые свойства должны быть 
	 * функциями, принимающими один аргумент. Значение этого аргумента 
	 * изменяется от 0 до 1. Для удобства вместо хэшей с параметрами можно 
	 * отдавать функции
	 * @param {Object|Function} options Функция или набор функций в виде хэша
	 * @return {$t}
	 * @example
	 * var default_options = {
	 * 	time: 2, 
	 * 	value: function(v){
	 * 		console.log(v);
	 * 	}
	 * };
	 * var obj = document.getElementById('test_obj');
	 * $t(obj).percent(default_options, function(v){
	 * 	console.log('same value is' + v);
	 * });
	 */
	percent: function(options){},
	
	/**
	 * Останавливает анимацию на всех объектах текущей выборки
	 * @return {$t}
	 */
	stop: function(){},
	
	/**
	 * Добавляет параметры анимации к тем параметрам, которые будут 
	 * применятся по умолчанию при запуске любой анимации
	 * @param {Object} options Один или несколько хэшей с опциями
	 * @return {$t}
	 * @example
	 * $t(document.getElementById('example')).addOptions({time: 4});
	 */
	addOptions: function(options){},
	
	/**
	 * Удаляет все параметры анимации, которые были установлены по умолчанию
	 * @return {$t}
	 * @example
	 * var my_tween = $t(document.getElementById('example'), {transition: 'linear'}).addOptions({time: 4});
	 * // у my_tween установлены параметры time и transition
	 * 
	 * my_tween.clearOptions();
	 * // теперь у my_tween нет никаких параметров 
	 */
	clearOptions: function(){},
	
	/**
	 * Удаляет указанные параметры из параметров анимации по умолчанию.
	 * Принимает неограниченное количество строковых параметров.
	 * @param {String} option Одно или несколько названий параметров, которые нужно удалить
	 * @return {$t}
	 * 
	 * @example
	 * var my_tween = $t(document.getElementById('example'), {transition: 'linear', left: 100}).addOptions({time: 4});
	 * // у my_tween установлены параметры time, transition и left
	 * 
	 * my_tween.removeTween('time', 'left');
	 * // у my_tween осталось только свойство transition
	 */
	removeOptions: function(option){}
};