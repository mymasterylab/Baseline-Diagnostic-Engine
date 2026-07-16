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

// Map US Common Core Metadata for all grades and categories
const usCurriculumMetadata: Record<number, Record<string, {
  standardCode: string;
  topic: string;
  lesson: string;
  learningObjective: string;
  commonMisconception: string;
  skillsTested: string[];
  prerequisiteConcepts: string[];
}>> = {
  1: {
    'Number Sense & Place Value': {
      standardCode: 'CCSS.Math.Content.1.NBT.B.2',
      topic: 'Grade 1 Unit 1: Place value',
      lesson: 'Numbers 0 to 120 and Place Value Introduction',
      learningObjective: 'Understand that the two digits of a two-digit number represent amounts of tens and ones, and count to 120.',
      commonMisconception: 'Swapping the position of tens and ones (e.g., viewing 42 as 2 tens and 4 ones).',
      skillsTested: ['place-value-identification', 'tens-and-ones', 'numbers-to-120'],
      prerequisiteConcepts: ['counting-to-20']
    },
    'Operations & Algebraic Thinking': {
      standardCode: 'CCSS.Math.Content.1.OA.A.1',
      topic: 'Grade 1 Unit 2: Addition and subtraction',
      lesson: 'Addition and Subtraction word problems within 20',
      learningObjective: 'Solve addition and subtraction word problems within 20 with unknowns in all positions.',
      commonMisconception: 'Choosing the wrong operation (e.g., adding instead of subtracting due to misinterpreting word cues).',
      skillsTested: ['equations-with-unknowns', 'addition-subtraction-within-20'],
      prerequisiteConcepts: ['counting-on']
    },
    'Fractions, Decimals & Rational Numbers': {
      standardCode: 'CCSS.Math.Content.1.G.A.3',
      topic: 'Grade 1 Unit 3: Measurement, data, and geometry',
      lesson: 'Fractions: Halves and fourths',
      learningObjective: 'Partition circles and rectangles into two and four equal shares, and use fraction terms.',
      commonMisconception: 'Believing parts represent fractions even when they are unequal in size.',
      skillsTested: ['shape-partitioning', 'halves-and-fourths'],
      prerequisiteConcepts: ['identifying-shapes']
    },
    'Patterns & Pre-Algebra': {
      standardCode: 'CCSS.Math.Content.1.NBT.A.1',
      topic: 'Grade 1 Unit 1: Place value',
      lesson: 'Number grid and missing numbers',
      learningObjective: 'Identify missing numbers up to 120 on a standard number grid.',
      commonMisconception: 'Struggling with row-to-row transitions in the number grid (+10 vs +1).',
      skillsTested: ['skip-counting', 'number-grid-patterns'],
      prerequisiteConcepts: ['sequential-counting']
    },
    'Measurement & Data': {
      standardCode: 'CCSS.Math.Content.1.MD.B.3',
      topic: 'Grade 1 Unit 3: Measurement, data, and geometry',
      lesson: 'Telling time to the hour and half hour',
      learningObjective: 'Tell and write time in hours and half-hours using analog and digital clocks.',
      commonMisconception: 'Confusing the minute hand (long) with the hour hand (short).',
      skillsTested: ['clock-reading', 'time-to-half-hour'],
      prerequisiteConcepts: ['reading-numbers-1-12']
    },
    'Geometry & Spatial Reasoning': {
      standardCode: 'CCSS.Math.Content.1.G.A.1',
      topic: 'Grade 1 Unit 3: Measurement, data, and geometry',
      lesson: 'Shapes, recognizing shapes, and properties',
      learningObjective: 'Distinguish between defining attributes versus non-defining attributes of shapes.',
      commonMisconception: 'Thinking shape orientation or color changes its fundamental identity.',
      skillsTested: ['shape-properties', 'vertices-and-sides'],
      prerequisiteConcepts: ['simple-shape-names']
    },
    'Problem Solving & Mathematical Reasoning': {
      standardCode: 'CCSS.Math.Content.1.OA.A.1',
      topic: 'Grade 1 Unit 2: Addition and subtraction',
      lesson: 'Word problems with "more" and "fewer"',
      learningObjective: 'Solve comparison word problems using addition and subtraction within 20.',
      commonMisconception: 'Blindly adding any numbers seen in the problem without analyzing relationships.',
      skillsTested: ['comparison-reasoning', 'word-problem-translation'],
      prerequisiteConcepts: ['counting-on']
    },
    'Mathematical Fluency': {
      standardCode: 'CCSS.Math.Content.1.OA.C.6',
      topic: 'Grade 1 Unit 2: Addition and subtraction',
      lesson: 'Fluency within 20',
      learningObjective: 'Demonstrate fluency for addition and subtraction within 10 and apply strategies up to 20.',
      commonMisconception: 'Counting by fingers instead of using memory facts or grouping strategies.',
      skillsTested: ['fact-recall', 'doubles-facts'],
      prerequisiteConcepts: ['basic-counting']
    }
  },
  2: {
    'Number Sense & Place Value': {
      standardCode: 'CCSS.Math.Content.2.NBT.A.1',
      topic: 'Grade 2 Unit 2: Place value',
      lesson: 'Three-Digit Place Value to 1,000',
      learningObjective: 'Understand that the three digits of a three-digit number represent amounts of hundreds, tens, and ones.',
      commonMisconception: 'Writing expanded forms incorrectly (e.g., writing "300405" for 345 instead of "300 + 40 + 5").',
      skillsTested: ['expanded-form', 'hundreds-tens-ones'],
      prerequisiteConcepts: ['tens-and-ones']
    },
    'Operations & Algebraic Thinking': {
      standardCode: 'CCSS.Math.Content.2.OA.C.4',
      topic: 'Grade 2 Unit 1: Add and subtract within 20',
      lesson: 'Arrays and repeated addition',
      learningObjective: 'Use addition to find the total number of objects arranged in rectangular arrays up to 5x5.',
      commonMisconception: 'Counting individually instead of using rows/columns or repeated addition.',
      skillsTested: ['array-multiplication', 'repeated-addition'],
      prerequisiteConcepts: ['addition-within-20']
    },
    'Fractions, Decimals & Rational Numbers': {
      standardCode: 'CCSS.Math.Content.2.G.A.3',
      topic: 'Grade 2 Unit 8: Geometry',
      lesson: 'Equal parts of circles and rectangles',
      learningObjective: 'Partition circles and rectangles into two, three, or four equal shares, describe as halves, thirds, fourths.',
      commonMisconception: 'Thinking that equal area parts must have identical physical shapes.',
      skillsTested: ['fractional-partitioning', 'halves-thirds-fourths'],
      prerequisiteConcepts: ['halves-and-fourths']
    },
    'Patterns & Pre-Algebra': {
      standardCode: 'CCSS.Math.Content.2.NBT.A.2',
      topic: 'Grade 2 Unit 2: Place value',
      lesson: 'Counting patterns within 1,000',
      learningObjective: 'Skip-count by 5s, 10s, and 100s within 1000.',
      commonMisconception: 'Miscalculating skip sequences when passing over hundred thresholds (e.g., 290 to 300).',
      skillsTested: ['skip-counting-by-5s-10s', 'number-sequence-patterns'],
      prerequisiteConcepts: ['sequential-counting']
    },
    'Measurement & Data': {
      standardCode: 'CCSS.Math.Content.2.MD.C.8',
      topic: 'Grade 2 Unit 5: Money and time',
      lesson: 'Telling time and counting money',
      learningObjective: 'Solve word problems involving dollar bills, quarters, dimes, nickels, and pennies.',
      commonMisconception: 'Treating larger coins like nickels as worth more than dimes due to physical size.',
      skillsTested: ['coin-counting', 'money-word-problems', 'time-to-5-minutes'],
      prerequisiteConcepts: ['skip-counting']
    },
    'Geometry & Spatial Reasoning': {
      standardCode: 'CCSS.Math.Content.2.G.A.1',
      topic: 'Grade 2 Unit 8: Geometry',
      lesson: 'Classifying 2D and 3D shapes',
      learningObjective: 'Recognize and draw shapes having specified attributes, such as a given number of angles or equal faces.',
      commonMisconception: 'Confusing 2D flat shapes (circle) with 3D solid shapes (sphere).',
      skillsTested: ['shape-attribute-analysis', 'vertices-and-angles'],
      prerequisiteConcepts: ['simple-shape-names']
    },
    'Problem Solving & Mathematical Reasoning': {
      standardCode: 'CCSS.Math.Content.2.OA.A.1',
      topic: 'Grade 2 Unit 3: Add and subtract within 100',
      lesson: 'Two-step addition and subtraction word problems',
      learningObjective: 'Use addition and subtraction within 100 to solve one- and two-step word problems.',
      commonMisconception: 'Completing only the first step of a two-step problem and stopping there.',
      skillsTested: ['multi-step-word-problems', 'algebraic-structures'],
      prerequisiteConcepts: ['addition-within-20']
    },
    'Mathematical Fluency': {
      standardCode: 'CCSS.Math.Content.2.OA.B.2',
      topic: 'Grade 2 Unit 1: Add and subtract within 20',
      lesson: 'Fluently add and subtract within 20',
      learningObjective: 'Fluently add and subtract within 20 using mental strategies.',
      commonMisconception: 'Hesitating and failing to recall facts from memory within a reasonable speed.',
      skillsTested: ['mental-recall', 'subtraction-fluency'],
      prerequisiteConcepts: ['counting-on']
    }
  },
  3: {
    'Number Sense & Place Value': {
      standardCode: 'CCSS.Math.Content.3.NBT.A.1',
      topic: 'Grade 3 Unit 3: Addition, subtraction, and estimation',
      lesson: 'Rounding to the nearest 10 and 100',
      learningObjective: 'Use place value understanding to round whole numbers to the nearest 10 or 100.',
      commonMisconception: 'Rounding down instead of up when the units digit is exactly 5 (e.g., rounding 35 to 30 instead of 40).',
      skillsTested: ['rounding-to-10-100', 'place-value-estimation'],
      prerequisiteConcepts: ['three-digit-place-value']
    },
    'Operations & Algebraic Thinking': {
      standardCode: 'CCSS.Math.Content.3.OA.A.1',
      topic: 'Grade 3 Unit 1: Intro to multiplication',
      lesson: 'Multiplication as equal groups and arrays',
      learningObjective: 'Interpret products of whole numbers as representing groups of objects.',
      commonMisconception: 'Confusing multiplication with addition (calculating 3 x 4 as 3 + 4 = 7).',
      skillsTested: ['equal-groups', 'multiplication-concept'],
      prerequisiteConcepts: ['repeated-addition']
    },
    'Fractions, Decimals & Rational Numbers': {
      standardCode: 'CCSS.Math.Content.3.NF.A.2',
      topic: 'Grade 3 Unit 5: Understand fractions',
      lesson: 'Fractions on the number line',
      learningObjective: 'Represent fractions on a number line diagram, understanding the denominator as partitions.',
      commonMisconception: 'Viewing numerator and denominator as two independent numbers rather than a single ratio quantity.',
      skillsTested: ['number-line-fractions', 'numerator-denominator-meaning'],
      prerequisiteConcepts: ['shape-partitioning']
    },
    'Patterns & Pre-Algebra': {
      standardCode: 'CCSS.Math.Content.3.OA.D.9',
      topic: 'Grade 3 Unit 8: Arithmetic patterns and problem solving',
      lesson: 'Arithmetic patterns and even/odd rules',
      learningObjective: 'Identify arithmetic patterns (including patterns in the addition table or multiplication table).',
      commonMisconception: 'Struggling to find standard patterns in even/odd multiplications.',
      skillsTested: ['even-odd-patterns', 'arithmetic-rule-finding'],
      prerequisiteConcepts: ['skip-counting']
    },
    'Measurement & Data': {
      standardCode: 'CCSS.Math.Content.3.MD.A.1',
      topic: 'Grade 3 Unit 12: Time',
      lesson: 'Telling time and elapsed time',
      learningObjective: 'Tell and write time to the nearest minute and measure time intervals in minutes.',
      commonMisconception: 'Adding elapsed minutes directly to the hour value without wrapping around at 60 minutes.',
      skillsTested: ['elapsed-time', 'telling-time-to-minute'],
      prerequisiteConcepts: ['time-to-hour-half-hour']
    },
    'Geometry & Spatial Reasoning': {
      standardCode: 'CCSS.Math.Content.3.MD.C.5',
      topic: 'Grade 3 Unit 10: Area',
      lesson: 'Area and Perimeter calculation',
      learningObjective: 'Understand area as an attribute of plane figures and measure area by counting unit squares.',
      commonMisconception: 'Confusing perimeter (outline distance) with area (interior region space).',
      skillsTested: ['area-by-counting', 'perimeter-measurement'],
      prerequisiteConcepts: ['addition-multiplication']
    },
    'Problem Solving & Mathematical Reasoning': {
      standardCode: 'CCSS.Math.Content.3.OA.D.8',
      topic: 'Grade 3 Unit 8: Arithmetic patterns and problem solving',
      lesson: 'Two-step word problems with algebraic equations',
      learningObjective: 'Solve two-step word problems using the four operations, and represent using letters for unknowns.',
      commonMisconception: 'Failing to perform the operations in the correct order or missing the nested step.',
      skillsTested: ['algebraic-formulations', 'two-step-operations'],
      prerequisiteConcepts: ['addition-subtraction-within-100']
    },
    'Mathematical Fluency': {
      standardCode: 'CCSS.Math.Content.3.OA.C.7',
      topic: 'Grade 3 Unit 7: More with multiplication and division',
      lesson: 'Fluently multiplying and dividing within 100',
      learningObjective: 'Fluently multiply and divide within 100, using properties of operations.',
      commonMisconception: 'Failing to recall basic facts for multiplication tables like 7s, 8s, and 9s.',
      skillsTested: ['multiplication-facts', 'division-facts'],
      prerequisiteConcepts: ['skip-counting']
    }
  },
  4: {
    'Number Sense & Place Value': {
      standardCode: 'CCSS.Math.Content.4.NBT.A.1',
      topic: 'Grade 4 Unit 1: Place value',
      lesson: 'Multi-digit place value to 1,000,000',
      learningObjective: 'Recognize that in a multi-digit whole number, a digit in one place represents ten times what it represents in the place to its right.',
      commonMisconception: 'Thinking a digit has the exact same value regardless of its column position.',
      skillsTested: ['place-value-scaling', 'digit-value-determination'],
      prerequisiteConcepts: ['rounding-to-10-100']
    },
    'Operations & Algebraic Thinking': {
      standardCode: 'CCSS.Math.Content.4.NBT.B.5',
      topic: 'Grade 4 Unit 3: Multiply by 1-digit numbers',
      lesson: 'Multiplying multi-digit numbers with area models',
      learningObjective: 'Multiply a whole number of up to four digits by a one-digit whole number, and multiply two two-digit numbers.',
      commonMisconception: 'Forgetting to add partial products, or misplacing zeros during intermediate multiplications.',
      skillsTested: ['area-model-multiplication', 'partial-products'],
      prerequisiteConcepts: ['multiplication-facts']
    },
    'Fractions, Decimals & Rational Numbers': {
      standardCode: 'CCSS.Math.Content.4.NF.C.5',
      topic: 'Grade 4 Unit 10: Understand decimals',
      lesson: 'Equivalent fractions and decimals',
      learningObjective: 'Express a fraction with denominator 10 as an equivalent fraction with denominator 100, and write decimals.',
      commonMisconception: 'Thinking 0.4 is smaller than 0.15 because 4 is smaller than 15 (ignoring tenths place columns).',
      skillsTested: ['fractions-to-decimals', 'tenths-and-hundredths'],
      prerequisiteConcepts: ['number-line-fractions']
    },
    'Patterns & Pre-Algebra': {
      standardCode: 'CCSS.Math.Content.4.OA.B.4',
      topic: 'Grade 4 Unit 6: Factors, multiples and patterns',
      lesson: 'Finding factor pairs, prime and composite',
      learningObjective: 'Find all factor pairs for a whole number in the range 1-100 and determine if prime or composite.',
      commonMisconception: 'Believing all odd numbers are prime (e.g., thinking 15 or 21 are prime).',
      skillsTested: ['factor-pairs', 'prime-composite-identification'],
      prerequisiteConcepts: ['multiplication-facts']
    },
    'Measurement & Data': {
      standardCode: 'CCSS.Math.Content.4.MD.A.1',
      topic: 'Grade 4 Unit 14: Units of measurement',
      lesson: 'Converting metric and customary units',
      learningObjective: 'Know relative sizes of measurement units and convert units within a single system.',
      commonMisconception: 'Dividing instead of multiplying when converting from larger units to smaller units.',
      skillsTested: ['unit-conversions', 'metric-customary-conversions'],
      prerequisiteConcepts: ['multiplication-facts']
    },
    'Geometry & Spatial Reasoning': {
      standardCode: 'CCSS.Math.Content.4.MD.C.5',
      topic: 'Grade 4 Unit 12: Measuring angles',
      lesson: 'Measuring angles with a protractor',
      learningObjective: 'Recognize angles as geometric shapes and measure angles in whole-number degrees using a protractor.',
      commonMisconception: 'Reading the wrong scale on a protractor (e.g., measuring an obtuse angle as 50° instead of 130°).',
      skillsTested: ['protractor-reading', 'angle-classification'],
      prerequisiteConcepts: ['angle-types']
    },
    'Problem Solving & Mathematical Reasoning': {
      standardCode: 'CCSS.Math.Content.4.MD.A.3',
      topic: 'Grade 4 Unit 13: Area and perimeter',
      lesson: 'Area and perimeter word problems',
      learningObjective: 'Apply the area and perimeter formulas for rectangles in real-world problems.',
      commonMisconception: 'Adding only two sides when calculating the perimeter of a rectangle.',
      skillsTested: ['rectangle-formulas', 'word-problem-geometry'],
      prerequisiteConcepts: ['perimeter-measurement']
    },
    'Mathematical Fluency': {
      standardCode: 'CCSS.Math.Content.4.NBT.B.4',
      topic: 'Grade 4 Unit 2: Addition, subtraction, and estimation',
      lesson: 'Standard algorithm addition and subtraction',
      learningObjective: 'Fluently add and subtract multi-digit whole numbers using the standard algorithm.',
      commonMisconception: 'Forgetting to regroup or borrow when subtracting across zeros.',
      skillsTested: ['standard-algorithm-addition', 'subtraction-regrouping'],
      prerequisiteConcepts: ['three-digit-place-value']
    }
  },
  5: {
    'Number Sense & Place Value': {
      standardCode: 'CCSS.Math.Content.6.NS.C.7', // Common Core standards for middle school
      topic: 'Grade 5 Unit 5: Negative numbers',
      lesson: 'Opposite numbers and absolute value',
      learningObjective: 'Understand ordering and absolute value of rational numbers.',
      commonMisconception: 'Thinking that a negative number with a larger absolute value is greater (e.g., -10 > -3).',
      skillsTested: ['opposite-numbers', 'absolute-value'],
      prerequisiteConcepts: ['integers-on-number-line']
    },
    'Operations & Algebraic Thinking': {
      standardCode: 'CCSS.Math.Content.6.EE.A.2',
      topic: 'Grade 5 Unit 6: Variables & expressions',
      lesson: 'Evaluating algebraic expressions with variables',
      learningObjective: 'Evaluate expressions at specific values of their variables, following order of operations.',
      commonMisconception: 'Evaluating 3x when x=5 as 35 instead of 3 × 5 = 15.',
      skillsTested: ['substitution-evaluations', 'order-of-operations-PEMDAS'],
      prerequisiteConcepts: ['order-of-operations']
    },
    'Fractions, Decimals & Rational Numbers': {
      standardCode: 'CCSS.Math.Content.6.NS.A.1',
      topic: 'Grade 5 Unit 2: Arithmetic with rational numbers',
      lesson: 'Multiplying/dividing decimals and fractions division',
      learningObjective: 'Interpret and compute quotients of fractions, and perform decimal arithmetic.',
      commonMisconception: 'Dividing fractions by multiplying straight across instead of multiplying by the reciprocal.',
      skillsTested: ['fraction-division', 'decimal-operations'],
      prerequisiteConcepts: ['equivalent-fractions']
    },
    'Ratios, Proportions & Functions': {
      standardCode: 'CCSS.Math.Content.6.RP.A.3',
      topic: 'Grade 5 Unit 1: Ratios',
      lesson: 'Equivalent ratios and percentages',
      learningObjective: 'Use ratio and rate reasoning to solve real-world problems and calculate percents.',
      commonMisconception: 'Adding a constant instead of multiplying when generating equivalent ratios (e.g., 2:3 equivalent to 3:4).',
      skillsTested: ['ratio-tables', 'percent-of-whole'],
      prerequisiteConcepts: ['multiplication-facts']
    },
    'Measurement & Data': {
      standardCode: 'CCSS.Math.Content.6.SP.B.5',
      topic: 'Grade 5 Unit 11: Data and statistics',
      lesson: 'Finding mean, median, IQR, and MAD',
      learningObjective: 'Summarize numerical datasets, calculating central tendencies and variabilities.',
      commonMisconception: 'Forgetting to arrange numbers in ascending order before locating the median.',
      skillsTested: ['mean-median-calculations', 'interquartile-range'],
      prerequisiteConcepts: ['basic-division']
    },
    'Geometry & Spatial Reasoning': {
      standardCode: 'CCSS.Math.Content.6.G.A.1',
      topic: 'Grade 5 Unit 8: Plane figures',
      lesson: 'Area of triangles and parallelograms',
      learningObjective: 'Find the area of right triangles, other triangles, and special quadrilaterals.',
      commonMisconception: 'Using the slant height of a triangle instead of the vertical perpendicular height to calculate area.',
      skillsTested: ['triangle-area-formula', 'parallelogram-area'],
      prerequisiteConcepts: ['area-by-counting']
    },
    'Problem Solving & Mathematical Reasoning': {
      standardCode: 'CCSS.Math.Content.6.EE.C.9',
      topic: 'Grade 5 Unit 7: Equations & inequalities',
      lesson: 'Analyzing independent and dependent variables',
      learningObjective: 'Use variables to represent two quantities in a real-world problem that change in relationship to each other.',
      commonMisconception: 'Swapping independent and dependent variables when constructing equations (e.g., writing x = 5y instead of y = 5x).',
      skillsTested: ['independent-dependent-variables', 'modeling-equations'],
      prerequisiteConcepts: ['substitution-evaluations']
    },
    'Mathematical Fluency': {
      standardCode: 'CCSS.Math.Content.6.EE.A.1',
      topic: 'Grade 5 Unit 4: Exponents and order of operations',
      lesson: 'Order of operations with exponents',
      learningObjective: 'Write and evaluate numerical expressions involving whole-number exponents.',
      commonMisconception: 'Multiplying the base by the exponent power instead of multiplying the base by itself (e.g., calculating 5^2 as 10).',
      skillsTested: ['exponents-evaluation', 'pemdas-fluency'],
      prerequisiteConcepts: ['order-of-operations']
    }
  },
  6: {
    // Grade 6 follows standard Middle School Common Core topics (similar to Grade 5 units which are 6th-grade math courses)
    'Number Sense & Place Value': {
      standardCode: 'CCSS.Math.Content.6.NS.C.6',
      topic: 'Grade 5 Unit 9: Coordinate plane',
      lesson: 'Coordinate Plane Four Quadrants',
      learningObjective: 'Understand signs of numbers in ordered pairs as indicating locations in quadrants of the coordinate plane.',
      commonMisconception: 'Transposing x and y coordinates (e.g., plotting (3, -2) as (-2, 3)).',
      skillsTested: ['coordinate-plotting', 'quadrant-properties'],
      prerequisiteConcepts: ['first-quadrant-graphing']
    },
    'Operations & Algebraic Thinking': {
      standardCode: 'CCSS.Math.Content.6.EE.B.7',
      topic: 'Grade 5 Unit 7: Equations & inequalities',
      lesson: 'Solving one-step equations',
      learningObjective: 'Solve real-world and mathematical problems by writing and solving equations of the form x + p = q.',
      commonMisconception: 'Performing the same operation instead of the inverse operation to solve the equation.',
      skillsTested: ['one-step-equations', 'inverse-operations'],
      prerequisiteConcepts: ['substitution-evaluations']
    },
    'Fractions, Decimals & Rational Numbers': {
      standardCode: 'CCSS.Math.Content.6.NS.A.1',
      topic: 'Grade 5 Unit 2: Arithmetic with rational numbers',
      lesson: 'Fraction Division and Decimal operations',
      learningObjective: 'Perform division of fractions and fluently add, subtract, multiply, and divide multi-digit decimals.',
      commonMisconception: 'Adding decimals without lining up the decimal points in columns.',
      skillsTested: ['fraction-division-algorithm', 'decimal-division'],
      prerequisiteConcepts: ['decimal-operations']
    },
    'Ratios, Proportions & Functions': {
      standardCode: 'CCSS.Math.Content.6.RP.A.2',
      topic: 'Grade 5 Unit 3: Rates and percentages',
      lesson: 'Unit rates and ratio tables',
      learningObjective: 'Understand the concept of a unit rate a/b associated with a ratio a:b, and solve problems.',
      commonMisconception: 'Swapping numerator and denominator in unit rate calculations.',
      skillsTested: ['unit-rate-finding', 'ratio-word-problems'],
      prerequisiteConcepts: ['ratio-tables']
    },
    'Measurement & Data': {
      standardCode: 'CCSS.Math.Content.6.SP.B.4',
      topic: 'Grade 5 Unit 11: Data and statistics',
      lesson: 'Data display: Histograms and Dot plots',
      learningObjective: 'Display numerical data in plots on a number line, including dot plots, histograms, and box plots.',
      commonMisconception: 'Miscalculating category frequencies when drawing histogram intervals.',
      skillsTested: ['histogram-interpretation', 'dot-plot-readings'],
      prerequisiteConcepts: ['bar-graphs']
    },
    'Geometry & Spatial Reasoning': {
      standardCode: 'CCSS.Math.Content.6.G.A.2',
      topic: 'Grade 5 Unit 10: 3D figures',
      lesson: 'Volume and Surface Area with nets',
      learningObjective: 'Find volume of right rectangular prisms and represent three-dimensional figures using nets.',
      commonMisconception: 'Using area formulas (2D) instead of volume formulas (3D), or failing to count all faces of a net.',
      skillsTested: ['rectangular-prism-volume', 'surface-area-nets'],
      prerequisiteConcepts: ['triangle-area-formula']
    },
    'Problem Solving & Mathematical Reasoning': {
      standardCode: 'CCSS.Math.Content.6.EE.B.8',
      topic: 'Grade 5 Unit 7: Equations & inequalities',
      lesson: 'Solving inequalities and testing solutions',
      learningObjective: 'Write an inequality of the form x > c or x < c to represent a constraint in a real-world problem.',
      commonMisconception: 'Believing an inequality has only one solution instead of an infinite range.',
      skillsTested: ['inequality-constraints', 'solution-testing'],
      prerequisiteConcepts: ['one-step-equations']
    },
    'Mathematical Fluency': {
      standardCode: 'CCSS.Math.Content.6.NS.B.2',
      topic: 'Grade 5 Unit 2: Arithmetic with rational numbers',
      lesson: 'Fluent multi-digit division',
      learningObjective: 'Fluently divide multi-digit numbers using the standard algorithm.',
      commonMisconception: 'Misplacing decimal points or failing to adjust place columns correctly in long division.',
      skillsTested: ['long-division-fluency', 'fact-recall'],
      prerequisiteConcepts: ['long-division']
    }
  },
  7: {
    'Number Sense & Place Value': {
      standardCode: 'CCSS.Math.Content.7.NS.A.1',
      topic: 'Grade 7 Curriculum',
      lesson: 'Unit 3: Integers: addition and subtraction',
      learningObjective: 'Apply and extend previous understandings of addition and subtraction to add and subtract rational numbers.',
      commonMisconception: 'Thinking that subtracting a negative is equivalent to subtraction (e.g., 5 - (-3) = 2 instead of 8).',
      skillsTested: ['integer-operations', 'number-line-distances'],
      prerequisiteConcepts: ['opposite-numbers']
    },
    'Operations & Algebraic Thinking': {
      standardCode: 'CCSS.Math.Content.7.EE.B.4',
      topic: 'Grade 7 Curriculum',
      lesson: 'Unit 6: Expressions, equations, & inequalities',
      learningObjective: 'Solve word problems leading to equations of the form px + q = r and simple inequalities.',
      commonMisconception: 'Forgetting to flip the inequality sign when multiplying or dividing both sides by a negative number.',
      skillsTested: ['two-step-inequalities', 'two-step-equations'],
      prerequisiteConcepts: ['one-step-equations']
    },
    'Fractions, Decimals & Rational Numbers': {
      standardCode: 'CCSS.Math.Content.7.RP.A.3',
      topic: 'Grade 7 Curriculum',
      lesson: 'Unit 2: Rates and percentages',
      learningObjective: 'Use proportional relationships to solve multistep ratio and percent problems (tax, tip, discount, markups).',
      commonMisconception: 'Failing to apply progressive operations (e.g., adding tax to a discounted price incorrectly).',
      skillsTested: ['sales-tax-markup', 'percent-discount-tip'],
      prerequisiteConcepts: ['percent-of-whole']
    },
    'Ratios, Proportions & Functions': {
      standardCode: 'CCSS.Math.Content.7.RP.A.2',
      topic: 'Grade 7 Curriculum',
      lesson: 'Unit 1: Proportional relationships',
      learningObjective: 'Identify the constant of proportionality (unit rate) in tables, graphs, equations, and verbal descriptions.',
      commonMisconception: 'Taking coordinates out of order (x/y instead of y/x) when calculating the constant of proportionality k.',
      skillsTested: ['constant-of-proportionality', 'proportional-equations'],
      prerequisiteConcepts: ['unit-rate-finding']
    },
    'Measurement & Data': {
      standardCode: 'CCSS.Math.Content.7.SP.C.5',
      topic: 'Grade 7 Curriculum',
      lesson: 'Unit 7: Statistics and probability',
      learningObjective: 'Understand that the probability of a chance event is a number between 0 and 1 that expresses its likelihood.',
      commonMisconception: 'Confusing theoretical probability (ideal conditions) with experimental probability (actual tests).',
      skillsTested: ['theoretical-probability', 'experimental-predictions'],
      prerequisiteConcepts: ['ratio-word-problems']
    },
    'Geometry & Spatial Reasoning': {
      standardCode: 'CCSS.Math.Content.7.G.B.4',
      topic: 'Grade 7 Curriculum',
      lesson: 'Unit 9: Geometry',
      learningObjective: 'Know the formulas for the area and circumference of a circle and use them to solve problems.',
      commonMisconception: 'Confusing radius and diameter in the circumference (2*pi*r) and area (pi*r^2) formulas.',
      skillsTested: ['circle-area', 'circle-circumference'],
      prerequisiteConcepts: ['triangle-area-formula']
    },
    'Problem Solving & Mathematical Reasoning': {
      standardCode: 'CCSS.Math.Content.7.G.A.1',
      topic: 'Grade 7 Curriculum',
      lesson: 'Unit 8: Scale copies',
      learningObjective: 'Solve problems involving scale drawings of geometric figures, including computing actual lengths.',
      commonMisconception: 'Applying the scale factor directly to areas instead of squaring the scale factor first.',
      skillsTested: ['scale-drawings', 'scale-factor-area-change'],
      prerequisiteConcepts: ['ratio-word-problems']
    },
    'Mathematical Fluency': {
      standardCode: 'CCSS.Math.Content.7.NS.A.2',
      topic: 'Grade 7 Curriculum',
      lesson: 'Unit 5: Negative numbers: multiplication and division',
      learningObjective: 'Multiply and divide negative rational numbers fluently.',
      commonMisconception: 'Believing a negative times a negative is a negative integer.',
      skillsTested: ['rational-multiplication-fluency', 'sign-rules'],
      prerequisiteConcepts: ['integer-operations']
    }
  },
  8: {
    'Number Sense & Place Value': {
      standardCode: 'CCSS.Math.Content.8.NS.A.1',
      topic: 'Grade 8 - Curriculum',
      lesson: 'Unit 1: Numbers and operations',
      learningObjective: 'Understand that numbers that are not rational are irrational, and evaluate roots and negative exponents.',
      commonMisconception: 'Believing negative exponents represent negative numbers (e.g., thinking 3^-2 = -9 instead of 1/9).',
      skillsTested: ['rational-irrational-distinction', 'negative-exponents-rules'],
      prerequisiteConcepts: ['rational-multiplication-fluency']
    },
    'Operations & Algebraic Thinking': {
      standardCode: 'CCSS.Math.Content.8.EE.C.8',
      topic: 'Grade 8 - Curriculum',
      lesson: 'Unit 4: Systems of equations',
      learningObjective: 'Analyze and solve pairs of simultaneous linear equations by substitution or elimination.',
      commonMisconception: 'Assuming all linear systems have exactly one solution, forgetting parallel line cases (no solution).',
      skillsTested: ['linear-systems-substitution', 'consecutive-equations'],
      prerequisiteConcepts: ['two-step-equations']
    },
    'Fractions, Decimals & Rational Numbers': {
      standardCode: 'CCSS.Math.Content.8.EE.A.4',
      topic: 'Grade 8 - Curriculum',
      lesson: 'Unit 1: Scientific notation',
      learningObjective: 'Perform operations with numbers expressed in scientific notation, including decimal scaling.',
      commonMisconception: 'Adding exponent powers during scientific notation addition operations (exponents must match).',
      skillsTested: ['scientific-notation-arithmetic', 'standard-notation-conversions'],
      prerequisiteConcepts: ['exponents-evaluation']
    },
    'Ratios, Proportions & Functions': {
      standardCode: 'CCSS.Math.Content.8.F.A.1',
      topic: 'Grade 8 - Curriculum',
      lesson: 'Unit 3: Linear equations and functions',
      learningObjective: 'Understand that a function is a rule that assigns to each input exactly one output.',
      commonMisconception: 'Believing any curved line represents a function, or violating the vertical line test on graphs.',
      skillsTested: ['slope-intercept-equations', 'function-definition-evaluations'],
      prerequisiteConcepts: ['constant-of-proportionality']
    },
    'Measurement & Data': {
      standardCode: 'CCSS.Math.Content.8.G.B.7',
      topic: 'Grade 8 - Curriculum',
      lesson: 'Unit 5: Geometry',
      learningObjective: 'Apply the Pythagorean Theorem to determine unknown side lengths in right triangles.',
      commonMisconception: 'Applying the Pythagorean Theorem to acute or obtuse triangles instead of right-angled ones.',
      skillsTested: ['pythagorean-theorem', 'hypotenuse-side-finding'],
      prerequisiteConcepts: ['circle-area']
    },
    'Geometry & Spatial Reasoning': {
      standardCode: 'CCSS.Math.Content.8.G.A.1',
      topic: 'Grade 8 - Curriculum',
      lesson: 'Unit 6: Geometric transformations',
      learningObjective: 'Verify experimentally the properties of rotations, reflections, translations, and dilations.',
      commonMisconception: 'Changing orientation or size incorrectly during reflection or dilation transforms.',
      skillsTested: ['coordinate-translations-reflections', 'dilations-similarity'],
      prerequisiteConcepts: ['coordinate-plotting']
    },
    'Problem Solving & Mathematical Reasoning': {
      standardCode: 'CCSS.Math.Content.8.SP.A.1',
      topic: 'Grade 8 - Curriculum',
      lesson: 'Unit 7: Data and modeling',
      learningObjective: 'Construct and interpret scatter plots for bivariate measurement data to investigate patterns.',
      commonMisconception: 'Assuming high mathematical correlation implies direct physical causation in bivariate datasets.',
      skillsTested: ['scatter-plot-correlations', 'two-way-frequency-tables'],
      prerequisiteConcepts: ['mean-median-calculations']
    },
    'Mathematical Fluency': {
      standardCode: 'CCSS.Math.Content.8.EE.A.1',
      topic: 'Grade 8 - Curriculum',
      lesson: 'Unit 1: Exponent properties and perfect squares',
      learningObjective: 'Apply properties of integer exponents to generate equivalent numerical expressions fluently.',
      commonMisconception: 'Adding exponents during division operations instead of subtracting them.',
      skillsTested: ['exponent-properties-recall', 'perfect-squares-roots'],
      prerequisiteConcepts: ['exponents-evaluation']
    }
  },
  9: {
    'Number Sense & Place Value': {
      standardCode: 'CCSS.Math.Content.HSN.RN.A.1',
      topic: 'Grade 9 - Curriculum',
      lesson: 'Number Theory: Absolute Value, Square/Cube Roots, Rational Exponents',
      learningObjective: 'Explain how the definition of rational exponents follows from extending properties of integer exponents.',
      commonMisconception: 'Mistaking a fractional exponent like x^(1/2) for x/2 instead of the square root of x.',
      skillsTested: ['rational-exponents-simplifying', 'radical-expression-conversions'],
      prerequisiteConcepts: ['negative-exponents-rules']
    },
    'Operations & Algebraic Thinking': {
      standardCode: 'CCSS.Math.Content.HSA.SSE.B.3',
      topic: 'Grade 9 - Curriculum',
      lesson: 'Algebra 1: Factoring quadratics and binomial operations',
      learningObjective: 'Factor quadratic expressions and solve quadratic equations by factoring, completing the square, or formula.',
      commonMisconception: 'Forgetting the middle product term when expanding squared binomials (e.g., expanding (x+3)^2 to x^2 + 9).',
      skillsTested: ['quadratic-factoring', 'binomial-expansion-FOIL'],
      prerequisiteConcepts: ['linear-systems-substitution']
    },
    'Fractions, Decimals & Rational Numbers': {
      standardCode: 'CCSS.Math.Content.HSF.IF.A.1',
      topic: 'Grade 9 - Curriculum',
      lesson: 'Functions: Notation, evaluations, domain and range',
      learningObjective: 'Understand function notation, evaluate functions, and identify their domain and range.',
      commonMisconception: 'Interpreting the notation f(x) as multiplication of f by x.',
      skillsTested: ['function-notation', 'domain-range-bounds'],
      prerequisiteConcepts: ['function-definition-evaluations']
    },
    'Ratios, Proportions & Functions': {
      standardCode: 'CCSS.Math.Content.HSF.IF.C.7',
      topic: 'Grade 9 - Curriculum',
      lesson: 'Algebra 1: Graphing linear and nonlinear functions',
      learningObjective: 'Graph functions expressed symbolically and show key features of the graph.',
      commonMisconception: 'Confusing additive constant growth in linear lines with multiplicative exponential growth.',
      skillsTested: ['graphing-linear-functions', 'intercepts-asymptotes'],
      prerequisiteConcepts: ['slope-intercept-equations']
    },
    'Measurement & Data': {
      standardCode: 'CCSS.Math.Content.HSS.ID.A.2',
      topic: 'Grade 9 - Curriculum',
      lesson: 'Statistics and Probability: Standard deviation and conditional probability',
      learningObjective: 'Use statistics appropriate to the shape of the data distribution to compare center and spread.',
      commonMisconception: 'Thinking standard deviation is simply distance from median, or failing to apply conditional formulas.',
      skillsTested: ['standard-deviation-concept', 'conditional-probabilities'],
      prerequisiteConcepts: ['mean-median-calculations']
    },
    'Geometry & Spatial Reasoning': {
      standardCode: 'CCSS.Math.Content.HSG.CO.A.2',
      topic: 'Grade 9 - Curriculum',
      lesson: 'Geometry: Triangles, circles, and transformations',
      learningObjective: 'Use coordinates to prove simple geometric theorems algebraically.',
      commonMisconception: 'Failing to construct general coordinate points (e.g., placing coordinates at specific numbers).',
      skillsTested: ['coordinate-geometry-proofs', 'triangle-congruence-properties'],
      prerequisiteConcepts: ['coordinate-translations-reflections']
    },
    'Problem Solving & Mathematical Reasoning': {
      standardCode: 'CCSS.Math.Content.HSG.SRT.C.8',
      topic: 'Grade 9 - Curriculum',
      lesson: 'Trigonometry & Matrices: Intro, operations, right triangle trig ratios',
      learningObjective: 'Use trigonometric ratios (sin, cos, tan) to solve right triangles, and perform matrix additions.',
      commonMisconception: 'Using the wrong trigonometric ratio (e.g., using sin instead of cos when given adjacent/hypotenuse).',
      skillsTested: ['trigonometric-ratios-sin-cos', 'matrix-additions-multiplications'],
      prerequisiteConcepts: ['pythagorean-theorem']
    },
    'Mathematical Fluency': {
      standardCode: 'CCSS.Math.Content.HSA.APR.A.1',
      topic: 'Grade 9 - Curriculum',
      lesson: 'Algebra 1: Polynomial arithmetic fluency',
      learningObjective: 'Perform arithmetic operations on polynomials, understanding they form a closed system.',
      commonMisconception: 'Failing to distribute negative signs across parentheses during polynomial subtraction.',
      skillsTested: ['polynomial-additions-fluency', 'factoring-trinomials-speedout'],
      prerequisiteConcepts: ['quadratic-factoring']
    }
  }
};

