export const extractionPrompt = `## Syllabus Data Extraction

Please extract the following information from the provided syllabus text into a structured JavaScript object. If information for any field is not available, please use reasonable placeholder text, or generate the missing information using AI.

### Required Fields:

1. **Course Title**: Extract the full course title.

2. **Instructor**: Extract the instructor's name and title.

3. **Term**: Extract the academic term (e.g., "Fall 2023").

4. **Course Description**: Extract the full course description paragraph.

5. **Learning Objectives**: Extract all learning objectives as an array of strings.

6. **Required Materials**: Extract textbooks and materials as an array of objects with these properties:
   - title: The name of the book or material
   - author: The author's name
   - publisher: The publisher's name
   - year: Publication year
   - required: Boolean indicating if the material is required or optional

7. **Grading Policy**: Extract as an object with assessment components as properties:
   - assignments: { percentage: number, description: string }
   - participation: { percentage: number, description: string }
   - midterm: { percentage: number, description: string }
   - finalExam: { percentage: number, description: string }
   - Any other grading components found in the syllabus

8. **Weekly Schedule**: Extract as an array of objects with these properties:
   - week: week number
   - topic: weekly topic
   - readings: assigned readings
   - assignments: assignments due that week

9. **Policies**: Extract as an object with these properties:
   - attendance: attendance policy
   - lateWork: late work policy
   - academicIntegrity: academic integrity policy
   - accommodations: accommodations for students with disabilities


### Syllabus Text:`



export const gradingReferencesPrompt = `## Grading References Extraction

Please analyze the provided course syllabus and extract a structured list of grading references. These references should support the course's learning objectives, assignments, and assessments.

### Output Format:

Provide the output as a JSON array named \`gradingReferences\`, where each element is an object with the following properties:

- \`id\`: A unique identifier as a string (e.g., "1", "2", "3", ...).
- \`title\`: The title of the resource.
- \`type\`: The type of resource (e.g., "Document", "Link", "Text").
- \`added\`: The date the resource was added, formatted as "MMM DD, YYYY" (e.g., "Mar 15, 2025").
- \`usedIn\`: A brief description indicating how many assignments the resource is used in (e.g., "3 assignments").
- \`url\`: The URL of the resource, if available; otherwise, leave as an empty string.

### Instructions:

1. **Review the Syllabus:**
   - Examine the syllabus thoroughly, focusing on sections such as course description, learning objectives, required materials, grading policy, weekly schedule, and policies.

2. **Identify Relevant Resources:**
   - Determine documents, links, or texts that are pertinent to the course's assignments and assessments. These may include style guides, rubric templates, citation examples, or external writing resources.

3. **Generate Grading References:**
   - For each identified resource, create an object with the properties specified in the output format.

4. **Assumptions:**
   - If certain information (e.g., \`added\` date or \`usedIn\` count) is not explicitly mentioned in the syllabus, use reasonable estimates or placeholders.

### Example Output:

\`\`\`javascript
const gradingReferences = [
  {
    id: "1",
    title: "APA Style Guide 7th Edition",
    type: "Document",
    added: "Mar 15, 2025",
    usedIn: "3 assignments",
    url: "",
  },
  {
    id: "2",
    title: "Rubric Template - Research Papers",
    type: "Document",
    added: "Feb 28, 2025",
    usedIn: "2 assignments",
    url: "",
  },
  {
    id: "3",
    title: "Purdue OWL Writing Resources",
    type: "Link",
    added: "Mar 10, 2025",
    usedIn: "5 assignments",
    url: "https://owl.purdue.edu/owl/research_and_citation/resources.html",
  },
  {
    id: "4",
    title: "Psychology Journal Citation Examples",
    type: "Text",
    added: "Mar 5, 2025",
    usedIn: "1 assignment",
    url: "",
  },
  {
    id: "5",
    title: "Harvard Referencing Guide",
    type: "Link",
    added: "Feb 20, 2025",
    usedIn: "4 assignments",
    url: "https://www.citethisforme.com/harvard-referencing",
  },
];
\`\`\`

### Syllabus Text:
`;
// export const testAssignmentPrompt = `
// ## Context above
// ## Test Assignment Generator

// Create a test or quiz based on the provided educational context and specifications. Your output should include structured content such as questions, answer keys, instructions, and other components depending on the requested outputs.

// ### Output Format:

// Provide the output as a JavaScript object named \`assignment\`, with the following structure:

// - \`title\`: The title of the assignment.
// - \`description\`: A short description of the assignment's objective and scope.
// - \`questions\` (if requested):
//   - It is an array of objects with the following properties.
//     - \`question\`: The text of the question.
//     - \`options\`: An array of 4 strings, each prefixed with a, b, c, or d.
//     - \`points\`: The points for the question
// - \`answer_key\` (if requested):
//   - It is an array of objects with the following properties.
    
