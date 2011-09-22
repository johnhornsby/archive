/**
 * @projectDescription
 * Класс для пакетной анимации кучи объектов и их свойств.
 * Базируется на коде
 * caurina.transitions.Tweener (http://code.google.com/p/tweener/)
 * и jTweener (http://coderepos.org/share/wiki/jTweener)<br><br>
 * @author Sergey Chikuyonok (sc@design.ru)
 * @copyright Art.Lebedev Studio (http://www.artlebedev.ru)
 * @link http://code.google.com/p/jtweener/
 * @version 0.1
 */

/**
 * Класс для пакетной анимации кучи объектов и их свойств.
 * В большинстве случаев для создания анимации нужно всего лишь
 * вызвать метод <code>jTweener.addTween()</code>
 */
var jTweener = function(){
	var looping = false;
	var frameRate = 30;

	var userAgent = navigator.userAgent.toLowerCase();

	/** @type {Boolean} Говорит, что текущий браузер — Internet Explorer */
	var is_msie = /msie/.test( userAgent ) && !/opera/.test( userAgent );

	/**
	 * Хэш всех анимируемых в данный момент объектов, разбитые по нэймспэйсам.
	 * Ключом хэша является нэймспэйс, а значением — массив анимируемых объектов
	 */
	var objects = {};

	/** Действия для нэймспэйсов */
	var nsActions = {};

	/**
	 * Стандартные значения ацимации, который будут подставляться в каждый
	 * <code>addTween()</code>, если они не указаны
	 */
	var defaultOptions = {
		time: 1,
		transition: 'easeoutexpo',
		namespace: 'default',
		delay: 0,
		prefix: {},
		suffix: {},
		onStart: undefined,
		onStartParams: undefined,
		onUpdate: undefined,
		onUpdateParams: undefined,
		onComplete: undefined,
		onCompleteParams: undefined
	};

	/**
	 * Названия параметров, при анимации которых будет менятся цвет.
	 */
	var color_properties = ['backgroundColor', 'borderBottomColor',
			'borderLeftColor', 'borderRightColor', 'borderTopColor',
			'color', 'outlineColor', 'borderColor'];

	/**
	 * Регулярное выражение для разбора значения, до которого нужно анимировать.
	 * Используется для разбора значений типа '+=30', '-=20'
	 */
	var re_value = /^\s*([+\-])=\s*(\-?\d+)/;

	var inited = false;
	var easingFunctionsLowerCase = {};

	/**
	 * Первичная инициализация объекта, вызывается только один раз при создании
	 * первой анимации.
	 */
	function init(){
		for (var key in jTweener.easingFunctions) {
			easingFunctionsLowerCase[key.toLowerCase()] = jTweener.easingFunctions[key];
		}
		inited = true;
	};

	/**
	 * Вспомогательный метод для callback-функций
	 * @param {Function} func Функция, котрую нужно вызвать
	 * @param {Array} [params] Агрументы функции
	 */
	function callback(func, params){
		if (typeof func == 'function') {
            if (params) {
                func.apply(window, params);
            } else {
                func();
            }
        }
	}

	/**
	 * Возвращает значение CSS-свойства <b>name</b> элемента <b>elem</b>
	 * @author John Resig (http://ejohn.org)
	 * @param {Element} elem Элемент, у которого нужно получить значение CSS-свойства
	 * @param {String} name Название CSS-свойства
	 * @return {String}
	 */
	function getStyle( elem, name ) {
		// If the property exists in style[], then it's been set
		// recently (and is current)
		if (elem.style[name]) {
			return elem.style[name];
		}
		//Otherwise, try to use IE's method
		else if (is_msie) {
			var cs = elem.currentStyle;
			if (name == 'opacity') {
				// если хотим полцчить opacity — наверняка хотим анимировать это свойство,
				// поэтому принудительно ставлю zoom = 1
				elem.style.zoom = 1;

				/**
				 * взял код с jQuery
				 * @author John Resig
				 */
				return cs.filter && cs.filter.indexOf("opacity=") >= 0 ?
					parseFloat( cs.filter.match(/opacity=([^)]*)/)[1] ) / 100 :
					1;
			} else {
				return elem.currentStyle[name];
			}
		}
		// Or the W3C's method, if it exists
		else if (document.defaultView && document.defaultView.getComputedStyle) {
			//It uses the traditional 'text-align' style of rule writing,
			//instead of textAlign
			name = name.replace(/([A-Z])/g,"-$1").toLowerCase();
			// Get the style object and get the value of the property (if it exists)
			var s = document.defaultView.getComputedStyle(elem, "");
			return s && s.getPropertyValue(name);
		}
		//Otherwise, we're using some other browser
		else {
			return null;
		}
	}

	/**
	 * Проверяет, является ли переданный объект html-нодом
	 * @return {Boolean}
	 */
	function isNode(obj){
		return obj.nodeType ? true : false;
	}

	/**
	 * Проверяет, является ли анимируемое свойство цветовым
	 * @param {String} prop Название свойства
	 * @return {Boolean}
	 */
	function isColorProperty(prop){
		for (var i = 0; i < color_properties.length; i++) {
			if (color_properties[i] == prop) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Проверяет, является ли переданный объект функцией
	 * @param {Object} obj
	 * @return {Boolean}
	 */
	function isFunction(obj){
		return (typeof obj == 'function');
	}

	/**
	 * Получить числовое значение свойства <b>key</b> объекта <b>obj</b>.
	 * Если объект является html-элементом, достается css-свойство.
	 * @param {Object, Element} obj
	 * @param {String} key
	 * @return {Number}
	 */
	function getNumericValue(obj, key){
		var val = 0;
		if (isNode(obj)) { //это html-элемент
			val = getStyle(obj, key);
		} else if (isFunction(obj[key])) { // используем свойство как getter
			val = obj[key]();
		} else { //это обычный объект
			val = obj[key];
		}

		return parseFloat(val) || 0;
	}

	/**
	 * Запускает функции нэймспэйса
	 * @param {String} ns
	 * @param {String} action_name
	 */
	function runNSAction(ns, action_name){
		if (nsActions[ns] && nsActions[ns][action_name]) {
			var actions = nsActions[ns][action_name];
			for (var i = 0; i < actions.length; i++) {
				callback(actions[i].func, actions[i].params);
			}
		}
	}

	/**
	 * Ставит новое значение анимируемому свойству объекта.
	 * Перед установкой проверяется, является ли это свойство цветовым,
	 * getter/setter или opacity. В зависимости от этого выбираются разные
	 * стратегии установки значения
	 * @param {Object} o Анимационный объект, возвращаемый <code>prepareOptions()</code>
	 * @param {String} property Анимируемое свойство
	 * @param {Number} val Новое значение свойства
	 */
	function setProperty(o, property, val){
		var new_value = (o.suffix[property]) ? val + o.suffix[property] : val;
		if (isFunction(o.target[property])) {
			// используем свойство как setter
			o.target[property](new_value);
		} else if(isColorProperty(property)) {
			// анимируем цвет
			var tP = o.targetPropeties[property];
			o.target[property] = jTweener.Utils.Color.blend(tP.start_color, tP.end_color, val) + '';
		} else {
			// обычное или CSS-свойство
			// FIXME:For IE. A Few times IE (style.width||style.height) = value is throw error...
			try {
				if (is_msie && property == 'opacity' && isNode(o.rawTarget)) {
					// устанавливаем opacity для IE
					o.target.filter = (o.target.filter || "").replace( /alpha\([^)]*\)/, "" ) +
					(parseFloat( val ).toString() == "NaN" ? "" : "alpha(opacity=" + val * 100 + ")");
				} else {
					o.target[property] = new_value;
				}
			} catch(e) {}
		}
	}


	/**
	 * Основной метод, который работает с анимациями. Все анимации отрабатываются
	 * и останавливаются именно в нем.
	 */
	function eventLoop() {
        var now = (new Date() - 0);

		// Количество namespaces в объектах. Если равно нулю после завершения
		// основного цикла, значит, нужно прекращать анимацию
		var ns_len = 0;

		for(var ns in objects){
			var ns_obj = objects[ns];
			ns_len++;

	        for (var i = 0; i < ns_obj.length; i++) {
	            var o = ns_obj[i];
	            var t = now - o.startTime;
	            var d = o.endTime - o.startTime;

	            if (t >= d) { //завершаем анимацию
	                for (var property in o.targetPropeties) {
	                    var tP = o.targetPropeties[property];
						setProperty(o, property, tP.b + tP.c);
	                }
	                ns_obj.splice(i, 1);

					callback(o.onUpdate, o.onUpdateParams);
					callback(o.onComplete, o.onCompleteParams);
	            } else {
	                for (var property in o.targetPropeties) {
	                    var tP = o.targetPropeties[property];
	                    setProperty(o, property, o.easing(t, tP.b, tP.c, d));
	                }

	                callback(o.onUpdate, o.onUpdateParams);
	            }
	        }

			runNSAction(ns, 'onUpdate');

			if(!ns_obj.length){
				ns_obj = null;
				delete objects[ns];
				ns_len--;
				runNSAction(ns, 'onComplete');
			}
		}

        if (ns_len > 0) {
			//еще есть объекты для анимирования
            setTimeout(eventLoop, 1000 / frameRate);
        } else {
			//объектов больше нет, останавливаемся
            looping = false;
        }
    }

	/**
	 * Останавливает все анимации для объекта <b>obj</b> путем удаления
	 * соответствующих объектов из хэша <code>objects</code>. Возвращает
	 * количество удаленных анимаций у объекта
	 * @param {Object} obj Объект, для которого нужно остановить все анимации
	 * @param {String} [ns] Удалять анимации только из этого нэймспэйса
	 * @return {Number}
	 */
	function stopAnimation(obj, ns){
		var how_many = 0;

		if(obj && isNode(obj)){
			obj = obj.style;
		}

		function rm(items){
			for (var i = items.length - 1; i >= 0; i--) {
				if (items[i].target == obj) {
					items.splice(i, 1);
					how_many++;
				}
			}
		};

		if (!obj && ns){ // удаляем все анимации из нэймспэйса
			objects[ns] = [];
		} else if(ns && objects[ns]){ // если указали нэймспэйс, удаляем анимации только из него
			rm(objects[ns]);
		} else {
			for(var n in objects){
				rm(objects[n]);
			}
		}

		return how_many;
	}

	/**
	 * Создание копии объекта
	 * @param {Object} obj Объект, который нужно скопировать
	 * @return {Object}
	 */
	function copyObject(obj){
		var result = {};
		for(var a in obj) if (obj.hasOwnProperty(a)) {
			result[a] = obj[a];
		}

		return result;
	}

	/**
	 * Преобразует переданные пользователем опции в вид, пригодный для анимации
	 * @param {Object} obj Объект, для которого нужно подготовить опции
	 * @param {Object} options Опции, пришедшие от пользователя
	 * @return {Object}
	 * TODO : refactor
	 */
	function prepareOptions(obj, options){
		// создаю копию объекта, так как эти опции могут использоваться
		// для нескольких объектов, а мне нужно модифицировать объект
		options = copyObject(options);

		var is_node = isNode(obj);
        var o = {};
        o.rawTarget = obj;
        o.target = (is_node) ? obj.style : obj;
        o.targetPropeties = {};

        // сначала пройдусь по системным свойствам и удалю их
		for (var key in defaultOptions) {
            if (options[key]) {
                o[key] = options[key];
                delete options[key];
            } else {
                o[key] = defaultOptions[key];
            }
        }

        if (isFunction(o.transition)) {
            o.easing = o.transition;
        } else {
            o.easing = easingFunctionsLowerCase[o.transition.toLowerCase()];
        }

        /** @type {Array} */
		var m;
		// прохожусь по всем свойствам, которые нужно анимировать
        for (var key in options) {
			// TODO: удалить суффиксы и префиксы из параметров, данные брать из значения
            if (!o.prefix[key]) o.prefix[key] = '';
            if (!o.suffix[key]) o.suffix[key] = (is_node && key != 'opacity') ? 'px' :'';

            var option_value = options[key];

            // если анимируем html-элемент, нужно преобразовать название css-свойства:
            // 'background-color' => 'backgroundColor'
            if (is_node) {
            	key = key.replace(/\-(\w)/g, function(/* String */ str, /* String */ p){
            		return p.toUpperCase();
            	});
            }

            if (isColorProperty(key)) {
            	// хотим анимировать цвет
            	o.targetPropeties[key] = {
	                b: 0, //base — начальное значение
	                c: 1, //change — изменение значения
	                start_color: jTweener.Utils.getRGB( getStyle(obj, key) ),
	                end_color: jTweener.Utils.getRGB(option_value)
	            };
            } else {
            	var sB = getNumericValue(obj, key);
            	var end_value = option_value;

	            if ((m = re_value.exec(end_value))) {
	            	// не хочу запускать лишний раз компилятор через eval(), поэтому
	            	// использую switch
					switch (m[1]) {
						case '+':
							end_value = sB + parseFloat(m[2]);
							break;
						case '-':
							end_value = sB - parseFloat(m[2]);
							break;
					}
	            } else {
	            	end_value = parseFloat(end_value);
	            }

	            o.targetPropeties[key] = {
	                b: sB, //base — начальное значение
	                c: end_value - sB //change — изменение значения
	            };
            }
        }

		return o;
	}

	/**
	 * Создание новой анимации. Параметры такие же, как
	 * и в <code>jTweener.addTween</code> с одним исключением: <b>obj</b> —
	 * именно тот объект, который нужно анимировать (а не массив объектов)
	 * @param {Object} obj Объект, свойства которого нужно анимировать.
	 * Если нужно анимировать css-свойства элемента, передать <code>obj.style</code>
	 * @param {Object} options Параметры анимации
	 */
	function createTween(obj, options){
		var delay = options.delay || 0;

        setTimeout(function() {
			var o = prepareOptions(obj, options);
            o.startTime = (new Date() - 0);
            o.endTime = o.time * 1000 + o.startTime;

			callback(o.onStart, o.onStartParams);

			if(!objects[o.namespace]){
				objects[o.namespace] = [];
			}

            objects[o.namespace].push(o);
            if (!looping) {
                looping = true;
                eventLoop();
            }
        }, delay * 1000);
	}

	return {
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
		 * @alias jTweener.addTween
		 * @type {Function}
		 * @param {Object, Array} obj Объект или массив объектов, свойства	 * которых нужно анимировать.	 * @param {Object} options Параметры анимации	 */	
		 
		 addTween: function(obj, options) {
			 if (!inited){
			 	init();
			 }
		
			if(!(obj instanceof Array) && !obj.jquery){
				obj = [obj];		
			}
			for(var i = 0; i < obj.length; i++){
					createTween(obj[i], options);
				}
		},
		
		addNSAction: function(actions, ns){
			ns = ns || defaultOptions.namespace;
			if (!nsActions[ns]) {
				nsActions[ns] = {};
			}
			var nsa = nsActions[ns];
			for(var a in actions){
				if (a.indexOf('Params') == -1) {
					if (!nsa[a]) {
						nsa[a] = [];
					}
					nsa[a].push({func: actions[a], params: actions[a+'Params']});
				}
			}
		},
	
		removeNSActions: function(){
			switch(arguments.length){
				case 0: 
					nsActions = {};
					break;
				default:
					var ns = arguments[0];
					var actions = [].splice.call(arguments, 1);	
					if(nsActions[ns]){
						if(actions && actions.length){ 
							var nsa = nsActions[ns];
							for(var i = 0; i < actions.length; i++){
								delete nsa[actions[i]];
							}
						} else { 
							delete nsActions[ns]
						}
					}
				}
			},
	/**	 * Удаляет анимации<br><br>	 * <b>Варианты использования:</b><br><br>	 * <code>removeTween()</code> — удаляет абсолютно все анимации<br>	 * <code>removeTween(namespace : String)</code> — удаляет все анимации	 * у нэймспэйса 'namespace'<br>	 * <code>removeTween(namespace : String, obj : Object, Array)</code> —	 * удаляет анимации у объекта (или массива объектов) 'obj' из нэймспэйса	 * 'namespace'<br>	 * <code>removeTween(obj : Object, Array)</code> — удаляет все анимации	 * у объекта (или массива объектов) 'obj'	 * @alias jTweener.removeTween	 */	
	
	
	removeTween: function(){
		switch(arguments.length){
			case 0:
				objects = {};
				break;
			default:
				var ns, items;
				if(arguments.length == 1){
					if (typeof arguments[0] == 'string') {
						ns = arguments[0];
					} else {
						items = arguments[0];
					}
				} else {
					ns = arguments[0];
					items = arguments[1];
				}
				if (items && (items instanceof Array || items.jquery)) {
					for (var i = 0; i < items.length; i++){
						stopAnimation(items[i], ns);
					}
				} else {
					stopAnimation(items, ns);
				}
		}
	}};
	
	
}();