// Procedural Generator for US Grade and Category
export function generateUSQuestion(
  id: string,
  grade: Grade,
  category: string,
  difficulty: Difficulty,
  index: number
): Partial<Question> {
  const meta = usCurriculumMetadata[grade]?.[category] || {
    standardCode: `CCSS.Math.Content.${grade}.Core`,
    topic: `Grade ${grade} Core Mathematics`,
    lesson: `${category} Concepts`,
    learningObjective: `Fluently solve problems in ${category}.`,
    commonMisconception: 'Failing to double check work steps.',
    skillsTested: [category.toLowerCase().replace(/\s+/g, '-')],
    prerequisiteConcepts: [`foundational-g${grade - 1 || 1}`]
  };

  let type: QuestionType = 'MCQ';
  let text = '';
  let hint = '';
  let explanation = '';
  let options: string[] = [];
  let correctAnswer = '';
  let visualData: any = undefined;

  // Easy (index 0,1,2), Medium (index 3..11), Hard (index 12..14)
  const isEasy = difficulty === 'Easy';
  const isMedium = difficulty === 'Medium';

  // -------------------------------------------------------------
  // GRADE 1
  // -------------------------------------------------------------
  if (grade === 1) {
    if (category === 'Number Sense & Place Value') {
      const val = 20 + index * 5;
      if (isEasy) {
        text = `In the number **${val}**, which digit is in the **tens** place?`;
        correctAnswer = String(Math.floor(val / 10));
        options = [correctAnswer, String(val % 10), '0', '5'];
        hint = `Recall that the first digit on the left in a two-digit number tells how many tens there are.`;
        explanation = `The number ${val} has ${Math.floor(val / 10)} tens and ${val % 10} ones. Thus, ${Math.floor(val / 10)} is in the tens place.`;
      } else if (isMedium) {
        text = `Which symbol makes this true? <br/>**${val} ______ ${val - 3}**`;
        correctAnswer = '>';
        options = ['>', '<', '='];
        hint = `${val} is larger than ${val - 3}. Use the symbol that points like an alligator mouth to the larger number.`;
        explanation = `Since ${val} is greater than ${val - 3}, we use the greater than symbol (>).`;
      } else {
        const ones = index;
        text = `What is the total value of **1 ten and ${ones} ones**?`;
        correctAnswer = String(10 + ones);
        options = generateNumericOptions(10 + ones);
        hint = `1 ten is equal to 10. Add ${ones} more to 10.`;
        explanation = `1 ten = 10. 10 + ${ones} ones = ${10 + ones}.`;
      }
    } else if (category === 'Operations & Algebraic Thinking') {
      const a = 5 + index;
      const b = 3 + (index % 3);
      if (isEasy) {
        text = `Solve: **${a} + ${b} = ______**`;
        correctAnswer = String(a + b);
        options = generateNumericOptions(a + b);
        hint = `Start with ${a} and count on ${b} more.`;
        explanation = `Adding ${b} to ${a} gives ${a + b}.`;
      } else if (isMedium) {
        text = `**${a} superheroes** are on a roof. **${b}** fly away. How many superheroes are left?`;
        correctAnswer = String(a - b);
        options = generateNumericOptions(a - b);
        hint = `When superheroes fly away, we subtract. Calculate ${a} minus ${b}.`;
        explanation = `We subtract the ones that fly away: ${a} - ${b} = ${a - b} superheroes left.`;
      } else {
        const c = 2;
        text = `Solve this 3-number addition: **${a} + ${b} + ${c} = ______**`;
        correctAnswer = String(a + b + c);
        options = generateNumericOptions(a + b + c);
        hint = `First add ${a} + ${b}, then add ${c} to the result.`;
        explanation = `${a} + ${b} = ${a + b}. Then, ${a + b} + ${c} = ${a + b + c}.`;
      }
    } else if (category === 'Fractions, Decimals & Rational Numbers') {
      if (isEasy) {
        text = `If we split a cookie into **2 equal shares**, what is each part called?`;
        correctAnswer = 'A half';
        options = ['A half', 'A fourth', 'A third', 'A whole'];
        hint = `When a shape is partitioned into exactly two identical pieces, they are halves.`;
        explanation = `Splitting an item into two equal parts creates two halves. Each part is a half.`;
      } else if (isMedium) {
        text = `If we split a square into **four equal shares**, each piece is called a:`;
        correctAnswer = 'Fourth';
        options = ['Half', 'Fourth', 'Third', 'Whole'];
        hint = `Four identical pieces represent quarters or fourths.`;
        explanation = `Partitioning a shape into 4 equal pieces yields fourths (or quarters).`;
      } else {
        text = `Bella eats one-fourth of a pizza. How many parts must the pizza be split into so she gets a fourth?`;
        correctAnswer = '4 equal parts';
        options = ['2 equal parts', '3 equal parts', '4 equal parts', '4 unequal parts'];
        hint = `Fourths represent 4 equal shares of a whole.`;
        explanation = `A fourth means the whole is split into 4 equal shares.`;
      }
    } else if (category === 'Measurement & Data') {
      const hr = 1 + (index % 11);
      if (isEasy) {
        text = `An analog clock's short hand points to **${hr}** and its long hand points to **12**. What time is it?`;
        correctAnswer = `${hr}:00`;
        options = [`${hr}:00`, `${hr}:30`, `12:00`, `12:${hr}`];
        hint = `The short hand shows the hour, and the long hand pointing to 12 means it's exactly on the hour.`;
        explanation = `Short hand at ${hr} and long hand at 12 represents exactly ${hr} o'clock (${hr}:00).`;
      } else if (isMedium) {
        text = `If the short hand is between **${hr}** and **${hr + 1}** and the long hand is on **6**, what time is it?`;
        correctAnswer = `${hr}:30`;
        options = [`${hr}:30`, `${hr}:00`, `${hr + 1}:30`, `${hr + 1}:00`];
        hint = `The long hand at 6 means 30 minutes past the hour.`;
        explanation = `Since the hour hand has passed ${hr} but not reached ${hr + 1}, and the minute hand is on 6, it is ${hr}:30.`;
      } else {
        text = `Dog A is longer than Dog B. Dog B is longer than Dog C. Which dog is the **shortest**?`;
        correctAnswer = 'Dog C';
        options = ['Dog A', 'Dog B', 'Dog C', 'They are all equal'];
        hint = `Order them: Dog A > Dog B > Dog C.`;
        explanation = `Dog A is longest. Dog B is in the middle. Dog C is the shortest.`;
      }
    } else {
      // General fallbacks for other categories
      const a = 10 + index;
      text = `Solve this Grade 1 puzzle: What is **${a} - 4**?`;
      correctAnswer = String(a - 4);
      options = generateNumericOptions(a - 4);
      explanation = `${a} - 4 = ${a - 4}.`;
    }
  }

  // -------------------------------------------------------------
  // GRADE 2
  // -------------------------------------------------------------
  else if (grade === 2) {
    if (category === 'Number Sense & Place Value') {
      const h = index + 2;
      const t = (index % 5) + 1;
      const o = (index % 3) + 4;
      const totalVal = h * 100 + t * 10 + o;
      if (isEasy) {
        text = `What is the value of the **hundreds** digit in **${totalVal}**?`;
        correctAnswer = String(h * 100);
        options = [String(h * 100), String(h), String(t * 10), String(o)];
        hint = `The digit is in the hundreds position. Multiply the digit by 100.`;
        explanation = `In ${totalVal}, the digit in the hundreds column is ${h}, which has a value of ${h} × 100 = ${h * 100}.`;
      } else if (isMedium) {
        text = `What is the expanded form of **${totalVal}**?`;
        correctAnswer = `${h * 100} + ${t * 10} + ${o}`;
        options = [
          `${h * 100} + ${t * 10} + ${o}`,
          `${h}00 + ${t}0 + ${o}0`,
          `${h} + ${t} + ${o}`,
          `${h * 100} + ${t} + ${o}`
        ];
        hint = `Break the number down into hundreds, tens, and ones.`;
        explanation = `${totalVal} is composed of ${h} hundreds (${h * 100}), ${t} tens (${t * 10}), and ${o} ones (${o}).`;
      } else {
        text = `Is the number **${totalVal}** Even or Odd?`;
        correctAnswer = totalVal % 2 === 0 ? 'Even' : 'Odd';
        options = ['Even', 'Odd'];
        hint = `Look at the very last digit (${o}). If it is divisible by 2, the number is even.`;
        explanation = `The last digit is ${o}. Since ${o} is ${o % 2 === 0 ? 'divisible' : 'not divisible'} by 2, the total number ${totalVal} is ${correctAnswer.toLowerCase()}.`;
      }
    } else if (category === 'Operations & Algebraic Thinking') {
      const r = (index % 3) + 3;
      const c = (index % 2) + 4;
      if (isEasy) {
        text = `How many total haircuts are represented by **${r} rows of ${c} chairs** in a barbershop?`;
        correctAnswer = String(r * c);
        options = generateNumericOptions(r * c);
        hint = `Use repeated addition: add ${c} exactly ${r} times.`;
        explanation = `An array of ${r} rows and ${c} columns has ${r} × ${c} = ${r * c} items.`;
      } else {
        const val = 40 + index * 3;
        const sub = 15 + index;
        text = `Find the missing number: **${val} - ______ = ${val - sub}**`;
        correctAnswer = String(sub);
        options = generateNumericOptions(sub);
        hint = `Subtract ${val - sub} from ${val} to find the missing value.`;
        explanation = `Rearranging gives: ${val} - ${val - sub} = ${sub}.`;
      }
    } else if (category === 'Measurement & Data') {
      const q = (index % 3) + 1;
      const d = (index % 2) + 2;
      const cents = q * 25 + d * 10;
      if (isEasy) {
        text = `How much money is **${q} quarters and ${d} dimes**?`;
        correctAnswer = `$${(cents / 100).toFixed(2)}`;
        options = [`$${(cents / 100).toFixed(2)}`, `$${((cents + 15) / 100).toFixed(2)}`, `$${((cents - 10) / 100).toFixed(2)}`, `$0.75`];
        hint = `Quarters are 25¢ each and dimes are 10¢ each.`;
        explanation = `${q} quarters = ${q * 25}¢, and ${d} dimes = ${d * 10}¢. Total = ${cents}¢, which is $${(cents / 100).toFixed(2)}.`;
      } else {
        const inches = 24 + index * 12;
        text = `A wooden board is **${inches} inches** long. How many **feet** is this? (1 foot = 12 inches)`;
        correctAnswer = String(inches / 12);
        options = generateNumericOptions(inches / 12);
        hint = `Divide the total inches by 12.`;
        explanation = `${inches} inches ÷ 12 inches/foot = ${inches / 12} feet.`;
      }
    } else {
      const a = 20 + index * 2;
      text = `Solve this Grade 2 math: What is **${a} + 15**?`;
      correctAnswer = String(a + 15);
      options = generateNumericOptions(a + 15);
      explanation = `${a} + 15 = ${a + 15}.`;
    }
  }

  // -------------------------------------------------------------
  // GRADE 3
  // -------------------------------------------------------------
  else if (grade === 3) {
    if (category === 'Number Sense & Place Value') {
      const val = 340 + index * 7;
      if (isEasy) {
        text = `Round **${val}** to the nearest **ten**.`;
        const ans = Math.round(val / 10) * 10;
        correctAnswer = String(ans);
        options = generateNumericOptions(ans, 4, 10);
        hint = `Look at the ones digit. If it is 5 or more, round up. Otherwise, round down.`;
        explanation = `The ones digit of ${val} is ${val % 10}. Thus, we round to ${ans}.`;
      } else {
        const val100 = 600 + index * 35;
        text = `Round **${val100}** to the nearest **hundred**.`;
        const ans = Math.round(val100 / 100) * 100;
        correctAnswer = String(ans);
        options = generateNumericOptions(ans, 4, 100);
        hint = `Look at the tens digit of ${val100}. If it is 50 or more, round up to the next hundred.`;
        explanation = `Rounding ${val100} to the nearest hundred gives ${ans}.`;
      }
    } else if (category === 'Operations & Algebraic Thinking') {
      const a = 3 + (index % 5);
      const b = 6 + (index % 4);
      if (isEasy) {
        text = `Solve: **${a} × ${b} = ______**`;
        correctAnswer = String(a * b);
        options = generateNumericOptions(a * b);
        hint = `Think of ${a} groups of ${b} objects.`;
        explanation = `${a} × ${b} = ${a * b}.`;
      } else if (isMedium) {
        text = `Which is equivalent to **${a} × (2 + 5)** by the distributive property?`;
        correctAnswer = `(${a} × 2) + (${a} × 5)`;
        options = [
          `(${a} × 2) + (${a} × 5)`,
          `(${a} + 2) × (${a} + 5)`,
          `${a} × 10`,
          `(${a} × 2) × 5`
        ];
        hint = `Distribute the ${a} to both numbers inside the parentheses.`;
        explanation = `By the distributive property, a × (b + c) = (a × b) + (a × c).`;
      } else {
        const dividend = a * b;
        text = `Solve for the unknown: **${dividend} ÷ ______ = ${a}**`;
        correctAnswer = String(b);
        options = generateNumericOptions(b);
        hint = `What number multiplied by ${a} equals ${dividend}?`;
        explanation = `Since ${a} × ${b} = ${dividend}, then ${dividend} ÷ ${b} = ${a}.`;
      }
    } else if (category === 'Fractions, Decimals & Rational Numbers') {
      const denom = 4 + (index % 5);
      if (isEasy) {
        text = `In the fraction **3/${denom}**, what is the **denominator**?`;
        correctAnswer = String(denom);
        options = ['3', String(denom), '1', String(denom + 3)];
        hint = `The denominator is the bottom number, representing the total equal shares.`;
        explanation = `In 3/${denom}, 3 is the numerator and ${denom} is the denominator.`;
      } else {
        text = `Which fraction is equivalent to **1/2**?`;
        correctAnswer = `4/8`;
        options = [`4/8`, `2/5`, `3/8`, `4/10`];
        hint = `Multiply both the top and bottom of 1/2 by the same number.`;
        explanation = `(1 × 4)/(2 × 4) = 4/8, which makes it equivalent to 1/2.`;
      }
    } else if (category === 'Geometry & Spatial Reasoning') {
      const l = 5 + index;
      const w = 4;
      if (isEasy) {
        text = `Find the **area** of a rectangle with length **${l} cm** and width **${w} cm**.`;
        correctAnswer = String(l * w);
        options = generateNumericOptions(l * w);
        hint = `Area = length × width.`;
        explanation = `Area = ${l} × ${w} = ${l * w} square cm.`;
      } else {
        text = `Find the **perimeter** of a rectangle with length **${l} m** and width **${w} m**.`;
        correctAnswer = String(2 * (l + w));
        options = generateNumericOptions(2 * (l + w));
        hint = `Perimeter = 2 × (length + width).`;
        explanation = `Perimeter = 2 × (${l} + ${w}) = 2 × ${l + w} = ${2 * (l + w)} meters.`;
      }
    } else {
      const val = 10 + index * 5;
      text = `Calculate this Grade 3 arithmetic: **${val} + 85**?`;
      correctAnswer = String(val + 85);
      options = generateNumericOptions(val + 85);
      explanation = `${val} + 85 = ${val + 85}.`;
    }
  }

  // -------------------------------------------------------------
  // GRADE 4
  // -------------------------------------------------------------
  else if (grade === 4) {
    if (category === 'Number Sense & Place Value') {
      const largeNum = 500000 + index * 12345;
      if (isEasy) {
        text = `In the number **${largeNum.toLocaleString()}**, which digit is in the **hundred thousands** place?`;
        correctAnswer = String(Math.floor(largeNum / 100000) % 10);
        options = [correctAnswer, '0', '4', '1'];
        hint = `Count columns from right to left: ones, tens, hundreds, thousands, ten thousands, hundred thousands.`;
        explanation = `In ${largeNum.toLocaleString()}, the digit in the hundred thousands place is ${correctAnswer}.`;
      } else {
        const roundBase = 43210 + index * 1000;
        text = `Round **${roundBase}** to the nearest **thousand**.`;
        const ans = Math.round(roundBase / 1000) * 1000;
        correctAnswer = String(ans);
        options = generateNumericOptions(ans, 4, 1000);
        explanation = `Rounding ${roundBase} to the nearest thousand yields ${ans}.`;
      }
    } else if (category === 'Operations & Algebraic Thinking') {
      const a = 24 + index;
      const b = 5;
      if (isEasy) {
        text = `Find the quotient and remainder: **${a} ÷ ${b}**`;
        const q = Math.floor(a / b);
        const r = a % b;
        correctAnswer = `${q} R ${r}`;
        options = [`${q} R ${r}`, `${q} R ${r + 1}`, `${q - 1} R ${r + b}`, `${q + 1} R 0`];
        hint = `How many times does ${b} go into ${a} fully? The leftover is the remainder.`;
        explanation = `${b} × ${q} = ${b * q}. Leftover is ${a} - ${b * q} = ${r}. Thus, ${q} R ${r}.`;
      } else {
        const factor1 = 12 + index;
        const factor2 = 15;
        text = `Multiply using partial products or area models: **${factor1} × ${factor2}**`;
        correctAnswer = String(factor1 * factor2);
        options = generateNumericOptions(factor1 * factor2);
        explanation = `${factor1} × ${factor2} = ${factor1 * factor2}.`;
      }
    } else if (category === 'Fractions, Decimals & Rational Numbers') {
      if (isEasy) {
        text = `Convert the fraction **45/100** to a **decimal**.`;
        correctAnswer = '0.45';
        options = ['0.45', '4.5', '0.045', '45.0'];
        hint = `Forty-five hundredths means 45 divided by 100.`;
        explanation = `45/100 is equal to 45 hundredths, which is written as 0.45 in decimal form.`;
      } else {
        text = `Which decimal is greater: **0.4** or **0.39**?`;
        correctAnswer = '0.4';
        options = ['0.4', '0.39', 'They are equal'];
        hint = `Compare the tenths place: 4 tenths is larger than 3 tenths.`;
        explanation = `0.4 = 0.40. Comparing 40 hundredths to 39 hundredths reveals that 0.4 is larger.`;
      }
    } else if (category === 'Patterns & Pre-Algebra') {
      const primes = [17, 19, 23, 29, 31, 37, 41, 43, 47];
      const p = primes[index % primes.length];
      if (isEasy) {
        text = `Is the number **${p}** prime or composite?`;
        correctAnswer = 'Prime';
        options = ['Prime', 'Composite'];
        hint = `A prime number has only 1 and itself as factors.`;
        explanation = `The only factors of ${p} are 1 and ${p}. Therefore, it is a prime number.`;
      } else {
        const comp = p + 1;
        text = `Is the number **${comp}** prime or composite?`;
        correctAnswer = 'Composite';
        options = ['Prime', 'Composite'];
        explanation = `${comp} has multiple factors (including 2), so it is composite.`;
      }
    } else {
      const a = 12 * (index + 2);
      text = `Solve: Convert **${index + 2} feet** to **inches**. (1 foot = 12 inches)`;
      correctAnswer = String(a);
      options = generateNumericOptions(a);
      explanation = `${index + 2} feet × 12 inches/foot = ${a} inches.`;
    }
  }

  // -------------------------------------------------------------
  // GRADE 5 & 6 (Ratios, Negatives, Pre-Algebra)
  // -------------------------------------------------------------
  else if (grade === 5 || grade === 6) {
    if (category === 'Ratios, Proportions & Functions' || category === 'Patterns & Pre-Algebra') {
      const baseL = 2;
      const baseR = 3;
      const mult = index + 3;
      if (isEasy) {
        text = `Find the equivalent ratio of **${baseL}:${baseR}** if the first term is scaled to **${baseL * mult}**.`;
        correctAnswer = String(baseR * mult);
        options = generateNumericOptions(baseR * mult);
        hint = `The multiplier is ${baseL * mult} / ${baseL} = ${mult}. Multiply ${baseR} by ${mult}.`;
        explanation = `${baseL} × ${mult} = ${baseL * mult}, so the second term is ${baseR} × ${mult} = ${baseR * mult}.`;
      } else {
        const pct = 15;
        const whole = 200 + index * 50;
        text = `What is **${pct}%** of **${whole}**?`;
        const ans = (whole * pct) / 100;
        correctAnswer = String(ans);
        options = generateNumericOptions(ans, 4, 5);
        hint = `Multiply ${whole} by ${pct}/100, or find 10% first and add 5%.`;
        explanation = `15% of ${whole} is (15/100) × ${whole} = ${ans}.`;
      }
    } else if (category === 'Number Sense & Place Value') {
      const neg = -5 - index;
      if (isEasy) {
        text = `Evaluate the absolute value of: **|${neg}|**`;
        correctAnswer = String(Math.abs(neg));
        options = [String(Math.abs(neg)), String(neg), '0', String(neg * 2)];
        hint = `Absolute value represents the distance from 0 on a number line, which is always positive.`;
        explanation = `The distance from ${neg} to 0 is ${Math.abs(neg)} units. Thus, |${neg}| = ${Math.abs(neg)}.`;
      } else {
        text = `Which inequality is true?`;
        correctAnswer = `${neg} > ${neg - 5}`;
        options = [
          `${neg} > ${neg - 5}`,
          `${neg} < ${neg - 5}`,
          `|${neg}| < |${neg - 5}|`,
          `${neg} = ${neg - 5}`
        ];
        explanation = `${neg} is to the right of ${neg - 5} on the number line, so it is greater.`;
      }
    } else if (category === 'Operations & Algebraic Thinking') {
      const base = 2 + (index % 3);
      const exp = 3;
      if (isEasy) {
        text = `Evaluate: **${base}<sup>${exp}</sup>**`;
        correctAnswer = String(Math.pow(base, exp));
        options = [String(Math.pow(base, exp)), String(base * exp), String(base + exp), '16'];
        hint = `Do not multiply base and exponent. Multiply the base by itself ${exp} times.`;
        explanation = `${base}<sup>${exp}</sup> = ${base} × ${base} × ${base} = ${Math.pow(base, exp)}.`;
      } else {
        const x = 4;
        text = `Evaluate **3x + 10** when **x = ${x + index}**`;
        const ans = 3 * (x + index) + 10;
        correctAnswer = String(ans);
        options = generateNumericOptions(ans);
        explanation = `Substitute ${x + index} for x: 3(${x + index}) + 10 = ${3 * (x + index)} + 10 = ${ans}.`;
      }
    } else {
      const a = 2 + index;
      text = `Solve this ratio check: What is the ratio of **${a} red** to **${a + 4} blue** candies simplified?`;
      const gcd = (x: number, y: number): number => (!y ? x : gcd(y, x % y));
      const g = gcd(a, a + 4);
      correctAnswer = `${a / g}:${(a + 4) / g}`;
      options = [`${a / g}:${(a + 4) / g}`, `${a}:${a + 4}`, `1:2`, `3:4`];
      explanation = `The ratio is ${a}:${a + 4}. Dividing both sides by their GCD of ${g} yields ${correctAnswer}.`;
    }
  }

  // -------------------------------------------------------------
  // GRADE 7
  // -------------------------------------------------------------
  else if (grade === 7) {
    if (category === 'Ratios, Proportions & Functions') {
      const k = 3 + index;
      text = `If a proportional relationship is represented by the equation **y = ${k}x**, what is the constant of proportionality?`;
      correctAnswer = String(k);
      options = [String(k), '1', String(k * 2), String(k + 3)];
      hint = `In y = kx, k is the constant of proportionality.`;
      explanation = `The constant of proportionality is the coefficient of x, which is ${k}.`;
    } else if (category === 'Operations & Algebraic Thinking') {
      const x = 5 + index;
      const ans = 2 * x + 7;
      if (isEasy) {
        text = `Solve the two-step equation: **2x + 7 = ${ans}**`;
        correctAnswer = String(x);
        options = generateNumericOptions(x);
        hint = `First subtract 7 from both sides, then divide by 2.`;
        explanation = `2x + 7 = ${ans} => 2x = ${ans - 7} => x = ${x}.`;
      } else {
        text = `Solve the inequality: **-3x + 5 < ${-3 * x + 5}**`;
        correctAnswer = `x > ${x}`;
        options = [`x > ${x}`, `x < ${x}`, `x > ${-x}`, `x < ${-x}`];
        hint = `Subtract 5 from both sides, then divide by -3. Remember to flip the inequality sign!`;
        explanation = `-3x + 5 < ${-3 * x + 5} => -3x < ${-3 * x} => x > ${x} (sign flipped due to negative division).`;
      }
    } else if (category === 'Geometry & Spatial Reasoning') {
      const r = 7;
      if (isEasy) {
        text = `Find the **circumference** of a circle with a radius of **${r} cm**. (Use π ≈ 22/7)`;
        correctAnswer = '44';
        options = ['44', '154', '22', '88'];
        hint = `Use the circumference formula C = 2 × π × r.`;
        explanation = `C = 2 × (22/7) × 7 = 44 cm.`;
      } else {
        text = `Find the **area** of a circle with a radius of **${r} cm**. (Use π ≈ 22/7)`;
        correctAnswer = '154';
        options = ['154', '44', '308', '77'];
        hint = `Use the area formula A = π × r<sup>2</sup>.`;
        explanation = `A = (22/7) × 7 × 7 = 154 square cm.`;
      }
    } else {
      const val = -12 + index;
      text = `Solve: **${val} + (-8) = ______**`;
      correctAnswer = String(val - 8);
      options = generateNumericOptions(val - 8);
      explanation = `${val} + (-8) = ${val - 8}.`;
    }
  }

  // -------------------------------------------------------------
  // GRADE 8
  // -------------------------------------------------------------
  else if (grade === 8) {
    if (category === 'Number Sense & Place Value') {
      const base = 3;
      const exp = -2;
      if (isEasy) {
        text = `Evaluate: **${base}<sup>${exp}</sup>**`;
        correctAnswer = '1/9';
        options = ['1/9', '-9', '9', '-1/9'];
        hint = `A negative exponent represents taking the reciprocal: a<sup>-n</sup> = 1/a<sup>n</sup>.`;
        explanation = `${base}<sup>-2</sup> = 1/${base}<sup>2</sup> = 1/9.`;
      } else {
        text = `Is the square root of 7 (**√7**) rational or irrational?`;
        correctAnswer = 'Irrational';
        options = ['Rational', 'Irrational'];
        hint = `7 is not a perfect square, so its root cannot be written as a fraction.`;
        explanation = `√7 yields a non-terminating, non-repeating decimal. Thus, it is irrational.`;
      }
    } else if (category === 'Operations & Algebraic Thinking') {
      const x = 2 + index;
      const y = 2 * x;
      text = `Solve this system of linear equations: <br/>**y = 2x**<br/>**x + y = ${x + y}**`;
      correctAnswer = `x = ${x}, y = ${y}`;
      options = [
        `x = ${x}, y = ${y}`,
        `x = ${y}, y = ${x}`,
        `x = ${x + 1}, y = ${y - 2}`,
        `x = 1, y = 2`
      ];
      hint = `Substitute the value of y (2x) into the second equation: x + 2x = ${x + y}.`;
      explanation = `x + 2x = ${x + y} => 3x = ${x + y} => x = ${x}. Since y = 2x, y = ${y}.`;
    } else if (category === 'Measurement & Data') {
      // Pythagorean Triple (3, 4, 5) scaled
      const factor = 1 + index % 3;
      const a = 3 * factor;
      const b = 4 * factor;
      const c = 5 * factor;
      text = `Find the hypotenuse **c** of a right triangle with legs **a = ${a} cm** and **b = ${b} cm**.`;
      correctAnswer = String(c);
      options = generateNumericOptions(c);
      hint = `Apply the Pythagorean theorem: a<sup>2</sup> + b<sup>2</sup> = c<sup>2</sup>.`;
      explanation = `${a}<sup>2</sup> + ${b}<sup>2</sup> = ${a*a} + ${b*b} = ${c*c} = c<sup>2</sup>. Thus c = ${c} cm.`;
    } else {
      const slope = index + 1;
      text = `What is the slope of the line **y = ${slope}x + 4**?`;
      correctAnswer = String(slope);
      options = [String(slope), '4', '-4', '1'];
      explanation = `In y = mx + b, m represents the slope. Thus, the slope is ${slope}.`;
    }
  }

  // -------------------------------------------------------------
  // GRADE 9
  // -------------------------------------------------------------
  else {
    if (category === 'Operations & Algebraic Thinking') {
      const root = 2 + (index % 4);
      const sum = root + 3;
      const prod = root * 3;
      text = `Factor the quadratic expression: **x<sup>2</sup> - ${sum}x + ${prod}**`;
      correctAnswer = `(x - ${root})(x - 3)`;
      options = [
        `(x - ${root})(x - 3)`,
        `(x + ${root})(x + 3)`,
        `(x - ${prod})(x - 1)`,
        `(x + ${sum})(x - 1)`
      ];
      hint = `Look for two numbers that multiply to ${prod} and add up to -${sum}.`;
      explanation = `The numbers are -${root} and -3. Their product is ${prod} and their sum is -${sum}. Thus, the factors are (x - ${root})(x - 3).`;
    } else if (category === 'Fractions, Decimals & Rational Numbers') {
      const a = index + 1;
      text = `Evaluate function **f(4)** if **f(x) = ${a}x - 5**`;
      const ans = a * 4 - 5;
      correctAnswer = String(ans);
      options = generateNumericOptions(ans);
      explanation = `f(4) = ${a}(4) - 5 = ${a * 4} - 5 = ${ans}.`;
    } else if (category === 'Problem Solving & Mathematical Reasoning') {
      text = `In right-angled triangle ABC, what is **sin(A)** if the opposite side is **3** and hypotenuse is **5**?`;
      correctAnswer = '3/5';
      options = ['3/5', '4/5', '3/4', '1'];
      hint = `Recall that sine = opposite / hypotenuse.`;
      explanation = `sin(A) = opposite / hypotenuse = 3/5.`;
    } else {
      const coeff = index + 2;
      text = `Solve the algebraic equation: **${coeff}x - 12 = 0**`;
      const ans = 12 / coeff;
      if (12 % coeff === 0) {
        correctAnswer = String(ans);
        options = generateNumericOptions(ans);
      } else {
        correctAnswer = `12/${coeff}`;
        options = [`12/${coeff}`, `6/${coeff}`, `1`, `4`];
      }
      explanation = `${coeff}x = 12 => x = 12/${coeff}.`;
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
    curriculum: 'US',
    category,
    subcategory: meta.topic,
    difficulty,
    type,
    text,
    hint,
    explanation,
    options,
    correctAnswer,
    visualData,
    lesson: meta.lesson,
    topic: meta.topic,
    learningObjective: meta.learningObjective,
    solution: correctAnswer,
    stepByStepExplanation: explanation,
    commonMisconception: meta.commonMisconception,
    skillsTested: meta.skillsTested,
    prerequisiteConcepts: meta.prerequisiteConcepts,
    standardCode: meta.standardCode,
    estimatedTime: 60,
    bloomLevel: isEasy ? 'Remembering' : (isMedium ? 'Applying' : 'Analyzing'),
    tags: [category.toLowerCase().replace(/\s+/g, '-'), 'us-curriculum'],
    skillId: `SKILL-${grade}-${category.substring(0, 3).toUpperCase().replace(/\s+/g, '')}`,
    conceptId: `CON-${grade}-${difficulty}`
  };
}
