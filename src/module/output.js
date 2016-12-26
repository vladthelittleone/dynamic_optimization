/**
 * Created by greezlock on 24.12.2016.
 */

module.exports = output();

var util = require('util');
var lodash = require('lodash');

var config = require('./../config.json');

var E = config['E'];

function output() {

	var that = {};

	var PRECISION = 5;

	that.drawHeaderOfResultTable = drawHeaderOfResultTable;
	that.insertIntoResultTable = insertIntoResultTable;
	that.drawEndOfResultTable = drawEndOfResultTable;
	that.drawBeginOfGamma = drawBeginOfGamma;
	that.gamma = gamma;
	that.multiplyOfArgumets = multiplyOfArgumets;
	that.validProbability = validProbability;
	that.clarifyProbability = clarifyProbability;
	that.D = D;
	that.efficientOfCheck = efficientOfCheck;

	that.PRECISION = PRECISION;

	that.beginDocument = beginDocument;
	that.endDocument = endDocument;

	return that;

	function beginDocument() {

		var str = "\\documentclass{article} \\usepackage[english]{babel} \\usepackage{amssymb} " +
				  "\\usepackage{amsmath} \\usepackage{txfonts} \\usepackage{mathdots} " +
				  "\\usepackage[classicReIm]{kpfonts} \\usepackage[pdftex]{graphicx} " +
				  "\\begin{document} ";

		return str;
	}

	function drawHeaderOfResultTable() {

		var str = "\\begin{tabular}{|p{0.3in}|p{1.5in}|p{1.5in}|p{0.6in}|p{0.6in}|} \\hline " +
				  "№ пп & Информационные состояния \\textit{R${}_{k}$} & Множества $\\Pi$\\textit{${}_{k }$}" +
				  "допустимых проверок в состояниях \\textit{R${}_{k}$} & \\multicolumn{2}{|p{1.2in}|}" +
				  "{Результаты расчетов } \\\\ \\hline &  &  & Оптимальная проверка $\\piup$\\textit{${}_{j}$} " +
				  "& \\textit{D}(\\textit{R${}_{k}$}) \\\\" +
				  "\\hline 1 & 2 & 3 & 4 & 5 \\\\";

		return str;
	}

	function insertIntoResultTable(currentRowNumber,
								   indexR,
								   listIndexOfE,
								   listIndexCheck,
								   optimus,
								   D) {
		var str = util.format("\\hline %d & \\textit{R}${}_{%d}$=$\\{$",
							  currentRowNumber,
							  indexR);

		str = str.concat(generateListOf(listIndexOfE));

		str = str.concat(util.format("$$\\}$ & $\\Pi$${}_{%d}$=$\\{$", indexR));

		listIndexCheck.forEach(function (value, index) {

			if (index != 0) {
				str = str.concat("$,");
			}

			str = str.concat(util.format("$\\piup$${}_{%d}", value));
		});

		str = str.concat("$$\\}$");

		str = str.concat(util.format("& $\\piup$${}_{%d}$ & %d \\\\", optimus, D.toFixed(PRECISION)));

		return str;
	}

	function generateListOf(listIndexOfE) {

		var str = "";

		listIndexOfE.forEach(function (value, index) {

			// Разделитель элементов в списке E
			if (index !== 0) {
				str = str.concat("$,");
			}

			str = str.concat(util.format("\\textbf{ E}${}_{%d}", value));
		});

		return str;
	}

	function drawEndOfResultTable() {

		return "\\hline \\end{tabular}";

	}

	function endDocument() {

		return "\\end{document}";

	}

	function efficientOfCheck(indexOfCheck,
							  negativeFlag,
							  indexOfCurrentR,
							  indexOfPreviousR,
							  listIndexOfE) {

		var p = negativeFlag === true ? -1 : 1;

		// \noindent $\pi _{5}^{1} $:\textit{R}${}_{17}$\textit{$\to$} \textit{R}${}_{6}$=$\{$\textbf{E}${}_{6}$$\}$,
		// \noindent $\pi _{4}^{1} $:\textit{R}${}_{6}$\textit{$	o$} \textit{R}${}_{0}$=$\{$\textbf{ E}${}_{0}$$}$
		var str = util.format("\\noindent $\\pi _{%d}^{%d} $:\\textit{R}${}_{%d}$\\textit{$\\to$} \\textit{R}${}_{%d}$=$\\{$",
							  indexOfCheck,
							  p,
							  indexOfCurrentR,
							  indexOfPreviousR);
		str = str.concat(generateListOf(listIndexOfE));

		str = str.concat("$$\\}$");

		return str;
	}

	// Начало формулы 28.
	function drawBeginOfGamma(k, i, optimus, f) {

		return util.format("\\[{\\rm P}_{%d} \\left(R_{%d}^{*} (\\pi _{%d} )/R_{%d} \\right)=",
						   k,
						   i,
						   optimus,
						   f);

	}

	function gamma(i, j, f) {

		var Eij = E[i][j];
		var Efj = E[f][j];

		j = j + 1;

		// Если eij == efj
		if (lodash.isEqual(Eij, Efj)) {

			// если Если eij == efj == 1 -> (1 - alpha(j)) (alpha - ошибка первого рода)
			// если Если eij == efj == -1 -> (1 - betta(j)) (betta - ошибка второго рода)
			return lodash.isEqual(Eij, 1) ? util.format("(1-\\alpha _{%d})", j + 1) :
				   util.format("(1-\\beta _{%d})", j + 1);

		}

		// если eij == -1 И efj == 1 -> alpha(j)
		// если eij == 1 И efj == -1 -> betta(j)
		return lodash.isEqual(Eij, -1) && lodash.isEqual(Efj, 1) ? util.format("(\\alpha _{%d})", j + 1) :
			   util.format("(\\beta _{%d})", j + 1);

	}

	function multiplyOfArgumets(arguments) {

		var str = "=";

		arguments.forEach(function (value, index) {

			if (index > 0) {

				str = str.concat("*");
			}

			str = str.concat(value.toFixed(PRECISION));
		});

		return str;
	}

	// Олег
	function createDenominator(denominators) {

		var denominatorTemplate = "DENOMINATORS_FIRST \\cdot DENOMINATORS_SECOND +";
		var denominatorResult = "";
		denominators.forEach(function (value) {
			denominatorResult += (denominatorTemplate.replace("DENOMINATORS_FIRST", value.first.toFixed(PRECISION))
				.replace("DENOMINATORS_SECOND", value.second.toFixed(PRECISION)));
		});
		// дропаем лишний +
		return denominatorResult.substring(0, denominatorResult.length - 1);
	}
	
	/**
	 * Олег
	 * ПУНКТ 3
	 * @param numerator числитель объект с двумя полями
	 * numerator.first и numerator.second
	 * @param i индекс для P
	 * @param k индекс для R
	 * @param j индекс R*
	 * @param N до какого значения должна выисляться сумму в знаменателе
	 * @returns {string}
	 */
	function validProbability(numerator, denominators, i, k, j, result) {

		var listOfIndex = denominators.map(function (a) {
			return a.stateNum;
		});

		var resultString = "\\[{\\rm P}_{INDEX_K} \\left(R_{INDEX_I} /R_{INDEX_I}^{*} (\\pi _{INDEX_J} )\\right)=" +
						   "\\frac{{\\rm P}(R_{INDEX_I} ){\\rm P}_{INDEX_K} \\left(R_{INDEX_I}^{*} (\\pi _{INDEX_J} )/R_{INDEX_I} \\right)}" +
						   "{SUM} =\\]" +
						   "\\[~=~\\frac{NUMERATOR_FIRST \\cdot NUMERATOR_SECOND}{DENOMINATOR} =RESULT.\\]";
		// ЗАМЕНА В ФОРМУЛУ В ОБЩЕМ ВИДЕ
		resultString = resultString.replace('RESULT', result.toFixed(PRECISION));
		resultString = resultString.replace('SUM', createSumP3(listOfIndex, k, j));
		resultString = resultString.replace(/INDEX_I/g, i);
		resultString = resultString.replace(/INDEX_K/g, k);
		resultString = resultString.replace(/INDEX_J/g, j);
		// ПОДСТАНОВКА В ЧИСЛИТЕЛЬ
		resultString = resultString.replace('NUMERATOR_FIRST', numerator.first.toFixed(PRECISION));
		resultString = resultString.replace('NUMERATOR_SECOND', numerator.second.toFixed(PRECISION));
		// ПОДСТАНОВКА В ЗНАМЕНАТЕЛЬ
		resultString = resultString.replace('DENOMINATOR', createDenominator(denominators));
		return resultString;
	}

	function createSumP3(listOfIndex, k, j) {
		var template = '{{\\rm P}(R_{INDEX_I} ){\\rm P}_{INDEX_K} \\left(R_{INDEX_I}^{*} (\\pi_{INDEX_J} )/R_{INDEX_I} \\right)}';
		template = template.replace(/INDEX_J/g, j);
		template = template.replace(/INDEX_K/g, k);
		var resultString = "";
		listOfIndex.forEach(function (value) {
			resultString += template.replace(/INDEX_I/g, value) + '+';
		});
		return resultString.substring(0, resultString.length - 1);
	}

	//console.log(createCalcExempleP3(numerator, [numerator, numerator, numerator, numerator], 2, 11, 1, 5, 1, [1,2,5]));


	function createSumP4(listOfIndex) {
		var template = 'P(E_j)';
		var resultString = '';
		listOfIndex.forEach(function (value) {
			resultString += template.replace('j', value) + '+';
		});
		return resultString.substring(0, resultString.length - 1);
	}

	/**
	 * Олег
	 * ПУНКТ 4
	 * @param numerator числитель
	 * @param denominators знаминатель, массив чисел
	 * @param k индекс для P
	 * @param i byltrc E
	 * @param N до какого значения должна идти сумма в знаминателе
	 * @param result результат вычислений
	 */
	function clarifyProbability(numerator, denominators, k, i, result) {

		var listOfIndex = denominators.map(function (a) {
			return a.stateNum;
		});
		
		denominators = denominators.map(function (a) {
			return a.probability;
		});

		var resultString = '\\[P_{INDEX_K}(E_{INDEX_I}) = \\frac{P(E_{INDEX_I})}{SUM} = \\frac{NUMERATOR}{DENOMINATOR} = RESULT\\]';

		resultString = resultString.replace('RESULT', result.toFixed(PRECISION));
		resultString = resultString.replace(/INDEX_I/g, i);
		resultString = resultString.replace(/INDEX_K/g, k);
		resultString = resultString.replace('NUMERATOR', numerator.toFixed(PRECISION));
		resultString = resultString.replace('SUM', createSumP4(listOfIndex));

		var denominatorResult = "";

		denominators.forEach(function (value) {
			denominatorResult += value.toFixed(PRECISION) + "+"
		});

		resultString = resultString.replace('DENOMINATOR', denominatorResult.substring(0, denominatorResult.length - 1));

		return resultString;
	}

	//console.log(createCalcExempleP4(10, [1, 2, 3, 4], 1, 2, 3, 4));

	function createSumP5(k, j, listOfIndex) {

		var template = 'P_{INDEX_K}(E_{INDEX_I})P_{INDEX_K}(R_{INDEX_I}/(R^*_{INDEX_I}(\\pi_{INDEX_J}))';

		template = template.replace(/INDEX_K/g, k);
		template = template.replace(/INDEX_J/g, j);

		var resultString = '';

		listOfIndex.forEach(function (value) {
			resultString += template.replace(/INDEX_I/g, value) + '+';
		});

		return resultString.substring(0, resultString.length - 1);
	}

	// ПУНКТ 5
	/**
	 * @return {string}
	 */
	function D(k, j, result, calcValues, listOfIndex) {

		var resultString = '\\[ D_{INDEX_K}(\\pi_{INDEX_J})~=~SUM~=~CALC~=~RESULT\\]';

		resultString = resultString.replace(/INDEX_K/g, k);
		resultString = resultString.replace(/INDEX_J/g, j);
		resultString = resultString.replace('RESULT', result.toFixed(PRECISION));
		resultString = resultString.replace('SUM', createSumP5(k, j, listOfIndex));

		var calcResult = '';

		calcValues.forEach(function (value) {
			calcResult += value.first.toFixed(PRECISION) + ' + ' + value.second.toFixed(PRECISION) + '+';
		});

		resultString = resultString.replace('CALC', calcResult.substring(0, calcResult.length - 1));

		return resultString;
	}
}
