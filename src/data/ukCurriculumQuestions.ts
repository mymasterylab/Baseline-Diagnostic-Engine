import { Question, Grade, Difficulty, QuestionType } from '../types';

// Helper to generate numeric options based on a correct answer
function generateNumericOptions(correct: number, count = 4, step = 1): string[] {
  const options = new Set<string>();
  options.add(String(correct));
  while (options.size < count) {
    const offset = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1) * step;
    const val = correct + offset;
    if (val >= 0) {
      options.add(String(val));
    }
  }
  return Array.from(options).sort((a, b) => Number(a) - Number(b));
}

// Maps Grade to Key Stage and Year string
export function getUKYearName(grade: Grade): string {
  if (grade === 1) return 'Key Stage 1, Year 1';
  if (grade === 2) return 'Key Stage 1, Year 2';
  if (grade === 3) return 'Lower Key Stage 2, Year 3';
  if (grade === 4) return 'Lower Key Stage 2, Year 4';
  if (grade === 5) return 'Upper Key Stage 2, Year 5';
  if (grade === 6) return 'Upper Key Stage 2, Year 6';
  if (grade === 7) return 'Key Stage 3, Year 7';
  if (grade === 8) return 'Key Stage 3, Year 8';
  return 'Key Stage 4, GCSE (Year 9)';
}

