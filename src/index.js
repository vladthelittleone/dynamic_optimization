'use strict';

/**
 * @since 03.06.16
 * @author Skurishin Vladislav
 */
// load math.js
var lodash = require('lodash');
var config = require('./config.json');

var output = require('./module/output');
var util = require('util');

var ERROR1 = config['error1'];
var ERROR2 = config['error2'];
var E = config['E'];
var PROBABILITIES = config['P(E)'];

var states = new Map();
var optimums = new Map();

generateImages(states, convert(E), E[0].length);

var i = 1;

// Окончательная табличка (массив) в отсортированном состоянии в соответствии
// с мощностями множеств состояний.
var statesArray = [];

states.forEach(function (e) {

	statesArray.push(e);

});

console.log(output.beginDocument());

// Сортируем в соответствии с мощностью множеств состояний.
var sort = sortByStatesLength(statesArray);

var indexOfR = E[0].length + 1;
sort.forEach(function (e) {

	e.k = indexOfR;

	indexOfR++;

});

generateTableOfOptimums(sort);

// Начинаем отрисовку таблицы с результатами.
console.log(output.drawHeaderOfResultTable());

// Начальный индекс R для таблички.
sort.forEach(function (e, index) {

	var eStr = '';
	var cStr = '';

	var listIndexE = [];
	e.states.forEach(function (e) {
		listIndexE.push(e.num);
	});

	var listIndexOfCheck = [];
	e.checks.forEach(function (e) {
		listIndexOfCheck.push(e + 1);
	});

	console.log(output.insertIntoResultTable(index,
											 e.k,
											 listIndexE,
											 listIndexOfCheck,
											 e.optimum + 1,
											 e.D));

	indexOfR++;
});

console.log(output.drawEndOfResultTable());
console.log(output.endDocument());

function sortByStatesLength(resultArray) {

	// Сортируем в соответствии с мощностью множеств состояний.
	return lodash.sortBy(resultArray, function (R) {

		return R.states.length;

	});

}

function generateImages(map, R, checkSize) {

	var images = [];

	if (R.states.length < 2) {

		return;

	}

	map.set(R.states + R.checks, R);

	R.checks.forEach(function (c) {

		var img = newImages(R, c, checkSize);

		images.push(img.Rn);
		images.push(img.Rp);

	});

	images.forEach(function (Ri) {

		generateImages(map, Ri, checkSize);

	});
}

function convert(E) {

	var checksCount = E[0].length;
	var result = R();

	E.forEach(function (Ei, n) {

		result.states.push({
							   num:    n,
							   errors: Ei
						   });

	});

	result.checks = Array.from(new Array(checksCount).keys());

	return result;
}

function generatePermissibleChecks(R, checksCount) {

	for (var i = 0; i < checksCount; i++) {

		var equals = true;
		var tmpValue = null;

		R.states.forEach(function (E) {

			if (!tmpValue) {

				tmpValue = E.errors[i];

				return;

			}

			if (E.errors[i] !== tmpValue) {

				equals = false;

			}

		});

		if (!equals) {

			R.checks.push(i);

		}

	}

}

function generateNewImage(Rk, i) {

	var Rp = R();
	var Rn = R();

	Rk.states.forEach(function (Ei) {

		if (Ei.errors[i] === -1) {

			Rn.states.push(Ei);
			Rn.k = Ei.num;

		}

		if (Ei.errors[i] === 1) {

			Rp.states.push(Ei);
			Rp.k = Ei.num;

		}

	});

	return {Rp: Rp, Rn: Rn};
}

function newImages(Rk, i, checksSize) {

	var newImages = generateNewImage(Rk, i);

	var Rp = newImages.Rp;
	var Rn = newImages.Rn;

	generatePermissibleChecks(Rp, checksSize);
	generatePermissibleChecks(Rn, checksSize);

	return {

		Rn: Rn,
		Rp: Rp

	}
}

function R() {

	var t = {};

	t.checks = [];
	t.states = [];

	return t;

}

function optionHash(states) {

	var hash = '';

	states.forEach(function (e) {

		hash = hash + e.num;

	});

	return hash;
}