//     - \`key\`: The correct option (e.g., "a")
//     - \`value\`: The correct answer text
// - \`instructions\`, \`rubric\`, \`checklist\`, and \`participation_criteria\` (if requested):
// - \`instructions\`:It is an array of objects with the following properties:
//   - \`title\`: The title of the instruction
//   - \`content\`: The content of the instruction
// - \`rubric\`: It is an array of objects with the following properties:
//   - \`Criterion\`: The Criterion of the rubric
//   - \`Description\`: The description of the rubric
//   - \`Points\`: The points of the rubric
// - \`checklist\`: It is an array of obje, whether true or falsects with the following properties:
//   - \`item\`: The item of the checklist
//   -\`required\`: The required of the checklist
// - \`participation_criteria\`: It is an array of objects with the following properties:
//   - \`Criterion\`: The Criterion of the participation criteria
//   - \`Description\`: The description of the participation criteria
//   - \`Points\`: The points of the participation criteria

//   - Include structured, clear content based on the type.

// ### Instructions:

// 1. **Understand the Context:**
//    - Use the provided subject, grade level, topic, and difficulty to guide the question design.
//    - Focus on age-appropriate and conceptually relevant material.

// 2. **Generate Test Elements:**
//    - Depending on the \`outputs\` requested, include any combination of questions, answer keys, rubric, etc.

// 3. **Follow the Question Rules:**
//    - All multiple-choice questions must have exactly 4 options labeled a–d.
//    - Do not include explanations with questions.
//    - Ensure clarity and variation in question style if applicable.

// 4. **Structure the Output Properly:**
//    - Return a single object named \`assignment\` with all requested fields included.

// # Note: Generate the complete object, dont return incomplete object
// #### Note: output should not include const assignment = 
// ### Note:If the question type is not multiple choice, the options should be an empty array, and check thee outputs in the context


// Look at outputs in questionType, and generate that in the assignment object, leave other empty, also genearte everything dont retrn incomplete
// For example if type is multiple choice, then generate questions, answer_key
// If type  is short answer, then generate questions, answer_key
// If type is discussion, then generate questions, instructions, rubric, participation_criteria
// If type is essay, then generate questions, instructions, rubric, participation_criteria
// If type is case study, then generate questions, instructions, rubric, participation_criteria checklist


// ### Input Parameters:
// - \`testType\`: e.g., "quiz", "exam"
// - \`title\`: The title of the test
// - \`grade\`: Target student grade
// - \`topic\`: Subject topic
// - \`description\`: Optional description of the assignment
// - \`subject\`: e.g., "Science", "Mathematics"
// - \`difficultyLevel\`: e.g., "easy", "medium", "hard"
// - \`formatDescription\`: Notes on formatting (e.g., multiple choice only)
// - \`numberOfQuestions\`: How many questions to generate
// - \`outputs\`: What to generate (questions, answer_key, rubric, etc.)

// ## Generate in accordance with syllabus below
// `;


export const testAssignmentPrompt = `
## Test Assignment Generator

You are tasked with generating a complete test assignment object based on provided input parameters.

### Output Format:

Return a **JavaScript object** (not a variable) with the following structure:

{
  title: string,
  description: string,
  questions: Array<{
    question: string,
    options: string[],
    points: number
  }>,
  answer_key: Array<{
    key: string,
    value: string
  }>,
  instructions: Array<{
    title: string,
    content: string
  }>,
  rubric: Array<{
    Criterion: string,
    Description: string,
    Points: number
  }>,
  checklist: Array<{
    item: string,
    required: boolean
  }>,
  participation_criteria: Array<{
    Criterion: string,
    Description: string,
    Points: number
  }>
}

### Output Rules:

- **Return the object body only**: No \`const\`, \`let\`, or export statements. Just return the raw object.
- All fields must be included. Use empty arrays for fields not requested.
- Do not leave the object incomplete. 
- 

### Output Conditions by \`questionType\`:

| questionType     | Required Fields                                             |
|------------------|------------------------------------------------------------|
| multiple choice  | questions, answer_key                                      |
| short answer     | questions, answer_key                                      |
| discussion       | questions, instructions, rubric, participation_criteria    |
| essay            | questions, instructions, rubric, participation_criteria    |
| case study       | questions, instructions, rubric, participation_criteria, checklist |

- For **multiple choice**: Include exactly 4 options labeled a–d in each question, one should be correct.
- For **short answer**: Include the one answer key in the answer_key array.
- For **non-multiple choice** types: Set \`options: []\` in each question.

### Guidelines:

1. Use the given subject, grade, topic, and difficulty to generate age-appropriate questions.
2. Number of questions must match \`numberOfQuestions\`.
3. All top-level keys must be present in the output object.
4. Do not include any extra explanation or text outside the object.

### Input Parameters (you'll receive dynamically):

- \`testType\`: "quiz" | "exam"
- \`title\`: Title of the test
- \`grade\`: Student grade
- \`topic\`: Subject topic
- \`description\`: Short description
- \`subject\`: e.g., "Science", "Math"
- \`difficultyLevel\`: "easy" | "medium" | "hard"
- \`formatDescription\`: Optional formatting notes
- \`numberOfQuestions\`: Number of questions to generate
- \`outputs\`: Which fields to include (will match questionType)
- \`questionType\`: See table above for logic

### Example Reminder:

**✅ Correct**:  
\`\`\`js
{
  title: "...",
  description: "...",
  questions: [...],
  answer_key: [...],
  instructions: [],
  rubric: [],
  checklist: [],
  participation_criteria: []
}
\`\`\`

**❌ Incorrect**:  
\`const assignment = { ... }\`

Always return the full object body, not just partial or named variables.
`;