export function generateUKQuestion(
  id: string,
  grade: Grade,
  category: string,
  difficulty: Difficulty,
  index: number
): Partial<Question> {
  const yearName = getUKYearName(grade);
  let type: QuestionType = 'MCQ';
  let text = '';
  let hint = '';
  let explanation = '';
  let options: string[] = [];
  let correctAnswer: any = '';
  let visualData: Question['visualData'] = undefined;
  
  // Dynamic National Curriculum Codes
  let standardCode = `NC.Math.Y${grade}.${category.substring(0, 3).toUpperCase().replace(/\s+/g, '')}`;
  let topic = `${yearName} Maths: ${category}`;
  let lesson = `Focus: ${category} Skills`;
  let learningObjective = `Develop fluency, reasoning, and problem-solving skills in ${category}.`;
  let commonMisconception = '';
  let skillsTested: string[] = [];
  let prerequisiteConcepts: string[] = [];

  // Categorised question templates depending on UK National Curriculum
  if (category.includes('Number Sense')) {
    skillsTested = ['place-value', 'counting', 'number-relationships'];
    prerequisiteConcepts = grade > 1 ? [`grade-${grade - 1}-place-value`] : ['counting-to-10'];

    if (grade === 1) {
      learningObjective = 'Count, read, and write numbers to 100 in numerals; identify 1 more and 1 less.';
      commonMisconception = 'Confusing teen numbers like 13 and 30 when reading or writing.';
      if (difficulty === 'Easy') {
        const num = 10 + (index % 10) * 3 + 1;
        text = `What is **1 more** than the number **${num}**?`;
        correctAnswer = String(num + 1);
        options = generateNumericOptions(num + 1);
        hint = `Count forward by one step from ${num}.`;
        explanation = `One more than ${num} is ${num + 1}.`;
      } else if (difficulty === 'Medium') {
        const words = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
        const num = 10 + (index % 11);
        text = `Which numeral represents the word **"${words[num - 10]}"**?`;
        correctAnswer = String(num);
        options = [String(num), String(num + 1), String(num - 1), String(num + 10)];
        hint = `Say the word out loud and think of its number form.`;
        explanation = `The word "${words[num - 10]}" corresponds to the numeral ${num}.`;
      } else {
        text = `Which of these numbers is the **least (smallest)**?`;
        options = ['12', '8', '20', '15'];
        correctAnswer = '8';
        hint = `The least number is the one that comes first when counting from zero.`;
        explanation = `8 is the smallest value among the options.`;
      }
    } else if (grade === 2) {
      learningObjective = 'Recognise the place value of each digit in a two-digit number (10s, 1s); compare numbers using <, > and =.';
      commonMisconception = 'Thinking the digit 7 in 72 has a value of 7 instead of 70 (7 tens).';
      if (difficulty === 'Easy') {
        const num = 20 + (index % 8) * 9 + 4;
        text = `In the number **${num}**, what is the value of the digit **${Math.floor(num / 10)}** in the tens place?`;
        correctAnswer = String(Math.floor(num / 10) * 10);
        options = [correctAnswer, String(Math.floor(num / 10)), String(num % 10), '10'];
        hint = `The tens place shows how many groups of 10 are in the number.`;
        explanation = `The number ${num} has ${Math.floor(num / 10)} tens, which equals ${Math.floor(num / 10) * 10}.`;
      } else if (difficulty === 'Medium') {
        text = `Choose the correct sign to make this statement true: **45 [ ? ] 54**`;
        correctAnswer = '<';
        options = ['<', '>', '='];
        hint = `45 has 4 tens, while 54 has 5 tens.`;
        explanation = `Since 4 tens is less than 5 tens, 45 is less than 54 (45 < 54).`;
      } else {
        text = `Count in steps of **3** from **0**. What is the 5th number in this sequence (excluding 0)?`;
        correctAnswer = '15';
        options = ['12', '15', '18', '21'];
        hint = `The sequence goes 3, 6, 9...`;
        explanation = `The sequence of counting in steps of 3 is: 3, 6, 9, 12, 15... The 5th number is 15.`;
      }
    } else if (grade === 3) {
      learningObjective = 'Recognise the place value of each digit in a 3-digit number (100s, 10s, 1s); compare and order up to 1,000.';
      commonMisconception = 'Misinterpreting the placeholder 0 in three-digit numbers like 405.';
      if (difficulty === 'Easy') {
        const val = 300 + (index % 5) * 120 + 5;
        text = `What is **100 less** than the number **${val}**?`;
        correctAnswer = String(val - 100);
        options = generateNumericOptions(val - 100, 4, 100);
        hint = `Subtract 1 from the hundreds digit of ${val}.`;
        explanation = `${val} minus 100 equals ${val - 100}.`;
      } else if (difficulty === 'Medium') {
        text = `Which digit is in the **hundreds** place in the number **782**?`;
        correctAnswer = '7';
        options = ['7', '8', '2', '700'];
        hint = `The hundreds place is the third digit from the right.`;
        explanation = `In 782, 7 is in the hundreds place (value 700), 8 is in the tens place, and 2 is in the ones place.`;
      } else {
        text = `Order these numbers from **least to greatest**: **402, 420, 240, 204**`;
        correctAnswer = '204, 240, 402, 420';
        options = ['204, 240, 402, 420', '240, 204, 402, 420', '204, 240, 420, 402', '420, 402, 240, 204'];
        hint = `Compare the hundreds first, then tens, then ones.`;
        explanation = `Sorting the numbers: 204 < 240 < 402 < 420.`;
      }
    } else if (grade === 4) {
      learningObjective = 'Round any number to the nearest 10, 100, or 1000; read Roman numerals to 100.';
      commonMisconception = 'Rounding up when the final digit is less than 5, or rounding down when it is 5.';
      if (difficulty === 'Easy') {
        text = `Round **473** to the nearest **100**.`;
        correctAnswer = '500';
        options = ['400', '470', '480', '500'];
        hint = `Look at the tens digit. It is 7, which is 5 or more.`;
        explanation = `Since the tens digit in 473 is 7, we round up to the nearest hundred, which is 500.`;
      } else if (difficulty === 'Medium') {
        text = `What standard number is represented by the Roman numeral **XLVI**?`;
        correctAnswer = '46';
        options = ['46', '66', '56', '36'];
        hint = `XL represents 40 (10 less than 50) and VI represents 6.`;
        explanation = `XL = 40, VI = 6. Together, XLVI equals 46.`;
      } else {
        text = `Count backwards by steps of **5** from **3**. What is the next number below zero?`;
        correctAnswer = '-2';
        options = ['-1', '-2', '-5', '-3'];
        hint = `Subtract 5 from 3: 3 - 5 = ?`;
        explanation = `Starting at 3 and counting back 5 steps reaches -2 (3 - 5 = -2).`;
      }
    } else if (grade === 5) {
      learningObjective = 'Read, write, order, and compare numbers to at least 1,000,000; interpret negative numbers.';
      if (difficulty === 'Easy') {
        text = `What is the value of the digit **8** in the number **852,104**?`;
        correctAnswer = '800,000';
        options = ['800,000', '80,000', '8,000', '800'];
        explanation = `The 8 is in the hundred-thousands place, so its value is 800,000.`;
      } else if (difficulty === 'Medium') {
        text = `Which number represents the Roman numeral **CDXCV**?`;
        correctAnswer = '495';
        options = ['495', '695', '445', '595'];
        explanation = `CD = 400, XC = 90, V = 5. Therefore, CDXCV = 495.`;
      } else {
        text = `The temperature at midnight is **-7°C**. By midday, it rises by **12°C**. What is the midday temperature?`;
        correctAnswer = '5°C';
        options = ['5°C', '-5°C', '19°C', '-19°C'];
        explanation = `-7°C + 12°C = 5°C.`;
      }
    } else if (grade === 6) {
      learningObjective = 'Compare and order numbers up to 10,000,000; calculate intervals across zero.';
      if (difficulty === 'Easy') {
        text = `Round **2,345,678** to the nearest **100,000**.`;
        correctAnswer = '2,300,000';
        options = ['2,300,000', '2,400,000', '2,000,000', '2,350,000'];
        explanation = `The ten-thousands digit is 4, so we round down to 2,300,000.`;
      } else if (difficulty === 'Medium') {
        text = `Calculate the interval (difference) between **-14** and **9** on a number line.`;
        correctAnswer = '23';
        options = ['5', '23', '-5', '13'];
        explanation = `The distance is calculated as 9 - (-14) = 9 + 14 = 23.`;
      } else {
        text = `What is the value of the digit **7** in the number **17,452,089**?`;
        correctAnswer = '7,000,000';
        options = ['7,000,000', '700,000', '70,000', '7,000'];
        explanation = `The digit 7 is in the millions place, so its value is 7,000,000.`;
      }
    } else if (grade === 7) {
      learningObjective = 'Order positive and negative decimals, integers, and fractions; understand inequalities.';
      if (difficulty === 'Easy') {
        text = `Which of the following is true?`;
        correctAnswer = '-8 > -12';
        options = ['-8 > -12', '-8 < -12', '-8 = -12', '-12 > 0'];
        explanation = `On the number line, -8 is to the right of -12, meaning -8 is greater than -12.`;
      } else if (difficulty === 'Medium') {
        text = `Arrange these values in ascending order: **-0.5, -3/4, 0.2, -1**. Which comes first?`;
        correctAnswer = '-1';
        options = ['-1', '-3/4', '-0.5', '0.2'];
        explanation = `Converting to decimals: -3/4 = -0.75. The order from least to greatest is -1, -0.75, -0.5, 0.2. So -1 is first.`;
      } else {
        text = `If **x** is an integer and **-3 < x <= 1**, what is the complete list of possible values for x?`;
        correctAnswer = '-2, -1, 0, 1';
        options = ['-2, -1, 0, 1', '-3, -2, -1, 0, 1', '-2, -1, 0', '-3, -2, -1, 0'];
        explanation = `Since x is strictly greater than -3, it starts at -2. Since it is less than or equal to 1, it includes 1.`;
      }
    } else if (grade === 8) {
      learningObjective = 'Express numbers as a product of prime factors (prime factorisation); understand standard form.';
      if (difficulty === 'Easy') {
        text = `Express **60** as a product of its prime factors in index notation.`;
        correctAnswer = '2² x 3 x 5';
        options = ['2² x 3 x 5', '2 x 3 x 10', '2 x 3² x 5', '4 x 3 x 5'];
        explanation = `60 = 2 x 30 = 2 x 2 x 15 = 2 x 2 x 3 x 5 = 2² x 3 x 5.`;
      } else if (difficulty === 'Medium') {
        text = `Convert **0.00035** into standard form.`;
        correctAnswer = '3.5 x 10⁻⁴';
        options = ['3.5 x 10⁻⁴', '3.5 x 10⁻³', '35 x 10⁻⁵', '0.35 x 10⁻³'];
        explanation = `0.00035 is written in standard form as 3.5 x 10⁻⁴.`;
      } else {
        text = `Calculate **(2 x 10³) x (4 x 10⁵)**. Express your answer in standard form.`;
        correctAnswer = '8 x 10⁸';
        options = ['8 x 10⁸', '8 x 10¹⁵', '6 x 10⁸', '8 x 10²'];
        explanation = `Multiply the numbers: 2 x 4 = 8. Add powers: 3 + 5 = 8. Result is 8 x 10⁸.`;
      }
    } else {
      learningObjective = 'Apply and interpret limits of accuracy, including upper and lower bounds.';
      if (difficulty === 'Easy') {
        text = `A fence is measured as **15 m** long to the nearest metre. What is the **lower bound** of its length?`;
        correctAnswer = '14.5 m';
        options = ['14.5 m', '14.9 m', '15.5 m', '14.0 m'];
        explanation = `The half-unit interval is 0.5m. The lower bound is 15 - 0.5 = 14.5 m.`;
      } else if (difficulty === 'Medium') {
        text = `The mass of a box is **4.3 kg**, correct to 1 decimal place. What is the **upper bound** of its mass?`;
        correctAnswer = '4.35 kg';
        options = ['4.35 kg', '4.4 kg', '4.25 kg', '4.39 kg'];
        explanation = `The level of accuracy is 0.1 kg. The half-unit is 0.05 kg. The upper bound is 4.3 + 0.05 = 4.35 kg.`;
      } else {
        text = `A rectangle has width **a = 10 cm** (nearest cm) and height **b = 5 cm** (nearest cm). What is the **lower bound** for the area of the rectangle?`;
        correctAnswer = '42.75 cm²';
        options = ['42.75 cm²', '50 cm²', '47.5 cm²', '40.25 cm²'];
        explanation = `Lower bound of a = 9.5 cm. Lower bound of b = 4.5 cm. Lower bound of area = 9.5 x 4.5 = 42.75 cm².`;
      }
    }
  } else if (category.includes('Operations & Algebra')) {
    skillsTested = ['algebraic-manipulation', 'arithmetic-operations', 'equations'];
    prerequisiteConcepts = grade > 1 ? [`grade-${grade - 1}-operations`] : ['addition-subtraction-to-10'];

    if (grade === 1) {
      learningObjective = 'Represent and use number bonds and related subtraction facts within 20; solve missing number problems.';
      commonMisconception = 'Thinking subtraction can be done in any order (commutative), like addition.';
      if (difficulty === 'Easy') {
        const a = 12 + (index % 5);
        text = `Solve the missing number problem: **${a} + ? = 20**`;
        correctAnswer = String(20 - a);
        options = generateNumericOptions(20 - a);
        explanation = `Since ${a} + ${20 - a} = 20, the missing number is ${20 - a}.`;
      } else if (difficulty === 'Medium') {
        text = `Which subtraction sentence is related to **8 + 7 = 15**?`;
        correctAnswer = '15 - 7 = 8';
        options = ['15 - 7 = 8', '8 - 7 = 15', '15 - 8 = 10', '8 - 15 = 7'];
        explanation = `Addition and subtraction are inverse operations. 15 - 7 = 8 is directly related to 8 + 7 = 15.`;
      } else {
        text = `Solve the missing number problem: **? - 6 = 11**`;
        correctAnswer = '17';
        options = ['17', '5', '15', '18'];
        explanation = `Add 6 to 11 to find the missing start value: 11 + 6 = 17.`;
      }
    } else if (grade === 2) {
      learningObjective = 'Recall and use addition and subtraction facts to 20 fluently, and derive related facts up to 100; add 3 one-digit numbers.';
      if (difficulty === 'Easy') {
        text = `Add these three numbers: **4 + 9 + 6 = ?**`;
        correctAnswer = '19';
        options = ['19', '15', '17', '21'];
        hint = `Try grouping 4 and 6 first to make 10, then add 9.`;
        explanation = `4 + 6 = 10. Then 10 + 9 = 19. Making 10 is an efficient strategy!`;
      } else if (difficulty === 'Medium') {
        text = `If we know **3 + 7 = 10**, what is the related fact for tens?`;
        correctAnswer = '30 + 70 = 100';
        options = ['30 + 70 = 100', '30 + 70 = 90', '13 + 17 = 100', '3 + 70 = 73'];
        explanation = `Using place value facts, 3 tens (30) + 7 tens (70) = 10 tens (100).`;
      } else {
        text = `Solve for the missing number: **54 + ? = 100**`;
        correctAnswer = '46';
        options = ['46', '56', '44', '36'];
        explanation = `Subtract 54 from 100: 100 - 54 = 46.`;
      }
    } else if (grade === 3) {
      learningObjective = 'Recall and use multiplication and division facts for the 3, 4 and 8 multiplication tables.';
      if (difficulty === 'Easy') {
        text = `Calculate: **8 x 4 = ?**`;
        correctAnswer = '32';
        options = ['32', '28', '36', '40'];
        explanation = `Using the 4 or 8 times table, 8 x 4 = 32.`;
      } else if (difficulty === 'Medium') {
        text = `Divide: **24 ÷ 3 = ?**`;
        correctAnswer = '8';
        options = ['8', '6', '7', '9'];
        explanation = `Since 3 x 8 = 24, 24 ÷ 3 = 8.`;
      } else {
        text = `Calculate: **12 x 8 = ?**`;
        correctAnswer = '96';
        options = ['96', '88', '84', '104'];
        explanation = `Using the 8 times table, 12 x 8 = 96.`;
      }
    } else if (grade === 4) {
      learningObjective = 'Recall multiplication facts up to 12 x 12; use factor pairs and commutativity.';
      if (difficulty === 'Easy') {
        text = `Which of these is a **factor pair** for the number **24**?`;
        correctAnswer = '4 and 6';
        options = ['4 and 6', '5 and 4', '3 and 9', '2 and 14'];
        explanation = `Since 4 x 6 = 24, 4 and 6 are a factor pair of 24.`;
      } else if (difficulty === 'Medium') {
        text = `Calculate: **3 x 6 x 5 = ?**`;
        correctAnswer = '90';
        options = ['90', '75', '80', '105'];
        hint = `Using commutativity, multiply 2 of the numbers first to make a simpler step (e.g. 6 x 5 = 30, then 30 x 3).`;
        explanation = `6 x 5 = 30. Then 3 x 30 = 90.`;
      } else {
        text = `Use short multiplication to calculate: **143 x 6 = ?**`;
        correctAnswer = '858';
        options = ['858', '848', '868', '758'];
        explanation = `143 x 6 = (100 x 6) + (40 x 6) + (3 x 6) = 600 + 240 + 18 = 858.`;
      }
    } else if (grade === 5) {
      learningObjective = 'Identify prime numbers, prime factors, and square/cube numbers.';
      if (difficulty === 'Easy') {
        text = `Which of the following is a **prime number**?`;
        correctAnswer = '17';
        options = ['15', '17', '21', '9'];
        explanation = `A prime number has exactly two factors: 1 and itself. 17 is prime, while 15, 21, and 9 are composite.`;
      } else if (difficulty === 'Medium') {
        text = `Calculate: **5² + 2³ = ?**`;
        correctAnswer = '33';
        options = ['33', '29', '19', '31'];
        explanation = `5² (5 squared) = 25. 2³ (2 cubed) = 8. 25 + 8 = 33.`;
      } else {
        text = `What are the **common factors** of **12** and **18**?`;
        correctAnswer = '1, 2, 3, 6';
        options = ['1, 2, 3, 6', '1, 2, 3', '2, 3, 6', '1, 2, 3, 4, 6'];
        explanation = `Factors of 12: 1, 2, 3, 4, 6, 12. Factors of 18: 1, 2, 3, 6, 9, 18. Common factors are 1, 2, 3, and 6.`;
      }
    } else if (grade === 6) {
      learningObjective = 'Use the order of operations (BIDMAS) to carry out calculations; write simple formulae.';
      if (difficulty === 'Easy') {
        text = `Calculate using **BIDMAS**: **12 - 3 x 2 = ?**`;
        correctAnswer = '6';
        options = ['6', '18', '9', '15'];
        hint = `Multiplication (M) must be done before Subtraction (S) under BIDMAS rules.`;
        explanation = `Perform multiplication first: 3 x 2 = 6. Then subtract from 12: 12 - 6 = 6.`;
      } else if (difficulty === 'Medium') {
        text = `Using BIDMAS, evaluate: **(4 + 6) x 3 - 5 = ?**`;
        correctAnswer = '25';
        options = ['25', '17', '19', '35'];
        explanation = `Brackets first: 4 + 6 = 10. Then multiplication: 10 x 3 = 30. Then subtraction: 30 - 5 = 25.`;
      } else {
        text = `A taxi charges a fixed fee of **£3** plus **£2 per mile (m)**. Which formula gives the total cost **C**?`;
        correctAnswer = 'C = 2m + 3';
        options = ['C = 2m + 3', 'C = 3m + 2', 'C = 2(m + 3)', 'C = m + 5'];
        explanation = `Cost C is £2 multiplied by miles (2m) plus the fixed charge of £3, so C = 2m + 3.`;
      }
    } else if (grade === 7) {
      learningObjective = 'Simplify algebraic expressions by collecting like terms; expand single brackets.';
      if (difficulty === 'Easy') {
        text = `Simplify: **3a + 4b + 2a - b**`;
        correctAnswer = '5a + 3b';
        options = ['5a + 3b', '5a + 5b', '6a - 3b', '5a - 3b'];
        explanation = `Group like terms: (3a + 2a) + (4b - b) = 5a + 3b.`;
      } else if (difficulty === 'Medium') {
        text = `Expand the single bracket: **3(x - 4)**`;
        correctAnswer = '3x - 12';
        options = ['3x - 12', '3x - 4', '3x + 12', 'x - 12'];
        explanation = `Multiply 3 by both terms inside the bracket: 3 * x = 3x and 3 * (-4) = -12. Result is 3x - 12.`;
      } else {
        text = `Solve the equation: **4x + 7 = 31**`;
        correctAnswer = '6';
        options = ['6', '8', '5', '7.5'];
        explanation = `Subtract 7 from both sides: 4x = 24. Divide by 4: x = 6.`;
      }
    } else if (grade === 8) {
      learningObjective = 'Expand and simplify double brackets; solve simultaneous equations.';
      if (difficulty === 'Easy') {
        text = `Expand and simplify: **(x + 3)(x + 5)**`;
        correctAnswer = 'x² + 8x + 15';
        options = ['x² + 8x + 15', 'x² + 15', 'x² + 15x + 8', 'x² + 2x + 15'];
        explanation = `Expand using FOIL: x*x + x*5 + 3*x + 3*5 = x² + 5x + 3x + 15 = x² + 8x + 15.`;
      } else if (difficulty === 'Medium') {
        text = `Solve the equation: **3(2x - 1) = 4x + 7**`;
        correctAnswer = '5';
        options = ['5', '4', '6', '3'];
        explanation = `Expand left: 6x - 3 = 4x + 7. Subtract 4x: 2x - 3 = 7. Add 3: 2x = 10. Divide by 2: x = 5.`;
      } else {
        text = `If **y** is directly proportional to **x**, and **y = 20** when **x = 4**, find y when **x = 6**.`;
        correctAnswer = '30';
        options = ['30', '24', '40', '26'];
        explanation = `Proportionality equation: y = kx => 20 = k * 4 => k = 5. Therefore, when x = 6, y = 5 * 6 = 30.`;
      }
    } else {
      learningObjective = 'Factorise quadratic expressions ax² + bx + c; solve linear inequalities.';
      if (difficulty === 'Easy') {
        text = `Factorise the quadratic expression: **x² - 9**`;
        correctAnswer = '(x - 3)(x + 3)';
        options = ['(x - 3)(x + 3)', '(x - 3)²', '(x + 3)²', '(x - 9)(x + 1)'];
        explanation = `This is a difference of two squares: a² - b² = (a - b)(a + b). x² - 9 = (x - 3)(x + 3).`;
      } else if (difficulty === 'Medium') {
        text = `Solve the inequality: **5x - 3 > 2x + 9**`;
        correctAnswer = 'x > 4';
        options = ['x > 4', 'x < 4', 'x > 2', 'x < 2'];
        explanation = `Subtract 2x: 3x - 3 > 9. Add 3: 3x > 12. Divide by 3: x > 4.`;
      } else {
        text = `Solve the simultaneous equations: **y = 2x + 1** and **x² + y = 4** for positive x.`;
        correctAnswer = 'x = 1, y = 3';
        options = ['x = 1, y = 3', 'x = 2, y = 5', 'x = 3, y = 7', 'x = 1.5, y = 4'];
        explanation = `Substitute y: x² + 2x + 1 = 4 => x² + 2x - 3 = 0 => (x + 3)(x - 1) = 0. Positive solution: x = 1. Since y = 2x + 1, y = 3.`;
      }
    }
  } else if (category.includes('Fractions')) {
    skillsTested = ['fraction-operations', 'decimals', 'percentages'];
    prerequisiteConcepts = grade > 1 ? [`grade-${grade - 1}-fractions`] : ['sharing-concepts'];

    if (grade === 1) {
      learningObjective = 'Recognise, find and name a half (1/2) and a quarter (1/4) of a shape or quantity.';
      commonMisconception = 'Thinking parts are halves or quarters even if they are unequal sizes.';
      if (difficulty === 'Easy') {
        text = `If we share **12 sweets** equally into **2 equal parts**, how many sweets are in each half?`;
        correctAnswer = '6';
        options = ['6', '4', '8', '3'];
        explanation = `Half of 12 is 12 divided by 2, which is 6.`;
      } else if (difficulty === 'Medium') {
        text = `What fraction of the circle is shaded when it is cut into **4 equal parts** and **1 part** is shaded?`;
        correctAnswer = '1/4';
        options = ['1/4', '1/2', '3/4', '1/3'];
        explanation = `1 shaded part out of 4 equal parts is represented by the fraction 1/4.`;
      } else {
        text = `Find **one quarter (1/4)** of **8 apples**.`;
        correctAnswer = '2';
        options = ['2', '4', '1', '3'];
        explanation = `A quarter of 8 is 8 divided by 4, which is 2.`;
      }
    } else if (grade === 2) {
      learningObjective = 'Recognise, find, name and write fractions 1/3, 1/4, 2/4 and 3/4 of a length, shape or quantity.';
      if (difficulty === 'Easy') {
        text = `Which of these fractions is equivalent to **one half (1/2)**?`;
        correctAnswer = '2/4';
        options = ['2/4', '1/3', '3/4', '1/4'];
        explanation = `2/4 is equivalent to 1/2 because 2 is half of 4.`;
      } else if (difficulty === 'Medium') {
        text = `Calculate **3/4** of **12** pencils.`;
        correctAnswer = '9';
        options = ['9', '6', '3', '8'];
        hint = `First, find 1/4 of 12 by dividing by 4. Then multiply that answer by 3.`;
        explanation = `1/4 of 12 = 3. Then 3/4 is 3 x 3 = 9.`;
      } else {
        text = `Find **1/3** of **15** toy cars.`;
        correctAnswer = '5';
        options = ['5', '3', '6', '10'];
        explanation = `One third of 15 is 15 divided by 3, which is 5.`;
      }
    } else if (grade === 3) {
      learningObjective = 'Count up and down in tenths; recognise equivalent fractions with small denominators.';
      if (difficulty === 'Easy') {
        text = `What decimal represents **3 tenths**?`;
        correctAnswer = '0.3';
        options = ['0.3', '0.03', '3.0', '1.3'];
        explanation = `3 tenths is written as the fraction 3/10, which corresponds to the decimal 0.3.`;
      } else if (difficulty === 'Medium') {
        text = `Add these fractions: **2/7 + 3/7 = ?**`;
        correctAnswer = '5/7';
        options = ['5/7', '5/14', '1/7', '6/7'];
        explanation = `When adding fractions with the same denominator, keep the denominator the same and add the numerators: 2 + 3 = 5, giving 5/7.`;
      } else {
        text = `Find **2/5** of **20** marbles.`;
        correctAnswer = '8';
        options = ['8', '4', '10', '12'];
        explanation = `1/5 of 20 is 4. Therefore, 2/5 of 20 is 2 x 4 = 8.`;
      }
    } else if (grade === 4) {
      learningObjective = 'Recognise and write decimal equivalents to 1/4, 1/2, 3/4; count in hundredths.';
      if (difficulty === 'Easy') {
        text = `Write **1/4** as a decimal.`;
        correctAnswer = '0.25';
        options = ['0.25', '0.5', '0.75', '0.14'];
        explanation = `One quarter (1/4) is equal to 0.25 as a decimal.`;
      } else if (difficulty === 'Medium') {
        text = `What is **3/100** written as a decimal?`;
        correctAnswer = '0.03';
        options = ['0.03', '0.3', '3.0', '0.003'];
        explanation = `3 hundredths has a 3 in the hundredths place, written as 0.03.`;
      } else {
        text = `Calculate: **1 - 0.35 = ?**`;
        correctAnswer = '0.65';
        options = ['0.65', '0.75', '0.55', '0.6'];
        explanation = `1.00 minus 0.35 equals 0.65.`;
      }
    } else if (grade === 5) {
      learningObjective = 'Recognise mixed numbers and improper fractions and convert between them; recognise percentages.';
      if (difficulty === 'Easy') {
        text = `Convert the improper fraction **7/3** into a mixed number.`;
        correctAnswer = '2 1/3';
        options = ['2 1/3', '1 2/3', '2 2/3', '3 1/3'];
        explanation = `7 divided by 3 is 2 with a remainder of 1. So 7/3 = 2 1/3.`;
      } else if (difficulty === 'Medium') {
        text = `Convert the mixed number **3 1/4** to an improper fraction.`;
        correctAnswer = '13/4';
        options = ['13/4', '7/4', '11/4', '12/4'];
        explanation = `Multiply the whole number by the denominator and add the numerator: (3 * 4) + 1 = 13. So, 3 1/4 = 13/4.`;
      } else {
        text = `Find **25%** of **£80**.`;
        correctAnswer = '£20';
        options = ['£20', '£10', '£40', '£25'];
        explanation = `25% is equivalent to 1/4. 1/4 of £80 is £80 divided by 4, which is £20.`;
      }
    } else if (grade === 6) {
      learningObjective = 'Simplify fractions; add and subtract fractions with different denominators.';
      if (difficulty === 'Easy') {
        text = `Simplify the fraction **12/18** to its simplest form.`;
        correctAnswer = '2/3';
        options = ['2/3', '3/4', '4/6', '6/9'];
        explanation = `Divide the numerator and denominator by their highest common factor, which is 6: 12÷6 = 2, 18÷6 = 3. Simplest form is 2/3.`;
      } else if (difficulty === 'Medium') {
        text = `Calculate: **1/3 + 1/4 = ?**`;
        correctAnswer = '7/12';
        options = ['7/12', '2/7', '1/12', '5/12'];
        hint = `Find a common denominator first, which is 12.`;
        explanation = `Convert to common denominator: 1/3 = 4/12, and 1/4 = 3/12. Adding them: 4/12 + 3/12 = 7/12.`;
      } else {
        text = `Calculate: **2/5 x 3/4 = ?** (Express in simplest form)`;
        correctAnswer = '3/10';
        options = ['3/10', '6/20', '5/9', '1/2'];
        explanation = `Multiply numerators: 2 x 3 = 6. Multiply denominators: 5 x 4 = 20. 6/20 simplifies to 3/10.`;
      }
    } else if (grade === 7) {
      learningObjective = 'Calculate percentages of amounts, and work with multipliers.';
      if (difficulty === 'Easy') {
        text = `What is **15%** of **£240**?`;
        correctAnswer = '£36';
        options = ['£36', '£24', '£30', '£40'];
        explanation = `10% of £240 is £24. 5% is £12. Therefore, 15% is £24 + £12 = £36.`;
      } else if (difficulty === 'Medium') {
        text = `Express the fraction **3/8** as a decimal and a percentage.`;
        correctAnswer = '0.375 and 37.5%';
        options = ['0.375 and 37.5%', '0.35 and 35%', '0.375 and 3.75%', '0.4 and 40%'];
        explanation = `3 ÷ 8 = 0.375, which is 37.5%.`;
      } else {
        text = `An item costs **£45** excluding VAT. If VAT is **20%**, what is the total cost including VAT?`;
        correctAnswer = '£54';
        options = ['£54', '£50', '£55', '£49'];
        explanation = `20% of £45 is 45 * 0.20 = £9. Total cost = £45 + £9 = £54.`;
      }
    } else if (grade === 8) {
      learningObjective = 'Solve problems involving percentage increase and decrease; use fractional indices.';
      if (difficulty === 'Easy') {
        text = `A coat costs **£80** in a sale with a **30% discount**. What is the sale price?`;
        correctAnswer = '£56';
        options = ['£56', '£60', '£54', '£24'];
        explanation = `Discount = 30% of £80 = £24. Sale price = £80 - £24 = £56.`;
      } else if (difficulty === 'Medium') {
        text = `Convert the recurring decimal **0.7777...** into a vulgar fraction.`;
        correctAnswer = '7/9';
        options = ['7/9', '7/10', '77/100', '2/3'];
        explanation = `Let x = 0.777... => 10x = 7.777... => 9x = 7 => x = 7/9.`;
      } else {
        text = `Evaluate: **64^(1/2) + 27^(1/3)**`;
        correctAnswer = '11';
        options = ['11', '17', '9', '12'];
        explanation = `64^(1/2) is the square root of 64, which is 8. 27^(1/3) is the cube root of 27, which is 3. 8 + 3 = 11.`;
      }
    } else {
      learningObjective = 'Calculate compound interest; simplify surds and rationalise denominators.';
      if (difficulty === 'Easy') {
        text = `Simplify the surd **√50** as far as possible.`;
        correctAnswer = '5√2';
        options = ['5√2', '2√5', '25√2', '10√5'];
        explanation = `√50 = √(25 x 2) = √25 x √2 = 5√2.`;
      } else if (difficulty === 'Medium') {
        text = `Rationalise the denominator of: **6 / √3**`;
        correctAnswer = '2√3';
        options = ['2√3', '6√3', '3√3', '2'];
        explanation = `Multiply top and bottom by √3: (6 x √3) / (√3 x √3) = 6√3 / 3 = 2√3.`;
      } else {
        text = `**£2,000** is invested at **4% per annum compound interest**. What is the value of the investment after **2 years**?`;
        correctAnswer = '£2,163.20';
        options = ['£2,163.20', '£2,160.00', '£2,080.00', '£2,240.00'];
        explanation = `Value = 2000 * (1.04)² = 2000 * 1.0816 = £2,163.20.`;
      }
    }
  } else if (category.includes('Measurement')) {
    skillsTested = ['units-of-measure', 'conversions', 'perimeter-area-volume'];
    prerequisiteConcepts = grade > 1 ? [`grade-${grade - 1}-measurement`] : ['basic-measurement'];

    if (grade === 1) {
      learningObjective = 'Tell the time to the hour and half past; recognise denominations of coins and notes.';
      commonMisconception = 'Confusing the 5p and 10p coins or thinking size dictates value.';
      if (difficulty === 'Easy') {
        text = `An analog clock shows the short hand pointing to the **3** and the long hand pointing straight up to the **12**. What time is it?`;
        correctAnswer = '3 o\'clock';
        options = ['3 o\'clock', 'Half past 3', '12 o\'clock', '3:30'];
        explanation = `When the long minute hand points to 12, it is an exact hour. Since the short hand points to 3, the time is 3 o'clock.`;
      } else if (difficulty === 'Medium') {
        text = `How many **5p** coins are needed to make exactly **20p**?`;
        correctAnswer = '4';
        options = ['4', '5', '3', '10'];
        explanation = `5p x 4 = 20p. So 4 coins are needed.`;
      } else {
        text = `Which of these units is most appropriate to measure the **length of a classroom**?`;
        correctAnswer = 'metres';
        options = ['metres', 'centimetres', 'kilograms', 'hours'];
        explanation = `Metres are appropriate for large room dimensions. Centimetres are too small, while kilograms and hours measure weight and time.`;
      }
    } else if (grade === 2) {
      learningObjective = 'Use standard units to measure lengths (m/cm), mass (kg/g), capacity (l/ml); find coin combinations.';
      if (difficulty === 'Easy') {
        text = `How many **centimetres (cm)** are in **1 metre (m)**?`;
        correctAnswer = '100';
        options = ['100', '10', '1000', '10000'];
        explanation = `There are exactly 100 centimetres in one metre.`;
      } else if (difficulty === 'Medium') {
        text = `You buy a toy for **65p** and pay with a **£1** coin. How much change should you get back?`;
        correctAnswer = '35p';
        options = ['35p', '45p', '25p', '55p'];
        explanation = `£1 is 100p. 100p - 65p = 35p change.`;
      } else {
        text = `An analog clock shows the hour hand slightly past 4 and the minute hand pointing to the **6**. What is the time?`;
        correctAnswer = 'Half past 4';
        options = ['Half past 4', 'Half past 6', '4 o\'clock', 'Quarter to 4'];
        explanation = `The minute hand on 6 indicates 30 minutes, or 'half past'. Since the hour hand is past 4, the time is half past 4.`;
      }
    } else if (grade === 3) {
      learningObjective = 'Measure perimeter of simple 2D shapes; tell time using 12/24 hour clocks.';
      if (difficulty === 'Easy') {
        text = `A rectangle has a length of **6 cm** and a width of **4 cm**. What is its **perimeter**?`;
        correctAnswer = '20 cm';
        options = ['20 cm', '10 cm', '24 cm', '16 cm'];
        explanation = `Perimeter is the total boundary: 6 + 4 + 6 + 4 = 20 cm.`;
      } else if (difficulty === 'Medium') {
        text = `Convert **3:45 pm** into 24-hour clock format.`;
        correctAnswer = '15:45';
        options = ['15:45', '03:45', '13:45', '17:45'];
        explanation = `For pm times, add 12 to the hours: 3 + 12 = 15. The time is 15:45.`;
      } else {
        text = `A train departs at **10:15 am** and arrives at **11:05 am**. How long did the journey take in minutes?`;
        correctAnswer = '50 minutes';
        options = ['50 minutes', '90 minutes', '45 minutes', '60 minutes'];
        explanation = `From 10:15 to 11:00 is 45 minutes, plus 5 more minutes is 50 minutes.`;
      }
    } else if (grade === 4) {
      learningObjective = 'Convert between different units of measure; find area by counting squares.';
      if (difficulty === 'Easy') {
        text = `Convert **2.5 kilometres (km)** into **metres (m)**.`;
        correctAnswer = '2,500 m';
        options = ['2,500 m', '250 m', '25,000 m', '25 m'];
        explanation = `Since 1 km = 1000 m, 2.5 km = 2.5 * 1000 = 2,500 m.`;
      } else if (difficulty === 'Medium') {
        text = `A rectilinear shape is made of **14 squares**, each with an area of **1 cm²**. What is the total area of the shape?`;
        correctAnswer = '14 cm²';
        options = ['14 cm²', '28 cm²', '7 cm²', '14 cm'];
        explanation = `Total area = 14 * 1 cm² = 14 cm².`;
      } else {
        text = `A movie is **2 hours and 15 minutes** long. How many **minutes** is this in total?`;
        correctAnswer = '135 minutes';
        options = ['135 minutes', '115 minutes', '120 minutes', '145 minutes'];
        explanation = `2 hours = 120 minutes. 120 + 15 = 135 minutes.`;
      }
    } else if (grade === 5) {
      learningObjective = 'Measure and calculate perimeter and area of composite rectilinear shapes.';
      if (difficulty === 'Easy') {
        text = `A composite rectilinear shape has a perimeter with sides of length: 8cm, 3cm, 5cm, 2cm, 3cm, and 5cm. What is its total perimeter?`;
        correctAnswer = '26 cm';
        options = ['26 cm', '24 cm', '28 cm', '30 cm'];
        explanation = `Perimeter is the sum of all outer sides: 8 + 3 + 5 + 2 + 3 + 5 = 26 cm.`;
      } else if (difficulty === 'Medium') {
        text = `Calculate the area of a rectangle with length **12 cm** and width **8 cm**.`;
        correctAnswer = '96 cm²';
        options = ['96 cm²', '40 cm²', '96 cm', '48 cm²'];
        explanation = `Area = length * width = 12 * 8 = 96 cm².`;
      } else {
        text = `Understand imperial units: Approximately how many **pints** are in a standard **1 litre** container?`;
        correctAnswer = '1.75 pints';
        options = ['1.75 pints', '1 pint', '2.2 pints', '0.5 pints'];
        explanation = `1 litre is approximately equal to 1.75 pints (or 1.76 pints).`;
      }
    } else if (grade === 6) {
      learningObjective = 'Calculate area of triangles and parallelograms; calculate volume of cuboids.';
      if (difficulty === 'Easy') {
        text = `What is the **volume** of a cuboid with length **5 cm**, width **3 cm**, and height **4 cm**?`;
        correctAnswer = '60 cm³';
        options = ['60 cm³', '12 cm³', '47 cm³', '60 cm²'];
        explanation = `Volume of cuboid = length * width * height = 5 * 3 * 4 = 60 cm³.`;
      } else if (difficulty === 'Medium') {
        text = `Calculate the **area** of a triangle with a base of **8 cm** and a vertical height of **6 cm**.`;
        correctAnswer = '24 cm²';
        options = ['24 cm²', '48 cm²', '14 cm²', '24 cm³'];
        explanation = `Area of triangle = (base * height) / 2 = (8 * 6) / 2 = 24 cm².`;
      } else {
        text = `Convert **450 grams (g)** into **kilograms (kg)**.`;
        correctAnswer = '0.45 kg';
        options = ['0.45 kg', '4.5 kg', '0.045 kg', '45 kg'];
        explanation = `Since 1 kg = 1000 g, 450 g = 450 / 1000 = 0.45 kg.`;
      }
    } else if (grade === 7) {
      learningObjective = 'Calculate area of trapezia and circumference of circles.';
      if (difficulty === 'Easy') {
        text = `Calculate the **circumference** of a circle with a diameter of **10 cm**. Use π = 3.14.`;
        correctAnswer = '31.4 cm';
        options = ['31.4 cm', '78.5 cm', '15.7 cm', '62.8 cm'];
        explanation = `Circumference = π * d = 3.14 * 10 = 31.4 cm.`;
      } else if (difficulty === 'Medium') {
        text = `A trapezium has parallel sides of **6 cm** and **10 cm**, and a vertical height of **5 cm**. Find its **area**.`;
        correctAnswer = '40 cm²';
        options = ['40 cm²', '80 cm²', '32 cm²', '45 cm²'];
        explanation = `Area = ((a + b) / 2) * h = ((6 + 10) / 2) * 5 = 8 * 5 = 40 cm².`;
      } else {
        text = `A cyclist travels at a constant speed of **12 miles per hour (mph)**. How far do they travel in **2 hours and 15 minutes**?`;
        correctAnswer = '27 miles';
        options = ['27 miles', '24 miles', '25.5 miles', '30 miles'];
        explanation = `2 hours 15 minutes = 2.25 hours. Distance = Speed * Time = 12 * 2.25 = 27 miles.`;
      }
    } else if (grade === 8) {
      learningObjective = 'Solve problems with compound units; apply Pythagoras\' Theorem.';
      if (difficulty === 'Easy') {
        text = `Find the hypotenuse of a right-angled triangle with side lengths **6 cm** and **8 cm**.`;
        correctAnswer = '10 cm';
        options = ['10 cm', '14 cm', '9.5 cm', '12 cm'];
        explanation = `By Pythagoras: c² = a² + b² = 6² + 8² = 36 + 64 = 100 => c = √100 = 10 cm.`;
      } else if (difficulty === 'Medium') {
        text = `A metal block has a mass of **270 g** and a volume of **90 cm³**. What is its **density** in g/cm³?`;
        correctAnswer = '3 g/cm³';
        options = ['3 g/cm³', '0.33 g/cm³', '24300 g/cm³', '4 g/cm³'];
        explanation = `Density = Mass / Volume = 270 / 90 = 3 g/cm³.`;
      } else {
        text = `A ladder of length **5 m** leans against a vertical wall. The base of the ladder is **3 m** from the wall. How high up the wall does it reach?`;
        correctAnswer = '4 m';
        options = ['4 m', '4.5 m', '3.5 m', '4.2 m'];
        explanation = `Height² = Hypotenuse² - Base² = 5² - 3² = 25 - 9 = 16 => Height = √16 = 4 m.`;
      }
    } else {
      learningObjective = 'Apply sine, cosine, and triangle area formulae to non-right triangles.';
      if (difficulty === 'Easy') {
        text = `In a triangle, side **a = 8 cm**, side **b = 5 cm**, and the included angle **C = 30°**. Calculate its **area**.`;
        correctAnswer = '10 cm²';
        options = ['10 cm²', '20 cm²', '10√3 cm²', '15 cm²'];
        explanation = `Area = 1/2 * a * b * sin C = 1/2 * 8 * 5 * sin(30°) = 20 * 0.5 = 10 cm².`;
      } else if (difficulty === 'Medium') {
        text = `Convert a speed of **72 kilometres per hour (km/h)** into **metres per second (m/s)**.`;
        correctAnswer = '20 m/s';
        options = ['20 m/s', '25 m/s', '15 m/s', '30 m/s'];
        explanation = `72 km/h = 72,000 m / 3600 s = 20 m/s. (Alternatively, divide by 3.6: 72 / 3.6 = 20).`;
      } else {
        text = `In a non-right-angled triangle ABC, side **a = 7 cm**, side **b = 8 cm**, and side **c = 9 cm**. Find **cos C** as a fraction.`;
        correctAnswer = '1/7';
        options = ['1/7', '1/8', '2/7', '3/8'];
        explanation = `By Cosine Rule: c² = a² + b² - 2ab cos C => 9² = 7² + 8² - 2(7)(8) cos C => 81 = 49 + 64 - 112 cos C => 81 = 113 - 112 cos C => 112 cos C = 32 => cos C = 32/112 = 1/7.`;
      }
    }
  } else if (category.includes('Geometry')) {
    skillsTested = ['shape-properties', 'angle-rules', 'transformations'];
    prerequisiteConcepts = grade > 1 ? [`grade-${grade - 1}-geometry`] : ['shape-sorting'];

    if (grade === 1) {
      learningObjective = 'Recognise and name common 2-D and 3-D shapes.';
      commonMisconception = 'Not recognising a square is also a type of rectangle.';
      if (difficulty === 'Easy') {
        text = `What is the name of a flat 2-D shape with **3 straight sides** and **3 corners**?`;
        correctAnswer = 'triangle';
        options = ['triangle', 'rectangle', 'circle', 'square'];
        explanation = `A triangle has exactly 3 sides and 3 corners (vertices).`;
      } else if (difficulty === 'Medium') {
        text = `Which of these is a **3-D shape** that looks like a ball?`;
        correctAnswer = 'sphere';
        options = ['sphere', 'circle', 'cylinder', 'cube'];
        explanation = `A sphere is a perfectly round 3-D shape. A circle is flat (2-D).`;
      } else {
        text = `If a toy robot makes a **half turn**, what direction does it end up facing relative to its start?`;
        correctAnswer = 'the opposite direction';
        options = ['the opposite direction', 'the same direction', 'to the left', 'to the right'];
        explanation = `A half turn turns you completely around to face the opposite direction.`;
      }
    } else if (grade === 2) {
      learningObjective = 'Identify properties of 2-D and 3-D shapes (faces, vertices, edges); distinguish turns.';
      if (difficulty === 'Easy') {
        text = `How many **vertices (corners)** does a standard **cube** have?`;
        correctAnswer = '8';
        options = ['8', '6', '12', '4'];
        explanation = `A cube has 8 vertices, 6 faces, and 12 edges.`;
      } else if (difficulty === 'Medium') {
        text = `What is the name of a 2-D shape with **6 straight sides**?`;
        correctAnswer = 'hexagon';
        options = ['hexagon', 'pentagon', 'octagon', 'quadrilateral'];
        explanation = `A hexagon is a polygon with exactly 6 sides.`;
      } else {
        text = `An analog clock hand turns from **12** to **3**. What kind of turn is this?`;
        correctAnswer = 'quarter turn clockwise';
        options = ['quarter turn clockwise', 'half turn clockwise', 'quarter turn anticlockwise', 'three-quarter turn clockwise'];
        explanation = `Moving from 12 to 3 is a 90-degree turn (1/4 of a full circle) in the direction of clock movement (clockwise).`;
      }
    } else if (grade === 3) {
      learningObjective = 'Identify right angles; recognise horizontal, vertical, parallel and perpendicular lines.';
      if (difficulty === 'Easy') {
        text = `How many **right angles** make a **half-turn (180°)**?`;
        correctAnswer = '2';
        options = ['2', '1', '3', '4'];
        explanation = `Each right angle is 90°. Two right angles make 180° (a half-turn).`;
      } else if (difficulty === 'Medium') {
        text = `Lines that run side-by-side and **never meet** no matter how far they extend are called:`;
        correctAnswer = 'parallel lines';
        options = ['parallel lines', 'perpendicular lines', 'horizontal lines', 'diagonal lines'];
        explanation = `Parallel lines are always the same distance apart and never intersect.`;
      } else {
        text = `An angle that is **smaller than a right angle** is called:`;
        correctAnswer = 'an acute angle';
        options = ['an acute angle', 'an obtuse angle', 'a reflex angle', 'a straight angle'];
        explanation = `An angle less than 90° (a right angle) is an acute angle.`;
      }
    } else if (grade === 4) {
      learningObjective = 'Classify geometric shapes based on their properties; identify lines of symmetry.';
      if (difficulty === 'Easy') {
        text = `What type of triangle has **all three sides equal** in length?`;
        correctAnswer = 'equilateral';
        options = ['equilateral', 'isosceles', 'scalene', 'right-angled'];
        explanation = `An equilateral triangle has three equal sides and three equal angles (each 60°).`;
      } else if (difficulty === 'Medium') {
        text = `How many **lines of symmetry** does a standard **square** have?`;
        correctAnswer = '4';
        options = ['4', '2', '8', 'infinite'];
        explanation = `A square has 4 lines of symmetry: 2 bisecting the sides and 2 along the diagonals.`;
      } else {
        text = `Which quadrilateral has exactly **one pair** of parallel sides?`;
        correctAnswer = 'trapezium';
        options = ['trapezium', 'parallelogram', 'rhombus', 'kite'];
        explanation = `In the UK curriculum, a quadrilateral with exactly one pair of parallel sides is called a trapezium.`;
      }
    } else if (grade === 5) {
      learningObjective = 'Measure angles in degrees; find missing angles on a straight line and at a point.';
      if (difficulty === 'Easy') {
        text = `What is the sum of angles on a **straight line**?`;
        correctAnswer = '180°';
        options = ['180°', '360°', '90°', '270°'];
        explanation = `Angles on a straight line always add up to exactly 180°.`;
      } else if (difficulty === 'Medium') {
        text = `A straight line is divided into two angles. One angle is **115°**. What is the size of the other angle **x**?`;
        correctAnswer = '65°';
        options = ['65°', '55°', '75°', '180°'];
        explanation = `Angles on a straight line sum to 180°. x = 180° - 115° = 65°.`;
      } else {
        text = `What is the sum of angles **around a single point**?`;
        correctAnswer = '360°';
        options = ['360°', '180°', '90°', '100°'];
        explanation = `Angles around a point make a full rotation, which equals 360°.`;
      }
    } else if (grade === 6) {
      learningObjective = 'Find missing angles in triangles and quadrilaterals; recognise parts of circles.';
      if (difficulty === 'Easy') {
        text = `The sum of interior angles in any **triangle** is always:`;
        correctAnswer = '180°';
        options = ['180°', '360°', '90°', '270°'];
        explanation = `The angles inside any triangle always add up to 180°.`;
      } else if (difficulty === 'Medium') {
        text = `Two angles are **vertically opposite** where two lines cross. If one is **42°**, what is the other?`;
        correctAnswer = '42°';
        options = ['42°', '138°', '48°', '90°'];
        explanation = `Vertically opposite angles are equal. So the other angle is also 42°.`;
      } else {
        text = `If the **radius** of a circle is **4.5 cm**, what is its **diameter**?`;
        correctAnswer = '9 cm';
        options = ['9 cm', '4.5 cm', '13.5 cm', '18 cm'];
        explanation = `The diameter is twice the radius: d = 2 * r = 2 * 4.5 = 9 cm.`;
      }
    } else if (grade === 7) {
      learningObjective = 'Apply parallel line angle properties (alternate and corresponding angles).';
      if (difficulty === 'Easy') {
        text = `When a line intersects parallel lines, **Z-angles** are mathematically known as:`;
        correctAnswer = 'alternate angles';
        options = ['alternate angles', 'corresponding angles', 'vertically opposite angles', 'co-interior angles'];
        explanation = `Alternate angles (Z-angles) lie between parallel lines on opposite sides of the transversal and are equal.`;
      } else if (difficulty === 'Medium') {
        text = `What is the sum of the interior angles of a **regular pentagon (5 sides)**?`;
        correctAnswer = '540°';
        options = ['540°', '360°', '720°', '108°'];
        explanation = `Sum = (n - 2) * 180° = (5 - 2) * 180° = 3 * 180° = 540°.`;
      } else {
        text = `An interior angle of a regular polygon is **120°**. How many sides does the polygon have?`;
        correctAnswer = '6';
        options = ['6', '5', '8', '10'];
        explanation = `Exterior angle = 180° - 120° = 60°. Number of sides = 360° / 60° = 6. This is a regular hexagon.`;
      }
    } else if (grade === 8) {
      learningObjective = 'Apply congruency and similarity criteria for triangles.';
      if (difficulty === 'Easy') {
        text = `Which of these is **not** a standard rule to prove triangle congruence?`;
        correctAnswer = 'AAA';
        options = ['AAA', 'SSS', 'SAS', 'ASA'];
        explanation = `AAA (Angle-Angle-Angle) proves similarity, not congruence, because the triangles can be different sizes.`;
      } else if (difficulty === 'Medium') {
        text = `Triangle A has side lengths 3cm, 4cm, and 5cm. Triangle B is **similar** with a scale factor of **3**. What is the longest side of Triangle B?`;
        correctAnswer = '15 cm';
        options = ['15 cm', '12 cm', '8 cm', '9 cm'];
        explanation = `The longest side of Triangle A is 5cm. Multiplying by scale factor 3 gives 5 * 3 = 15 cm.`;
      } else {
        text = `A point **P(2, -3)** is reflected in the **y-axis**. What are the coordinates of the reflected point?`;
        correctAnswer = '(-2, -3)';
        options = [ '(-2, -3)', '(2, 3)', '(-2, 3)', '(3, -2)' ];
        explanation = `Reflecting in the y-axis negates the x-coordinate while keeping the y-coordinate the same.`;
      }
    } else {
      learningObjective = 'Apply circle theorems to find missing geometric angles.';
      if (difficulty === 'Easy') {
        text = `An angle is subtended at the circumference of a circle by a diameter. What is the size of this angle?`;
        correctAnswer = '90°';
        options = ['90°', '180°', '45°', 'depends on circle size'];
        explanation = `The angle in a semicircle is always a right angle (90°).`;
      } else if (difficulty === 'Medium') {
        text = `A circle theorem states: **"The angle subtended by an arc at the centre is [ ? ] the angle subtended at the circumference."**`;
        correctAnswer = 'twice';
        options = ['twice', 'half of', 'equal to', 'three times'];
        explanation = `The angle at the centre is twice the angle at the circumference.`;
      } else {
        text = `In a cyclic quadrilateral, what do **opposite angles** sum to?`;
        correctAnswer = '180°';
        options = ['180°', '360°', '90°', '270°'];
        explanation = `Opposite angles of a cyclic quadrilateral are supplementary, meaning they always add up to 180°.`;
      }
    }
  } else if (category.includes('Statistics')) {
    skillsTested = ['data-handling', 'charts', 'probability'];
    prerequisiteConcepts = grade > 1 ? [`grade-${grade - 1}-statistics`] : ['counting-objects'];

    if (grade === 1) {
      learningObjective = 'Sequence events in chronological order; read basic calendars and days.';
      commonMisconception = 'Thinking there are 6 days in a week or missing order transitions.';
      if (difficulty === 'Easy') {
        text = `Which day of the week comes directly after **Tuesday**?`;
        correctAnswer = 'Wednesday';
        options = ['Wednesday', 'Thursday', 'Monday', 'Friday'];
        explanation = `The order is Monday, Tuesday, Wednesday... so Wednesday is next.`;
      } else if (difficulty === 'Medium') {
        text = `How many **months** are in a full year?`;
        correctAnswer = '12';
        options = ['12', '10', '7', '52'];
        explanation = `A year has exactly 12 months, from January to December.`;
      } else {
        text = `Which of these represents **yesterday** if today is **Sunday**?`;
        correctAnswer = 'Saturday';
        options = ['Saturday', 'Monday', 'Friday', 'Tuesday'];
        explanation = `Yesterday refers to the day before today. Before Sunday is Saturday.`;
      }
    } else if (grade === 2) {
      learningObjective = 'Interpret tally charts, pictograms, and block diagrams.';
      if (difficulty === 'Easy') {
        text = `A tally mark is written as four vertical lines crossed by one diagonal line. What value does this represent?`;
        correctAnswer = '5';
        options = ['5', '4', '6', '10'];
        explanation = `A crossed group of tally lines represents exactly 5 items.`;
      } else if (difficulty === 'Medium') {
        text = `In a pictogram, each symbol of a star represents **2 children**. How many children are represented by **4 stars**?`;
        correctAnswer = '8';
        options = ['8', '4', '6', '10'];
        explanation = `Since 1 star = 2 children, 4 stars represent 4 * 2 = 8 children.`;
      } else {
        text = `A tally chart shows tally marks for favourite fruits: Apples (7), Bananas (5). How many more children preferred Apples than Bananas?`;
        correctAnswer = '2';
        options = ['2', '12', '5', '7'];
        explanation = `The difference is 7 - 5 = 2.`;
      }
    } else if (grade === 3) {
      learningObjective = 'Interpret and present data using bar charts, pictograms and tables.';
      if (difficulty === 'Easy') {
        text = `On a bar chart, the bar for 'Blue' reaches the scale line of **8**, and the bar for 'Red' reaches **3**. How many children voted for Blue?`;
        correctAnswer = '8';
        options = ['8', '3', '11', '5'];
        explanation = `The height of the bar directly represents the category's count, which is 8.`;
      } else if (difficulty === 'Medium') {
        text = `On a bar chart, the bar for 'Blue' reaches the scale line of **8**, and the bar for 'Red' reaches **3**. How many **more** children voted for Blue than Red?`;
        correctAnswer = '5';
        options = ['5', '11', '8', '3'];
        explanation = `8 (Blue) - 3 (Red) = 5 more votes.`;
      } else {
        text = `In a pictogram with a key of **1 circle = 10 votes**, what value is represented by **2 and a half circles**?`;
        correctAnswer = '25';
        options = ['25', '20', '15', '30'];
        explanation = `2 circles = 20 votes. Half a circle = 5 votes. Total = 20 + 5 = 25.`;
      }
    } else if (grade === 4) {
      learningObjective = 'Interpret time graphs and line graphs to solve comparison problems.';
      if (difficulty === 'Easy') {
        text = `Data that can only take **specific, distinct values** (such as number of pets) is called:`;
        correctAnswer = 'discrete data';
        options = ['discrete data', 'continuous data', 'grouped data', 'interval data'];
        explanation = `Discrete data has distinct separate values, whereas continuous data can take any value in a range (such as height or time).`;
      } else if (difficulty === 'Medium') {
        text = `A line graph tracks temperature over a day. At 9 am it is **11°C** and at 1 pm it is **17°C**. How much did the temperature rise?`;
        correctAnswer = '6°C';
        options = ['6°C', '8°C', '28°C', '17°C'];
        explanation = `Rise = 17°C - 11°C = 6°C.`;
      } else {
        text = `If a line graph shows temperature flat at **15°C** from 2 pm to 5 pm, what was the temperature change during this time?`;
        correctAnswer = '0°C';
        options = ['0°C', '3°C', '15°C', '2°C'];
        explanation = `A flat horizontal line means no change in value, which equals 0°C change.`;
      }
    } else if (grade === 5) {
      learningObjective = 'Complete, read and interpret tables and timetables.';
      if (difficulty === 'Easy') {
        text = `A bus timetable shows departures: Bus A at **08:15**, Bus B at **08:45**. How many minutes after Bus A does Bus B depart?`;
        correctAnswer = '30 minutes';
        options = ['30 minutes', '15 minutes', '45 minutes', '1 hour'];
        explanation = `From 08:15 to 08:45 is 30 minutes.`;
      } else if (difficulty === 'Medium') {
        text = `A train leaves London at **14:20** and arrives in Reading at **15:05**. How long is the journey?`;
        correctAnswer = '45 minutes';
        options = ['45 minutes', '1 hour 5 minutes', '35 minutes', '55 minutes'];
        explanation = `From 14:20 to 15:00 is 40 minutes, plus 5 minutes is 45 minutes.`;
      } else {
        text = `On a weekly mileage chart, a runner logs: Mon (5 km), Wed (8 km), Fri (12 km). What is their total mileage for these three days?`;
        correctAnswer = '25 km';
        options = ['25 km', '20 km', '28 km', '15 km'];
        explanation = `Total = 5 + 8 + 12 = 25 km.`;
      }
    } else if (grade === 6) {
      learningObjective = 'Interpret pie charts; calculate the mean as an average.';
      if (difficulty === 'Easy') {
        text = `Find the **mean** of these test scores: **5, 7, 8, 4, 6**`;
        correctAnswer = '6';
        options = ['6', '5', '7', '8'];
        explanation = `Mean = Sum / Count. Sum = 5 + 7 + 8 + 4 + 6 = 30. Count = 5. Mean = 30 / 5 = 6.`;
      } else if (difficulty === 'Medium') {
        text = `In a pie chart representing **60 students**, the slice for 'History' is exactly a **quarter (90 degrees)**. How many students chose History?`;
        correctAnswer = '15';
        options = ['15', '20', '30', '10'];
        explanation = `A quarter of the circle corresponds to 1/4 of the total: 1/4 of 60 is 15 students.`;
      } else {
        text = `A student has a mean score of **8** over **3 games**. If they score **12** in the 4th game, what is their new mean?`;
        correctAnswer = '9';
        options = ['9', '8', '10', '11'];
        explanation = `Sum of first 3 games = 8 * 3 = 24. New sum with 4th game = 24 + 12 = 36. New mean = 36 / 4 = 9.`;
      }
    } else if (grade === 7) {
      learningObjective = 'Record and analyse probabilities using the 0-1 scale.';
      if (difficulty === 'Easy') {
        text = `A bag has **3 red marbles** and **7 blue marbles**. What is the probability of randomly drawing a **red** marble?`;
        correctAnswer = '0.3';
        options = ['0.3', '0.7', '3', '0.5'];
        explanation = `Probability = favourable outcomes / total = 3 / (3 + 7) = 3/10 = 0.3.`;
      } else if (difficulty === 'Medium') {
        text = `If the probability of it raining tomorrow is **0.15**, what is the probability of it **not** raining?`;
        correctAnswer = '0.85';
        options = ['0.85', '0.75', '0.95', '0.5'];
        explanation = `The probabilities of exhaustive mutually exclusive events sum to 1. P(not rain) = 1 - 0.15 = 0.85.`;
      } else {
        text = `A fair six-sided die is rolled. What is the probability of rolling a **prime number**?`;
        correctAnswer = '1/2';
        options = ['1/2', '1/3', '2/3', '1/6'];
        explanation = `Prime numbers on a die are 2, 3, and 5 (3 outcomes). Total outcomes = 6. Probability = 3/6 = 1/2.`;
      }
    } else if (grade === 8) {
      learningObjective = 'Use Venn diagrams and tree diagrams; interpret scatter graphs.';
      if (difficulty === 'Easy') {
        text = `In a Venn diagram, the region representing elements in **both Set A and Set B** is called the:`;
        correctAnswer = 'intersection';
        options = ['intersection', 'union', 'complement', 'subset'];
        explanation = `The intersection (A ∩ B) represents elements common to both sets.`;
      } else if (difficulty === 'Medium') {
        text = `In a scatter graph, if y increases as x decreases, the variables have:`;
        correctAnswer = 'negative correlation';
        options = ['negative correlation', 'positive correlation', 'no correlation', 'perfect correlation'];
        explanation = `A negative correlation means that as one variable increases, the other decreases.`;
      } else {
        text = `Two coins are flipped. What is the probability of getting **exactly one head**?`;
        correctAnswer = '1/2';
        options = ['1/2', '1/4', '3/4', '1/3'];
        explanation = `Sample space: HH, HT, TH, TT. Exactly one head occurs in HT and TH (2 outcomes out of 4). Probability = 2/4 = 1/2.`;
      }
    } else {
      learningObjective = 'Interpret cumulative frequency graphs, histograms, and conditional probability.';
      if (difficulty === 'Easy') {
        text = `In a box plot, what statistical measure is represented by the length of the central box?`;
        correctAnswer = 'interquartile range';
        options = ['interquartile range', 'range', 'median', 'mean'];
        explanation = `The box extends from the lower quartile (Q1) to the upper quartile (Q3), representing the interquartile range (IQR).`;
      } else if (difficulty === 'Medium') {
        text = `In a histogram, the **height** of each bar represents:`;
        correctAnswer = 'frequency density';
        options = ['frequency density', 'frequency', 'class width', 'cumulative frequency'];
        explanation = `In a histogram, area represents frequency, so bar height corresponds to frequency density (frequency / class width).`;
      } else {
        text = `A drawer contains **4 blue** and **6 black** socks. You take two socks at random without replacement. What is the probability that both socks are **blue**?`;
        correctAnswer = '2/15';
        options = ['2/15', '4/25', '1/3', '1/5'];
        explanation = `First socks blue: 4/10 = 2/5. Second socks blue: 3/9 = 1/3. Combined probability = 2/5 * 1/3 = 2/15.`;
      }
    }
  } else if (category.includes('Problem Solving')) {
    skillsTested = ['reasoning', 'modelling', 'proof'];
    prerequisiteConcepts = [`grade-${grade}-operations`];

    if (grade === 1) {
      text = `Bella has **5 toys** and George has **8 toys**. How many toys do they have **altogether**?`;
      correctAnswer = '13';
      options = ['13', '12', '15', '3'];
      explanation = `Add their toys together: 5 + 8 = 13.`;
    } else if (grade === 2) {
      text = `A baker makes **30 cupcakes**. They put them into boxes of **5**. How many boxes do they fill?`;
      correctAnswer = '6';
      options = ['6', '5', '8', '7'];
      explanation = `Divide total cupcakes by box size: 30 ÷ 5 = 6 boxes.`;
    } else if (grade === 3) {
      text = `If 3 identical hats cost **£15**, how much would **5** of these hats cost?`;
      correctAnswer = '£25';
      options = ['£25', '£20', '£30', '£15'];
      explanation = `Find cost of 1 hat: £15 / 3 = £5. Then 5 hats cost 5 * £5 = £25.`;
    } else if (grade === 4) {
      text = `A playground has a length of **10 m** and width of **8 m**. What is its **area**?`;
      correctAnswer = '80 m²';
      options = ['80 m²', '36 m²', '40 m²', '18 m²'];
      explanation = `Area = length * width = 10 * 8 = 80 m².`;
    } else if (grade === 5) {
      text = `If the product of two numbers is **48** and their sum is **14**, what is the **larger** of the two numbers?`;
      correctAnswer = '8';
      options = ['8', '6', '12', '4'];
      explanation = `The numbers are 6 and 8, because 6 * 8 = 48 and 6 + 8 = 14. The larger number is 8.`;
    } else if (grade === 6) {
      text = `Prove/Reason: Which of these statement is always true about any **odd number** multiplied by an **even number**?`;
      correctAnswer = 'The result is always even';
      options = ['The result is always even', 'The result is always odd', 'The result is sometimes odd', 'The result ends in 5'];
      explanation = `An even number can be written as 2k. Any integer multiplied by 2k will have 2 as a factor, making it always even.`;
    } else if (grade === 7) {
      text = `Prove that the sum of **three consecutive integers** is always a multiple of:`;
      correctAnswer = '3';
      options = ['3', '2', '6', '4'];
      explanation = `Consecutive integers can be written as n, n+1, and n+2. Their sum is n + (n+1) + (n+2) = 3n + 3 = 3(n + 1), which is a multiple of 3.`;
    } else if (grade === 8) {
      text = `Reason: If the side length of a square is **doubled**, by what factor does its **area** increase?`;
      correctAnswer = '4';
      options = ['4', '2', '8', '16'];
      explanation = `If side is s, Area = s². Doubling side to 2s gives Area = (2s)² = 4s². The area increases by a factor of 4.`;
    } else {
      text = `Prove/Reason: Which of these is a valid algebraic proof that the sum of any **two odd numbers** is always **even**?`;
      correctAnswer = '(2n + 1) + (2m + 1) = 2(n + m + 1)';
      options = [
        '(2n + 1) + (2m + 1) = 2(n + m + 1)',
        '(2n + 1) + (2m) = 2n + 2m + 1',
        '3 + 5 = 8',
        '(2n) + (2m) = 2(n + m)'
      ];
      explanation = `Any two odd numbers can be written as 2n+1 and 2m+1. Their sum is 2n + 2m + 2 = 2(n + m + 1), which has a factor of 2 and is therefore always even.`;
    }
  } else {
    // Mathematical Fluency
    skillsTested = ['computational-fluency', 'mental-recall', 'speed'];
    prerequisiteConcepts = [`grade-${grade}-operations`];

    if (grade === 1) {
      text = `Calculate quickly: **15 - 7 = ?**`;
      correctAnswer = '8';
      options = ['8', '7', '9', '6'];
      explanation = `15 minus 7 is 8.`;
    } else if (grade === 2) {
      text = `Recall: **5 x 8 = ?**`;
      correctAnswer = '40';
      options = ['40', '35', '45', '50'];
      explanation = `Using the 5 times table, 5 x 8 = 40.`;
    } else if (grade === 3) {
      text = `Calculate: **120 + 340 = ?**`;
      correctAnswer = '460';
      options = ['460', '480', '440', '450'];
      explanation = `120 + 340 = 460.`;
    } else if (grade === 4) {
      text = `Recall: **9 x 8 = ?**`;
      correctAnswer = '72';
      options = ['72', '81', '64', '63'];
      explanation = `Using the multiplication tables, 9 x 8 = 72.`;
    } else if (grade === 5) {
      text = `Calculate: **12 x 11 = ?**`;
      correctAnswer = '132';
      options = ['132', '121', '144', '110'];
      explanation = `12 x 11 = 132.`;
    } else if (grade === 6) {
      text = `Calculate: **1000 - 345 = ?**`;
      correctAnswer = '655';
      options = ['655', '665', '555', '755'];
      explanation = `1000 - 345 = 655.`;
    } else if (grade === 7) {
      text = `Solve: **x / 3 = 12**`;
      correctAnswer = '36';
      options = ['36', '4', '15', '9'];
      explanation = `Multiply both sides by 3: x = 12 * 3 = 36.`;
    } else if (grade === 8) {
      text = `Simplify: **(x³ x x⁵) / x²**`;
      correctAnswer = 'x⁶';
      options = ['x⁶', 'x¹⁵', 'x⁴', 'x⁸'];
      explanation = `Add powers on top: x³ * x⁵ = x⁸. Subtract power below: x⁸ / x² = x⁶.`;
    } else {
      text = `Solve the quadratic: **x² - 5x + 6 = 0** for its largest root.`;
      correctAnswer = '3';
      options = ['3', '2', '5', '6'];
      explanation = `Factorise: (x - 2)(x - 3) = 0. The roots are x = 2 and x = 3. The largest root is 3.`;
    }
  }

  // Set standard MCQ fallbacks if options are empty
  if (type === 'MCQ' && options.length === 0) {
    options = ['Option A', 'Option B', 'Option C', 'Option D'];
    correctAnswer = 'Option A';
  }

  return {
    id,
    grade,
    curriculum: 'UK_EUROPE',
    category,
    subcategory: topic,
    difficulty,
    type,
    text,
    hint: hint || `Think about ${category.toLowerCase()} concepts for ${yearName}.`,
    explanation,
    options,
    correctAnswer,
    visualData,
    lesson,
    topic,
    learningObjective,
    solution: String(correctAnswer),
    stepByStepExplanation: explanation,
    commonMisconception: commonMisconception || `Ensure you use correct ${category.toLowerCase()} terminology.`,
    skillsTested,
    prerequisiteConcepts,
    standardCode,
    estimatedTime: 60,
    bloomLevel: difficulty === 'Easy' ? 'Remembering' : (difficulty === 'Medium' ? 'Applying' : 'Analyzing'),
    tags: [category.toLowerCase().replace(/\s+/g, '-'), 'uk-curriculum', yearName.toLowerCase().replace(/\s+/g, '-')],
    skillId: `SKILL-${grade}-${category.substring(0, 3).toUpperCase().replace(/\s+/g, '')}`,
    conceptId: `CON-${grade}-${difficulty}`
  };
}