function propagate(e, optimumsMap, optimumsChain) {

	var optimum = 0;
	var hash = optionHash(e.states);

	if (e.states.length < 2) {

		e.states.forEach(function (el) {

			optimumsMap.set(el.num, optimumsChain);

		});

		return;

	}

	if (optimums.has(hash)) {

		optimum = optimums.get(hash);
		optimumsChain.add(optimum)

	}

	// изображения (стр 15 пункт 1)
	var images = newImages(e, optimum);

	var Rn = images.Rn;
	var Rp = images.Rp;

	propagate(Rn, optimumsMap, new Set(optimumsChain));
	propagate(Rp, optimumsMap, new Set(optimumsChain));

}

function getOptimumsForChain(e, c) {

	var optimumsMap = new Map();
	var optimumsChain = new Set();

	// изображения (стр 15 пункт 1)
	var images = newImages(e, c);

	var Rn = images.Rn;
	var Rp = images.Rp;

	optimumsChain.add(c);

	propagate(Rn, optimumsMap, new Set(optimumsChain));
	propagate(Rp, optimumsMap, new Set(optimumsChain));

	console.log(output.efficientOfCheck(c + 1,
										false,
										e.k,
										"",
										Rp.states.map(function(o){return o.num;})));
	console.log(output.efficientOfCheck(c + 1,
										true,
										e.k,
										"",
										Rn.states.map(function(o){return o.num;})));

	return optimumsMap;

}

function conditionalProbabilities(states, optimums, currentCheck, k) {

	var probabilitiesMap = new Map();

	states.forEach(function (state1) {

		// Веротяности наступления i-го события при
		// диагностировании i-го состояния
		var validProbabilities = 0;

		// Веротяности наступления i-го события при
		// диагностировании любого состояния
		var allProbabilities = [];

		var argumetsForValidProbabilty = {};
		var argumentsForAllProbabilities = [];

		states.forEach(function (state2) {

			// Вычисляем гамму (см формулу 28)
			// state1.num = i
			// state2.num = f
			// c = j
			// state1.optimums = множество ik проверкок
			var mGamma = multiplyGamma(state1.num, state2.num, optimums.get(state1.num), currentCheck, k);

			// Если равны то это верная диагностика
			// ее мы будем делить на знаментаель (см 15 стр. пункт 3)
			if (state1.num === state2.num) {

				// Все условные вероятности для данного i
				// P(i) * P(R^i / Ri)

				validProbabilities = PROBABILITIES[state2.num] * mGamma;

				argumetsForValidProbabilty = {
					first:  PROBABILITIES[state2.num],
					second: mGamma
				};

			}

			// Все условные вероятности для данного i
			// P(f) * P(R^i / Rf)

			allProbabilities.push(PROBABILITIES[state2.num] * mGamma);

			argumentsForAllProbabilities.push({
												  first:    PROBABILITIES[state2.num],
												  second:   mGamma,
												  stateNum: state2.num
											  });

		});

		// Записываем вероятность верного диагностирования для state1.num состояния.
		// (см. 15 стр. пункт 3 и формула 27)

		//	function probability(numerator, denominators, i, k, j, N, result)

		probabilitiesMap.set(state1.num, clarifyProbability(validProbabilities, lodash.sum(allProbabilities)));

		console.log(output.validProbability(argumetsForValidProbabilty,
											argumentsForAllProbabilities,
											state1.num,
											k,
											state1.num,
											probabilitiesMap.get(state1.num)));

	});

	return probabilitiesMap;

}

function probabilitiesSum(states) {

	var sum = 0;

	states.forEach(function (state) {

		sum = sum + PROBABILITIES[state.num];

	});

	return sum;
}

function probabilitiesWithStates(states) {

	var arr = [];

	states.forEach(function (state) {

		var obj = {
			stateNum:    state.num,
			probability: PROBABILITIES[state.num]
		};

		arr.push(obj);
	});

	return arr;
}

