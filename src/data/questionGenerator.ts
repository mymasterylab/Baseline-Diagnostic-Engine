/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question, Grade, CurriculumType, Difficulty, QuestionType, MatchingPair, HotspotArea } from '../types';
import { generateUSQuestion } from './usCurriculumQuestions';
import { generateUKQuestion } from './ukCurriculumQuestions';

// Helper to generate a deterministic-like random selection or random range
const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffleArray = <T>(arr: T[]): T[] => {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// Vocabulary collections for contextual questions
const NAMES = ['Alex', 'Bella', 'Charlie', 'Daniel', 'Emily', 'Ethan', 'Fiona', 'George', 'Hannah', 'Ian', 'Julia', 'Kevin', 'Liam', 'Maya', 'Noah', 'Olivia', 'Peter', 'Ryan', 'Sarah', 'Tyler', 'Zoe'];
const TOYS = ['toy cars', 'marbles', 'blocks', 'stickers', 'crayons', 'stamps', 'balloons', 'pencils', 'keychains', 'action figures'];
const FRUITS = ['apples', 'bananas', 'oranges', 'strawberries', 'blueberries', 'peaches', 'pears', 'plums', 'grapes', 'cherries'];
const CLASSROOM_ITEMS = ['notebooks', 'erasers', 'markers', 'paperclips', 'glue sticks', 'rulers', 'scissors', 'backpacks'];

// Helper to generate distinct wrong numeric options
const generateNumericOptions = (correct: number, count = 3, minDiff = 1): string[] => {
  const options = new Set<number>();
  options.add(correct);
  while (options.size <= count) {
    const offset = randomRange(minDiff, Math.max(minDiff * 5, Math.ceil(correct * 0.4))) * (Math.random() < 0.5 ? 1 : -1);
    const val = correct + offset;
    if (val !== correct && val >= 0) {
      options.add(val);
    }
  }
  return shuffleArray(Array.from(options)).map(String);
};

// Generates dynamic question pools based on Grade, Curriculum, Category
export function generateQuestionPool(grade: Grade, curriculum: CurriculumType): Question[] {
  const pool: Question[] = [];
  const categories = curriculum === 'US' 
    ? [
        'Number Sense & Place Value',
        'Operations & Algebraic Thinking',
        'Fractions, Decimals & Rational Numbers',
        grade >= 6 ? 'Ratios, Proportions & Functions' : 'Patterns & Pre-Algebra',
        'Measurement & Data',
        'Geometry & Spatial Reasoning',
        'Problem Solving & Mathematical Reasoning',
        'Mathematical Fluency'
      ]
    : [
        'Number Sense & Place Value',
        'Number Operations & Algebra',
        'Fractions, Decimals & Percentages',
        'Measurement & Applied Mathematics',
        'Geometry & Spatial Reasoning',
        'Statistics & Probability',
        'Problem Solving & Proof',
        'Mathematical Fluency'
      ];

  // For every category, we generate exactly 15 questions
  // 3 Easy (indices 0, 1, 2)
  // 9 Medium (indices 3 to 11)
  // 3 Hard (indices 12, 13, 14)
  categories.forEach((category) => {
    for (let index = 0; index < 15; index++) {
      let difficulty: Difficulty = 'Medium';
      if (index < 3) difficulty = 'Easy';
      else if (index >= 12) difficulty = 'Hard';

      const qId = `${curriculum}-G${grade}-${category.replace(/\s+/g, '')}-Q${index + 1}`;
      const question = createProceduralQuestion(qId, grade, curriculum, category, difficulty, index);
      pool.push(question);
    }
  });

  return pool;
}

// Procedural builder mapping specific indexes to structured curriculum questions
function createProceduralQuestion(
  id: string,
  grade: Grade,
  curriculum: CurriculumType,
  category: string,
  difficulty: Difficulty,
  index: number
): Question {
  if (curriculum === 'US') {
    return generateUSQuestion(id, grade, category, difficulty, index) as Question;
  }
  if (curriculum === 'UK_EUROPE') {
    return generateUKQuestion(id, grade, category, difficulty, index) as Question;
  }

  // Common placeholders
  const name1 = randomElement(NAMES);
  const name2 = NAMES.find(n => n !== name1) || 'Ben';
  const item1 = randomElement(TOYS);
  const fruit1 = randomElement(FRUITS);
  const schoolItem = randomElement(CLASSROOM_ITEMS);

  // Standard structures
  let type: QuestionType = 'MCQ';
  let text = '';
  let hint = '';
  let explanation = '';
  let options: string[] = [];
  let correctAnswer: any = '';
  let subcategory = '';
  let standardCode = '';
  let bloomLevel: Question['bloomLevel'] = 'Understanding';
  let tags: string[] = [];
  let skillId = '';
  let conceptId = '';
  let visualData: Question['visualData'] = undefined;
  let estimatedTime = 60; // seconds

  // Category routers
  const isUS = false;

  // Core Math Generator Logic by Category & Difficulty
  if (category.includes('Number Sense')) {
    subcategory = 'Place Value and Representation';
    standardCode = isUS ? `CCSS.Math.Content.${grade}.NBT.A` : `NC.Math.${grade}.NS`;
    tags = ['number-sense', 'place-value', `grade-${grade}`];
    skillId = `SKILL-NS-${grade}`;
    conceptId = `CON-NS-${grade}-${difficulty}`;

    if (grade <= 2) {
      // Early Place Value
      if (difficulty === 'Easy') {
        type = 'MCQ';
        const mod = index % 3;
        if (mod === 0) {
          const num = randomRange(11, 49);
          text = `What is the value of the digit in the tens place in the number **${num}**?`;
          const tensDigit = Math.floor(num / 10);
          correctAnswer = String(tensDigit * 10);
          options = [correctAnswer, String(tensDigit), String(num % 10), String((tensDigit + 1) * 10)];
          hint = `Recall that the tens place is the second digit from the right.`;
          explanation = `In the number ${num}, there are ${tensDigit} tens and ${num % 10} ones. The value of ${tensDigit} tens is ${tensDigit * 10}.`;
          bloomLevel = 'Remembering';
        } else if (mod === 1) {
          const num = randomRange(11, 49);
          text = `What is the value of the digit in the ones place in the number **${num}**?`;
          const onesDigit = num % 10;
          correctAnswer = String(onesDigit);
          options = [correctAnswer, String(onesDigit * 10), String(Math.floor(num / 10)), String(onesDigit + 2)];
          hint = `The ones place is the rightmost digit.`;
          explanation = `In the number ${num}, there are ${Math.floor(num / 10)} tens and ${onesDigit} ones. The value of the ones place is simply ${onesDigit}.`;
          bloomLevel = 'Remembering';
        } else {
          const num1 = randomRange(15, 29);
          const num2 = randomRange(30, 45);
          text = `Which of the following numbers is **greater** than **${num1}** but **less** than **${num2}**?`;
          const ans = randomRange(num1 + 1, num2 - 1);
          correctAnswer = String(ans);
          options = [correctAnswer, String(num1 - 2), String(num2 + 3), String(num1 + num2)];
          hint = `Look for a number that lies between ${num1} and ${num2}.`;
          explanation = `The number ${ans} is greater than ${num1} and less than ${num2}.`;
          bloomLevel = 'Understanding';
        }
      } else if (difficulty === 'Medium') {
        const mod = index % 3;
        if (mod === 0) {
          type = 'FILL_IN_BLANK';
          const tens = randomRange(2, 9);
          const ones = randomRange(1, 9);
          const standard = tens * 10 + ones;
          text = `Find the missing number: **${tens} tens + ${ones} ones = ______**`;
          correctAnswer = String(standard);
          hint = `Multiply the number of tens by 10 and add the ones.`;
          explanation = `${tens} tens is ${tens * 10}, and ${ones} ones is ${ones}. Adding them together: ${tens * 10} + ${ones} = ${standard}.`;
          bloomLevel = 'Understanding';
        } else if (mod === 1) {
          type = 'MCQ';
          const total = randomRange(50, 99);
          const ones = total % 10;
          const tens = Math.floor(total / 10);
          text = `How do you write the number **${total}** in expanded form?`;
          correctAnswer = `${tens * 10} + ${ones}`;
          options = [correctAnswer, `${tens} + ${ones}`, `${tens * 10} + ${ones * 10}`, `${ones * 10} + ${tens}`];
          hint = `Expanded form breaks a number down into the value of each of its digits.`;
          explanation = `In ${total}, the 10s value is ${tens * 10} and the 1s value is ${ones}, so it expands to ${tens * 10} + ${ones}.`;
          bloomLevel = 'Understanding';
        } else {
          type = 'MCQ';
          const base = randomRange(2, 8) * 10;
          text = `Which number represents **${base / 10} tens**?`;
          correctAnswer = String(base);
          options = [correctAnswer, String(base / 10), String(base * 10), String(base + 5)];
          hint = `One ten equals 10, so multiply by 10.`;
          explanation = `${base / 10} tens is ${base / 10} × 10 = ${base}.`;
          bloomLevel = 'Understanding';
        }
      } else {
        const mod = index % 2;
        if (mod === 0) {
          type = 'DRAG_DROP_ORDERING';
          const vals = [randomRange(10, 30), randomRange(35, 60), randomRange(65, 99)].sort((a,b) => a-b);
          text = `Arrange these numbers in order from **least to greatest**:`;
          options = shuffleArray(vals).map(String);
          correctAnswer = vals.map(v => options.indexOf(String(v)));
          hint = `Compare the tens place first, then the ones place if the tens are equal.`;
          explanation = `Comparing the tens place, we see that ${vals[0]} < ${vals[1]} < ${vals[2]}.`;
          bloomLevel = 'Analyzing';
        } else {
          type = 'MCQ';
          const num1 = randomRange(40, 60);
          const num2 = randomRange(61, 80);
          text = `Which symbol makes the statement true? <br/><strong class="text-lg">${num1} ______ ${num2}</strong>`;
          correctAnswer = '<';
          options = ['<', '>', '='];
          hint = `Check which number is smaller. The symbol points its small end to the smaller number.`;
          explanation = `${num1} is less than ${num2}, so the correct symbol is <.`;
          bloomLevel = 'Applying';
        }
      }
    } else if (grade <= 5) {
      // Upper Primary Place Value & Rounding
      if (difficulty === 'Easy') {
        type = 'MCQ';
        const mod = index % 3;
        if (mod === 0) {
          const baseNum = randomRange(100, 999);
          const remainder = baseNum % 10;
          const rounded = remainder >= 5 ? baseNum + (10 - remainder) : baseNum - remainder;
          text = `Round the number **${baseNum}** to the nearest ten.`;
          correctAnswer = String(rounded);
          options = generateNumericOptions(rounded, 3, 10);
          hint = `Look at the digit in the ones place. If it is 5 or more, round up.`;
          explanation = `To round ${baseNum} to the nearest ten, look at the ones place (${remainder}). Since ${remainder} is ${remainder >= 5 ? '>= 5' : '< 5'}, we round ${remainder >= 5 ? 'up to' : 'down to'} ${rounded}.`;
          bloomLevel = 'Applying';
        } else if (mod === 1) {
          const baseNum = randomRange(1000, 9999);
          const remainder = baseNum % 100;
          const rounded = remainder >= 50 ? baseNum + (100 - remainder) : baseNum - remainder;
          text = `Round the number **${baseNum}** to the nearest hundred.`;
          correctAnswer = String(rounded);
          options = generateNumericOptions(rounded, 3, 100);
          hint = `Look at the tens place digit. If it is 5 or more, round the hundreds up.`;
          explanation = `The tens digit of ${baseNum} is ${Math.floor((baseNum % 100) / 10)}. Since it is ${remainder >= 50 ? '5 or more' : 'less than 5'}, we round to ${rounded}.`;
          bloomLevel = 'Applying';
        } else {
          const val = randomRange(1, 9) * 1000 + randomRange(1, 9) * 100;
          text = `What is the value of the digit in the thousands place of the number **${val}**?`;
          const thousands = Math.floor(val / 1000);
          correctAnswer = String(thousands * 1000);
          options = [correctAnswer, String(thousands), String(val % 1000), '1000'];
          hint = `Identify which position is the thousands place (fourth digit from right).`;
          explanation = `In the number ${val}, ${thousands} is in the thousands place, so its value is ${thousands * 1000}.`;
          bloomLevel = 'Remembering';
        }
      } else if (difficulty === 'Medium') {
        type = 'SHORT_NUMERICAL';
        const mod = index % 3;
        if (mod === 0) {
          // Fixed place value question (to ensure exactly one 5 digit in the entire number!)
          const d1 = randomElement([1, 2, 3, 4, 6, 7, 8, 9]);
          const d2 = randomElement([0, 1, 2, 3, 4, 6, 7, 8, 9]);
          const d4 = randomElement([0, 1, 2, 3, 4, 6, 7, 8, 9]);
          const d5 = randomElement([0, 1, 2, 3, 4, 6, 7, 8, 9]);
          const numStr = `${d1}${d2}5${d4}${d5}`;
          text = `What is the value of the digit **5** in the number **${numStr}**?`;
          correctAnswer = '500';
          hint = `Recall the place value chart: Ones, Tens, Hundreds, Thousands, Ten Thousands.`;
          explanation = `In the number ${numStr}, the digit 5 is in the hundreds place, so its value is 5 × 100 = 500.`;
          bloomLevel = 'Understanding';
        } else if (mod === 1) {
          // Rounding to nearest thousand
          const d1 = randomRange(10, 89);
          const hundreds = randomElement([1, 2, 3, 4, 6, 7, 8, 9]);
          const baseNum = d1 * 1000 + hundreds * 100 + randomRange(10, 99);
          const rounded = Math.round(baseNum / 1000) * 1000;
          text = `Round the number **${baseNum}** to the nearest thousand.`;
          correctAnswer = String(rounded);
          type = 'MCQ';
          options = [correctAnswer, String(rounded - 1000), String(rounded + 1000), String(Math.floor(baseNum / 100) * 100)];
          hint = `To round to the nearest thousand, look at the hundreds place digit.`;
          explanation = `The digit in the hundreds place of ${baseNum} is ${hundreds}. Since ${hundreds} is ${hundreds >= 5 ? '5 or more, we round up' : 'less than 5, we round down'}, giving ${rounded}.`;
          bloomLevel = 'Applying';
        } else {
          // Identify place value name
          const d1 = randomElement([1, 2, 3, 4, 6, 7, 8, 9]);
          const d2 = randomElement([1, 2, 3, 4, 6, 7, 8, 9]);
          const d3 = randomElement([1, 2, 3, 4, 6, 7, 8, 9]);
          const numStr = `${d1}5${d2}${d3}`;
          text = `In the number **${numStr}**, which place is occupied by the digit **5**?`;
          correctAnswer = 'Hundreds';
          type = 'MCQ';
          options = ['Hundreds', 'Thousands', 'Tens', 'Ones'];
          hint = `Count the places from right to left: Ones, Tens, Hundreds.`;
          explanation = `In ${numStr}, from right to left, ${d3} is in the ones, ${d2} is in the tens, and 5 is in the hundreds place.`;
          bloomLevel = 'Understanding';
        }
      } else {
        type = 'MCQ';
        const exponent = randomRange(3, 5);
        const multiplier = randomRange(2, 9);
        const result = multiplier * Math.pow(10, exponent);
        text = `What is the value of the expression **${multiplier} × 10<sup>${exponent}</sup>**?`;
        correctAnswer = result.toLocaleString();
        options = [
          correctAnswer,
          (multiplier * Math.pow(10, exponent - 1)).toLocaleString(),
          (multiplier * Math.pow(10, exponent + 1)).toLocaleString(),
          (multiplier + exponent * 10).toLocaleString()
        ];
        hint = `Recall that 10 raised to a power represents a 1 followed by that many zeros.`;
        explanation = `10<sup>${exponent}</sup> is 1 followed by ${exponent} zeros, which is ${Math.pow(10, exponent).toLocaleString()}. Multiplying by ${multiplier} gives ${result.toLocaleString()}.`;
        bloomLevel = 'Applying';
      }
    } else {
      // Middle School - Powers of Ten, Integers, Real Numbers
      if (difficulty === 'Easy') {
        type = 'TRUE_FALSE';
        const val1 = randomRange(-15, -2);
        const val2 = randomRange(-30, -16);
        text = `Is the inequality **${val1} > ${val2}** true or false?`;
        correctAnswer = 'True';
        options = ['True', 'False'];
        hint = `On a number line, values further to the right are greater.`;
        explanation = `Since negative ${Math.abs(val1)} is closer to zero than negative ${Math.abs(val2)}, it lies to the right on a number line, so ${val1} is greater than ${val2}.`;
        bloomLevel = 'Understanding';
      } else if (difficulty === 'Medium') {
        type = 'MCQ';
        const floatNum = randomRange(1, 9) + Math.random();
        const exponent = randomRange(-4, -2);
        const sci = `${floatNum.toFixed(2)} × 10<sup>${exponent}</sup>`;
        const standard = floatNum * Math.pow(10, exponent);
        text = `Express the scientific notation **${sci}** in standard decimal form.`;
        correctAnswer = standard.toFixed(6);
        options = [
          correctAnswer,
          (floatNum * Math.pow(10, exponent - 1)).toFixed(6),
          (floatNum * Math.pow(10, exponent + 1)).toFixed(6),
          (floatNum / exponent).toFixed(6)
        ];
        hint = `A negative exponent of 10 moves the decimal point to the left.`;
        explanation = `The exponent ${exponent} means we move the decimal point ${Math.abs(exponent)} places to the left, which results in ${standard.toFixed(6)}.`;
        bloomLevel = 'Applying';
      } else {
        type = 'MCQ';
        text = `Which of the following numbers is **irrational**?`;
        correctAnswer = '√7';
        options = ['√7', '√9', '3.14', '22/7'];
        hint = `An irrational number cannot be expressed as a simple fraction of two integers.`;
        explanation = `√7 cannot be simplified to an integer or rational fraction. √9 = 3 (rational), 3.14 is a terminating decimal (rational), and 22/7 is a fraction (rational).`;
        bloomLevel = 'Analyzing';
      }
    }
  } 
  
  else if (category.includes('Operations') || category.includes('Algebra')) {
    subcategory = 'Operations & Expressions';
    standardCode = isUS ? `CCSS.Math.Content.${grade}.OA.A` : `NC.Math.${grade}.OA`;
    tags = ['algebra', 'operations', 'equations', `grade-${grade}`];
    skillId = `SKILL-OA-${grade}`;
    conceptId = `CON-OA-${grade}-${difficulty}`;

    if (grade <= 2) {
      if (difficulty === 'Easy') {
        type = 'MCQ';
        const a = randomRange(5, 12);
        const b = randomRange(3, 8);
        text = `${name1} has **${a}** ${toyCount(item1)} and receives **${b}** more from ${name2}. How many ${item1} does ${name1} have in total?`;
        correctAnswer = String(a + b);
        options = generateNumericOptions(a + b);
        hint = `Use addition to find the total sum.`;
        explanation = `${a} + ${b} = ${a + b}. Total ${item1} is ${a + b}.`;
        bloomLevel = 'Applying';
      } else if (difficulty === 'Medium') {
        type = 'SHORT_NUMERICAL';
        const total = randomRange(12, 20);
        const sub = randomRange(4, 9);
        text = `Find the missing addend: **${sub} + _____ = ${total}**`;
        correctAnswer = String(total - sub);
        hint = `Subtract ${sub} from ${total} to find the answer.`;
        explanation = `The missing number is ${total} - ${sub} = ${total - sub}.`;
        bloomLevel = 'Understanding';
      } else {
        type = 'MCQ';
        const start = randomRange(2, 6);
        const step = randomRange(2, 5);
        const seq = [start, start + step, start + step * 2, start + step * 3];
        text = `What is the **next number** in this skip counting pattern? <br/><strong class="text-lg">${seq.join(', ')},  __?__</strong>`;
        correctAnswer = String(start + step * 4);
        options = generateNumericOptions(start + step * 4, 3, step);
        hint = `Find the constant difference between consecutive numbers.`;
        explanation = `The sequence increases by ${step} each time. The next term is ${seq[3]} + ${step} = ${start + step * 4}.`;
        bloomLevel = 'Creating';
      }
    } else if (grade <= 5) {
      if (difficulty === 'Easy') {
        type = 'MCQ';
        const factors = [randomRange(4, 9), randomRange(3, 8)];
        text = `Solve: **${factors[0]} × ${factors[1]} = ______**`;
        correctAnswer = String(factors[0] * factors[1]);
        options = generateNumericOptions(factors[0] * factors[1], 3, 4);
        hint = `Think of this as ${factors[0]} groups of ${factors[1]}.`;
        explanation = `Using basic multiplication, ${factors[0]} multiplied by ${factors[1]} is ${factors[0] * factors[1]}.`;
        bloomLevel = 'Remembering';
      } else if (difficulty === 'Medium') {
        type = 'SHORT_NUMERICAL';
        const x = randomRange(5, 15);
        const y = randomRange(10, 30);
        text = `Evaluate the expression **3x - 5** when **x = ${x}**`;
        correctAnswer = String(3 * x - 5);
        hint = `Substitute ${x} for x and follow the order of operations.`;
        explanation = `Substitute x = ${x}: 3(${x}) - 5 = ${3 * x} - 5 = ${3 * x - 5}.`;
        bloomLevel = 'Applying';
      } else {
        type = 'MCQ';
        const a = randomRange(4, 8);
        const b = randomRange(2, 5);
        const c = randomRange(3, 6);
        const ans = a * (b + c);
        text = `Which expression is equivalent to **${a} × (${b} + ${c})** according to the **distributive property**?`;
        correctAnswer = `(${a} × ${b}) + (${a} × ${c})`;
        options = [
          correctAnswer,
          `(${a} + ${b}) × (${a} + ${c})`,
          `${a} × ${b} + ${c}`,
          `(${a} × ${b}) × ${c}`
        ];
        hint = `The distributive property expands a multiplier to all addends in the parentheses.`;
        explanation = `By the distributive property, a × (b + c) = (a × b) + (a × c). Therefore, ${a} × (${b} + ${c}) = (${a} × ${b}) + (${a} × ${c}).`;
        bloomLevel = 'Analyzing';
      }
    } else {
      // Middle School - Algebra & Linear Equations
      if (difficulty === 'Easy') {
        type = 'SHORT_NUMERICAL';
        const sol = randomRange(3, 12);
        const add = randomRange(4, 15);
        const total = sol * 2 + add;
        text = `Solve the equation for **x**: <br/>**2x + ${add} = ${total}**`;
        correctAnswer = String(sol);
        hint = `Subtract ${add} from both sides, then divide by 2.`;
        explanation = `Subtract ${add}: 2x = ${total - add}. Divide by 2: x = ${sol}.`;
        bloomLevel = 'Applying';
      } else if (difficulty === 'Medium') {
        type = 'MCQ';
        const sol1 = randomRange(2, 6);
        const sol2 = randomRange(1, 5);
        // system: x + y = sol1 + sol2; 2x - y = 2*sol1 - sol2
        const sumVal = sol1 + sol2;
        const diffVal = 2 * sol1 - sol2;
        text = `Solve the system of equations: <br/>**x + y = ${sumVal}** <br/>**2x - y = ${diffVal}**`;
        correctAnswer = `x = ${sol1}, y = ${sol2}`;
        options = [
          correctAnswer,
          `x = ${sol2}, y = ${sol1}`,
          `x = ${sol1 + 1}, y = ${sol2 - 1}`,
          `x = ${sol1 - 1}, y = ${sol2 + 1}`
        ];
        hint = `Add the two equations together to eliminate y.`;
        explanation = `Adding equations: 3x = ${sumVal + diffVal} => 3x = ${3 * sol1} => x = ${sol1}. Substitute back: ${sol1} + y = ${sumVal} => y = ${sol2}.`;
        bloomLevel = 'Analyzing';
      } else {
        type = 'MCQ';
        text = `Which of the following represents the factored form of the quadratic expression **x<sup>2</sup> - 5x - 6**?`;
        correctAnswer = `(x - 6)(x + 1)`;
        options = [`(x - 6)(x + 1)`, `(x - 3)(x - 2)`, `(x + 6)(x - 1)`, `(x - 5)(x - 1)`];
        hint = `Find two numbers that multiply to -6 and add up to -5.`;
        explanation = `The numbers -6 and +1 multiply to -6 and sum to -5. Thus, x<sup>2</sup> - 5x - 6 factors into (x - 6)(x + 1).`;
        bloomLevel = 'Evaluating';
      }
    }
  } 
  
  else if (category.includes('Fraction') || category.includes('Rational')) {
    subcategory = 'Fractions & Rational Numbers';
    standardCode = isUS ? `CCSS.Math.Content.${grade}.NF.A` : `NC.Math.${grade}.FR`;
    tags = ['fractions', 'decimals', 'rational-numbers', `grade-${grade}`];
    skillId = `SKILL-FR-${grade}`;
    conceptId = `CON-FR-${grade}-${difficulty}`;

    if (grade <= 2) {
      // Early partition of shapes
      type = 'MCQ';
      if (difficulty === 'Easy') {
        text = `If a circle is split into **four equal parts**, what is each part called?`;
        correctAnswer = 'A quarter (fourth)';
        options = ['A quarter (fourth)', 'A half', 'A third', 'A whole'];
        hint = `Four equal parts mean dividing by four.`;
        explanation = `Splitting an object into four identical parts creates quarters or fourths.`;
        bloomLevel = 'Remembering';
      } else if (difficulty === 'Medium') {
        type = 'FRACTION_MODEL';
        const shaded = 1;
        const total = 3;
        text = `What fraction of this block model is shaded?`;
        correctAnswer = '1/3';
        options = ['1/3', '1/2', '1/4', '2/3'];
        visualData = { fractionParts: { shaded, total } };
        hint = `Count the shaded squares on top, and count the total squares.`;
        explanation = `There is 1 shaded part out of 3 equal parts, representing the fraction 1/3.`;
        bloomLevel = 'Understanding';
      } else {
        type = 'MCQ';
        text = `If you eat **half** of an apple, and your sister eats **one quarter** of the same apple, how much of the apple is left?`;
        correctAnswer = 'One quarter';
        options = ['One quarter', 'Half', 'Three quarters', 'None'];
        hint = `Combine the eaten parts first: 1/2 + 1/4 = 3/4.`;
        explanation = `Eating half (2/4) and one quarter (1/4) means 3/4 is eaten. What remains is 1 - 3/4 = 1/4.`;
        bloomLevel = 'Applying';
      }
    } else if (grade <= 5) {
      if (difficulty === 'Easy') {
        type = 'FRACTION_MODEL';
        const shaded = 3;
        const total = 8;
        text = `Identify the fraction represented by the shaded region in the block model:`;
        correctAnswer = '3/8';
        options = ['3/8', '5/8', '1/2', '3/5'];
        visualData = { fractionParts: { shaded, total } };
        hint = `Count shaded parts first (numerator), then count total parts (denominator).`;
        explanation = `3 out of 8 total parts are shaded, which is written as 3/8.`;
        bloomLevel = 'Understanding';
      } else if (difficulty === 'Medium') {
        type = 'MCQ';
        const a_num = 1;
        const a_den = 3;
        const b_num = 1;
        const b_den = 4;
        text = `Calculate the sum: **1/3 + 1/4 = ______**`;
        correctAnswer = '7/12';
        options = ['7/12', '2/7', '1/12', '5/12'];
        hint = `Find a common denominator, which is 12.`;
        explanation = `Convert to common denominator 12: 1/3 = 4/12, and 1/4 = 3/12. Adding them: 4/12 + 3/12 = 7/12.`;
        bloomLevel = 'Applying';
      } else {
        type = 'DRAG_DROP_ORDERING';
        text = `Order these fractions from **least to greatest**:`;
        const list = ['1/4', '1/2', '5/8'];
        options = shuffleArray(list);
        correctAnswer = list.map(v => options.indexOf(v));
        hint = `Convert all fractions to a common denominator of 8.`;
        explanation = `Converting to denominator 8: 1/4 = 2/8, 1/2 = 4/8, and 5/8 is already 5/8. So the correct order is 1/4 < 1/2 < 5/8.`;
        bloomLevel = 'Analyzing';
      }
    } else {
      // Middle School - Rational, Percents, Decimals
      if (difficulty === 'Easy') {
        type = 'SHORT_NUMERICAL';
        text = `Convert **3/5** to a percentage. Do not type the % symbol.`;
        correctAnswer = '60';
        hint = `Multiply the fraction by 100 or convert to a denominator of 100.`;
        explanation = `3/5 = (3 × 20) / (5 × 20) = 60/100 = 60%.`;
        bloomLevel = 'Understanding';
      } else if (difficulty === 'Medium') {
        type = 'MCQ';
        text = `Solve: **(2/3) ÷ (4/5) = ______**`;
        correctAnswer = '5/6';
        options = ['5/6', '8/15', '15/8', '6/5'];
        hint = `To divide by a fraction, multiply by its reciprocal (invert and multiply).`;
        explanation = `(2/3) ÷ (4/5) = (2/3) × (5/4) = 10/12 = 5/6.`;
        bloomLevel = 'Applying';
      } else {
        type = 'MCQ';
        text = `Express the repeating decimal **0.444...** as a simplified fraction.`;
        correctAnswer = '4/9';
        options = ['4/9', '4/10', '2/5', '11/25'];
        hint = `Let x = 0.444... Then 10x = 4.444... Subtract the equations.`;
        explanation = `Let x = 0.444... Therefore 10x = 4.444... Subtracting the first from the second gives 9x = 4 => x = 4/9.`;
        bloomLevel = 'Analyzing';
      }
    }
  } 
  
  else if (category.includes('Ratio') || category.includes('Patterns')) {
    subcategory = isUS && grade < 6 ? 'Patterns & Number Relationships' : 'Ratios and Proportions';
    standardCode = isUS ? `CCSS.Math.Content.${grade}.RP.A` : `NC.Math.${grade}.RP`;
    tags = ['ratios', 'proportions', 'patterns', `grade-${grade}`];
    skillId = `SKILL-RP-${grade}`;
    conceptId = `CON-RP-${grade}-${difficulty}`;

    if (grade < 6) {
      // Patterns & Relationships
      if (difficulty === 'Easy') {
        type = 'PATTERN_RECOGNITION';
        const start = randomRange(5, 10);
        const seq = [start, start + 3, start + 6, start + 9];
        text = `Find the next shape pattern/number in this sequence:`;
        correctAnswer = String(start + 12);
        options = generateNumericOptions(start + 12, 3, 3);
        visualData = { pattern: seq.map(String) };
        hint = `Add 3 to each number to find the next.`;
        explanation = `The rule is 'add 3'. ${seq[3]} + 3 = ${start + 12}.`;
        bloomLevel = 'Understanding';
      } else if (difficulty === 'Medium') {
        type = 'MCQ';
        const mult = randomRange(3, 5);
        text = `If 1 notebook costs **$${mult}**, and 2 notebooks cost **$${mult*2}**, how much do **5 notebooks** cost?`;
        correctAnswer = `$${mult * 5}`;
        options = [`$${mult * 5}`, `$${mult * 4}`, `$${mult * 6}`, `$${mult * 5 + 2}`];
        hint = `Multiply the cost of 1 notebook by 5.`;
        explanation = `Each notebook costs $${mult}. So, 5 notebooks cost 5 × $${mult} = $${mult * 5}.`;
        bloomLevel = 'Applying';
      } else {
        type = 'SHORT_NUMERICAL';
        // recursive sequence: 1, 3, 6, 10, 15... (triangular numbers)
        text = `What is the **6th term** in this sequence: **1, 3, 6, 10, 15, ______**?`;
        correctAnswer = '21';
        hint = `Notice the differences between terms increase by 1 each time (+2, +3, +4, +5...).`;
        explanation = `The differences are +2, +3, +4, +5. The next difference is +6. 15 + 6 = 21.`;
        bloomLevel = 'Creating';
      }
    } else {
      // Ratios & Proportions for Grades 6-9
      if (difficulty === 'Easy') {
        type = 'MCQ';
        const ratioLeft = 2;
        const ratioRight = 3;
        const mult = randomRange(3, 6);
        text = `A ratio of blue to red marbles is **${ratioLeft}:${ratioRight}**. If there are **${ratioLeft * mult}** blue marbles, how many red marbles are there?`;
        correctAnswer = String(ratioRight * mult);
        options = generateNumericOptions(ratioRight * mult, 3, 3);
        hint = `The ratio multiplier is ${ratioLeft * mult} / ${ratioLeft} = ${mult}.`;
        explanation = `Multiply both terms of the ratio by ${mult}: (${ratioLeft} × ${mult}):(${ratioRight} × ${mult}) = ${ratioLeft * mult}:${ratioRight * mult}.`;
        bloomLevel = 'Applying';
      } else if (difficulty === 'Medium') {
        type = 'SHORT_NUMERICAL';
        const distance = randomRange(150, 300);
        const hours = randomRange(3, 5);
        const speed = distance / hours;
        text = `A car travels **${distance} miles** in **${hours} hours**. What is its constant speed in **miles per hour**?`;
        correctAnswer = String(speed);
        hint = `Divide total distance by total time to find unit rate.`;
        explanation = `Speed = Distance / Time = ${distance} / ${hours} = ${speed} mph.`;
        bloomLevel = 'Applying';
      } else {
        type = 'MCQ';
        const base = 80;
        const percent = 15;
        const off = (base * percent) / 100;
        const price = base - off;
        text = `A pair of shoes normally costs **$${base}**. It is on sale for **${percent}% off**. What is the sale price?`;
        correctAnswer = `$${price.toFixed(2)}`;
        options = [`$${price.toFixed(2)}`, `$${off.toFixed(2)}`, `$${(base - percent).toFixed(2)}`, `$${(base - 10).toFixed(2)}`];
        hint = `First calculate ${percent}% of ${base}, then subtract it from the original price.`;
        explanation = `${percent}% of $${base} is (15/100) × 80 = $12. The sale price is $80 - $12 = $${price}.`;
        bloomLevel = 'Analyzing';
      }
    }
  } 
  
  else if (category.includes('Measurement') || category.includes('Applied')) {
    subcategory = 'Measurement & Practical Math';
    standardCode = isUS ? `CCSS.Math.Content.${grade}.MD.A` : `NC.Math.${grade}.MD`;
    tags = ['measurement', 'time', 'money', `grade-${grade}`];
    skillId = `SKILL-MD-${grade}`;
    conceptId = `CON-MD-${grade}-${difficulty}`;

    if (grade <= 2) {
      if (difficulty === 'Easy') {
        type = 'CLOCK_TIME';
        const hour = randomRange(1, 12);
        text = `Read the clock and choose the correct time showing exactly **${hour} o'clock**:`;
        correctAnswer = `${hour}:00`;
        options = [`${hour}:00`, `${hour === 12 ? 1 : hour + 1}:00`, `${hour}:30`, `${hour === 1 ? 12 : hour - 1}:30`];
        visualData = { clockTime: { hour, minute: 0 } };
        hint = `The long hand (minute) points to 12 and the short hand (hour) points to ${hour}.`;
        explanation = `With the minute hand pointing straight up at 12, it is an exact hour. Since the short hour hand is at ${hour}, it is ${hour}:00.`;
        bloomLevel = 'Understanding';
      } else if (difficulty === 'Medium') {
        type = 'MONEY_COUNT';
        // count quarters and dimes
        const quartersCount = randomRange(2, 3);
        const dimesCount = randomRange(1, 3);
        const totalCents = quartersCount * 25 + dimesCount * 10;
        text = `How much money is in this piggy bank? <br/>**${quartersCount} quarters and ${dimesCount} dimes**`;
        correctAnswer = `$${(totalCents / 100).toFixed(2)}`;
        options = [`$${(totalCents / 100).toFixed(2)}`, `$${((totalCents - 15) / 100).toFixed(2)}`, `$${((totalCents + 25) / 100).toFixed(2)}`, `$${((quartersCount * 10 + dimesCount * 25) / 100).toFixed(2)}`];
        visualData = {
          moneyCoins: [
            { type: 'quarter', count: quartersCount },
            { type: 'dime', count: dimesCount }
          ]
        };
        hint = `Quarters are worth 25 cents each and dimes are worth 10 cents each.`;
        explanation = `${quartersCount} quarters × 25¢ = ${quartersCount * 25}¢. ${dimesCount} dimes × 10¢ = ${dimesCount * 10}¢. In total: ${quartersCount * 25}¢ + ${dimesCount * 10}¢ = ${totalCents}¢, which is $${(totalCents / 100).toFixed(2)}.`;
        bloomLevel = 'Applying';
      } else {
        type = 'MCQ';
        text = `Which unit of measurement is best for measuring the length of a **real school bus**?`;
        correctAnswer = isUS ? 'Feet' : 'Metres';
        options = isUS ? ['Feet', 'Inches', 'Miles', 'Ounces'] : ['Metres', 'Centimetres', 'Kilometres', 'Grams'];
        hint = `Think of which unit is large enough to measure a bus but not as massive as distances between cities.`;
        explanation = `A school bus is about 35-40 ${isUS ? 'feet' : 'metres'} long. ${isUS ? 'Inches' : 'Centimetres'} are too small, and ${isUS ? 'miles' : 'kilometres'} are far too large.`;
        bloomLevel = 'Analyzing';
      }
    } else if (grade <= 5) {
      if (difficulty === 'Easy') {
        type = 'MCQ';
        const l = randomRange(5, 8);
        const w = randomRange(3, 4);
        text = `Find the **perimeter** of a rectangle with length **${l} cm** and width **${w} cm**.`;
        correctAnswer = String(2 * (l + w));
        options = generateNumericOptions(2 * (l + w), 3, 2);
        hint = `Perimeter is the sum of all four sides: 2 × (length + width).`;
        explanation = `Perimeter = 2(length + width) = 2(${l} + ${w}) = 2 × ${l + w} = ${2 * (l + w)} cm.`;
        bloomLevel = 'Applying';
      } else if (difficulty === 'Medium') {
        type = 'SHORT_NUMERICAL';
        const feet = randomRange(3, 6);
        text = `How many **inches** are there in **${feet} feet**? (1 foot = 12 inches)`;
        correctAnswer = String(feet * 12);
        hint = `Multiply the number of feet by 12.`;
        explanation = `${feet} feet × 12 inches/foot = ${feet * 12} inches.`;
        bloomLevel = 'Applying';
      } else {
        type = 'MCQ';
        const basePrice = randomRange(12, 18);
        const taxRate = 0.10; // 10%
        const total = basePrice * (1 + taxRate);
        text = `A museum ticket costs **$${basePrice.toFixed(2)}**. If a **10% sales tax** is added, what is the total price?`;
        correctAnswer = `$${total.toFixed(2)}`;
        options = [`$${total.toFixed(2)}`, `$${(basePrice + 1).toFixed(2)}`, `$${(basePrice + basePrice * 0.05).toFixed(2)}`, `$${(basePrice - basePrice * taxRate).toFixed(2)}`];
        hint = `Find 10% of $${basePrice.toFixed(2)} and add it to the original cost.`;
        explanation = `Tax = 10% of $${basePrice} = $${(basePrice * 0.1).toFixed(2)}. Total = $${basePrice} + $${(basePrice * 0.1).toFixed(2)} = $${total.toFixed(2)}.`;
        bloomLevel = 'Analyzing';
      }
    } else {
      // Middle School - Geometry measurement, Stats introduction
      if (difficulty === 'Easy') {
        type = 'SHORT_NUMERICAL';
        const r = 7; // nice number for division with 22/7
        text = `Calculate the **circumference** of a circle with a radius of **${r} units**. (Use π ≈ 22/7)`;
        correctAnswer = '44';
        hint = `Formula for circumference is 2 × π × r.`;
        explanation = `C = 2 × (22/7) × 7 = 2 × 22 = 44.`;
        bloomLevel = 'Applying';
      } else if (difficulty === 'Medium') {
        type = 'MCQ';
        const kg = randomRange(4, 9);
        const g = kg * 1000;
        text = `Convert **${kg} kilograms** to **grams**. (1 kg = 1000 g)`;
        correctAnswer = `${g} grams`;
        options = [`${g} grams`, `${kg * 100} grams`, `${kg * 10000} grams`, `${kg / 1000} grams`];
        hint = `Multiply kilograms by 1000.`;
        explanation = `${kg} kg × 1000 grams/kg = ${g} grams.`;
        bloomLevel = 'Applying';
      } else {
        type = 'MCQ';
        const principal = 2000;
        const rate = 5; // 5%
        const years = 3;
        const interest = (principal * rate * years) / 100;
        text = `Calculate the **simple interest** earned on a principal of **$${principal}** at a **${rate}% annual rate** for **${years} years**.`;
        correctAnswer = `$${interest}`;
        options = [`$${interest}`, `$${interest + principal}`, `$${interest / years}`, `$300`];
        hint = `Use the simple interest formula: I = P × r × t.`;
        explanation = `I = P × r × t = $${principal} × 0.05 × ${years} = $${interest}.`;
        bloomLevel = 'Analyzing';
      }
    }
  } 
  
  else if (category.includes('Geometry')) {
    subcategory = 'Shapes and Spatial Systems';
    standardCode = isUS ? `CCSS.Math.Content.${grade}.G.A` : `NC.Math.${grade}.GE`;
    tags = ['geometry', 'shapes', 'angles', `grade-${grade}`];
    skillId = `SKILL-GE-${grade}`;
    conceptId = `CON-GE-${grade}-${difficulty}`;

    if (grade <= 2) {
      if (difficulty === 'Easy') {
        type = 'MCQ';
        text = `How many **corners (vertices)** does a **triangle** have?`;
        correctAnswer = '3';
        options = ['3', '4', '5', '2'];
        hint = `Think of the shape of a triangle. Count its points.`;
        explanation = `A triangle has 3 sides and 3 corners (vertices).`;
        bloomLevel = 'Remembering';
      } else if (difficulty === 'Medium') {
        type = 'TRUE_FALSE';
        text = `A **rectangle** has exactly four straight sides of equal length. True or False?`;
        correctAnswer = 'False';
        options = ['True', 'False'];
        hint = `A shape with four equal sides is a square. Rectangles can have different lengths and widths.`;
        explanation = `A rectangle has opposite sides equal, but not necessarily all four sides. A square is a special rectangle with all four sides equal.`;
        bloomLevel = 'Understanding';
      } else {
        type = 'MCQ';
        text = `Which of the following is a **3D (solid) shape**?`;
        correctAnswer = 'Sphere';
        options = ['Sphere', 'Circle', 'Triangle', 'Square'];
        hint = `A 3D shape has depth, like a ball.`;
        explanation = `A circle is a flat 2D shape. A sphere is a solid 3D shape (like a ball).`;
        bloomLevel = 'Analyzing';
      }
    } else if (grade <= 5) {
      if (difficulty === 'Easy') {
        type = 'MCQ';
        text = `An angle that measures exactly **90 degrees** is called a/an:`;
        correctAnswer = 'Right angle';
        options = ['Right angle', 'Acute angle', 'Obtuse angle', 'Straight angle'];
        hint = `Think of the corner of a square.`;
        explanation = `A 90-degree angle is a right angle.`;
        bloomLevel = 'Remembering';
      } else if (difficulty === 'Medium') {
        type = 'SHORT_NUMERICAL';
        const side = randomRange(4, 9);
        text = `What is the **area** of a square with side length of **${side} meters**?`;
        correctAnswer = String(side * side);
        hint = `Area of a square = side × side.`;
        explanation = `Area = side × side = ${side} × ${side} = ${side * side} square meters.`;
        bloomLevel = 'Applying';
      } else {
        type = 'MCQ';
        const ptX = randomRange(2, 6);
        const ptY = randomRange(2, 6);
        text = `On a coordinate plane, if you start at the origin (0,0), move **${ptX} units right** and **${ptY} units up**, what are the coordinates?`;
        correctAnswer = `(${ptX}, ${ptY})`;
        options = [`(${ptX}, ${ptY})`, `(${ptY}, ${ptX})`, `(${ptX}, 0)`, `(0, ${ptY})`];
        hint = `Coordinates are written as (x, y) where x is horizontal and y is vertical.`;
        explanation = `Horizontal movement represents x (${ptX}) and vertical represents y (${ptY}). The coordinate pair is (${ptX}, ${ptY}).`;
        bloomLevel = 'Analyzing';
      }
    } else {
      // Middle School - Volume, Pythagorean, Trigonometry
      if (difficulty === 'Easy') {
        type = 'MCQ';
        text = `If two lines intersect and form a right angle, they are said to be:`;
        correctAnswer = 'Perpendicular';
        options = ['Perpendicular', 'Parallel', 'Skew', 'Congruent'];
        hint = `Perpendicular lines meet at exactly 90 degrees.`;
        explanation = `Perpendicular lines intersect at right (90°) angles.`;
        bloomLevel = 'Remembering';
      } else if (difficulty === 'Medium') {
        type = 'SHORT_NUMERICAL';
        // Pythagorean triple 3-4-5 multiplied by random factor
        const factor = randomRange(1, 3);
        const a = 3 * factor;
        const b = 4 * factor;
        const c = 5 * factor;
        text = `In a right-angled triangle, if the legs measure **${a} cm** and **${b} cm**, find the length of the **hypotenuse (c)** in cm.`;
        correctAnswer = String(c);
        hint = `Use the Pythagorean theorem: a<sup>2</sup> + b<sup>2</sup> = c<sup>2</sup>.`;
        explanation = `${a}<sup>2</sup> + ${b}<sup>2</sup> = ${a*a} + ${b*b} = ${a*a + b*b} = ${c}<sup>2</sup>. Thus c = ${c} cm.`;
        bloomLevel = 'Applying';
      } else {
        type = 'MCQ';
        text = `A cylinder has a radius of **3 cm** and a height of **5 cm**. What is its **volume** in terms of π?`;
        correctAnswer = '45π cm³';
        options = ['45π cm³', '15π cm³', '30π cm³', '90π cm³'];
        hint = `The volume formula is V = π × r<sup>2</sup> × h.`;
        explanation = `V = π × 3<sup>2</sup> × 5 = π × 9 × 5 = 45π cm³.`;
        bloomLevel = 'Analyzing';
      }
    }
  } 
  
  else if (category.includes('Problem Solving') || category.includes('Statistics')) {
    subcategory = isUS ? 'Analytical Reasoning & Modeling' : 'Statistics and Interpretation';
    standardCode = isUS ? `CCSS.Math.Content.${grade}.SP.A` : `NC.Math.${grade}.ST`;
    tags = ['problem-solving', 'reasoning', 'logic', `grade-${grade}`];
    skillId = `SKILL-PS-${grade}`;
    conceptId = `CON-PS-${grade}-${difficulty}`;

    if (grade <= 2) {
      if (difficulty === 'Easy') {
        type = 'MCQ';
        const a = randomRange(8, 15);
        const b = randomRange(3, 7);
        text = `A basket has **${a} ${fruit1}**. ${name1} eats **${b}** of them. How many ${fruit1} are left?`;
        correctAnswer = String(a - b);
        options = generateNumericOptions(a - b);
        hint = `Subtract the eaten fruits from the total.`;
        explanation = `${a} - ${b} = ${a - b} ${fruit1} left.`;
        bloomLevel = 'Applying';
      } else if (difficulty === 'Medium') {
        type = 'MCQ';
        text = `If yesterday was **Tuesday**, what day will it be **tomorrow**?`;
        correctAnswer = 'Thursday';
        options = ['Thursday', 'Wednesday', 'Friday', 'Tuesday'];
        hint = `If yesterday was Tuesday, today is Wednesday.`;
        explanation = `Yesterday = Tuesday => Today = Wednesday => Tomorrow = Thursday.`;
        bloomLevel = 'Understanding';
      } else {
        type = 'SHORT_NUMERICAL';
        // simple grid logic
        const rCount = randomRange(3, 5);
        const cCount = randomRange(2, 4);
        text = `If children sit in a grid of **${rCount} rows** and **${cCount} columns**, how many children are there in total?`;
        correctAnswer = String(rCount * cCount);
        hint = `Multiply rows by columns.`;
        explanation = `${rCount} rows × ${cCount} columns = ${rCount * cCount} children total.`;
        bloomLevel = 'Applying';
      }
    } else if (grade <= 5) {
      if (difficulty === 'Easy') {
        type = 'MCQ';
        const items = [4, 6, 8, 10];
        const sum = items.reduce((a,b) => a+b, 0);
        const mean = sum / items.length;
        text = `Find the **mean (average)** of this set of data: <strong class="text-lg">${items.join(', ')}</strong>`;
        correctAnswer = String(mean);
        options = generateNumericOptions(mean, 3, 1);
        hint = `Add all values together and divide by the count of items (${items.length}).`;
        explanation = `Sum = ${sum}. Count = ${items.length}. Average = ${sum} / ${items.length} = ${mean}.`;
        bloomLevel = 'Applying';
      } else if (difficulty === 'Medium') {
        type = 'MCQ';
        const cards = ['Red', 'Red', 'Blue', 'Green', 'Green', 'Green'];
        text = `A bag contains **2 Red, 1 Blue, and 3 Green** cards. If you draw one card at random, which color are you **most likely** to pick?`;
        correctAnswer = 'Green';
        options = ['Green', 'Red', 'Blue', 'All are equally likely'];
        hint = `Compare the quantities of each color. The highest count has the highest probability.`;
        explanation = `Green has the highest count (3 cards), followed by Red (2 cards) and Blue (1 card). Thus, Green is most likely.`;
        bloomLevel = 'Understanding';
      } else {
        type = 'SHORT_NUMERICAL';
        const base = randomRange(5, 10);
        const added = randomRange(2, 5);
        text = `I am thinking of a number. If you **double it** and **add ${added}**, the result is **${base * 2 + added}**. What is my number?`;
        correctAnswer = String(base);
        hint = `Work backwards: subtract ${added} from the result, then divide by 2.`;
        explanation = `Let the number be n. 2n + ${added} = ${base * 2 + added} => 2n = ${base * 2} => n = ${base}.`;
        bloomLevel = 'Analyzing';
      }
    } else {
      // Middle School - High Stats & Logic
      if (difficulty === 'Easy') {
        type = 'SHORT_NUMERICAL';
        const scores = [10, 15, 15, 20, 25].sort((a,b) => a-b);
        text = `Find the **median** value of this dataset: <strong class="text-lg">${scores.join(', ')}</strong>`;
        correctAnswer = '15';
        hint = `Arrange the numbers in ascending order and find the middle term.`;
        explanation = `The middle term in this sorted 5-item dataset is the 3rd term, which is 15.`;
        bloomLevel = 'Understanding';
      } else if (difficulty === 'Medium') {
        type = 'MCQ';
        text = `You roll a fair six-sided die twice. What is the probability of rolling a **6 on both rolls**?`;
        correctAnswer = '1/36';
        options = ['1/36', '1/6', '1/12', '1/18'];
        hint = `The probability of rolling a 6 is 1/6. Since the rolls are independent, multiply their probabilities.`;
        explanation = `P(6 on roll 1) = 1/6. P(6 on roll 2) = 1/6. Combined probability = (1/6) × (1/6) = 1/36.`;
        bloomLevel = 'Applying';
      } else {
        type = 'MCQ';
        text = `In a class of **30 students**, **18** like Math, **15** like Science, and **8** like both. How many students **do not like either** subject?`;
        correctAnswer = '5';
        options = ['5', '3', '7', '10'];
        hint = `Use a Venn Diagram. Total liking either = L(Math) + L(Sci) - L(Both).`;
        explanation = `L(Math or Science) = 18 + 15 - 8 = 25 students. Students liking neither = 30 - 25 = 5 students.`;
        bloomLevel = 'Analyzing';
      }
    }
  } 
  
  else {
    // Mathematical Fluency Category
    subcategory = 'Mental Recall & Fast Processing';
    standardCode = isUS ? `CCSS.Math.Content.${grade}.OA.B` : `NC.Math.${grade}.FL`;
    tags = ['fluency', 'mental-math', 'fact-recall', `grade-${grade}`];
    skillId = `SKILL-FL-${grade}`;
    conceptId = `CON-FL-${grade}-${difficulty}`;
    estimatedTime = 30; // speed category

    if (grade <= 2) {
      if (difficulty === 'Easy') {
        type = 'MCQ';
        const a = randomRange(3, 8);
        text = `Solve quickly: **${a} + ${a} = ______**`;
        correctAnswer = String(2 * a);
        options = generateNumericOptions(2 * a, 3, 1);
        hint = `This is a double. Doubling ${a} is ${a} + ${a}.`;
        explanation = `${a} + ${a} = ${2 * a}.`;
        bloomLevel = 'Remembering';
      } else if (difficulty === 'Medium') {
        type = 'SHORT_NUMERICAL';
        const a = randomRange(10, 15);
        text = `What is **${a} - 9**?`;
        correctAnswer = String(a - 9);
        hint = `Subtract 10 and add 1 back for a fast strategy.`;
        explanation = `${a} - 9 = ${a - 9}.`;
        bloomLevel = 'Remembering';
      } else {
        type = 'MCQ';
        text = `Which of these equations equals exactly **10**?`;
        const correctEq = '6 + 4';
        correctAnswer = correctEq;
        options = [correctEq, '5 + 4', '7 + 2', '8 + 3'];
        hint = `Think of friendly number partners that make 10.`;
        explanation = `6 + 4 is a standard partition of 10.`;
        bloomLevel = 'Understanding';
      }
    } else if (grade <= 5) {
      if (difficulty === 'Easy') {
        type = 'SHORT_NUMERICAL';
        const x = randomRange(6, 9);
        const y = randomRange(6, 9);
        text = `Solve as fast as you can: **${x} × ${y} = ______**`;
        correctAnswer = String(x * y);
        hint = `This is a standard multiplication table fact.`;
        explanation = `${x} × ${y} = ${x * y}.`;
        bloomLevel = 'Remembering';
      } else if (difficulty === 'Medium') {
        type = 'MCQ';
        const base = randomRange(3, 6) * 10;
        const mult = randomRange(4, 7);
        text = `Mental Math: **${base} × ${mult} = ______**`;
        correctAnswer = String(base * mult);
        options = generateNumericOptions(base * mult, 3, 10);
        hint = `Multiply ${base / 10} by ${mult}, then append a zero.`;
        explanation = `${base / 10} × ${mult} = ${(base / 10) * mult}. Appending the zero gives ${base * mult}.`;
        bloomLevel = 'Applying';
      } else {
        type = 'SHORT_NUMERICAL';
        const dividend = randomRange(11, 14) * 5;
        text = `What is **${dividend} ÷ 5**?`;
        correctAnswer = String(dividend / 5);
        hint = `Think: what number multiplied by 5 equals ${dividend}?`;
        explanation = `${dividend / 5} × 5 = ${dividend}. So ${dividend} ÷ 5 = ${dividend / 5}.`;
        bloomLevel = 'Remembering';
      }
    } else {
      // Middle School Fluency
      if (difficulty === 'Easy') {
        type = 'MCQ';
        const sq = randomRange(11, 15);
        text = `What is the square of **${sq}** (i.e. **${sq}<sup>2</sup>**)?`;
        correctAnswer = String(sq * sq);
        options = generateNumericOptions(sq * sq, 3, 5);
        hint = `Recall perfect squares from memory.`;
        explanation = `${sq} × ${sq} = ${sq * sq}.`;
        bloomLevel = 'Remembering';
      } else if (difficulty === 'Medium') {
        type = 'SHORT_NUMERICAL';
        const percent = 20;
        const total = randomRange(4, 9) * 50;
        const ans = (total * percent) / 100;
        text = `What is **${percent}%** of **${total}**?`;
        correctAnswer = String(ans);
        hint = `20% is equivalent to dividing by 5 or finding 10% and doubling it.`;
        explanation = `10% of ${total} is ${total / 10}. Double it to get 20%: ${total / 10} × 2 = ${ans}.`;
        bloomLevel = 'Applying';
      } else {
        type = 'MCQ';
        // reciprocal fractions: 1/8 decimal
        text = `What is the decimal equivalent of the fraction **1/8**?`;
        correctAnswer = '0.125';
        options = ['0.125', '0.25', '0.15', '0.08'];
        hint = `Divide 1.000 by 8, or remember that 1/8 is half of 1/4 (0.25).`;
        explanation = `1/4 is 0.25. Half of 0.25 is 0.125. Thus, 1/8 = 0.125.`;
        bloomLevel = 'Remembering';
      }
    }
  }

  // Ensure options are populated even if MCQ questions missed them
  if (type === 'MCQ' && (!options || options.length === 0)) {
    options = ['Option A', 'Option B', 'Option C', 'Option D'];
    correctAnswer = 'Option A';
  }

  const details = getCurriculumDetails(
    grade,
    curriculum,
    category,
    subcategory,
    difficulty,
    correctAnswer,
    explanation
  );

  return {
    id,
    grade,
    curriculum,
    category,
    subcategory: details.topic,
    standardCode: details.standardCode || standardCode,
    difficulty,
    type,
    text,
    hint,
    explanation: details.stepByStepExplanation,
    estimatedTime,
    bloomLevel,
    tags,
    skillId,
    conceptId,
    options,
    correctAnswer,
    visualData,
    
    // Strict Curriculum Alignment Fields
    lesson: details.lesson,
    topic: details.topic,
    learningObjective: details.learningObjective,
    solution: details.solution,
    stepByStepExplanation: details.stepByStepExplanation,
    commonMisconception: details.commonMisconception,
    skillsTested: details.skillsTested,
    prerequisiteConcepts: details.prerequisiteConcepts
  };
}

// Curriculum-alignment Helper Function
function getCurriculumDetails(
  grade: Grade,
  curriculum: CurriculumType,
  category: string,
  subcategory: string,
  difficulty: Difficulty,
  correctAnswer: any,
  explanation: string
) {
  // Establish baseline default structures
  let lesson = subcategory || 'Core Mathematical Practice';
  let topic = category;
  let learningObjective = `Master the concept of ${subcategory || category} at a ${difficulty} difficulty.`;
  let solution = String(correctAnswer);
  let stepByStepExplanation = explanation;
  let commonMisconception = 'Failing to double check working or swapping operational order.';
  let skillsTested = [category.toLowerCase().replace(/\s+/g, '-'), 'accuracy'];
  let prerequisiteConcepts = ['foundational-counting', 'basic-arithmetic'];
  let standardCode = '';

  const isUS = curriculum === 'US';

  if (isUS) {
    if (grade === 1) {
      if (category.includes('Number Sense')) {
        standardCode = 'CCSS.Math.Content.1.NBT.B.2';
        lesson = 'Understanding Place Value (Tens and Ones)';
        topic = 'Number Sense & Place Value';
        learningObjective = 'Understand that the two digits of a two-digit number represent amounts of tens and ones.';
        commonMisconception = 'Confusing the position of tens and ones (e.g. interpreting 51 as 1 ten and 5 ones).';
        skillsTested = ['place-value-identification', 'tens-and-ones'];
        prerequisiteConcepts = ['counting-to-20'];
      } else if (category.includes('Operations') || category.includes('Algebra')) {
        standardCode = 'CCSS.Math.Content.1.OA.A.1';
        lesson = 'Addition and Subtraction within 20';
        topic = 'Operations & Algebraic Thinking';
        learningObjective = 'Solve addition and subtraction word problems within 20 with unknowns in all positions.';
        commonMisconception = 'Misapplying operation (e.g. adding when subtracting is required because of words like "more").';
        skillsTested = ['equations-with-unknowns', 'add-sub-to-20'];
        prerequisiteConcepts = ['counting-on'];
      } else if (category.includes('Fraction') || category.includes('Rational')) {
        standardCode = 'CCSS.Math.Content.1.G.A.3';
        lesson = 'Partitioning Shapes into Halves & Fourths';
        topic = 'Fractions, Decimals & Rational Numbers';
        learningObjective = 'Partition circles and rectangles into two and four equal shares, describe the shares using halves, fourths, and quarters.';
        commonMisconception = 'Believing split pieces represent fractions even when they are unequal in size.';
        skillsTested = ['fraction-models', 'halves-and-fourths'];
        prerequisiteConcepts = ['identifying-shapes'];
      } else if (category.includes('Measurement') || category.includes('Data')) {
        standardCode = 'CCSS.Math.Content.1.MD.B.3';
        lesson = 'Telling Time to the Hour & Half-Hour';
        topic = 'Measurement & Data';
        learningObjective = 'Tell and write time in hours and half-hours using analog and digital clocks.';
        commonMisconception = 'Confusing the long hand (minutes) with the short hand (hours).';
        skillsTested = ['clock-reading', 'time-to-hour'];
        prerequisiteConcepts = ['reading-numbers-1-12'];
      }
    } else if (grade === 2) {
      if (category.includes('Number Sense')) {
        standardCode = 'CCSS.Math.Content.2.NBT.A.1';
        lesson = 'Three-Digit Place Value to 1,000';
        topic = 'Number Sense & Place Value';
        learningObjective = 'Understand that the three digits of a three-digit number represent amounts of hundreds, tens, and ones.';
        commonMisconception = 'Writing 300405 for "three hundred forty-five" instead of 345.';
        skillsTested = ['expanded-form', 'place-value-to-1000'];
        prerequisiteConcepts = ['tens-and-ones'];
      } else if (category.includes('Operations') || category.includes('Algebra')) {
        standardCode = 'CCSS.Math.Content.2.NBT.B.5';
        lesson = 'Addition & Subtraction within 1,000';
        topic = 'Operations & Algebraic Thinking';
        learningObjective = 'Fluently add and subtract within 100 using strategies based on place value.';
        commonMisconception = 'Forgetting to carry over or borrow when performing column subtraction or addition.';
        skillsTested = ['column-addition', 'regrouping'];
        prerequisiteConcepts = ['addition-within-20'];
      } else if (category.includes('Fraction') || category.includes('Rational')) {
        standardCode = 'CCSS.Math.Content.2.G.A.3';
        lesson = 'Partitioning into Halves, Thirds, and Fourths';
        topic = 'Fractions, Decimals & Rational Numbers';
        learningObjective = 'Partition circles and rectangles into two, three, or four equal shares, and describe as halves, thirds, or fourths.';
        commonMisconception = 'Thinking that equal area parts of a shape must look identical in shape.';
        skillsTested = ['shape-partitioning', 'fractional-shares'];
        prerequisiteConcepts = ['halves-and-fourths'];
      } else if (category.includes('Measurement') || category.includes('Data')) {
        standardCode = 'CCSS.Math.Content.2.MD.C.8';
        lesson = 'Working with Money & Time';
        topic = 'Measurement & Data';
        learningObjective = 'Solve word problems involving dollar bills, quarters, dimes, nickels, and pennies.';
        commonMisconception = 'Treating nickels as worth more than dimes due to their larger physical size.';
        skillsTested = ['coin-counting', 'money-word-problems'];
        prerequisiteConcepts = ['skip-counting'];
      }
    } else if (grade === 3) {
      if (category.includes('Number Sense')) {
        standardCode = 'CCSS.Math.Content.3.NBT.A.1';
        lesson = 'Rounding to Nearest 10 and 100';
        topic = 'Number Sense & Place Value';
        learningObjective = 'Use place value understanding to round whole numbers to the nearest 10 or 100.';
        commonMisconception = 'Rounding down instead of up when the digit in the ones or tens place is exactly 5.';
        skillsTested = ['rounding', 'estimation'];
        prerequisiteConcepts = ['three-digit-place-value'];
      } else if (category.includes('Operations') || category.includes('Algebra')) {
        standardCode = 'CCSS.Math.Content.3.OA.A.1';
        lesson = 'Multiplication & Division Concepts';
        topic = 'Operations & Algebraic Thinking';
        learningObjective = 'Interpret products of whole numbers (e.g. 5 x 7 as 5 groups of 7 objects).';
        commonMisconception = 'Confusing multiplication with addition (e.g. calculating 3 x 4 as 3 + 4 = 7).';
        skillsTested = ['equal-groups', 'array-multiplication'];
        prerequisiteConcepts = ['repeated-addition'];
      } else if (category.includes('Fraction') || category.includes('Rational')) {
        standardCode = 'CCSS.Math.Content.3.NF.A.2';
        lesson = 'Understanding Fractions on Number Lines';
        topic = 'Fractions, Decimals & Rational Numbers';
        learningObjective = 'Represent a fraction a/b on a number line diagram by marking off length 1/b from 0.';
        commonMisconception = 'Viewing numerator and denominator as two independent whole numbers rather than a single ratio.';
        skillsTested = ['number-line-fractions', 'numerator-denominator'];
        prerequisiteConcepts = ['shape-partitioning'];
      } else if (category.includes('Measurement') || category.includes('Data')) {
        standardCode = 'CCSS.Math.Content.3.MD.C.5';
        lesson = 'Concepts of Area and Perimeter';
        topic = 'Measurement & Data';
        learningObjective = 'Understand area as an attribute of plane figures and measure area by counting unit squares.';
        commonMisconception = 'Confusing perimeter (the outline distance) with area (the interior region).';
        skillsTested = ['area-measurement', 'perimeter-calculation'];
        prerequisiteConcepts = ['addition-multiplication'];
      }
    } else if (grade === 4) {
      if (category.includes('Number Sense')) {
        standardCode = 'CCSS.Math.Content.4.NBT.A.1';
        lesson = 'Multi-Digit Place Value to 1,000,000';
        topic = 'Number Sense & Place Value';
        learningObjective = 'Recognize that in a multi-digit whole number, a digit in one place represents ten times what it represents in the place to its right.';
        commonMisconception = 'Thinking that a digit has the same value regardless of what column it is placed in.';
        skillsTested = ['large-number-reading', 'place-value-scaling'];
        prerequisiteConcepts = ['rounding-to-100'];
      } else if (category.includes('Operations') || category.includes('Algebra')) {
        standardCode = 'CCSS.Math.Content.4.NBT.B.5';
        lesson = 'Multi-Digit Multiplication & Long Division';
        topic = 'Operations & Algebraic Thinking';
        learningObjective = 'Multiply a whole number of up to four digits by a one-digit whole number, and find whole-number quotients and remainders.';
        commonMisconception = 'Ignoring or discarding the remainder in real-world division problems.';
        skillsTested = ['long-division', 'multi-digit-multiplication'];
        prerequisiteConcepts = ['multiplication-facts'];
      } else if (category.includes('Fraction') || category.includes('Rational')) {
        standardCode = 'CCSS.Math.Content.4.NF.A.1';
        lesson = 'Equivalent Fractions & Decimal Notation';
        topic = 'Fractions, Decimals & Rational Numbers';
        learningObjective = 'Explain why a fraction a/b is equivalent to a fraction (n x a)/(n x b) by using visual fraction models.';
        commonMisconception = 'Thinking 0.4 is smaller than 0.15 because 4 is smaller than 15 (ignoring place value).';
        skillsTested = ['equivalent-fractions', 'decimals-to-hundredths'];
        prerequisiteConcepts = ['number-line-fractions'];
      } else if (category.includes('Measurement') || category.includes('Data')) {
        standardCode = 'CCSS.Math.Content.4.MD.C.5';
        lesson = 'Angles, Lines, and Symmetry';
        topic = 'Measurement & Data';
        learningObjective = 'Recognize angles as geometric shapes formed wherever two rays share a common endpoint.';
        commonMisconception = 'Believing that the size of an angle changes when the lengths of its drawn rays are extended.';
        skillsTested = ['angle-measurement', 'unit-conversions'];
        prerequisiteConcepts = ['protractor-use'];
      }
    } else if (grade === 5) {
      if (category.includes('Number Sense')) {
        standardCode = 'CCSS.Math.Content.5.NBT.A.1';
        lesson = 'Decimal Place Value and Powers of Ten';
        topic = 'Number Sense & Place Value';
        learningObjective = 'Understand decimal place value down to thousandths and use powers of ten exponents.';
        commonMisconception = 'Thinking that multiplying a decimal by 10^3 means simply appending three zeros (e.g. 1.25 x 10^3 = 1.25000 instead of 1250).';
        skillsTested = ['powers-of-ten', 'decimal-place-value'];
        prerequisiteConcepts = ['decimals-to-hundredths'];
      } else if (category.includes('Operations') || category.includes('Algebra')) {
        standardCode = 'CCSS.Math.Content.5.NBT.B.7';
        lesson = 'Multi-Digit Decimal Operations & Order of Operations';
        topic = 'Operations & Algebraic Thinking';
        learningObjective = 'Add, subtract, multiply, and divide decimals to hundredths using concrete models or drawings.';
        commonMisconception = 'Failing to line up the decimal point when adding or subtracting columns.';
        skillsTested = ['decimal-operations', 'order-of-operations'];
        prerequisiteConcepts = ['long-division'];
      } else if (category.includes('Fraction') || category.includes('Rational')) {
        standardCode = 'CCSS.Math.Content.5.NF.A.1';
        lesson = 'Adding and Subtracting Fractions with Unlike Denominators';
        topic = 'Fractions, Decimals & Rational Numbers';
        learningObjective = 'Add and subtract fractions with unlike denominators by replacing given fractions with equivalent fractions.';
        commonMisconception = 'Adding the numerators and denominators straight across (e.g. 1/2 + 1/3 = 2/5).';
        skillsTested = ['unlike-denominators', 'fraction-addition'];
        prerequisiteConcepts = ['equivalent-fractions'];
      } else if (category.includes('Measurement') || category.includes('Data')) {
        standardCode = 'CCSS.Math.Content.5.MD.C.3';
        lesson = 'Volume Concepts & First Quadrant Coordinate Graphing';
        topic = 'Measurement & Data';
        learningObjective = 'Recognize volume as an attribute of solid figures and graph points in the first quadrant of the coordinate plane.';
        commonMisconception = 'Transposing x and y coordinates when plotting points (e.g., graphing (2, 4) as (4, 2)).';
        skillsTested = ['volume-measurement', 'coordinate-graphing'];
        prerequisiteConcepts = ['area-measurement'];
      }
    } else if (grade === 6) {
      if (category.includes('Number Sense')) {
        standardCode = 'CCSS.Math.Content.6.NS.C.5';
        lesson = 'Integers & Rational Numbers';
        topic = 'Number Sense & Place Value';
        learningObjective = 'Understand positive and negative numbers to represent quantities and place them on rational number lines.';
        commonMisconception = 'Believing that -10 is greater than -2 because 10 is greater than 2.';
        skillsTested = ['integers-ordering', 'negative-numbers'];
        prerequisiteConcepts = ['decimal-place-value'];
      } else if (category.includes('Operations') || category.includes('Algebra')) {
        standardCode = 'CCSS.Math.Content.6.EE.A.2';
        lesson = 'Algebraic Expressions & One-Variable Equations';
        topic = 'Operations & Algebraic Thinking';
        learningObjective = 'Write, read, and evaluate expressions in which letters stand for numbers, and solve simple equations.';
        commonMisconception = 'Interpreting "3x" as thirty-something (e.g. x=5 implies 35) instead of 3 multiplied by x.';
        skillsTested = ['evaluating-expressions', 'one-variable-equations'];
        prerequisiteConcepts = ['order-of-operations'];
      } else if (category.includes('Fraction') || category.includes('Rational') || category.includes('Ratios')) {
        standardCode = 'CCSS.Math.Content.6.RP.A.1';
        lesson = 'Understanding Ratios & Unit Rates';
        topic = 'Fractions, Decimals & Rational Numbers';
        learningObjective = 'Understand the concept of a ratio and use ratio language to describe a ratio relationship between two quantities.';
        commonMisconception = 'Confusing part-to-part ratios with part-to-whole fractions.';
        skillsTested = ['ratio-analysis', 'unit-rates'];
        prerequisiteConcepts = ['unlike-denominators'];
      } else if (category.includes('Measurement') || category.includes('Data') || category.includes('Geometry')) {
        standardCode = 'CCSS.Math.Content.6.G.A.1';
        lesson = 'Area, Surface Area, Volume & Statistical Distributions';
        topic = 'Measurement & Data';
        learningObjective = 'Find area of right triangles, other triangles, and polygons by composing into rectangles or decomposing.';
        commonMisconception = 'Using the side/slant length instead of the perpendicular vertical height to calculate the area of triangles.';
        skillsTested = ['area-of-triangles', 'data-distributions'];
        prerequisiteConcepts = ['volume-measurement'];
      }
    } else if (grade === 7) {
      if (category.includes('Number Sense')) {
        standardCode = 'CCSS.Math.Content.7.NS.A.1';
        lesson = 'Operations with Rational Numbers';
        topic = 'Number Sense & Place Value';
        learningObjective = 'Apply and extend previous understandings of addition and subtraction to add and subtract rational numbers.';
        commonMisconception = 'Incorrectly applying signs (e.g., thinking a negative plus a negative is a positive).';
        skillsTested = ['rational-operations', 'negative-fractions'];
        prerequisiteConcepts = ['integers-ordering'];
      } else if (category.includes('Operations') || category.includes('Algebra')) {
        standardCode = 'CCSS.Math.Content.7.EE.B.4';
        lesson = 'Multi-Step Linear Equations & Inequalities';
        topic = 'Operations & Algebraic Thinking';
        learningObjective = 'Solve word problems leading to equations of the form px + q = r and simple inequalities.';
        commonMisconception = 'Forgetting to reverse the inequality sign when multiplying or dividing both sides by a negative number.';
        skillsTested = ['multi-step-equations', 'linear-inequalities'];
        prerequisiteConcepts = ['one-variable-equations'];
      } else if (category.includes('Fraction') || category.includes('Rational') || category.includes('Ratios')) {
        standardCode = 'CCSS.Math.Content.7.RP.A.2';
        lesson = 'Proportional Relationships & Percents';
        topic = 'Fractions, Decimals & Rational Numbers';
        learningObjective = 'Identify and represent proportional relationships between quantities and calculate percentages.';
        commonMisconception = 'Failing to construct proper equal proportions (e.g., swapping numerators and denominators in ratios).';
        skillsTested = ['proportional-reasoning', 'percent-equations'];
        prerequisiteConcepts = ['ratio-analysis'];
      } else if (category.includes('Measurement') || category.includes('Data') || category.includes('Geometry')) {
        standardCode = 'CCSS.Math.Content.7.G.B.4';
        lesson = 'Circle Geometry, Scale Drawings & Sampling';
        topic = 'Measurement & Data';
        learningObjective = 'Know the formulas for the area and circumference of a circle and use them to solve problems.';
        commonMisconception = 'Confusing radius and diameter in circumference and area formulas (e.g., using diameter in pi*r^2).';
        skillsTested = ['circle-area', 'scale-drawings'];
        prerequisiteConcepts = ['area-of-triangles'];
      }
    } else if (grade === 8) {
      if (category.includes('Number Sense')) {
        standardCode = 'CCSS.Math.Content.8.NS.A.1';
        lesson = 'Real Numbers, Radicals & Exponents';
        topic = 'Number Sense & Place Value';
        learningObjective = 'Understand that numbers that are not rational are irrational, and use radical signs and square roots.';
        commonMisconception = 'Thinking that a negative exponent makes the term negative (e.g., 3^-2 = -9 instead of 1/9).';
        skillsTested = ['integer-exponents', 'irrational-numbers'];
        prerequisiteConcepts = ['rational-operations'];
      } else if (category.includes('Operations') || category.includes('Algebra')) {
        standardCode = 'CCSS.Math.Content.8.EE.C.8';
        lesson = 'Solving Systems of Linear Equations';
        topic = 'Operations & Algebraic Thinking';
        learningObjective = 'Analyze and solve pairs of simultaneous linear equations, finding intersections.';
        commonMisconception = 'Believing a system of equations must always have exactly one solution, ignoring parallel line cases.';
        skillsTested = ['simultaneous-equations', 'linear-systems'];
        prerequisiteConcepts = ['multi-step-equations'];
      } else if (category.includes('Fraction') || category.includes('Rational') || category.includes('Ratios') || category.includes('Functions')) {
        standardCode = 'CCSS.Math.Content.8.F.A.1';
        lesson = 'Defining and Evaluating Functions';
        topic = 'Fractions, Decimals & Rational Numbers';
        learningObjective = 'Understand that a function is a rule that assigns to each input exactly one output.';
        commonMisconception = 'Assuming all linear-looking graphs represent a valid function without testing inputs.';
        skillsTested = ['function-definition', 'linear-functions'];
        prerequisiteConcepts = ['proportional-reasoning'];
      } else if (category.includes('Measurement') || category.includes('Data') || category.includes('Geometry')) {
        standardCode = 'CCSS.Math.Content.8.G.B.7';
        lesson = 'Pythagorean Theorem, Transformations & Sphere/Cone Volume';
        topic = 'Measurement & Data';
        learningObjective = 'Apply the Pythagorean Theorem to determine unknown side lengths in right triangles in real-world problems.';
        commonMisconception = 'Applying the Pythagorean Theorem to triangles that do not contain a 90-degree right angle.';
        skillsTested = ['pythagorean-theorem', 'geometric-transformations'];
        prerequisiteConcepts = ['circle-area'];
      }
    } else if (grade === 9) {
      if (category.includes('Number Sense')) {
        standardCode = 'CCSS.Math.Content.HSN.RN.A.1';
        lesson = 'Rational Exponents & Radical Expressions';
        topic = 'Number Sense & Place Value';
        learningObjective = 'Explain how the definition of the meaning of rational exponents follows from extending the properties of integer exponents.';
        commonMisconception = 'Mistaking a fractional exponent like x^(1/2) for x/2 instead of square root of x.';
        skillsTested = ['rational-exponents', 'radical-simplification'];
        prerequisiteConcepts = ['integer-exponents'];
      } else if (category.includes('Operations') || category.includes('Algebra')) {
        standardCode = 'CCSS.Math.Content.HSA.SSE.B.3';
        lesson = 'Polynomial Operations & Factoring Quadratics';
        topic = 'Operations & Algebraic Thinking';
        learningObjective = 'Choose and produce an equivalent form of an expression to reveal and explain properties of the quantity represented.';
        commonMisconception = 'Forgetting the middle product term when expanding squared binomials (e.g., expanding (x+3)^2 to x^2 + 9).';
        skillsTested = ['polynomial-operations', 'quadratic-factoring'];
        prerequisiteConcepts = ['simultaneous-equations'];
      } else if (category.includes('Fraction') || category.includes('Rational') || category.includes('Ratios') || category.includes('Functions')) {
        standardCode = 'CCSS.Math.Content.HSF.IF.C.7';
        lesson = 'Linear, Quadratic, & Exponential Functions';
        topic = 'Fractions, Decimals & Rational Numbers';
        learningObjective = 'Graph functions expressed symbolically and show key features of the graph, including intercepts and maximums.';
        commonMisconception = 'Confusing constant additive growth in linear functions with multiplicative growth in exponential functions.';
        skillsTested = ['graphing-functions', 'exponential-models'];
        prerequisiteConcepts = ['function-definition'];
      } else if (category.includes('Measurement') || category.includes('Data') || category.includes('Geometry')) {
        standardCode = 'CCSS.Math.Content.HSG.GPE.B.4';
        lesson = 'Coordinate Geometry Proofs & Statistical Modeling';
        topic = 'Measurement & Data';
        learningObjective = 'Use coordinates to prove simple geometric theorems algebraically, and model statistical lines of fit.';
        commonMisconception = 'Assuming high correlation between two variables implies direct physical causation in statistics.';
        skillsTested = ['coordinate-proofs', 'regression-analysis'];
        prerequisiteConcepts = ['pythagorean-theorem'];
      }
    }
  } else {
    // UK & Europe National Curriculum
    standardCode = `NC.Math.G${grade}.${category.substring(0, 3).toUpperCase()}`;
    if (grade === 1) {
      lesson = 'Place Value within 100 & Number Operations';
      learningObjective = 'Count to and across 100, forwards and backwards, and solve one-step addition problems.';
      commonMisconception = 'Confusing teen number naming conventions (e.g. confusing 13 and 30).';
    } else if (grade === 2) {
      lesson = 'Mental Calculation Fluency & Partitioning';
      learningObjective = 'Solve simple subtraction, addition, and money problems up to 100.';
      commonMisconception = 'Subtracting the smaller digit from the larger digit regardless of order (e.g. 42 - 17 as 35).';
    } else if (grade === 3) {
      lesson = 'Multiplication and Division Recall Facts';
      learningObjective = 'Recall and use multiplication and division facts for the 3, 4 and 8 multiplication tables.';
      commonMisconception = 'Confusing multiplication of zero with multiplication of one (e.g. 5 x 0 = 5).';
    } else if (grade === 4) {
      lesson = 'Equivalent Fractions, Decimals, and Column Methods';
      learningObjective = 'Recognize and write decimal equivalents of any number of tenths or hundredths.';
      commonMisconception = 'Failing to adjust place values when performing addition with digits of different decimal positions.';
    } else if (grade === 5) {
      lesson = 'Proper Fractions, Percentages, and Metric Measures';
      learningObjective = 'Add and subtract fractions with denominators that are multiples of the same number.';
      commonMisconception = 'Failing to convert both fractions to a common denominator before performing operations.';
    } else if (grade === 6) {
      lesson = 'Ratio and Proportion, Algebra, and Geometry';
      learningObjective = 'Solve problems involving the relative sizes of two quantities, algebraic formulas, and areas.';
      commonMisconception = 'Applying ratio equations without scaling all terms by the same multiplication factor.';
    } else if (grade === 7) {
      lesson = 'Integers, Rational arithmetic, and Multi-step equations';
      learningObjective = 'Apply rational operations to negative quantities and handle multi-step algebraic balances.';
      commonMisconception = 'Multiplying two negative integers and incorrectly keeping a negative sign in the product.';
    } else if (grade === 8) {
      lesson = 'Standard Notation, Indices, and Coordinate Graphs';
      learningObjective = 'Apply properties of exponents, scientific notation, and find gradients of linear functions.';
      commonMisconception = 'Interpreting negative indices as representing a negative value instead of division.';
    } else if (grade === 9) {
      lesson = 'Quadratic expansions, Simultaneous systems, and Data modelling';
      learningObjective = 'Expand brackets, factorize trinomials, solve algebraic simultaneous equations, and model statistics.';
      commonMisconception = 'Expanding (x - 2)(x + 3) with incorrect sum signs (e.g. getting x^2 - x - 6 instead of x^2 + x - 6).';
    }
  }

  // Fallbacks
  if (!lesson) lesson = subcategory || 'Core Math Practice';
  if (!topic) topic = category;
  if (!learningObjective) learningObjective = `Fluently evaluate ${subcategory || category} problems.`;
  if (!solution) solution = String(correctAnswer);
  if (!stepByStepExplanation) stepByStepExplanation = explanation;
  if (!commonMisconception) commonMisconception = 'Forgetting to check work or misapplying sequence orders.';
  if (skillsTested.length === 0) skillsTested = [category.toLowerCase().replace(/\s+/g, '-'), `grade-${grade}`];
  if (prerequisiteConcepts.length === 0) prerequisiteConcepts = [`foundational-g${grade - 1 || 1}`];

  return {
    lesson,
    topic,
    learningObjective,
    solution,
    stepByStepExplanation,
    commonMisconception,
    skillsTested,
    prerequisiteConcepts,
    standardCode: standardCode || `CCSS.Math.Content.${grade}.${category.substring(0, 2).toUpperCase()}`
  };
}

// English plurals for numbers
function toyCount(item: string): string {
  return item;
}

// Psychometric Random Paper Selection Engine
// Randomly selects exactly the requested number of questions maintaining 20% Easy, 60% Medium, 20% Hard
export function createRandomizedAssessmentPaper(
  grade: Grade,
  curriculum: CurriculumType
): Question[] {
  const fullPool = generateQuestionPool(grade, curriculum);
  
  // Deduplicate pool to strictly avoid any duplicate questions by text
  const seenTexts = new Set<string>();
  const uniquePool: Question[] = [];
  fullPool.forEach((q) => {
    // Normalize question text to detect duplicate concepts / phrased questions
    const normText = q.text.toLowerCase().replace(/[*_~`#]|<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    if (!seenTexts.has(normText)) {
      seenTexts.add(normText);
      uniquePool.push(q);
    }
  });

  // Group by category
  const categories = Array.from(new Set(uniquePool.map(q => q.category)));
  const paper: Question[] = [];

  // US QUESTION DISTRIBUTION (Total 20 questions)
  // Number Sense: 3, Operations: 4, Fractions: 4, Ratios/Patterns: 3, Measurement: 2, Geometry: 2, Problem Solving: 1, Fluency: 1
  const usDistribution: Record<string, number> = {
    'Number Sense & Place Value': 3,
    'Operations & Algebraic Thinking': 4,
    'Fractions, Decimals & Rational Numbers': 4,
    'Ratios, Proportions & Functions': 3,
    'Patterns & Pre-Algebra': 3,
    'Measurement & Data': 2,
    'Geometry & Spatial Reasoning': 2,
    'Problem Solving & Mathematical Reasoning': 1,
    'Mathematical Fluency': 1
  };

  // UK QUESTION DISTRIBUTION (Total 20 questions)
  // Grades 1-5: Number Sense: 3, Operations: 4, Fractions: 3, Measurement: 3, Geometry: 3, Statistics: 2, Problem Solving: 1, Fluency: 1
  const ukPrimaryDistribution: Record<string, number> = {
    'Number Sense & Place Value': 3,
    'Number Operations & Algebra': 4,
    'Fractions, Decimals & Percentages': 3,
    'Measurement & Applied Mathematics': 3,
    'Geometry & Spatial Reasoning': 3,
    'Statistics & Probability': 2,
    'Problem Solving & Proof': 1,
    'Mathematical Fluency': 1
  };

  // Grades 6-9: Number Sense: 3, Operations: 4, Fractions: 3, Measurement: 2, Geometry: 3, Statistics: 2, Problem Solving: 2, Fluency: 1
  const ukSecondaryDistribution: Record<string, number> = {
    'Number Sense & Place Value': 3,
    'Number Operations & Algebra': 4,
    'Fractions, Decimals & Percentages': 3,
    'Measurement & Applied Mathematics': 2,
    'Geometry & Spatial Reasoning': 3,
    'Statistics & Probability': 2,
    'Problem Solving & Proof': 2,
    'Mathematical Fluency': 1
  };

  const activeDistribution = curriculum === 'US'
    ? usDistribution
    : (grade <= 5 ? ukPrimaryDistribution : ukSecondaryDistribution);

  categories.forEach((cat) => {
    const qty = activeDistribution[cat] || 2;
    const catPool = uniquePool.filter(q => q.category === cat);

    // Filter by difficulty in the pool
    const easyPool = catPool.filter(q => q.difficulty === 'Easy');
    const medPool = catPool.filter(q => q.difficulty === 'Medium');
    const hardPool = catPool.filter(q => q.difficulty === 'Hard');

    // Calculate dynamic counts to preserve 20% / 60% / 20%
    let easyQty = Math.round(qty * 0.20);
    let hardQty = Math.round(qty * 0.20);
    let medQty = qty - (easyQty + hardQty);

    // Safeguards for very low qty (e.g. 1 or 2)
    if (qty === 1) {
      easyQty = 0;
      medQty = 1;
      hardQty = 0;
    } else if (qty === 2) {
      easyQty = 1;
      medQty = 1;
      hardQty = 0;
    }

    // Shuffle each difficulty pool to get randomized selections
    const selectedEasy = shuffleArray(easyPool).slice(0, easyQty);
    const selectedMed = shuffleArray(medPool).slice(0, medQty);
    const selectedHard = shuffleArray(hardPool).slice(0, hardQty);

    let catSelected = [...selectedEasy, ...selectedMed, ...selectedHard];

    // If we didn't get enough questions for this category because a pool was small,
    // fill in from other available difficulties of the same category
    if (catSelected.length < qty) {
      const selectedIds = new Set(catSelected.map(q => q.id));
      const remainingInCat = shuffleArray(catPool.filter(q => !selectedIds.has(q.id)));
      const fillQty = qty - catSelected.length;
      catSelected.push(...remainingInCat.slice(0, fillQty));
    }

    // Add them to our paper
    paper.push(...catSelected);
  });

  // Ensure overall paper has exactly 20 questions
  if (paper.length > 20) {
    // Shuffle and slice to 20
    const shuffledPaper = shuffleArray(paper);
    return shuffledPaper.slice(0, 20);
  } else if (paper.length < 20) {
    const paperIds = new Set(paper.map(q => q.id));
    const extraCandidates = shuffleArray(uniquePool.filter(q => !paperIds.has(q.id)));
    const needed = 20 - paper.length;
    paper.push(...extraCandidates.slice(0, needed));
  }

  // Finally, shuffle the overall question order to guarantee no repeated paper format
  return shuffleArray(paper);
}