/**
 * Утилиты для анимаций
 */
jTweener.Utils = {
    bezier2: function(t, p0, p1, p2) {
         return (1-t) * (1-t) * p0 + 2 * t * (1-t) * p1 + t * t * p2;
    },

    bezier3: function(t, p0, p1, p2, p3) {
         return Math.pow(1-t, 3) * p0 + 3 * t * Math.pow(1-t, 2) * p1 + 3 * t * t * (1-t) * p2 + t * t * t * p3;
    },

    // Color Conversion functions from highlightFade// By Blair Mitchelmore// http://jquery.offput.ca/highlightFade/
// Parse strings looking for color tuples [255,255,255]
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
     */getRGB: function(color) {	var result;
		if (color && color.constructor == jTweener.Utils.Color )		return color;
		if (result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color))		return new jTweener.Utils.Color(			parseInt(result[1], 10),			parseInt(result[2], 10),			parseInt(result[3], 10)		);
		if (result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(color))		return new jTweener.Utils.Color(			parseFloat(result[1], 10) * 2.55,			parseFloat(result[2], 10) * 2.55,			parseFloat(result[3], 10) * 2.55		);
		if (result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color))		return new jTweener.Utils.Color(			parseInt(result[1], 16),			parseInt(result[2], 16),			parseInt(result[3], 16)		);
		if (result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color))		return new jTweener.Utils.Color(			parseInt(result[1] + result[1], 16),			parseInt(result[2] + result[2], 16),			parseInt(result[3] + result[3], 16)		);
		return new jTweener.Utils.Color(0, 0, 0);}
};