function optimum(e) {

	// Все доступные проверки для текущего
	// Ri
	var checks = e.checks;
	var efficiencyOfChecks = [];

	checks.forEach(function (c) {

		// Пробуем достать уже готовые оптимумы для данных
		// изображений (см. стр. 15 пункт 2)
		var optimums = getOptimumsForChain(e, c);

		var probabilitiesMap = conditionalProbabilities(e.states, optimums, c, e.k);

		// 4 и 5 ПУНКТЫ ВЫЧИСЛЕНИЙ
		var D = 0;

		var sum = probabilitiesSum(e.states);

		var probabilitiesWithStatesObj = probabilitiesWithStates(e.states);

		var bayesValues = [];

		e.states.forEach(function (state) {

			var stateProbability = PROBABILITIES[state.num];
			var clarify = clarifyProbability(stateProbability, sum);

			console.log(output.clarifyProbability(stateProbability,
												  probabilitiesWithStatesObj,
												  e.k,
												  state.num,
												  clarify));

			var bayes = probabilitiesMap.get(state.num);

			bayesValues.push({
								 state:  state.num,
								 first:  clarify,
								 second: bayes
							 });

			D = D + (clarify * bayes);

			// 	var stateProbability = PROBABILITIES[state.num];
			// 	var clarify = clarifyProbability(stateProbability, sum);
			// 	var bayes = probabilitiesMap.get(state.num);
			//
			// 	D = D + (clarify * bayes);
		});

		console.log(output.D(e.k,
							 c + 1,
							 D,
							 bayesValues.map(function (a) {
								 return {first: a.first, second: a.second};
							 }),
							 bayesValues.map(function (a) {
								 return a.state;
							 })));


		efficiencyOfChecks.push({
									check: c,
									D:     D
								});

	});


	// Находим наиличшую эффективность.
	var bestEfficiency = lodash.maxBy(efficiencyOfChecks, function (o) {
		return o.D;
	});

	// ЭТО ЕСТЬ ОПТИМУМ
	optimums.set(optionHash(e.states), bestEfficiency.check);

	e.optimum = bestEfficiency.check;
	e.D = bestEfficiency.D;

}

/**
 * Генерация оптимумов и их D.
 *
 * @param array
 */
function generateTableOfOptimums(array) {

	// Проходим по всем данным.
	array.forEach(function (e) {

		optimum(e);

	});

}

/**
 * Формула №28 по методическим указаниям.
 */
function multiplyGamma(i, f, optimums, currentCheck, k) {

	var multiply = 1;

	var str = "";

	str = str.concat(output.drawBeginOfGamma(k, i, currentCheck, f));

	var j = 0;

	var resultsOfGamma = [];
	// начинаем разбор нижележащих оптимальных состояний.
	optimums.forEach(function (optimum) {

		// Условие для вывода знака умножения.
		if (j > 0) {
			str = str.concat("*");
		}

		var resultOfGamma = gamma(i, optimum, f);
		multiply = multiply * resultOfGamma;

		resultsOfGamma.push(resultOfGamma);

		// Отрисовываем множители выражения.
		str = str.concat(output.gamma(i, f, optimum));

		j++;
	});
	
	str = str.concat(output.multiplyOfArgumets(resultsOfGamma));
	
	str = str.concat(util.format("=%d\\]", multiply.toFixed(output.PRECISION)));

	console.log(str);

	return multiply;

}

/**
 * Формула №25 по методическим указаниям.
 */
function clarifyProbability(probabilityOfCurrentState,
							probabilitiesForClarify) {

	return probabilityOfCurrentState / probabilitiesForClarify;

}


/**
 * Формула №29 по методическим указаниям.
 */
function gamma(i, j, f) {

	var Eij = E[i][j];
	var Efj = E[f][j];

	// Если eij == efj
	if (lodash.isEqual(Eij, Efj)) {

		// если Если eij == efj == 1 -> (1 - alpha(j)) (alpha - ошибка первого рода)
		// если Если eij == efj == -1 -> (1 - betta(j)) (betta - ошибка второго рода)
		return lodash.isEqual(Eij, 1) ? 1 - ERROR1[j] :
			   1 - ERROR2[j];

	}

	// если eij == -1 И efj == 1 -> alpha(j)
	// если eij == 1 И efj == -1 -> betta(j)
	return lodash.isEqual(Eij, -1) && lodash.isEqual(Efj, 1) ? ERROR1[j] :
		   ERROR2[j];
}