/**
 * @class
 * Вспомогательный класс для работы с цветом
 * @param {Number} r Красная компонента (0—255)
 * @param {Number} g Зеленая компонента (0—255)
 * @param {Number} b Синяя компонента (0—255)
 */
jTweener.Utils.Color = function(r, g, b){this.r = Math.max(Math.min(Math.round(r), 255), 0);this.g = Math.max(Math.min(Math.round(g), 255), 0);this.b = Math.max(Math.min(Math.round(b), 255), 0);
};

/**
 * Смешивает два цвета в указанной пропорции.
 * @param {jTweener.Utils.Color} color1 Первичный цвет
 * @param {jTweener.Utils.Color} color2 Вторичный цвет
 * @param {Number} ratio Пропорция, в которой нужно смешать цвет (0 — чистый первичный цвет, 1 — чистый вторичный цвет).
 * @return {jTweener.Utils.Color}
 */
jTweener.Utils.Color.blend = function(color1, color2, ratio){ratio = ratio || 0;return new jTweener.Utils.Color(	color1.r + (color2.r - color1.r) * ratio,	color1.g + (color2.g - color1.g) * ratio,	color1.b + (color2.b - color1.b) * ratio);
};

jTweener.Utils.Color.prototype = {/** Красная компонента цвета */r: 0,
/** Зеленая компонента цвета */g: 0,
/** Синяя компонента цвета */b: 0,/** * Возвращает цвет в формате RGB, например, 'rgb(129,250,0)' * @return {String} */toString: function(){	return 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';}
}

/*
 * jTweener.easingFunctions is
 * Tweener's easing functions (Penner's Easing Equations) porting to JavaScript.
 * http://code.google.com/p/tweener/
 */

jTweener.easingFunctions = {
    easeNone: function(t, b, c, d) {
        return c*t/d + b;
    },
    easeInQuad: function(t, b, c, d) {
        return c*(t/=d)*t + b;
    },
    easeOutQuad: function(t, b, c, d) {
        return -c *(t/=d)*(t-2) + b;
    },
    easeInOutQuad: function(t, b, c, d) {
        if((t/=d/2) < 1) return c/2*t*t + b;
        return -c/2 *((--t)*(t-2) - 1) + b;
    },
    easeInCubic: function(t, b, c, d) {
        return c*(t/=d)*t*t + b;
    },
    easeOutCubic: function(t, b, c, d) {
        return c*((t=t/d-1)*t*t + 1) + b;
    },
    easeInOutCubic: function(t, b, c, d) {
        if((t/=d/2) < 1) return c/2*t*t*t + b;
        return c/2*((t-=2)*t*t + 2) + b;
    },
    easeOutInCubic: function(t, b, c, d) {
        if(t < d/2) return jTweener.easingFunctions.easeOutCubic(t*2, b, c/2, d);
        return jTweener.easingFunctions.easeInCubic((t*2)-d, b+c/2, c/2, d);
    },
    easeInQuart: function(t, b, c, d) {
        return c*(t/=d)*t*t*t + b;
    },
    easeOutQuart: function(t, b, c, d) {
        return -c *((t=t/d-1)*t*t*t - 1) + b;
    },
    easeInOutQuart: function(t, b, c, d) {
        if((t/=d/2) < 1) return c/2*t*t*t*t + b;
        return -c/2 *((t-=2)*t*t*t - 2) + b;
    },
    easeOutInQuart: function(t, b, c, d) {
        if(t < d/2) return jTweener.easingFunctions.easeOutQuart(t*2, b, c/2, d);
        return jTweener.easingFunctions.easeInQuart((t*2)-d, b+c/2, c/2, d);
    },
    easeInQuint: function(t, b, c, d) {
        return c*(t/=d)*t*t*t*t + b;
    },
    easeOutQuint: function(t, b, c, d) {
        return c*((t=t/d-1)*t*t*t*t + 1) + b;
    },
    easeInOutQuint: function(t, b, c, d) {
        if((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
        return c/2*((t-=2)*t*t*t*t + 2) + b;
    },
    easeOutInQuint: function(t, b, c, d) {
        if(t < d/2) return jTweener.easingFunctions.easeOutQuint(t*2, b, c/2, d);
        return jTweener.easingFunctions.easeInQuint((t*2)-d, b+c/2, c/2, d);
    },
    easeInSine: function(t, b, c, d) {
        return -c * Math.cos(t/d *(Math.PI/2)) + c + b;
    },
    easeOutSine: function(t, b, c, d) {
        return c * Math.sin(t/d *(Math.PI/2)) + b;
    },
    easeInOutSine: function(t, b, c, d) {
        return -c/2 *(Math.cos(Math.PI*t/d) - 1) + b;
    },
    easeOutInSine: function(t, b, c, d) {
        if(t < d/2) return jTweener.easingFunctions.easeOutSine(t*2, b, c/2, d);
        return jTweener.easingFunctions.easeInSine((t*2)-d, b+c/2, c/2, d);
    },
    easeInExpo: function(t, b, c, d) {
        return(t==0) ? b : c * Math.pow(2, 10 *(t/d - 1)) + b - c * 0.001;
    },
    easeOutExpo: function(t, b, c, d) {
        return(t==d) ? b+c : c * 1.001 *(-Math.pow(2, -10 * t/d) + 1) + b;
    },
    easeInOutExpo: function(t, b, c, d) {
        if(t==0) return b;
        if(t==d) return b+c;
        if((t/=d/2) < 1) return c/2 * Math.pow(2, 10 *(t - 1)) + b - c * 0.0005;
        return c/2 * 1.0005 *(-Math.pow(2, -10 * --t) + 2) + b;
    },
    easeOutInExpo: function(t, b, c, d) {
        if(t < d/2) return jTweener.easingFunctions.easeOutExpo(t*2, b, c/2, d);
        return jTweener.easingFunctions.easeInExpo((t*2)-d, b+c/2, c/2, d);
    },
    easeInCirc: function(t, b, c, d) {
        return -c *(Math.sqrt(1 -(t/=d)*t) - 1) + b;
    },
    easeOutCirc: function(t, b, c, d) {
        return c * Math.sqrt(1 -(t=t/d-1)*t) + b;
    },
    easeInOutCirc: function(t, b, c, d) {
        if((t/=d/2) < 1) return -c/2 *(Math.sqrt(1 - t*t) - 1) + b;
        return c/2 *(Math.sqrt(1 -(t-=2)*t) + 1) + b;
    },
    easeOutInCirc: function(t, b, c, d) {
        if(t < d/2) return jTweener.easingFunctions.easeOutCirc(t*2, b, c/2, d);
        return jTweener.easingFunctions.easeInCirc((t*2)-d, b+c/2, c/2, d);
    },
    easeInElastic: function(t, b, c, d, a, p) {
        var s;
        if(t==0) return b;  if((t/=d)==1) return b+c;  if(!p) p=d*.3;
        if(!a || a < Math.abs(c)) { a=c; s=p/4; } else s = p/(2*Math.PI) * Math.asin(c/a);
        return -(a*Math.pow(2,10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p )) + b;
    },
    easeOutElastic: function(t, b, c, d, a, p) {
        var s;
        if(t==0) return b;  if((t/=d)==1) return b+c;  if(!p) p=d*.3;
        if(!a || a < Math.abs(c)) { a=c; s=p/4; } else s = p/(2*Math.PI) * Math.asin(c/a);
        return(a*Math.pow(2,-10*t) * Math.sin((t*d-s)*(2*Math.PI)/p ) + c + b);
    },
    easeInOutElastic: function(t, b, c, d, a, p) {
        var s;
        if(t==0) return b;  if((t/=d/2)==2) return b+c;  if(!p) p=d*(.3*1.5);
        if(!a || a < Math.abs(c)) { a=c; s=p/4; }       else s = p/(2*Math.PI) * Math.asin(c/a);
        if(t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p )) + b;
        return a*Math.pow(2,-10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p )*.5 + c + b;
    },
    easeOutInElastic: function(t, b, c, d, a, p) {
        if(t < d/2) return jTweener.easingFunctions.easeOutElastic(t*2, b, c/2, d, a, p);
        return jTweener.easingFunctions.easeInElastic((t*2)-d, b+c/2, c/2, d, a, p);
    },
    easeInBack: function(t, b, c, d, s) {
        if(s == undefined) s = 1.70158;
        return c*(t/=d)*t*((s+1)*t - s) + b;
    },
    easeOutBack: function(t, b, c, d, s) {
        if(s == undefined) s = 1.70158;
        return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
    },
    easeInOutBack: function(t, b, c, d, s) {
        if(s == undefined) s = 1.70158;
        if((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
        return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
    },
    easeOutInBack: function(t, b, c, d, s) {
        if(t < d/2) return jTweener.easingFunctions.easeOutBack(t*2, b, c/2, d, s);
        return jTweener.easingFunctions.easeInBack((t*2)-d, b+c/2, c/2, d, s);
    },
    easeInBounce: function(t, b, c, d) {
        return c - jTweener.easingFunctions.easeOutBounce(d-t, 0, c, d) + b;
    },
    easeOutBounce: function(t, b, c, d) {
        if((t/=d) <(1/2.75)) {
            return c*(7.5625*t*t) + b;
        } else if(t <(2/2.75)) {
            return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
        } else if(t <(2.5/2.75)) {
            return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
        } else {
            return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
        }
    },
    easeInOutBounce: function(t, b, c, d) {
        if(t < d/2) return jTweener.easingFunctions.easeInBounce(t*2, 0, c, d) * .5 + b;
        else return jTweener.easingFunctions.easeOutBounce(t*2-d, 0, c, d) * .5 + c*.5 + b;
    },
    easeOutInBounce: function(t, b, c, d) {
        if(t < d/2) return jTweener.easingFunctions.easeOutBounce(t*2, b, c/2, d);
        return jTweener.easingFunctions.easeInBounce((t*2)-d, b+c/2, c/2, d);
    }
};
jTweener.easingFunctions.linear = jTweener.easingFunctions.easeNone;


